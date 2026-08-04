/* API de registro de movimentações (entradas e saídas) de estoque */
async function registerEntrada(){
  const itemId = document.getElementById('e-item').value;
  const qty = Number(document.getElementById('e-qty').value);
  const date = document.getElementById('e-date').value || todayISO();
  const note = document.getElementById('e-note').value.trim();
  if(!itemId){ showToast('Cadastre um item primeiro'); return; }
  if(!qty || qty<=0){ showToast('Informe uma quantidade válida'); return; }
  const item = itemById(itemId);
  item.currentStock += qty;
  state.movements.push({id:genId('mv'), type:'entrada', itemId, qty, date, note});
  await saveState();
  renderEntradas();
  showToast('Entrada registrada: +'+qty+' '+item.unit);
}


async function registerSaida(){
  const itemId = document.getElementById('s-item').value;
  const qty = Number(document.getElementById('s-qty').value);
  const date = document.getElementById('s-date').value || todayISO();
  const person = document.getElementById('s-person').value.trim();
  const dest = document.getElementById('s-dest').value.trim();
  if(!itemId){ showToast('Cadastre um item primeiro'); return; }
  if(!qty || qty<=0){ showToast('Informe uma quantidade válida'); return; }
  const item = itemById(itemId);
  if(qty > item.currentStock){
    if(!confirm('A quantidade é maior que o estoque atual ('+item.currentStock+'). Registrar mesmo assim?')) return;
  }
  item.currentStock -= qty;
  const note = [person, dest].filter(Boolean).join(' · ');
  state.movements.push({id:genId('mv'), type:'saida', itemId, qty, date, note});
  await saveState();
  renderSaidas();
  showToast('Saída registrada: -'+qty+' '+item.unit);
}

