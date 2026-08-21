/* View da aba Usuários: listagem e cadastro de novos usuários do sistema.
   Só é acessível (no menu e na tela) para quem está logado como ADMIN;
   a restrição de verdade é sempre imposta pelo backend. */
const PERFIS = [
  {id:'ADMIN', label:'Administrador'},
  {id:'GESTOR', label:'Gestor'},
  {id:'APROVADOR', label:'Aprovador'},
  {id:'FUNCIONARIO', label:'Funcionário'}
];

function perfilLabel(p){
  const found = PERFIS.find(x=>x.id===p);
  return found ? found.label : p;
}

function renderUsuarios(){
  document.getElementById('view-title').textContent = 'Usuários';

  if(!isAdmin()){
    document.getElementById('main').innerHTML = `<div class="empty"><div class="big">🔒</div>Acesso restrito a administradores</div>`;
    document.getElementById('fab').innerHTML = '';
    return;
  }

  const usuarios = state.usuarios || [];
  let list = '';
  if(usuarios.length===0){
    list = `<div class="empty"><div class="big">👤</div>Nenhum usuário cadastrado</div>`;
  } else {
    usuarios.forEach(u=>{
      const souEu = usuarioAtual && usuarioAtual.id === u.id;
      list += `<div class="card">
        <div class="item-row">
          <div style="min-width:0;">
            <div class="name">${esc(u.nome)}</div>
            <div class="sub">${esc(u.email)}</div>
          </div>
          <span class="badge perfil-${esc(u.perfil)}">${perfilLabel(u.perfil)}</span>
        </div>
        ${souEu ? '' : `<div style="margin-top:8px;"><button class="btn btn-sm" onclick="excluirUsuario(${u.id})">Excluir</button></div>`}
       </div>`;
    });
  }

  document.getElementById('main').innerHTML = `
    <div class="metrics">
      <div class="metric"><div class="n">${usuarios.length}</div><div class="l">usuários cadastrados</div></div>
    </div>
    ${list}
  `;
  document.getElementById('fab').innerHTML = `<button class="btn btn-primary" onclick="openUsuarioModal()">+ Novo usuário</button>`;
}

function openUsuarioModal(){
  document.getElementById('sheet').innerHTML = `
    <h2>Novo usuário</h2>
    <div class="field"><label>Nome</label><input type="text" id="u-nome"></div>
    <div class="field"><label>E-mail</label><input type="email" id="u-email" placeholder="usuario@empresa.com"></div>
    <div class="field"><label>Senha</label><input type="password" id="u-senha" placeholder="Mínimo 6 caracteres"></div>
    <div class="field"><label>Confirmar senha</label><input type="password" id="u-senha-confirmacao" placeholder="Repita a senha"></div>
    <div class="field"><label>Perfil</label>
      <select id="u-perfil">${PERFIS.map(p=>`<option value="${p.id}">${p.label}</option>`).join('')}</select>
    </div>
    <div id="u-error" class="hint" style="color:var(--red);display:none;margin-bottom:4px;"></div>
    <div class="sheet-actions">
      <button class="btn btn-primary" onclick="salvarUsuario()">Cadastrar</button>
    </div>
    <div style="margin-top:8px;"><button class="btn" onclick="closeModal()">Cancelar</button></div>
  `;
  document.getElementById('overlay').classList.remove('hidden');
}

async function salvarUsuario(){
  const nome = document.getElementById('u-nome').value.trim();
  const email = document.getElementById('u-email').value.trim();
  const senha = document.getElementById('u-senha').value;
  const confirmacaoSenha = document.getElementById('u-senha-confirmacao').value;
  const perfil = document.getElementById('u-perfil').value;
  const errEl = document.getElementById('u-error');
  errEl.style.display = 'none';

  if(!nome || !email || !senha || !confirmacaoSenha){
    errEl.textContent = 'Preencha nome, e-mail e senha (nos dois campos)';
    errEl.style.display = 'block';
    return;
  }
  if(senha.length < 6){
    errEl.textContent = 'A senha deve ter pelo menos 6 caracteres';
    errEl.style.display = 'block';
    return;
  }
  if(senha !== confirmacaoSenha){
    errEl.textContent = 'as senhas não combinam, tente novamente';
    errEl.style.display = 'block';
    return;
  }

  try{
    await criarUsuario({nome, email, senha, confirmacaoSenha, perfil});
    await fetchUsuarios();
    closeModal();
    renderUsuarios();
    showToast('Usuário cadastrado');
  }catch(err){
    errEl.textContent = err.message || 'Erro ao cadastrar usuário';
    errEl.style.display = 'block';
  }
}
