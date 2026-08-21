/* Views das abas Entradas, Saídas, Requisições e Inventário */

/* Tabela de itens já adicionados ao lote (entrada/saída/requisição), com botão de remover.
   Compartilhada pelas 3 telas — cada uma passa sua própria lista e função de remoção. */
function itensLotePreviewHTML(lista, removerFn){
  if(lista.length===0) return '';
  return `<div style="margin-bottom:10px;">${lista.map((it,idx)=>{
    const item = itemById(it.itemId);
    return `<div class="item-row" style="padding:6px 0;border-bottom:0.5px solid var(--border);">
      <div class="sub">${item?esc(item.name):'(item removido)'} — ${it.qty} ${item?esc(item.unit):''}</div>
      <button class="btn-ghost" onclick="${removerFn}(${idx})" aria-label="Remover">✕</button>
    </div>`;
  }).join('')}</div>`;
}

/* ---------- ENTRADAS ---------- */
function renderEntradas(){
  document.getElementById('view-title').textContent = 'Entradas';
  document.getElementById('fab').innerHTML = '';
  const recentes = state.movements.filter(m=>m.type==='entrada').sort((a,b)=>b.date.localeCompare(a.date)||(b.id-a.id)).slice(0,25);
  document.getElementById('main').innerHTML = `
    <div class="card">
      <div class="row-2">
        <div class="field"><label>Item</label><select id="e-item">${itemOptions(null)}</select></div>
        <div class="field"><label>Quantidade</label><input type="number" id="e-qty" min="1" value="1"></div>
      </div>
      <button type="button" class="btn btn-sm" style="width:100%;margin-bottom:10px;" onclick="adicionarItemEntrada()">+ Adicionar item à entrada</button>
      ${itensLotePreviewHTML(entradaItens, 'removerItemEntrada')}
      <div class="field"><label>Data</label><input type="date" id="e-date" value="${todayISO()}"></div>
      <div class="field"><label>Link do PECOM</label><input type="text" id="e-pecom-link" placeholder="https://..."></div>
      <div class="row-2">
        <div class="field"><label>Nº do PECOM</label><input type="text" id="e-pecom-num"></div>
        <div class="field"><label>Nº da NF</label><input type="text" id="e-nf-num"></div>
      </div>
      <div class="field"><label>Fornecedor / nota fiscal</label><input type="text" id="e-note" placeholder="Opcional"></div>
      <button class="btn btn-teal" onclick="registerEntrada()" ${entradaItens.length===0?'disabled':''}>Registrar entrada${entradaItens.length?' ('+entradaItens.length+' '+(entradaItens.length===1?'item':'itens')+')':''}</button>
    </div>
    <div class="section-label" style="display:flex;align-items:center;justify-content:space-between;">
      <span>Últimas entradas</span>
      <button class="btn btn-sm" onclick="exportarMovimentacoes('entrada')">Exportar (.xlsx)</button>
    </div>
    ${recentes.length===0?'<div class="empty">Nenhuma entrada registrada ainda</div>':recentes.map(m=>movementCard(m)).join('')}
  `;
}

/* ---------- SAÍDAS ---------- */
function renderSaidas(){
  document.getElementById('view-title').textContent = 'Saídas';
  document.getElementById('fab').innerHTML = '';
  const recentes = state.movements.filter(m=>m.type==='saida').sort((a,b)=>b.date.localeCompare(a.date)||(b.id-a.id)).slice(0,25);
  document.getElementById('main').innerHTML = `
    <div class="card">
      <div class="row-2">
        <div class="field"><label>Item</label><select id="s-item">${itemOptions(null)}</select></div>
        <div class="field"><label>Quantidade</label><input type="number" id="s-qty" min="1" value="1"></div>
      </div>
      <button type="button" class="btn btn-sm" style="width:100%;margin-bottom:10px;" onclick="adicionarItemSaida()">+ Adicionar item à saída</button>
      ${itensLotePreviewHTML(saidaItens, 'removerItemSaida')}
      <div class="field"><label>Data</label><input type="date" id="s-date" value="${todayISO()}"></div>
      <div class="row-2">
        <div class="field"><label>Retirado por</label><input type="text" id="s-person" placeholder="Nome"></div>
        <div class="field"><label>Setor / destino</label><input type="text" id="s-dest" placeholder="Opcional"></div>
      </div>
      <button class="btn btn-rust" onclick="registerSaida()" ${saidaItens.length===0?'disabled':''}>Registrar saída${saidaItens.length?' ('+saidaItens.length+' '+(saidaItens.length===1?'item':'itens')+')':''}</button>
    </div>
     <div class="section-label" style="display:flex;align-items:center;justify-content:space-between;">
        <span>Últimas saídas</span>
        <button class="btn btn-sm" onclick="exportarMovimentacoes('saida')">Exportar (.xlsx)</button>
    </div>
    ${recentes.length===0?'<div class="empty">Nenhuma saída registrada ainda</div>':recentes.map(m=>movementCard(m)).join('')}
  `;
}

