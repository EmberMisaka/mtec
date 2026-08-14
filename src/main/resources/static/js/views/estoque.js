/* View da aba Estoque: listagem, modal de item e importação via planilha */
/* ---------- ESTOQUE ---------- */
function renderEstoque(){
  document.getElementById('view-title').textContent = 'Estoque';
  const belowMin = state.items.filter(i=>i.currentStock < i.minStock).length;
  const pendentes = state.requisicoes.filter(r=>r.status==='pendente').length;

  const filtered = state.items.filter(i=>{
    if(stockFilter.category!=='Todos' && i.category!==stockFilter.category) return false;
    if(stockFilter.search && !i.name.toLowerCase().includes(stockFilter.search.toLowerCase())) return false;
    return true;
  });

  let list = '';
  if(filtered.length===0){
    list = `<div class="empty"><div class="big">📦</div>Nenhum item encontrado</div>`;
  } else {
    CATEGORIES.forEach(cat=>{
      const items = filtered.filter(i=>i.category===cat);
      if(items.length===0) return;
      list += `<div class="section-label">${cat}</div>`;
      items.forEach(i=>{
        const low = i.currentStock < i.minStock;
        const thumb = i.image
            ? `<img src="${i.image}" style="width:40px;height:40px;object-fit:cover;border-radius:6px;border:0.5px solid var(--border);flex:none;">`
            : `<div style="width:40px;height:40px;border-radius:6px;background:var(--gray-bg);flex:none;"></div>`;
        list += `<div class="card">
          <div class="item-row">
            <div style="display:flex;gap:10px;align-items:center;min-width:0;">
              ${thumb}
              <div style="min-width:0;">
                <div class="name">${esc(i.name)}</div>
                <div class="sub">${i.brand?esc(i.brand)+' · ':''}${esc(i.unit)} · <span class="badge cat-${i.category}">${i.category}</span></div>
                ${i.costPrice?`<div class="sub">R$ ${Number(i.costPrice).toFixed(2).replace('.',',')} / ${esc(i.unit)}</div>`:''}
              </div>
            </div>
            <div class="stock">
              <div class="q ${low?'low':''}">${i.currentStock}</div>
              <div class="min">mín. ${i.minStock}</div>
            </div>
            <button class="btn-ghost" onclick="openItemModal('${i.id}')" aria-label="Editar item">✎</button>
          </div>
        </div>`;
      });
    });
  }

  document.getElementById('main').innerHTML = `
    <div class="metrics">
      <div class="metric"><div class="n">${state.items.length}</div><div class="l">itens cadastrados</div></div>
      <div class="metric ${belowMin>0?'alert':''}"><div class="n">${belowMin}</div><div class="l">abaixo do mínimo</div></div>
      <div class="metric ${pendentes>0?'alert':''}"><div class="n">${pendentes}</div><div class="l">requisições pendentes</div></div>
    </div>
    <div class="searchrow">
      <input type="text" placeholder="Buscar item..." value="${esc(stockFilter.search)}" oninput="stockFilter.search=this.value; renderEstoque();">
    </div>
    <div class="chips">
      ${['Todos',...CATEGORIES].map(c=>`<div class="chip ${stockFilter.category===c?'active':''}" onclick="stockFilter.category='${c}'; renderEstoque();">${c}</div>`).join('')}
    </div>
    ${list}
  `;
  document.getElementById('fab').innerHTML = `<div style="display:flex;gap:8px;">
    <button class="btn" style="flex:1;" onclick="openImportModal()">Importar planilha</button>
    <button class="btn btn-primary" style="flex:1;" onclick="openItemModal(null)">+ Novo item</button>
  </div>`;
}


