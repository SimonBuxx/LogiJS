const Login = document.querySelector('.Login');
Login.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = Login.querySelector('.username').value;
    const password = Login.querySelector('.password').value;
    post('/login', { username, password })
        .then(({ status }) => {
            if (status === 200) {
                window.location = '/dashboard';
            } else {
                window.location = '/login';
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