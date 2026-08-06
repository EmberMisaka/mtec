/* Serviço de inventário: aplica ajustes de contagem física ao estoque */
async function aplicarAjuste(itemId){
  const item = itemById(itemId);
  const counted = inventoryCounts[itemId];
  if(counted===undefined || !item) return;
  const diff = counted - item.currentStock;
  if(diff===0) return;
  const resp = inventoryResponsible.trim();
  try{
    await apiFetch('/movimentacoes/ajuste', {method:'POST', body:JSON.stringify({itemId:Number(itemId), contagemFisica:counted, observacao:'Ajuste de inventário'+(resp?' · '+resp:'')})});
    delete inventoryCounts[itemId];
    await Promise.all([fetchItems(), fetchMovimentacoes()]);
    renderInventario();
    showToast('Ajuste aplicado');
  }catch(err){
    showToast(err.message || 'Erro ao aplicar ajuste');
  }
}
