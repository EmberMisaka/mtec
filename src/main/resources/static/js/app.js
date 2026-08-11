/* Estado global, constantes e utilidades da aplicação */
let CATEGORIES = [];
let categoriaIdPorNome = {};
const TABS = [
  {id:'estoque', label:'Estoque', icon:'<path d="M21 8L12 3 3 8v8l9 5 9-5V8z"/><path d="M3 8l9 5 9-5"/><path d="M12 13v8"/>'},
  {id:'entradas', label:'Entradas', icon:'<path d="M12 3v10"/><path d="M8 9l4 4 4-4"/><path d="M4 15v4a2 2 0 002 2h12a2 2 0 002-2v-4"/>'},
  {id:'saidas', label:'Saídas', icon:'<path d="M12 13V3"/><path d="M8 7l4-4 4 4"/><path d="M4 15v4a2 2 0 002 2h12a2 2 0 002-2v-4"/>'},
  {id:'requisicoes', label:'Requisições', icon:'<rect x="6" y="4" width="12" height="16" rx="2"/><path d="M9 4V2h6v2"/><path d="M9 10h6M9 14h6"/>'},
  {id:'inventario', label:'Inventário', icon:'<path d="M4 6h2M4 12h2M4 18h2"/><path d="M9 6h11M9 12h11M9 18h11"/>'}
];

let state = null;
let currentTab = 'estoque';
let usuarioAtual = null;
let pendingImportRows = [];
let pendingImportErrors = [];
let stockFilter = {search:'', category:'Todos'};
let inventoryResponsible = '';
let inventoryCounts = {};

function todayISO(){ return new Date().toISOString().slice(0,10); }
function fmtDate(iso){ if(!iso) return ''; const [y,m,d]=iso.split('-'); return d+'/'+m+'/'+y; }
function esc(s){ return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }

/* ---------- CAMADA HTTP ----------
   Ponto único de conversa com o backend. Toda função de api/*.js passa por aqui. */
const API_BASE = '/api';

async function apiFetch(path, options={}){
  const res = await fetch(API_BASE + path, {
    headers: {'Content-Type':'application/json'},
    ...options
  });
  if(!res.ok){
    let msg = 'Erro na requisição ('+res.status+')';
    try{ const body = await res.json(); if(body.erro) msg = body.erro; }catch(e){}
    throw new Error(msg);
  }
  if(res.status === 204) return null;
  return res.json();
}

/* ---------- ADAPTADORES ----------
   O backend fala PT-BR e usa objeto aninhado pra categoria (Item.categoria = {id, nome}).
   O restante do app (views) fala o "dialeto" original em EN. Essas funções traduzem
   nos dois sentidos, então nada em views/estoque.js e views/movimentacoes.js precisa mudar. */
function mapItemFromApi(it){
  return {
    id: it.id,
    name: it.nome,
    category: it.categoria ? it.categoria.nome : '',
    unit: it.unidade,
    minStock: it.estoqueMinimo,
    currentStock: it.estoqueAtual,
    brand: it.marca,
    costPrice: it.precoCusto,
    image: it.imagemUrl
  };
}
function mapItemToApi(item){
  return {
    nome: item.name,
    categoria: {id: categoriaIdPorNome[item.category]},
    unidade: item.unit,
    estoqueMinimo: item.minStock,
    estoqueAtual: item.currentStock,
    marca: item.brand,
    precoCusto: item.costPrice,
    imagemUrl: item.image
  };
}
function mapMovimentacaoFromApi(m){
  return {
    id: m.id,
    type: m.tipo.toLowerCase(),
    itemId: m.item.id,
    qty: m.quantidade,
    date: m.data,
    note: m.observacao
  };
}
function mapRequisicaoFromApi(r){
  return {
    id: r.id,
    requester: r.solicitante,
    sector: r.setor,
    itemId: r.item.id,
    qty: r.quantidade,
    date: r.data,
    note: r.observacao,
    status: r.status.toLowerCase()
  };
}

/* ---------- CARREGAMENTO DE DADOS ---------- */
async function fetchCategorias(){
  const categorias = await apiFetch('/categorias');
  CATEGORIES = categorias.map(c=>c.nome);
  categoriaIdPorNome = {};
  categorias.forEach(c=>{ categoriaIdPorNome[c.nome] = c.id; });
}
async function fetchItems(){
  const itens = await apiFetch('/itens');
  state.items = itens.map(mapItemFromApi);
}
async function fetchMovimentacoes(){
  const movs = await apiFetch('/movimentacoes');
  state.movements = movs.map(mapMovimentacaoFromApi);
}
async function fetchRequisicoes(){
  const reqs = await apiFetch('/requisicoes');
  state.requisicoes = reqs.map(mapRequisicaoFromApi);
}

function showToast(msg){
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(t._timer);
  t._timer = setTimeout(()=>t.classList.remove('show'), 2200);
}

/* Comparação tolerante: o <select> devolve string, o backend devolve number (Long) */
function itemById(id){ return state.items.find(i=>String(i.id)===String(id)); }

function itemOptions(selectedId){
  return CATEGORIES.map(cat=>{
    const opts = state.items.filter(i=>i.category===cat)
        .map(i=>`<option value="${i.id}" ${String(i.id)===String(selectedId)?'selected':''}>${esc(i.name)}${i.brand?' — '+esc(i.brand):''} (${esc(i.unit)})</option>`).join('');
    return opts ? `<optgroup label="${cat}">${opts}</optgroup>` : '';
  }).join('');
}


/* ---------- NAV ---------- */
function renderNav(){
  const nav = document.getElementById('bottom-nav');
  nav.innerHTML = TABS.map(t=>`
    <button class="${t.id===currentTab?'active':''}" onclick="setTab('${t.id}')">
      <svg viewBox="0 0 24 24">${t.icon}</svg>
      <span>${t.label}</span>
    </button>`).join('');
}
function setTab(id){ currentTab = id; render(); }

function closeModal(){ document.getElementById('overlay').classList.add('hidden'); }

/* ---------- ROOT RENDER ---------- */
function render(){
  renderNav();
  if(currentTab==='estoque') renderEstoque();
  else if(currentTab==='entradas') renderEntradas();
  else if(currentTab==='saidas') renderSaidas();
  else if(currentTab==='requisicoes') renderRequisicoes();
  else if(currentTab==='inventario') renderInventario();
}

async function checkAuth(){
  try{
    usuarioAtual = await apiFetch('/auth/me');
    return true;
  }catch(err){
    usuarioAtual = null;
    return false;
  }
}

async function carregarDados(){
  document.getElementById('main').innerHTML = '<div class="empty">Carregando...</div>';
  state = {items:[], movements:[], requisicoes:[]};
  try{
    await fetchCategorias();
    await Promise.all([fetchItems(), fetchMovimentacoes(), fetchRequisicoes()]);
  }catch(e){
    console.error(e);
    document.getElementById('main').innerHTML = '<div class="empty">Não foi possível conectar ao servidor.</div>';
    showToast('Erro ao carregar dados do servidor');
    return;
  }
  render();
}

async function checkAuth(){
  try{
    usuarioAtual = await apiFetch('/auth/me');
    return true;
  }catch(err){
    usuarioAtual = null;
    return false;
  }
}

async function logout(){
  try{ await apiFetch('/auth/logout', {method:'POST'}); }catch(err){}
  window.location.href = 'login.html';
}

async function init(){
  const autenticado = await checkAuth();
  if(!autenticado){
    window.location.href = 'login.html';
    return;
  }
  await carregarDados();
}
init();