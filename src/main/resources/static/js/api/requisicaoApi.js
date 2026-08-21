/* API de gerenciamento de requisições de itens */

function adicionarItemRequisicao(){
  const itemId = document.getElementById('r-item').value;
  const qty = Number(document.getElementById('r-qty').value);
  if(!itemId){ showToast('Cadastre um item primeiro'); return; }
  if(!qty || qty<=0){ showToast('Informe uma quantidade válida'); return; }
  requisicaoItens.push({itemId:Number(itemId), qty});
  renderRequisicoes();
}
function removerItemRequisicao(idx){
  requisicaoItens.splice(idx,1);
  renderRequisicoes();
}
async function registerRequisicao(){
  if(requisicaoItens.length===0){ showToast('Adicione pelo menos um item'); return; }
  const sector = document.getElementById('r-sector').value.trim();
  const note = document.getElementById('r-note').value.trim();

  let sucesso = 0, falhas = 0;
  for(const it of requisicaoItens){
    try{
      await apiFetch('/requisicoes', {method:'POST', body:JSON.stringify({itemId:it.itemId, setor:sector, quantidade:it.qty, observacao:note})});
      sucesso++;
    }catch(err){
      falhas++;
      console.error('Falha ao criar requisição do item', it.itemId, err);
    }
  }
  requisicaoItens = [];
  await fetchRequisicoes();
  renderRequisicoes();
  showToast(sucesso+' requisição(ões) criada(s)'+(falhas?', '+falhas+' falharam':''));
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