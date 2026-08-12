/* API de usuários do sistema. Toda esta API é restrita a administradores no backend
   (/api/usuarios exige ROLE_ADMIN) — o frontend também esconde a aba pra quem não é admin. */
async function criarUsuario(payload){
  return apiFetch('/usuarios', {method:'POST', body:JSON.stringify(payload)});
}
