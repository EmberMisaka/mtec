async function fazerLogin(){
    const email = document.getElementById('login-email').value.trim();
    const senha = document.getElementById('login-senha').value;
    const errEl = document.getElementById('login-error');
    errEl.style.display = 'none';
    if(!email || !senha){
        errEl.textContent = 'Informe e-mail e senha';
        errEl.style.display = 'block';
        return;
    }
    try{
        const res = await fetch('/api/auth/login', {
            method:'POST',
            headers:{'Content-Type':'application/json'},
            body: JSON.stringify({email, senha})
        });
        if(!res.ok) throw new Error();
        window.location.href = 'index.html';
    }catch(err){
        errEl.textContent = 'E-mail ou senha inválidos';
        errEl.style.display = 'block';
    }
}

document.getElementById('login-senha').addEventListener('keydown', e=>{
    if(e.key==='Enter') fazerLogin();
});