/* API de registro de movimentações (entradas e saídas) de estoque */
async function registerEntrada(){
  const itemId = document.getElementById('e-item').value;
  const qty = Number(document.getElementById('e-qty').value);
  const note = document.getElementById('e-note').value.trim();
  if(!itemId){ showToast('Cadastre um item primeiro'); return; }
  if(!qty || qty<=0){ showToast('Informe uma quantidade válida'); return; }
  const item = itemById(itemId);
  try{
    await apiFetch('/movimentacoes/entrada', {method:'POST', body:JSON.stringify({itemId:Number(itemId), quantidade:qty, observacao:note})});
    await Promise.all([fetchItems(), fetchMovimentacoes()]);
    renderEntradas();
    showToast('Entrada registrada: +'+qty+(item?' '+item.unit:''));
  }catch(err){
    showToast(err.message || 'Erro ao registrar entrada');
  }
}


async function registerSaida(){
  const itemId = document.getElementById('s-item').value;
  const qty = Number(document.getElementById('s-qty').value);
  const person = document.getElementById('s-person').value.trim();
  const dest = document.getElementById('s-dest').value.trim();
  if(!itemId){ showToast('Cadastre um item primeiro'); return; }
  if(!qty || qty<=0){ showToast('Informe uma quantidade válida'); return; }
  const item = itemById(itemId);
  if(item && qty > item.currentStock){
    if(!confirm('A quantidade é maior que o estoque atual ('+item.currentStock+'). Registrar mesmo assim?')) return;
  }
  const note = [person, dest].filter(Boolean).join(' · ');
  try{
    await apiFetch('/movimentacoes/saida', {method:'POST', body:JSON.stringify({itemId:Number(itemId), quantidade:qty, observacao:note})});
    await Promise.all([fetchItems(), fetchMovimentacoes()]);
    renderSaidas();
    showToast('Saída registrada: -'+qty+(item?' '+item.unit:''));
  }catch(err){
    showToast(err.message || 'Erro ao registrar saída');
  }
}
