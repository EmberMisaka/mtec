/* API de acesso e manipulação de itens do estoque (dados, imagem e importação) */
let pendingImage = null;
function imagePreviewHTML(){
  return pendingImage
    ? `<img src="${pendingImage}" style="width:100%;max-width:160px;height:110px;object-fit:cover;border-radius:8px;border:0.5px solid var(--border);margin-bottom:6px;display:block;">
       <button type="button" class="btn btn-sm" onclick="removePendingImage()">Remover imagem</button>`
    : `<div style="width:100%;max-width:160px;height:80px;border:1px dashed var(--border);border-radius:8px;display:flex;align-items:center;justify-content:center;color:var(--ink-3);font-size:12px;margin-bottom:6px;">Sem imagem</div>`;
}
function refreshImagePreview(){
  const wrap = document.getElementById('f-image-preview-wrap');
  if(wrap) wrap.innerHTML = imagePreviewHTML();
}
function resizeImage(file, maxDim=480, quality=0.72){
  return new Promise((resolve,reject)=>{
    const reader = new FileReader();
    reader.onload = e=>{
      const img = new Image();
      img.onload = ()=>{
        let w=img.width, h=img.height;
        if(w>h){ if(w>maxDim){ h=Math.round(h*maxDim/w); w=maxDim; } }
        else { if(h>maxDim){ w=Math.round(w*maxDim/h); h=maxDim; } }
        const canvas = document.createElement('canvas');
        canvas.width=w; canvas.height=h;
        canvas.getContext('2d').drawImage(img,0,0,w,h);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
async function handleImageSelect(e){
  const file = e.target.files[0];
  if(!file) return;
  try{
    pendingImage = await resizeImage(file);
    refreshImagePreview();
  }catch(err){ showToast('Não foi possível carregar a imagem'); }
}
function removePendingImage(){
  pendingImage = null;
  const input = document.getElementById('f-image-input');
  if(input) input.value = '';
  refreshImagePreview();
}

async function saveItem(id){
  const name = document.getElementById('f-name').value.trim();
  const category = document.getElementById('f-category').value;
  const brand = document.getElementById('f-brand').value.trim();
  const unit = document.getElementById('f-unit').value.trim() || 'un';
  const min = Number(document.getElementById('f-min').value) || 0;
  const cur = Number(document.getElementById('f-current').value) || 0;
  const cost = Number(document.getElementById('f-cost').value) || 0;
  if(!name){ showToast('Informe o nome do item'); return; }
  if(id){
    const it = itemById(id);
    Object.assign(it, {name,category,unit,minStock:min,currentStock:cur,brand,costPrice:cost,image:pendingImage});
  } else {
    state.items.push(mkItem(name,category,unit,min,cur,brand,cost,pendingImage));
  }
  await saveState();
  closeModal();
  renderEstoque();
  showToast('Item salvo');
}

function removeAccents(s){ return String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,''); }
function normalizeHeader(s){ return removeAccents(s).toLowerCase().replace(/[^a-z0-9]/g,''); }
function findCol(headers, candidates){
  for(const c of candidates){ const idx = headers.indexOf(c); if(idx>-1) return idx; }
  return -1;
}
function matchCategory(v){
  const n = removeAccents(v).toLowerCase();
  if(n.includes('limp')) return 'Limpeza';
  if(n.includes('escrit')) return 'Escritório';
  if(n.includes('caf')) return 'Café';
  return 'Limpeza';
}
function downloadTemplate(){
  const rows = [
    ['Nome','Categoria','Marca','Unidade','Estoque minimo','Estoque atual','Preco de custo'],
    ['Álcool em gel 500ml','Limpeza','Marca X','un',10,24,8.90],
    ['Papel A4 (resma)','Escritório','Marca Y','resma',10,18,24.50],
    ['Café torrado e moído 500g','Café','Marca Z','pct',10,22,15.90]
  ];
  const csv = '\uFEFF'+rows.map(r=>r.map(v=>{
    const s = String(v);
    return /[",;\n]/.test(s) ? '"'+s.replace(/"/g,'""')+'"' : s;
  }).join(',')).join('\n');
  const blob = new Blob([csv], {type:'text/csv;charset=utf-8;'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'modelo-itens-almoxarifado.csv';
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  URL.revokeObjectURL(url);
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
    const category = colCategory>-1 ? matchCategory(row[colCategory]) : 'Limpeza';
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
  pendingImportRows.forEach(r=>{
    const existing = state.items.find(i=>i.name.trim().toLowerCase()===r.name.trim().toLowerCase());
    if(existing){
      existing.category = r.category || existing.category;
      existing.brand = r.brand || existing.brand;
      existing.unit = r.unit || existing.unit;
      existing.minStock = r.minStock;
      if(r.hasCurrentCol) existing.currentStock = r.currentStock;
      existing.costPrice = r.costPrice || existing.costPrice;
      updated++;
    } else {
      state.items.push(mkItem(r.name, r.category||'Limpeza', r.unit||'un', r.minStock, r.currentStock, r.brand, r.costPrice, null));
      created++;
    }
  });
  await saveState();
  closeModal();
  pendingImportRows = []; pendingImportErrors = [];
  renderEstoque();
  showToast(created+' criado(s), '+updated+' atualizado(s)');
}
async function deleteItem(id){
  if(!confirm('Excluir este item do almoxarifado?')) return;
  state.items = state.items.filter(i=>i.id!==id);
  await saveState();
  closeModal();
  renderEstoque();
  showToast('Item excluído');
}

