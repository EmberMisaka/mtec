/* API de acesso e manipulação de itens do estoque (dados, imagem e importação)
   A imagem do item aceita qualquer arquivo de imagem (png, jpeg, gif etc.) e é enviada
   como arquivo binário (multipart) pro backend, em vez de virar uma URL de texto. */
let pendingImageFile = null;      // novo arquivo de imagem escolhido, ainda não enviado
let pendingImageRemoved = false;  // usuário pediu pra remover a imagem atual do item
let editingImageUrl = null;       // URL da imagem já salva do item, quando editando

function imagePreviewHTML(){
  let src = null;
  if(pendingImageFile){
    src = URL.createObjectURL(pendingImageFile);
  } else if(!pendingImageRemoved && editingImageUrl){
    src = editingImageUrl;
  }
  return src
      ? `<img src="${src}" style="width:100%;max-width:160px;height:110px;object-fit:cover;border-radius:8px;border:0.5px solid var(--border);margin-bottom:6px;display:block;">
       <button type="button" class="btn btn-sm" onclick="removePendingImage()">Remover imagem</button>`
      : `<div style="width:100%;max-width:160px;height:80px;border:1px dashed var(--border);border-radius:8px;display:flex;align-items:center;justify-content:center;color:var(--ink-3);font-size:12px;margin-bottom:6px;">Sem imagem</div>`;
}
function refreshImagePreview(){
  const wrap = document.getElementById('f-image-preview-wrap');
  if(wrap) wrap.innerHTML = imagePreviewHTML();
}
function handleImageSelect(e){
  const file = e.target.files[0];
  if(!file) return;
  if(!file.type || !file.type.startsWith('image/')){
    showToast('Selecione um arquivo de imagem válido (png, jpeg, gif...)');
    e.target.value = '';
    return;
  }
  pendingImageFile = file;
  pendingImageRemoved = false;
  refreshImagePreview();
}
function removePendingImage(){
  pendingImageFile = null;
  pendingImageRemoved = true;
  const input = document.getElementById('f-image-input');
  if(input) input.value = '';
  refreshImagePreview();
}

/* Envia (ou remove) o arquivo de imagem de um item já salvo. Feito à parte da gravação
   dos dados do item porque o upload é multipart, diferente do restante da API (JSON). */
async function apiEnviarImagem(itemId, file){
  const formData = new FormData();
  formData.append('arquivo', file);
  const res = await fetch(API_BASE + '/itens/' + itemId + '/imagem', {method:'POST', body: formData});
  if(!res.ok){
    let msg = 'Erro ao enviar imagem (' + res.status + ')';
    try{ const body = await res.json(); if(body.erro) msg = body.erro; }catch(e){}
    throw new Error(msg);
  }
  return res.json();
}
async function apiRemoverImagem(itemId){
  const res = await fetch(API_BASE + '/itens/' + itemId + '/imagem', {method:'DELETE'});
  if(!res.ok && res.status !== 204){
    throw new Error('Erro ao remover imagem');
  }
}

async function saveItem(id){
  const name = document.getElementById('f-name').value.trim();
  const category = document.getElementById('f-category').value;
  const brand = document.getElementById('f-brand').value.trim();
  const unit = document.getElementById('f-unit').value.trim() || 'un';
  const min = Number(document.getElementById('f-min').value) || 0;
  const cur = Number(document.getElementById('f-current').value) || 0;
  const cost = Number(document.getElementById('f-cost').value) || 0;
  const fornecedor = document.getElementById('f-fornecedor').value;
  if(!name){ showToast('Informe o nome do item'); return; }
  const payload = mapItemToApi({name, category, unit, minStock:min, currentStock:cur, brand, costPrice:cost, fornecedor});
  try{
    const salvo = id
        ? await apiFetch(`/itens/${id}`, {method:'PUT', body:JSON.stringify(payload)})
        : await apiFetch('/itens', {method:'POST', body:JSON.stringify(payload)});

    if(pendingImageFile){
      await apiEnviarImagem(salvo.id, pendingImageFile);
    } else if(pendingImageRemoved){
      await apiRemoverImagem(salvo.id);
    }
    pendingImageFile = null;
    pendingImageRemoved = false;
    editingImageUrl = null;

    await fetchItems();
    closeModal();
    renderEstoque();
    showToast('Item salvo');
  }catch(err){
    showToast(err.message || 'Erro ao salvar item');
  }
}

