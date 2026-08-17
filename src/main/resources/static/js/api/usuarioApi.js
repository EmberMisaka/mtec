/* API de usuários do sistema. Toda esta API é restrita a administradores no backend
   (/api/usuarios exige ROLE_ADMIN) — o frontend também esconde a aba pra quem não é admin. */
async function criarUsuario(payload){
  return apiFetch('/usuarios', {method:'POST', body:JSON.stringify(payload)});
}
async function excluirUsuario(id){
  if(!confirm('Excluir este usuário?')) return;
  try{
    await apiFetch('/usuarios/'+id, {method:'DELETE'});
    await fetchUsuarios();
    renderUsuarios();
    showToast('Usuário excluído');
  }catch(err){
    showToast(err.message || 'Erro ao excluir usuário');
  }
}