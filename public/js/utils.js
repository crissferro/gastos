// public/js/utils.js
export const getToken = () => {
    return localStorage.getItem('token');
}

export const cargarContenido = (url, callback) => {
    const token = getToken();
    const mainContent = document.getElementById('mainContent');

    fetch(url, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Error al cargar el contenido');
            }
            return response.text();
        })
        .then(html => {
            mainContent.innerHTML = html;
            if (callback) {
                callback();
            }
        })
        .catch(error => {
            console.error('Error:', error);
            mainContent.innerHTML = '<p>Error al cargar el contenido.</p>';
        });
};
export const checkTokenAndRedirect = () => {
    const token = getToken();

    if (!token && window.location.pathname.includes('dashboard.html')) {
        window.location.href = 'index.html';
    }
};
