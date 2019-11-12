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
        if (!data.username_length) {
            window.location = '/signup?username_length=true';
        } else if (!data.email_length) {
            window.location = '/signup?email_length=true';
        } else if (!data.email_valid) {
            window.location = '/signup?email_invalid=true';
        } else if (!data.password_valid) {
            window.location = '/signup?password_invalid=true';
        } else if (!data.username_unused) {
            window.location = '/signup?username_taken=true';
        } else if (data.success) {
            window.location = '/login?signup_success=true';
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
