window.onscroll = function () { scrollFunction(); };
function scrollFunction() {
    if (document.body.scrollTop > 50 || document.documentElement.scrollTop > 50) {
        document.getElementsByClassName("navbar-brand")[0].style.setProperty("transform", "scale(0.6)");
        document.getElementsByClassName("navbar-header")[0].style.setProperty("top", "-20px");
        document.getElementById("front_teaser").style.opacity = "0";
        document.getElementById("main-carousel").style.opacity = "1";
    } else {
        document.getElementsByClassName("navbar-brand")[0].style.setProperty("transform", "scale(1.0)");
        document.getElementsByClassName("navbar-header")[0].style.setProperty("top", "10px");
        document.getElementById("front_teaser").style.opacity = "1";
        if (document.body.clientWidth >= 1024) {
            document.getElementById("main-carousel").style.opacity = "0";
        }
    }
}

let button = document.getElementsByClassName("all-samples-button")[0];
button.addEventListener("click", function () {
    let coll = document.getElementsByClassName("collapsible")[0];
    coll.classList.toggle("active");
    if (coll.style.maxHeight) {
        coll.style.maxHeight = null;
        button.innerHTML = "<i class=\"fas fa-stream\"></i> Show All";
    } else {
        coll.style.maxHeight = coll.scrollHeight + "px";
        button.innerHTML = "<i class=\"fas fa-stream\"></i> Show Less";
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

let currentTheme = localStorage.getItem('theme');

if (currentTheme !== 'light') {
    currentTheme = 'dark';
    localStorage.setItem('theme', currentTheme);
}

if (currentTheme === 'dark') {
    document.documentElement.classList.toggle('dark-theme');
    document.getElementById('top_logo').src = 'images/logo_index_new_white.png';
    document.getElementById('mode-button').innerHTML = '<i class="fa fa-sun red"></i>';
    document.getElementById('front_teaser').src = 'images/front_teaser.png';
    document.getElementById('carousel-1').src = 'images/carousel_1_new_dark.png';
    document.getElementById('carousel-2').src = 'images/carousel_2_new_dark.png';
    document.getElementById('carousel-3').src = 'images/carousel_3_new_dark.png';
}

document.getElementById('mode-button').addEventListener('click', function () {
    let theme = 'light';
    document.documentElement.classList.toggle('dark-theme');
    if (document.documentElement.classList.contains('dark-theme')) {
        theme = 'dark';
        document.getElementById('top_logo').src = 'images/logo_index_new_white.png';
        document.getElementById('mode-button').innerHTML = '<i class="fa fa-sun red"></i>';
        document.getElementById('front_teaser').src = 'images/front_teaser.png';
        document.getElementById('carousel-1').src = 'images/carousel_1_new_dark.png';
        document.getElementById('carousel-2').src = 'images/carousel_2_new_dark.png';
        document.getElementById('carousel-3').src = 'images/carousel_3_new_dark.png';
    } else {
        theme = 'light';
        document.getElementById('top_logo').src = 'images/logo_index_new.png';
        document.getElementById('mode-button').innerHTML = '<i class="fa fa-moon red"></i>';
        document.getElementById('front_teaser').src = 'images/front_teaser_white.png';
        document.getElementById('carousel-1').src = 'images/carousel_1_new.png';
        document.getElementById('carousel-2').src = 'images/carousel_2_new.png';
        document.getElementById('carousel-3').src = 'images/carousel_3_new.png';
    }
    localStorage.setItem('theme', theme);
});

function setCookie(name, value, days) {
    var d = new Date();
    d.setTime(d.getTime() + 24 * 60 * 60 * 1000 * days);
    document.cookie = name + "=" + value + ";path=/;expires=" + d.toGMTString();
}