const loginForm = document.getElementById('loginForm');
const loginError = document.getElementById('loginError');

loginForm.addEventListener('submit', function (e) {
    e.preventDefault();

    const user = document.getElementById('username').value;
    const pass = document.getElementById('password').value;

    if (user === 'admin' && pass === 'riodospassaros') {
        window.location.href = 'admin.html';
    } else {
        loginError.textContent = 'Usuário ou senha incorretos!';
        loginError.style.color = 'red';
    }
});
