document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const usernameInput = document.getElementById('username').value;
    const passwordInput = document.getElementById('password').value;
    const errorMsg = document.getElementById('error-message');
    const loginBtn = document.getElementById('loginBtn');

    loginBtn.disabled = true;
    errorMsg.classList.remove('visible');

    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username: usernameInput, password: passwordInput })
        });

        const data = await response.json();

        if (response.ok && data.token) {
            //сохранить токен в localStorage
            localStorage.setItem('auth_token', data.token);
            //редирект на основную страницу
            window.location.href = '/index.html';
        } else {
            errorMsg.textContent = data.message || '❌ Неверный логин или пароль';
            errorMsg.classList.add('visible');
        }
    } catch (err) {
        console.error('Login error:', err);
        errorMsg.textContent = '❌ Ошибка сервера. Попробуйте позже.';
        errorMsg.classList.add('visible');
    } finally {
        loginBtn.disabled = false;
    }
});

//сохранение логина
if (localStorage.getItem('auth_token')) {
    window.location.href = '/index.html';
}