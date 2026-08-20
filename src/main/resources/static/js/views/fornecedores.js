/* View da aba Fornecedores: listagem e cadastro. Só é acessível (no menu e na tela)
   para quem está logado como ADMIN; a restrição de verdade é sempre imposta pelo backend. */

function renderFornecedores(){
    document.getElementById('view-title').textContent = 'Fornecedores';

    if(!isAdmin()){
        document.getElementById('main').innerHTML = `<div class="empty"><div class="big">🔒</div>Acesso restrito a administradores</div>`;
        document.getElementById('fab').innerHTML = '';
        return;
    }

    const fornecedores = state.fornecedores || [];
    let list = '';
    if(fornecedores.length===0){
        list = `<div class="empty"><div class="big">🏢</div>Nenhum fornecedor cadastrado</div>`;
    } else {
        fornecedores.forEach(f=>{
            list += `<div class="card">
        <div class="item-row">
          <div style="min-width:0;">
            <div class="name">${esc(f.nomeFantasia)}</div>
            <div class="sub">${esc(f.razaoSocial)}</div>
            <div class="sub">${esc(formatarCnpj(f.cnpj))} · ${esc(f.endereco)}</div>
          </div>
          <button class="btn-ghost" onclick="openFornecedorModal('${f.id}')" aria-label="Editar fornecedor">✎</button>
        </div>
        <div style="margin-top:8px;"><button class="btn btn-sm" onclick="excluirFornecedor('${f.id}')">Excluir</button></div>
      </div>`;
        });
    }

    document.getElementById('main').innerHTML = `
    <div class="metrics">
      <div class="metric"><div class="n">${fornecedores.length}</div><div class="l">fornecedores cadastrados</div></div>
    </div>
    ${list}
  `;
    document.getElementById('fab').innerHTML = `<button class="btn btn-primary" onclick="openFornecedorModal(null)">+ Novo fornecedor</button>`;
}

function openFornecedorModal(id){
    const editing = id ? (state.fornecedores||[]).find(f=>String(f.id)===String(id)) : null;
    document.getElementById('sheet').innerHTML = `
    <h2>${editing?'Editar fornecedor':'Novo fornecedor'}</h2>
    <div class="field"><label>Razão social</label><input type="text" id="f-razao" value="${editing?esc(editing.razaoSocial):''}"></div>
    <div class="field"><label>Nome fantasia</label><input type="text" id="f-fantasia" value="${editing?esc(editing.nomeFantasia):''}"></div>
    <div class="field"><label>CNPJ</label><input type="text" id="f-cnpj" placeholder="00.000.000/0000-00" value="${editing?esc(editing.cnpj):''}"></div>
    <div class="field"><label>Endereço</label><input type="text" id="f-endereco" value="${editing?esc(editing.endereco):''}"></div>
    <div id="f-fornecedor-error" class="hint" style="color:var(--red);display:none;margin-bottom:4px;"></div>
    <div class="sheet-actions">
      <button class="btn btn-primary" onclick="salvarFornecedor(${editing?`'${editing.id}'`:'null'})">Salvar</button>
    </div>
    <div style="margin-top:8px;"><button class="btn" onclick="closeModal()">Cancelar</button></div>
  `;
    document.getElementById('overlay').classList.remove('hidden');
}