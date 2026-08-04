/* Serviço de inventário: aplica ajustes de contagem física ao estoque */
async function aplicarAjuste(itemId){
  const item = itemById(itemId);
  const counted = inventoryCounts[itemId];
  const diff = counted - item.currentStock;
  if(diff===0) return;
  const resp = inventoryResponsible.trim();
  item.currentStock = counted;
  state.movements.push({id:genId('mv'), type:'ajuste', itemId, qty:diff, date:todayISO(), note:'Ajuste de inventário'+(resp?' · '+resp:'')});
  delete inventoryCounts[itemId];
  await saveState();
  renderInventario();
  showToast('Ajuste aplicado');
}