function movementCard(m){
  const item = itemById(m.itemId);
  if(!item) return '';
  const cls = m.type==='entrada'?'stamp-entrada':(m.type==='saida'?'stamp-saida':'stamp-ajuste');
  const label = m.type==='entrada'?'Entrada':(m.type==='saida'?'Saída':'Ajuste');
  const sign = m.type==='entrada' ? '+' : (m.type==='saida' ? '-' : (m.qty>=0?'+':'-'));
  return `<div class="card">
    <div class="item-row">
      <div>
        <div class="name">${esc(item.name)}</div>
        <div class="sub">${fmtDate(m.date)}${m.note?' · '+esc(m.note):''}</div>
        ${m.type==='entrada' && m.numeroNf ? `<div class="sub">PECOM ${esc(m.numeroPecom||'—')} · NF ${esc(m.numeroNf)}</div>` : ''}
      </div>
      <div class="stock"><div class="q mono">${sign}${Math.abs(m.qty)}</div></div>
    </div>
    <div style="margin-top:8px;"><span class="stamp ${cls}">${label}</span></div>
  </div>`;
}


/* ---------- REQUISIÇÕES ---------- */
function renderRequisicoes(){
  document.getElementById('view-title').textContent = 'Requisições';
  const list = [...state.requisicoes].sort((a,b)=>{
    const order = {pendente:0, aprovada:1, atendida:2, cancelada:3};
    if(order[a.status]!==order[b.status]) return order[a.status]-order[b.status];
    return b.date.localeCompare(a.date);
  });
  const podeCriar = isGestor();
  const formularioHTML = podeCriar ? `
    <div class="card">
      <div class="row-2">
        <div class="field"><label>Solicitante</label><input type="text" value="${esc(usuarioAtual.nome)}" disabled></div>
        <div class="field"><label>Setor</label><input type="text" id="r-sector" placeholder="Opcional"></div>
      </div>
      <div class="row-2">
        <div class="field"><label>Item</label><select id="r-item">${itemOptions(null)}</select></div>
        <div class="field"><label>Quantidade</label><input type="number" id="r-qty" min="1" value="1"></div>
      </div>
      <button type="button" class="btn btn-sm" style="width:100%;margin-bottom:10px;" onclick="adicionarItemRequisicao()">+ Adicionar item à requisição</button>
      ${itensLotePreviewHTML(requisicaoItens, 'removerItemRequisicao')}
      <div class="field"><label>Data</label><input type="date" id="r-date" value="${todayISO()}"></div>
      <div class="field"><label>Observação</label><input type="text" id="r-note" placeholder="Opcional"></div>
      <button class="btn btn-primary" onclick="registerRequisicao()" ${requisicaoItens.length===0?'disabled':''}>Criar requisição${requisicaoItens.length?' ('+requisicaoItens.length+' '+(requisicaoItens.length===1?'item':'itens')+')':''}</button>
    </div>
  ` : '';
  document.getElementById('main').innerHTML = `
    ${formularioHTML}
    <div class="section-label">Todas as requisições</div>
    ${list.length===0?'<div class="empty">Nenhuma requisição criada ainda</div>':list.map(r=>requisicaoCard(r)).join('')}
  `;
  document.getElementById('fab').innerHTML = '';
}
function requisicaoCard(r){
  const item = itemById(r.itemId);
  const souGestor = isGestor();
  const souAprovador = isAprovador();
  const souFuncionario = isFuncionario();
  return `<div class="card">
    <div class="item-row">
      <div>
        <div class="sub mono">${esc(r.codigo)}</div>
        <div class="name">${item?esc(item.name):'(item removido)'}</div>
        <div class="sub">${esc(r.requester||'—')}${r.sector?' · '+esc(r.sector):''} · ${fmtDate(r.date)}</div>
        ${r.note?`<div class="sub">${esc(r.note)}</div>`:''}
      </div>
      <div class="stock"><div class="q mono">${r.qty}</div></div>
    </div>
    <div style="margin-top:8px;display:flex;align-items:center;justify-content:space-between;gap:8px;">
      <span class="badge st-${r.status}">${r.status}</span>
      <div style="display:flex;gap:6px;">
        ${r.status==='pendente' && souAprovador?`<button class="btn btn-sm btn-teal" onclick="aprovarRequisicao('${r.id}')">Aprovar</button>`:''}
        ${r.status==='aprovada' && souFuncionario?`<button class="btn btn-sm btn-teal" onclick="atenderRequisicao('${r.id}')">Atender</button>`:''}
        ${(r.status==='pendente'||r.status==='aprovada') && souGestor?`<button class="btn btn-sm" onclick="cancelarRequisicao('${r.id}')">Cancelar</button>`:''}
      </div>
    </div>
  </div>`;
}

