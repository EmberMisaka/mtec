/* API de registro de movimentações (entradas e saídas) de estoque */
async function registerEntrada(){
  const itemId = document.getElementById('e-item').value;
  const qty = Number(document.getElementById('e-qty').value);
  const note = document.getElementById('e-note').value.trim();
  const linkPecom = document.getElementById('e-pecom-link').value.trim();
  const numeroPecom = document.getElementById('e-pecom-num').value.trim();
  const numeroNf = document.getElementById('e-nf-num').value.trim();
  if(!itemId){ showToast('Cadastre um item primeiro'); return; }
  if(!qty || qty<=0){ showToast('Informe uma quantidade válida'); return; }
  if(!linkPecom){ showToast('Informe o link do PECOM'); return; }
  if(!numeroPecom){ showToast('Informe o número do PECOM'); return; }
  if(!numeroNf){ showToast('Informe o número da NF'); return; }
  const item = itemById(itemId);
  try{
    await apiFetch('/movimentacoes/entrada', {method:'POST', body:JSON.stringify({itemId:Number(itemId), quantidade:qty, observacao:note, linkPecom, numeroPecom, numeroNf})});
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

function exportarMovimentacoes(tipo){
  const label = tipo==='entrada' ? 'Entradas' : 'Saidas';
  const rows = [['Data','Item','Quantidade','Observacao']];
  state.movements.filter(m=>m.type===tipo).forEach(m=>{
    const item = itemById(m.itemId);
    rows.push([m.date, item?item.name:'(item removido)', m.qty, m.note||'']);
  });
  const ws = XLSX.utils.aoa_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, label);
  XLSX.writeFile(wb, (tipo==='entrada'?'entradas':'saidas')+'-almoxarifado.xlsx');
}