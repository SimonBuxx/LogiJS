const glob = require('glob');
const path = require('path');
const fs = require('fs');

module.exports = {
    getLibrarySketches: (callback) => {
        glob('./views/librarySketches/*.json', { nodir: true }, function (err, files) {
            let sketches = [];
            let images = [];
            let descriptions = [];
            let sketchNames = [];
            for (let i = 0; i < files.length; i++) {
                sketches.push(path.basename(files[i], '.json'));
                if (fs.existsSync('./views/librarySketches/' + path.basename(files[i], '.json') + '.png')) {
                    images.push(fs.readFileSync('./views/librarySketches/' + path.basename(files[i], '.json') + '.png'));
                    images[i] = new Buffer(images[i], "binary").toString("base64");
                } else {
                    images.push('');
                }
                if (fs.existsSync('./views/librarySketches/' + path.basename(files[i], '.json') + '.txt')) {
                    try {
                        let description = fs.readFileSync('./views/librarySketches/' + path.basename(files[i], '.json') + '.txt');
                        try {
                            description = JSON.parse(description);
                            if (description.hasOwnProperty('caption')) {
                                sketchNames.push(description.caption);
                            } else {
                                sketchNames.push('No caption available.');
                            }
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
                            descriptions.push(fs.readFileSync('./views/librarySketches/' + path.basename(files[i], '.json') + '.txt'));
                        }
                    } catch (e) {
                        
                    }
                } else {
                    descriptions.push('No description available.');
                }
            }
            callback({
                sketches: sketches,
                images: images,
                descriptions: descriptions,
                sketchNames: sketchNames
            });
        });
    }
};