const Login = document.querySelector('.Login');
Login.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = Login.querySelector('.username').value;
    const password = Login.querySelector('.password').value;
    post('/login', { username, password })
        .then(function (response) {
            if (response.status === 200) {
                window.location = '/dashboard';
            } else {
                window.location = '/login?failed=true';
            }
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
