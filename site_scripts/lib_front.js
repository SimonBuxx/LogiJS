const downloadButtons = document.querySelectorAll(".btn.download");
for (const button of downloadButtons) {
    button.addEventListener('click', function (event) { //jshint ignore:line
        event.preventDefault();
        window.location = '/libDownload?file=' + event.currentTarget.id.substring(2);
    });
}