/* ---------- INVENTÁRIO ---------- */
function renderInventario(){
  document.getElementById('view-title').textContent = 'Inventário';
  document.getElementById('fab').innerHTML = '';
  const ajustes = state.movements.filter(m=>m.type==='ajuste').sort((a,b)=>b.date.localeCompare(a.date)||(b.id-a.id)).slice(0,15);

  const ordered = [];
  CATEGORIES.forEach(cat=>{
    state.items.filter(i=>i.category===cat).forEach(i=>ordered.push(i));
  });

  const ITEMS_PER_PAGE = 7;
  const totalPages = Math.max(1, Math.ceil(ordered.length / ITEMS_PER_PAGE));
  if(inventarioPage > totalPages) inventarioPage = totalPages;
  if(inventarioPage < 1) inventarioPage = 1;
  const pageItems = ordered.slice((inventarioPage-1)*ITEMS_PER_PAGE, inventarioPage*ITEMS_PER_PAGE);

  let rows = '';
  if(pageItems.length===0){
    rows = `<div class="empty">Nenhum item cadastrado</div>`;
  } else {
    let currentCat = null;
    pageItems.forEach(i=>{
      if(i.category !== currentCat){
        currentCat = i.category;
        rows += `<div class="section-label">${currentCat}</div>`;
      }
      const counted = inventoryCounts[i.id] !== undefined ? inventoryCounts[i.id] : i.currentStock;
      const diff = counted - i.currentStock;
      rows += `<div class="card">
        <div class="item-row">
          <div>
            <div class="name">${esc(i.name)}</div>
            <div class="sub">Sistema: ${i.currentStock} ${esc(i.unit)}</div>
          </div>
          <div style="width:90px;">
            <input type="number" value="${counted}" oninput="inventoryCounts['${i.id}']=Number(this.value); renderInventario();">
          </div>
        </div>
        <div style="margin-top:8px;display:flex;align-items:center;justify-content:space-between;">
          <span class="${diff===0?'hint':(diff>0?'diffplus':'diffminus')}">${diff===0?'Sem diferença':(diff>0?'+'+diff+' a mais':diff+' a menos')}</span>
          ${diff!==0?`<button class="btn btn-sm btn-primary" onclick="aplicarAjuste('${i.id}')">Aplicar ajuste</button>`:''}
        </div>
      </div>`;
    });
  }

  const pager = totalPages>1 ? `
    <div style="display:flex;align-items:center;justify-content:center;gap:12px;margin-top:16px;">
      <button class="btn btn-sm" ${inventarioPage<=1?'disabled':''} onclick="inventarioPage--; renderInventario();">‹ Anterior</button>
      <span class="hint">Página ${inventarioPage} de ${totalPages}</span>
      <button class="btn btn-sm" ${inventarioPage>=totalPages?'disabled':''} onclick="inventarioPage++; renderInventario();">Próxima ›</button>
    </div>` : '';

  document.getElementById('main').innerHTML = `
    <div class="card">
      <div class="field"><label>Responsável pela contagem</label><input type="text" id="inv-resp" value="${esc(inventoryResponsible)}" oninput="inventoryResponsible=this.value;" placeholder="Nome de quem está contando"></div>
      <div class="hint">Digite a quantidade física contada de cada item. Diferenças são aplicadas individualmente.</div>
    </div>
    ${rows}
    ${pager}
    <div class="section-label">Últimos ajustes</div>
    ${ajustes.length===0?'<div class="empty">Nenhum ajuste de inventário ainda</div>':ajustes.map(m=>movementCard(m)).join('')}
  `;
}