/* API de gerenciamento de requisições de itens */
async function registerRequisicao(){
  const requester = document.getElementById('r-person').value.trim();
  const sector = document.getElementById('r-sector').value.trim();
  const itemId = document.getElementById('r-item').value;
  const qty = Number(document.getElementById('r-qty').value);
  const date = document.getElementById('r-date').value || todayISO();
  const note = document.getElementById('r-note').value.trim();
  if(!itemId){ showToast('Cadastre um item primeiro'); return; }
  if(!requester){ showToast('Informe o solicitante'); return; }
  if(!qty || qty<=0){ showToast('Informe uma quantidade válida'); return; }
  state.requisicoes.push({id:genId('rq'), requester, sector, itemId, qty, date, note, status:'pendente'});
  await saveState();
  renderRequisicoes();
  showToast('Requisição criada');
}
async function atenderRequisicao(id){
  const r = state.requisicoes.find(x=>x.id===id);
  const item = itemById(r.itemId);
  if(!item){ showToast('Item não encontrado'); return; }
  if(r.qty > item.currentStock){
    showToast('Estoque insuficiente para atender ('+item.currentStock+' disponível)');
    return;
  }
  item.currentStock -= r.qty;
  state.movements.push({id:genId('mv'), type:'saida', itemId:item.id, qty:r.qty, date:todayISO(), note:'Requisição de '+r.requester});
  r.status = 'atendida';
  await saveState();
  renderRequisicoes();
  showToast('Requisição atendida');
}
async function cancelarRequisicao(id){
  const r = state.requisicoes.find(x=>x.id===id);
  r.status = 'cancelada';
  await saveState();
  renderRequisicoes();
  showToast('Requisição cancelada');
}

