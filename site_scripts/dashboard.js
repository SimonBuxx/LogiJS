let confButton = '';

const Logout = document.querySelectorAll('.Logout');
for (const button of Logout) {
    button.addEventListener('click', (e) => { //jshint ignore:line
        e.preventDefault();
        setCookie('access_token', '', -1);
        window.location = '/';
    });
}

const openButtons = document.querySelectorAll(".btn.open");
for (const button of openButtons) {
    button.addEventListener('click', function (event) { //jshint ignore:line
        window.location = '/editor?sketch=' + event.target.id;
    });
}

const deleteButtons = document.querySelectorAll(".delete");
for (const button of deleteButtons) {
    button.addEventListener('click', function (event) { //jshint ignore:line
        if (confButton !== event.target.id) {
            button.innerHTML = '<i class="fa fa-exclamation-circle" style="color: #c83232"></i> SURE?';
            confButton = event.target.id;
        } else {
            confButton = '';
            post('/delete', {
                sketch: event.currentTarget.id
            });
            location.reload();
        }
    });
}

const downloadButtons = document.querySelectorAll(".download");
for (const button of downloadButtons) {
    button.addEventListener('click', function (event) { //jshint ignore:line
        event.preventDefault();
        window.location = '/download?file=' + event.currentTarget.id.substring(2);
    });
}

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

function setCookie(name, value, days) {
    var d = new Date();
    d.setTime(d.getTime() + 24 * 60 * 60 * 1000 * days);
    document.cookie = name + "=" + value + ";path=/;expires=" + d.toGMTString();

}

const currentTheme = localStorage.getItem('theme');

if (currentTheme === 'dark') {
    document.documentElement.classList.toggle('dark-theme');
    document.getElementById('top_logo_small').src = 'images/logo_index_new_white.png';
    document.getElementById('mode-button').innerHTML = '<i class="fa fa-sun red"></i>';
}

document.getElementById('mode-button').addEventListener('click', function () {
    let theme = 'light';
    document.documentElement.classList.toggle('dark-theme');
    if (document.documentElement.classList.contains('dark-theme')) {
        theme = 'dark';
        document.getElementById('top_logo_small').src = 'images/logo_index_new_white.png';
        document.getElementById('mode-button').innerHTML = '<i class="fa fa-sun red"></i>';
    } else {
        theme = 'light';
        document.getElementById('top_logo_small').src = 'images/logo_index_new.png';
        document.getElementById('mode-button').innerHTML = '<i class="fa fa-moon red"></i>';
    }
    localStorage.setItem('theme', theme);
});
