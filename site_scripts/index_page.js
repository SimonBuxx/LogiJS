window.onscroll = function () { scrollFunction(); };
function scrollFunction() {
    if (document.body.scrollTop > 50 || document.documentElement.scrollTop > 50) {
        document.getElementById("top_logo").style.width = "200px";
        document.getElementById("front_teaser").style.opacity = "0";
        document.getElementById("main-carousel").style.opacity = "1";
    } else {
        document.getElementById("top_logo").style.width = "350px";
        document.getElementById("front_teaser").style.opacity = "1";
        document.getElementById("main-carousel").style.opacity = "0";
    }
}

let button = document.getElementsByClassName("all-samples-button")[0];
button.addEventListener("click", function () {
    let coll = document.getElementsByClassName("collapsible")[0];
    coll.classList.toggle("active");
    if (coll.style.maxHeight) {
        coll.style.maxHeight = null;
        button.innerHTML = "<i class=\"fas fa-stream\"></i> Show all";
    } else {
        coll.style.maxHeight = coll.scrollHeight + "px";
        button.innerHTML = "<i class=\"fas fa-stream\"></i> Show less";
    }
});

const Logout = document.querySelectorAll('.Logout');
for (const button of Logout) {
    button.addEventListener('click', (e) => { //jshint ignore:line
        e.preventDefault();
        setCookie('access_token', '', -1);
        window.location = '/';
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

function setCookie(name, value, days) {
    var d = new Date();
    d.setTime(d.getTime() + 24 * 60 * 60 * 1000 * days);
    document.cookie = name + "=" + value + ";path=/;expires=" + d.toGMTString();
}