const CreateUser = document.querySelector('.SignUp');
CreateUser.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = CreateUser.querySelector('.username').value;
    const password = CreateUser.querySelector('.password').value;
    let invalid = (username.length >= 50 || password.length >= 50 ||
        username.length < 5 || password.length <= 8);
    if (invalid) {
        window.location = '/signup?invalid=true';
    } else {
        post('/createUser', { username, password }).then(({ status }) => {
            if (status === 200) {
                window.location = '/login';
            } else {
                window.location = '/signup?failed=true';
            }
        });
    }
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
