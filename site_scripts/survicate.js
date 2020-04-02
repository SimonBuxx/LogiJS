// Start of Survicate (www.survicate.com) code
if (window.location.href.includes('.com')) {
    console.log('Loading Survicate script');
    (function (w) {
        var s = document.createElement('script');
        s.src = 'https://survey.survicate.com/workspaces/01d22f9eb05bc4fcdd73eb6342cb3480/web_surveys.js';
        s.async = true;
        var e = document.getElementsByTagName('script')[0];
        e.parentNode.insertBefore(s, e);
    })(window);
}
// End of Survicate code