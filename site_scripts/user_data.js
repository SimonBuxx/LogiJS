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
            let images = [];
            let descriptions = [];
            for (let i = 0; i < files.length; i++) {
                sketches.push(path.basename(files[i], '.json'));
                sketchSizes.push(getFilesize(files[i]));
                sketchBirthtimes.push(getBirthtime(files[i]));
                sketchModified.push(getModifiedDate(files[i]));
                if (fs.existsSync('./userSketches/' + user + '/' + path.basename(files[i], '.json') + '.png')) {
                    images.push(fs.readFileSync('./userSketches/' + user + '/' + path.basename(files[i], '.json') + '.png'));
                    images[i] = new Buffer(images[i], "binary").toString("base64");
                } else {
                    images.push('');
                }
                if (fs.existsSync('./userSketches/' + user + '/' + path.basename(files[i], '.json') + '.txt')) {
                    try {
                        let description = fs.readFileSync('./userSketches/' + user + '/' + path.basename(files[i], '.json') + '.txt');
                        try {
                            description = JSON.parse(description);
                            if (description.hasOwnProperty('desc')) {
                                if (description.desc !== '') {
                                    descriptions.push(description.desc);
                                } else {
                                    descriptions.push('No description available.');
                                }
                            } else {
                                descriptions.push('No description available.');
                            }
                        } catch (e) {
                            descriptions.push(fs.readFileSync('./userSketches/' + user + '/' + path.basename(files[i], '.json') + '.txt'));
                        }
                    } catch (e) {
                        
                    }
                } else {
                    descriptions.push('No description available.');
                }
            }
            callback({
                sketches: {
                    sketches: sketches,
                    sizes: sketchSizes,
                    birthtimes: sketchBirthtimes,
                    modified: sketchModified
                },
                images: images,
                descriptions: descriptions
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

function getModifiedDate(filename) {
    const stats = fs.statSync(filename);
    let millis = stats.mtime;
    let newDate = new Date(millis);
    return newDate.toLocaleDateString("de-DE") /*+ ' ' + newDate.toLocaleTimeString("de-DE")*/;
}
