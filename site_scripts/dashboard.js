const Logout = document.querySelector('.Logout');
Logout.addEventListener('submit', (e) => {
    e.preventDefault();
    post('/logout', {})
        .then(() => {
            window.location = '/';
        });
});

function post(path, data) {
    return window.fetch(path, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });
}