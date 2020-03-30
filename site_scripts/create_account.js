const CreateUser = document.querySelector('.SignUp');
CreateUser.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = CreateUser.querySelector('.username').value;
    const email = CreateUser.querySelector('.email').value;
    const password = CreateUser.querySelector('.password').value;
    post('/createUser', {
        username: username,
        email: email,
        password: password
    }).then(function (data) {
        if (data.error_code === 0) {
            window.location = '/login?signup_success=true';
        } else {
            window.location = '/signup?error_code=' + data.error_code;
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
    })
        .then(function (res) { console.log(res.ok); return res.json(); })
        .then(function (data) { return data; });
}
