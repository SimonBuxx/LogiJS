const Logout = document.querySelectorAll('.Logout');
for (const button of Logout) {
  button.addEventListener('click', (e) => { //jshint ignore:line
    e.preventDefault();
    setCookie('access_token', '', -1);
    window.location = '/';
  });
}

function setCookie(name, value, days) {
  var d = new Date();
  d.setTime(d.getTime() + 24 * 60 * 60 * 1000 * days);
  document.cookie = name + "=" + value + ";path=/;expires=" + d.toGMTString();
}

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