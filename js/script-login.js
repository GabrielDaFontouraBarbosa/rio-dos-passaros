const loginForm = document.getElementById('loginForm');
const loginError = document.getElementById('loginError');

loginForm.addEventListener('submit', async function (e) {
    e.preventDefault();

    const user = document.getElementById('username').value;
    const pass = document.getElementById('password').value;

    loginError.textContent = '';

    try {
        const res = await fetch('./login.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user, pass }),
        });
        const dados = await res.json();

        if (dados.ok) {
            window.location.href = 'admin.html';
        } else {
            loginError.textContent = dados.erro || 'Usuário ou senha incorretos!';
            loginError.style.color = 'red';
        }
    } catch (err) {
        loginError.textContent = 'Não foi possível conectar ao servidor. Tente de novo.';
        loginError.style.color = 'red';
    }
});
