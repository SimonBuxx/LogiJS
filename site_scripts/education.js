window.onscroll = function () { scrollFunction(); };
function scrollFunction() {
    if (document.body.scrollTop > 50 || document.documentElement.scrollTop > 50) {
        document.getElementsByClassName("navbar-brand")[0].style.setProperty("transform", "scale(0.6)");
        document.getElementsByClassName("navbar-header")[0].style.setProperty("top", "-20px");
    } else {
        document.getElementsByClassName("navbar-brand")[0].style.setProperty("transform", "scale(1.0)");
        document.getElementsByClassName("navbar-header")[0].style.setProperty("top", "10px");
    }
}

const Logout = document.querySelectorAll('.Logout');
for (const button of Logout) {
    button.addEventListener('click', (e) => { //jshint ignore:line
        e.preventDefault();
        setCookie('access_token', '', -1);
        window.location = '/';
    });
}

let currentTheme = localStorage.getItem('theme');

if (currentTheme !== 'light') {
    currentTheme = 'dark';
    localStorage.setItem('theme', currentTheme);
}

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

function setCookie(name, value, days) {
    var d = new Date();
    d.setTime(d.getTime() + 24 * 60 * 60 * 1000 * days);
    document.cookie = name + "=" + value + ";path=/;expires=" + d.toGMTString();
}