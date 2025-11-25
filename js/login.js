const form = document.getElementById('loginForm');
const errorMessage = document.getElementById('errorMessage');
const loginBtn = document.getElementById('loginBtn');

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    // Ocultar mensaje de error previo
    errorMessage.classList.remove('show');
    errorMessage.textContent = '';
    
    // Deshabilitar botón durante el proceso
    loginBtn.disabled = true;
    loginBtn.textContent = 'Ingresando...';

    try {
        const formData = new FormData();
        formData.append('action', 'login');
        formData.append('email', email);
        formData.append('password', password);

        const response = await fetch('/auth.php', {
            method: 'POST',
            body: formData
        });

        const data = await response.json();

        if (response.ok && data.success) {
            // Login exitoso - redirigir al dashboard
            window.location.href = '/dashboard';
        } else {
            // Mostrar error
            errorMessage.textContent = data.error || 'Error al iniciar sesión';
            errorMessage.classList.add('show');
        }
    } catch (err) {
        console.error('Error de conexión:', err);
        errorMessage.textContent = 'Error de conexión. Intenta nuevamente.';
        errorMessage.classList.add('show');
    } finally {
        // Rehabilitar botón
        loginBtn.disabled = false;
        loginBtn.textContent = 'Ingresar';
    }
});