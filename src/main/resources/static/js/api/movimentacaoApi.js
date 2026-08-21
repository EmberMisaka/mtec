/* API de registro de movimentações (entradas e saídas) de estoque */

function adicionarItemEntrada(){
  const itemId = document.getElementById('e-item').value;
  const qty = Number(document.getElementById('e-qty').value);
  if(!itemId){ showToast('Cadastre um item primeiro'); return; }
  if(!qty || qty<=0){ showToast('Informe uma quantidade válida'); return; }
  entradaItens.push({itemId:Number(itemId), qty});
  renderEntradas();
}
function removerItemEntrada(idx){
  entradaItens.splice(idx,1);
  renderEntradas();
}
async function registerEntrada(){
  if(entradaItens.length===0){ showToast('Adicione pelo menos um item'); return; }
  const note = document.getElementById('e-note').value.trim();
  const linkPecom = document.getElementById('e-pecom-link').value.trim();
  const numeroPecom = document.getElementById('e-pecom-num').value.trim();
  const numeroNf = document.getElementById('e-nf-num').value.trim();
  if(!linkPecom){ showToast('Informe o link do PECOM'); return; }
  if(!numeroPecom){ showToast('Informe o número do PECOM'); return; }
  if(!numeroNf){ showToast('Informe o número da NF'); return; }

  let sucesso = 0, falhas = 0;
  for(const it of entradaItens){
    try{
      await apiFetch('/movimentacoes/entrada', {method:'POST', body:JSON.stringify({itemId:it.itemId, quantidade:it.qty, observacao:note, linkPecom, numeroPecom, numeroNf})});
      sucesso++;
    }catch(err){
      falhas++;
      console.error('Falha ao registrar entrada do item', it.itemId, err);
    }
  }
  entradaItens = [];
  await Promise.all([fetchItems(), fetchMovimentacoes()]);
  renderEntradas();
  showToast(sucesso+' entrada(s) registrada(s)'+(falhas?', '+falhas+' falharam':''));
}

function adicionarItemSaida(){
  const itemId = document.getElementById('s-item').value;
  const qty = Number(document.getElementById('s-qty').value);
  if(!itemId){ showToast('Cadastre um item primeiro'); return; }
  if(!qty || qty<=0){ showToast('Informe uma quantidade válida'); return; }
  const item = itemById(itemId);
  if(item && qty > item.currentStock){
    if(!confirm('A quantidade é maior que o estoque atual ('+item.currentStock+') de '+item.name+'. Adicionar mesmo assim?')) return;
  }
  saidaItens.push({itemId:Number(itemId), qty});
  renderSaidas();
}
function removerItemSaida(idx){
  saidaItens.splice(idx,1);
  renderSaidas();
}
async function registerSaida(){
  if(saidaItens.length===0){ showToast('Adicione pelo menos um item'); return; }
  const person = document.getElementById('s-person').value.trim();
  const dest = document.getElementById('s-dest').value.trim();
  const note = [person, dest].filter(Boolean).join(' · ');

  let sucesso = 0, falhas = 0;
  for(const it of saidaItens){
    try{
      await apiFetch('/movimentacoes/saida', {method:'POST', body:JSON.stringify({itemId:it.itemId, quantidade:it.qty, observacao:note})});
      sucesso++;
    }catch(err){
      falhas++;
      console.error('Falha ao registrar saída do item', it.itemId, err);
    }
  }
  saidaItens = [];
  await Promise.all([fetchItems(), fetchMovimentacoes()]);
  renderSaidas();
  showToast(sucesso+' saída(s) registrada(s)'+(falhas?', '+falhas+' falharam':''));
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