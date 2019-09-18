const glob = require('glob');
const path = require('path');
const fs = require('fs');

module.exports = {
    getSketches: (user, callback) => {
        glob('./userSketches/' + user + '/*.json', { nodir: true }, function (err, files) {
            let sketches = [];
            let sketchSizes = [];
            let sketchBirthtimes = [];
            let sketchModified = [];
            for (let i = 0; i < files.length; i++) {
                sketches.push(path.basename(files[i], '.json'));
                sketchSizes.push(getFilesize(files[i]));
                sketchBirthtimes.push(getBirthtime(files[i]));
                sketchModified.push(getModifiedTime(files[i]));
            }
            callback({
                sketches: sketches,
                sizes: sketchSizes,
                birthtimes: sketchBirthtimes,
                modified: sketchModified
            });
        });
    }
};

function getFilesize(filename) {
    const stats = fs.statSync(filename);
    return Math.round(stats.size / 1000);
}

function getBirthtime(filename) {
    const stats = fs.statSync(filename);
    let millis = stats.birthtimeMs;
    let newDate = new Date(millis);
    return newDate.toLocaleDateString("de-DE") + ' ' + newDate.toLocaleTimeString("de-DE");
}

function getModifiedTime(filename) {
    const stats = fs.statSync(filename);
    let millis = stats.mtime;
    let newDate = new Date(millis);
    return newDate.toLocaleDateString("de-DE") + ' ' + newDate.toLocaleTimeString("de-DE");
}