function removeAccents(s){ return String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,''); }
function normalizeHeader(s){ return removeAccents(s).toLowerCase().replace(/[^a-z0-9]/g,''); }
function findCol(headers, candidates){
  for(const c of candidates){ const idx = headers.indexOf(c); if(idx>-1) return idx; }
  return -1;
}
function matchCategory(v){
  const n = removeAccents(v).toLowerCase().trim();
  return CATEGORIES.find(c => removeAccents(c).toLowerCase().trim() === n) || null;
}
function exportarItens(){
  const rows = [['Nome','Categoria','Marca','Unidade','Estoque minimo','Estoque atual','Preco de custo']];
  state.items.forEach(i=>{
    rows.push([i.name, i.category, i.brand||'', i.unit, i.minStock, i.currentStock, i.costPrice]);
  });
  const ws = XLSX.utils.aoa_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Itens');
  XLSX.writeFile(wb, 'itens-almoxarifado.xlsx');
}
function readFileAsArrayBuffer(file){
  return new Promise((resolve,reject)=>{
    const reader = new FileReader();
    reader.onload = ()=>resolve(reader.result);
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}
function parseImportRows(rows){
  if(!rows || rows.length<2){
    pendingImportRows = []; pendingImportErrors = ['A planilha está vazia ou não tem linhas de dados.'];
    return;
  }
  const headers = rows[0].map(normalizeHeader);
  const colName = findCol(headers, ['nome','item','produto']);
  const colCategory = findCol(headers, ['categoria']);
  const colBrand = findCol(headers, ['marca']);
  const colUnit = findCol(headers, ['unidade','un']);
  const colMin = findCol(headers, ['estoqueminimo','minimo','min']);
  const colCurrent = findCol(headers, ['estoqueatual','estoque','quantidade','qtd']);
  const colCost = findCol(headers, ['precodecusto','preco','custo','valor']);

  if(colName===-1){
    pendingImportRows = []; pendingImportErrors = ['A planilha precisa ter uma coluna "Nome".'];
    return;
  }
  const parsed = [], errors = [];
  for(let r=1;r<rows.length;r++){
    const row = rows[r];

    if(!row || row.every(c=>c===''||c==null)) continue;

    const name = String(row[colName]||'').trim();

    if(!name){ errors.push('Linha '+(r+1)+': sem nome, ignorada.'); continue; }

    let category;
    if(colCategory>-1){
      category = matchCategory(row[colCategory]);
      if(!category){
        errors.push('Linha '+(r+1)+': categoria "'+row[colCategory]+'" não existe, item ignorado.');
        continue;
      }
    } else {
      category = CATEGORIES[0];
    }

    const brand = colBrand>-1 ? String(row[colBrand]||'').trim() : '';
    const unit = colUnit>-1 ? String(row[colUnit]||'').trim() : 'un';
    const minStock = colMin>-1 ? Number(row[colMin])||0 : 0;
    const currentStock = colCurrent>-1 ? Number(row[colCurrent])||0 : 0;
    const costPrice = colCost>-1 ? Number(row[colCost])||0 : 0;

    parsed.push({name, category, brand, unit:unit||'un', minStock, currentStock, costPrice, hasCurrentCol: colCurrent>-1});
  }
  pendingImportRows = parsed;
  pendingImportErrors = errors;
}
async function handleSpreadsheetSelect(e){
  const file = e.target.files[0];
  if(!file) return;
  try{
    const buf = await readFileAsArrayBuffer(file);
    const wb = XLSX.read(buf, {type:'array'});
    const sheet = wb.Sheets[wb.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet, {header:1, raw:true, defval:''});
    parseImportRows(rows);
  }catch(err){
    pendingImportRows = []; pendingImportErrors = [];
    showToast('Não foi possível ler esse arquivo');
    console.error(err);
  }
  document.getElementById('import-preview').innerHTML = importPreviewHTML();
  const btn = document.getElementById('import-confirm-btn');
  if(btn){
    btn.disabled = pendingImportRows.length===0;
    btn.textContent = 'Confirmar importação' + (pendingImportRows.length ? ' ('+pendingImportRows.length+')' : '');
  }
}

async function confirmImport(){
  if(pendingImportRows.length===0){ showToast('Nenhum item para importar'); return; }
  let created=0, updated=0;
  for(const r of pendingImportRows){
    const existing = state.items.find(i=>i.name.trim().toLowerCase()===r.name.trim().toLowerCase());
    const payload = mapItemToApi({
      name: r.name,
      category: r.category || (existing ? existing.category : CATEGORIES[0]),
      unit: r.unit || (existing ? existing.unit : 'un'),
      minStock: r.minStock,
      currentStock: r.hasCurrentCol ? r.currentStock : (existing ? existing.currentStock : r.currentStock),
      brand: r.brand || (existing ? existing.brand : ''),
      costPrice: r.costPrice || (existing ? existing.costPrice : 0)
    });
    try{
      if(existing){
        await apiFetch(`/itens/${existing.id}`, {method:'PUT', body:JSON.stringify(payload)});
        updated++;
      } else {
        await apiFetch('/itens', {method:'POST', body:JSON.stringify(payload)});
        created++;
      }
    }catch(err){ console.error('Falha ao importar', r.name, err); }
  }
  await fetchItems();
  closeModal();
  pendingImportRows = []; pendingImportErrors = [];
  renderEstoque();
  showToast(created+' criado(s), '+updated+' atualizado(s)');
}
async function deleteItem(id){
  if(!confirm('Excluir este item do almoxarifado?')) return;
  try{
    await apiFetch(`/itens/${id}`, {method:'DELETE'});
    await fetchItems();
    closeModal();
    renderEstoque();
    showToast('Item excluído');
  }catch(err){
    showToast(err.message || 'Erro ao excluir item');
  }
}

