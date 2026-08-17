/* API de gerenciamento de requisições de itens */
async function registerRequisicao(){
  const sector = document.getElementById('r-sector').value.trim();
  const itemId = document.getElementById('r-item').value;
  const qty = Number(document.getElementById('r-qty').value);
  const note = document.getElementById('r-note').value.trim();
  if(!itemId){ showToast('Cadastre um item primeiro'); return; }
  if(!qty || qty<=0){ showToast('Informe uma quantidade válida'); return; }
  try{
    await apiFetch('/requisicoes', {method:'POST', body:JSON.stringify({itemId:Number(itemId), setor:sector, quantidade:qty, observacao:note})});
    await fetchRequisicoes();
    renderRequisicoes();
    showToast('Requisição criada');
  }catch(err){
    showToast(err.message || 'Erro ao criar requisição');
  }
}
async function aprovarRequisicao(id){
  try{
    await apiFetch(`/requisicoes/${id}/aprovar`, {method:'PUT'});
    await fetchRequisicoes();
    renderRequisicoes();
    showToast('Requisição aprovada');
  }catch(err){
    showToast(err.message || 'Erro ao aprovar requisição');
  }
}
async function atenderRequisicao(id){
  try{
    await apiFetch(`/requisicoes/${id}/atender`, {method:'PUT'});
    await Promise.all([fetchItems(), fetchMovimentacoes(), fetchRequisicoes()]);
    renderRequisicoes();
    showToast('Requisição atendida');
  }catch(err){
    showToast(err.message || 'Erro ao atender requisição');
  }
}
async function cancelarRequisicao(id){
  try{
    await apiFetch(`/requisicoes/${id}/cancelar`, {method:'PUT'});
    await fetchRequisicoes();
    renderRequisicoes();
    showToast('Requisição cancelada');
  }catch(err){
    showToast(err.message || 'Erro ao cancelar requisição');
  }
}