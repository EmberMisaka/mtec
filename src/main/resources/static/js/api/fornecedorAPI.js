/* API de fornecedores. Criar/editar/excluir é restrito a administradores no backend
   (/api/fornecedores exige ROLE_ADMIN pra POST/PUT/DELETE) — o frontend também
   esconde a aba pra quem não é admin. */

function cnpjValido(cnpj){
    const d = String(cnpj||'').replace(/\D/g,'');
    if(d.length!==14 || /^(\d)\1{13}$/.test(d)) return false;
    const calc = (base, pesos) => {
        let soma=0;
        for(let i=0;i<pesos.length;i++) soma += Number(base[i])*pesos[i];
        const resto = soma % 11;
        return resto<2 ? 0 : 11-resto;
    };
    const dv1 = calc(d, [5,4,3,2,9,8,7,6,5,4,3,2]);
    const dv2 = calc(d, [6,5,4,3,2,9,8,7,6,5,4,3,2]);
    return Number(d[12])===dv1 && Number(d[13])===dv2;
}

function formatarCnpj(cnpj){
    const d = String(cnpj||'').replace(/\D/g,'');
    if(d.length!==14) return cnpj||'';
    return d.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
}

async function salvarFornecedor(id){
    const razaoSocial = document.getElementById('f-razao').value.trim();
    const nomeFantasia = document.getElementById('f-fantasia').value.trim();
    const cnpj = document.getElementById('f-cnpj').value.trim();
    const endereco = document.getElementById('f-endereco').value.trim();
    const errEl = document.getElementById('f-fornecedor-error');
    errEl.style.display = 'none';

    if(!razaoSocial || !nomeFantasia || !cnpj || !endereco){
        errEl.textContent = 'Preencha todos os campos';
        errEl.style.display = 'block';
        return;
    }
    if(!cnpjValido(cnpj)){
        errEl.textContent = 'CNPJ inválido';
        errEl.style.display = 'block';
        return;
    }

    const payload = {razaoSocial, nomeFantasia, cnpj, endereco};
    try{
        if(id){
            await apiFetch(`/fornecedores/${id}`, {method:'PUT', body:JSON.stringify(payload)});
        } else {
            await apiFetch('/fornecedores', {method:'POST', body:JSON.stringify(payload)});
        }
        await fetchFornecedores();
        closeModal();
        renderFornecedores();
        showToast('Fornecedor salvo');
    }catch(err){
        errEl.textContent = err.message || 'Erro ao salvar fornecedor';
        errEl.style.display = 'block';
    }
}

async function excluirFornecedor(id){
    if(!confirm('Excluir este fornecedor?')) return;
    try{
        await apiFetch('/fornecedores/'+id, {method:'DELETE'});
        await fetchFornecedores();
        renderFornecedores();
        showToast('Fornecedor excluído');
    }catch(err){
        showToast(err.message || 'Erro ao excluir fornecedor');
    }
}