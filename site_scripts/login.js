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