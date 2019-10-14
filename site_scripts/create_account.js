const CreateUser = document.querySelector('.SignUp');
CreateUser.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = CreateUser.querySelector('.username').value;
    const email = CreateUser.querySelector('.email').value;
    const password = CreateUser.querySelector('.password').value;
    let invalid = (username.length >= 50 || password.length >= 50 || email.length >= 50 ||
        username.length < 5 || password.length < 6 || email.length < 6) && false;
    //if (invalid) {
    //window.location = '/signup?invalid=true';
    //} else {
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
        } else if (status === 200) {
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
    })
        .then(function (res) { console.log(res.ok); return res.json(); })
        .then(function (data) { return data; });
}
