//let socket = io.connect();
let confButton = '';

/*let sketchData = [];

sketchData = fetch('/sketches')
    .then(function (res) {
        return res.json();
    });

sketchData.then(function (data) {
    console.log(data);
});*/

const Logout = document.querySelector('.Logout');
Logout.addEventListener('submit', (e) => {
    e.preventDefault();
    setCookie('access_token', '', -1);
    window.location = '/';
});

const openButtons = document.querySelectorAll(".btn.open");
for (const button of openButtons) {
    button.addEventListener('click', function (event) { //jshint ignore:line
        window.location = '/editor?sketch=' + event.target.id;
    });
}

const openImages = document.querySelectorAll(".top_layer");
for (const image of openImages) {
    image.addEventListener('click', function (event) { //jshint ignore:line
        window.location = '/editor?sketch=' + event.target.id.substring(2);
    });
}

const deleteButtons = document.querySelectorAll(".btn.delete");
for (const button of deleteButtons) {
    button.addEventListener('click', function (event) { //jshint ignore:line
        /*if (confButton !== event.target.id) {
            button.value = 'SURE?';
            if (confButton !== '') {
                document.querySelector('.delete#' + confButton).value = 'Delete';
            }
            confButton = event.target.id;
        } else {*/
            //((confButton = '';
            post('/delete', {
                sketch: event.currentTarget.id
            });
            location.reload();
        //}
    });
}

const downloadButtons = document.querySelectorAll(".btn.download");
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
