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

const currentTheme = localStorage.getItem('theme');

if (currentTheme === 'dark') {
    document.documentElement.classList.toggle('dark-theme');
    document.getElementById('top_logo').src = 'images/logo_index_new_white.png';
    document.getElementById('mode-button').innerHTML = '<i class="fa fa-sun red"></i>';
}

document.getElementById('mode-button').addEventListener('click', function () {
    let theme = 'light';
    document.documentElement.classList.toggle('dark-theme');
    if (document.documentElement.classList.contains('dark-theme')) {
        theme = 'dark';
        document.getElementById('top_logo').src = 'images/logo_index_new_white.png';
        document.getElementById('mode-button').innerHTML = '<i class="fa fa-sun red"></i>';
    } else {
        theme = 'light';
        document.getElementById('top_logo').src = 'images/logo_index_new.png';
        document.getElementById('mode-button').innerHTML = '<i class="fa fa-moon red"></i>';
    }
    localStorage.setItem('theme', theme);
});