function openItemModal(id){
  const editing = id ? itemById(id) : null;
  pendingImageFile = null;
  pendingImageRemoved = false;
  editingImageUrl = editing ? (editing.image || null) : null;
  document.getElementById('sheet').innerHTML = `
    <h2>${editing?'Editar item':'Novo item'}</h2>
    <div class="field"><label>Nome do item</label><input type="text" id="f-name" value="${editing?esc(editing.name):''}"></div>
    <div class="row-2">
      <div class="field"><label>Categoria</label>
        <select id="f-category">${CATEGORIES.map(c=>`<option ${editing&&editing.category===c?'selected':''}>${c}</option>`).join('')}</select>
      </div>
      <div class="field"><label>Marca</label><input type="text" id="f-brand" placeholder="Opcional" value="${editing?esc(editing.brand||''):''}"></div>
    </div>
    <div class="row-2">
      <div class="field"><label>Unidade</label><input type="text" id="f-unit" placeholder="un, cx, kg..." value="${editing?esc(editing.unit):''}"></div>
      <div class="field"><label>Estoque mínimo</label><input type="number" id="f-min" min="0" value="${editing?editing.minStock:0}"></div>
    </div>
    <div class="row-2">
      <div class="field"><label>Estoque atual</label><input type="number" id="f-current" min="0" value="${editing?editing.currentStock:0}" ${editing?'disabled title="Para alterar o estoque de um item existente, use Entradas, Saídas ou Inventário."':''}></div>
      <div class="field"><label>Preço de custo (R$)</label><input type="number" id="f-cost" min="0" step="0.01" value="${editing?(editing.costPrice||0):0}"></div>
    </div>
    <div class="field">
      <label>Imagem do item</label>
      <div id="f-image-preview-wrap">${imagePreviewHTML()}</div>
      <input type="file" accept="image/*" id="f-image-input" onchange="handleImageSelect(event)">
    </div>
    <div class="hint">Para movimentar estoque no dia a dia, use as abas Entradas, Saídas e Inventário.</div>
    <div class="sheet-actions">
      ${editing?'<button class="btn btn-rust" onclick="deleteItem(\''+editing.id+'\')">Excluir</button>':''}
      <button class="btn btn-primary" onclick="saveItem(${editing?`'${editing.id}'`:'null'})">Salvar</button>
    </div>
    <div style="margin-top:8px;"><button class="btn" onclick="closeModal()">Cancelar</button></div>
  `;
  document.getElementById('overlay').classList.remove('hidden');
}

function importPreviewHTML(){
  if(pendingImportRows.length===0 && pendingImportErrors.length===0) return '';
  let html = '';
  if(pendingImportRows.length>0){
    html += `<div class="section-label">Pré-visualização (${pendingImportRows.length} ${pendingImportRows.length===1?'item':'itens'})</div>`;
    pendingImportRows.slice(0,8).forEach(r=>{
      html += `<div class="card" style="padding:8px 12px;">
        <div class="item-row">
          <div><div class="name" style="font-size:13px;">${esc(r.name)}</div><div class="sub">${esc(r.category)}${r.brand?' · '+esc(r.brand):''} · ${esc(r.unit)}</div></div>
          <div class="stock"><div class="q mono" style="font-size:14px;">${r.currentStock}</div></div>
        </div>
      </div>`;
    });
    if(pendingImportRows.length>8) html += `<div class="hint">+ ${pendingImportRows.length-8} itens não exibidos aqui</div>`;
  }
  if(pendingImportErrors.length>0){
    html += `<div class="section-label">Linhas ignoradas (${pendingImportErrors.length})</div><div class="hint">${pendingImportErrors.slice(0,5).map(esc).join('<br>')}</div>`;
  }
  return html;
}
function openImportModal(){
  pendingImportRows = [];
  pendingImportErrors = [];
  document.getElementById('sheet').innerHTML = `
    <h2>Importar itens via planilha</h2>
    <div class="hint" style="margin-bottom:10px;">Aceita .xlsx ou .xls. Itens com nome já cadastrado são atualizados; os demais são criados. Colunas reconhecidas: Nome, Categoria, Marca, Unidade, Estoque mínimo, Estoque atual, Preço de custo.</div>
    <button type="button" class="btn btn-sm" style="width:100%;margin-bottom:10px;" onclick="exportarItens()">Exportar itens (.xlsx)</button>
    <div class="field"><label>Selecionar arquivo</label><input type="file" accept=".xlsx,.xls" id="import-file-input" onchange="handleSpreadsheetSelect(event)"></div>
    <div id="import-preview"></div>
    <div class="sheet-actions">
      <button class="btn btn-primary" id="import-confirm-btn" onclick="confirmImport()" disabled>Confirmar importação</button>
    </div>
    <div style="margin-top:8px;"><button class="btn" onclick="closeModal()">Cancelar</button></div>
  `;
  document.getElementById('overlay').classList.remove('hidden');
}
