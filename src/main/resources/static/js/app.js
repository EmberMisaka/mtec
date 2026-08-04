/* Estado global, constantes e utilidades da aplicação */
const CATEGORIES = ['Limpeza','Escritório','Café'];
const TABS = [
  {id:'estoque', label:'Estoque', icon:'<path d="M21 8L12 3 3 8v8l9 5 9-5V8z"/><path d="M3 8l9 5 9-5"/><path d="M12 13v8"/>'},
  {id:'entradas', label:'Entradas', icon:'<path d="M12 3v10"/><path d="M8 9l4 4 4-4"/><path d="M4 15v4a2 2 0 002 2h12a2 2 0 002-2v-4"/>'},
  {id:'saidas', label:'Saídas', icon:'<path d="M12 13V3"/><path d="M8 7l4-4 4 4"/><path d="M4 15v4a2 2 0 002 2h12a2 2 0 002-2v-4"/>'},
  {id:'requisicoes', label:'Requisições', icon:'<rect x="6" y="4" width="12" height="16" rx="2"/><path d="M9 4V2h6v2"/><path d="M9 10h6M9 14h6"/>'},
  {id:'inventario', label:'Inventário', icon:'<path d="M4 6h2M4 12h2M4 18h2"/><path d="M9 6h11M9 12h11M9 18h11"/>'}
];

let state = null;
let currentTab = 'estoque';
let pendingImportRows = [];
let pendingImportErrors = [];
let stockFilter = {search:'', category:'Todos'};
let inventoryResponsible = '';
let inventoryCounts = {};

function genId(p){ return p+'_'+Date.now().toString(36)+Math.random().toString(36).slice(2,7); }
function todayISO(){ return new Date().toISOString().slice(0,10); }
function fmtDate(iso){ if(!iso) return ''; const [y,m,d]=iso.split('-'); return d+'/'+m+'/'+y; }
function esc(s){ return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }

function mkItem(name,category,unit,minStock,currentStock,brand='',costPrice=0,image=null){
  return {id:genId('it'), name, category, unit, minStock, currentStock, brand, costPrice, image};
}
function seedState(){
  return {
    items:[
      mkItem('Álcool em gel 500ml','Limpeza','un',10,24),
      mkItem('Detergente neutro 500ml','Limpeza','un',8,15),
      mkItem('Desinfetante 1L','Limpeza','un',6,4),
      mkItem('Papel higiênico (fardo)','Limpeza','fardo',4,9),
      mkItem('Sabonete líquido 250ml','Limpeza','un',6,11),
      mkItem('Pano multiuso','Limpeza','un',10,20),
      mkItem('Papel A4 (resma)','Escritório','resma',10,18),
      mkItem('Caneta esferográfica azul','Escritório','un',20,45),
      mkItem('Grampeador','Escritório','un',3,5),
      mkItem('Grampos 26/6 (caixa)','Escritório','cx',5,8),
      mkItem('Bloco de post-it','Escritório','un',6,10),
      mkItem('Toner para impressora','Escritório','un',2,1),
      mkItem('Café torrado e moído 500g','Café','pct',10,22),
      mkItem('Açúcar refinado 1kg','Café','pct',6,9),
      mkItem('Filtro de papel 103','Café','pct',8,14),
      mkItem('Copo descartável 50ml','Café','pct',10,6),
      mkItem('Adoçante','Café','un',4,7)
    ],
    movements:[],
    requisicoes:[]
  };
}

async function loadState(){
  try{
    const res = await window.storage.get('almoxarifado-estado', true);
    return res && res.value ? JSON.parse(res.value) : null;
  }catch(e){ return null; }
}
async function saveState(){
  try{ await window.storage.set('almoxarifado-estado', JSON.stringify(state), true); }
  catch(e){ showToast('Erro ao salvar dados'); console.error(e); }
}

function showToast(msg){
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(t._timer);
  t._timer = setTimeout(()=>t.classList.remove('show'), 2200);
}

function itemById(id){ return state.items.find(i=>i.id===id); }

function itemOptions(selectedId){
  return CATEGORIES.map(cat=>{
    const opts = state.items.filter(i=>i.category===cat)
      .map(i=>`<option value="${i.id}" ${i.id===selectedId?'selected':''}>${esc(i.name)}${i.brand?' — '+esc(i.brand):''} (${esc(i.unit)})</option>`).join('');
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

async function init(){
  document.getElementById('main').innerHTML = '<div class="empty">Carregando...</div>';
  let loaded = await loadState();
  if(!loaded){
    loaded = seedState();
    state = loaded;
    await saveState();
  } else {
    state = loaded;
  }
  render();
}
init();
