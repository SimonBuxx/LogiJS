const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const store = require('./store');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');
const glob = require('glob');
const app = express();

const PORT = process.env.PORT || 7555;

let jwt_handler = require('./jwt_module.js');
let user_data = require('./user_data.js');

let server = app.listen(PORT, () => {
    console.log('Server running on port ' + PORT);
});

const io = require('socket.io')(server);

const router = express.Router();

let dlname = ''; //!

sharp.cache(false);

app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('views'));
app.use(express.static('libraries'));
app.use(express.static('site_scripts'));
app.use(express.static('sketches'));
app.set('view engine', 'pug');

var i = 'LogiJS';                    // Issuer 
var s = 'logijs@outlook.com';        // Subject 
var a = 'http://logijs.netlify.com'; // Audience

app.use('/', router);

router.use(function (req, res, next) {
    if (req.url === '/dashboard') {
        if (!jwt_handler.verify(req.cookies.access_token, { issuer: i, subject: s, audience: a })) {
            res.redirect('/login');
            return;
        }
    }
    next();
});

router.use(function (req, res, next) {
    if ((req.url === '/login' || req.url === '/signup')) {
        if (jwt_handler.verify(req.cookies.access_token, { issuer: i, subject: s, audience: a })) {
            res.redirect('/dashboard');
            return;
        }
    }
    next();
});

/*
    Prevent users from seeing restricted content by hitting the browser's back button
*/
router.use(function (req, res, next) {
    res.set('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
    next();
});

router.get('/', function (req, res) {
    res.render('index', {
        user: getUser(req)
    });
});

router.get('/editor', function (req, res) {
    res.render('logijs', {
        user: getUser(req)
    });
});

router.get('/features', function (req, res) {
    res.render('features', {
        user: getUser(req)
    });
});

router.get('/imprint', function (req, res) {
    res.render('imprint', {
        user: getUser(req)
    });
});

router.get('/login', function (req, res) {
    res.render('login', {
        failed: req.query.failed
    });
});

router.get('/signup', function (req, res) {
    res.render('signup', {
        failed: req.query.failed,
        invalid: req.query.invalid
    });
});

router.get('/dashboard', function (req, res) {
    let user = getUser(req);
    user_data.getSketches(user, function (data) {
        res.render('dashboard', {
            user: user,
            sketchData: data
        });
    });
});

router.get('/download', (req, res) => {
    res.download('./userSketches/' + getUser(req) + '/' + req.query.file + '.json');
});

router.post('/login', (req, res) => {
    store
        .authenticate({
            username: req.body.username,
            password: req.body.password
        })
        .then(({ success }) => {
            if (success) {
                let token = jwt_handler.sign({ user: req.body.username }, { issuer: i, subject: s, audience: a });
                res.cookie('access_token', token);
                res.sendStatus(200);
            } else {
                res.sendStatus(401);
            }
        });
});

router.post('/createUser', (req, res) => {
    store
        .createUser({
            username: req.body.username,
            password: req.body.password
        })
        .then(({ success }) => {
            if (success) {
                res.sendStatus(200);
            } else {
                res.sendStatus(401);
            }
        });
});

router.post('/delete', (req, res) => {
    let user = getUser(req);
    try {
        fs.unlink('./userSketches/' + user + '/' + req.body.sketch + '.json', (err) => {
            if (err) {
                console.log('[MAJOR] File delete error!');
                console.log('./userSketches/' + user + '/' + req.body.sketch + '.json');
            }
        });
    } catch (e) {
    }
    try {
        fs.unlink('./views/previews/' + user + '/' + req.body.sketch + '.png', (err) => {
            console.log('[MINOR] File delete error!');
            console.log('./views/previews/' + user + '/' + req.body.sketch + '.png');
        });
    } catch (e) {

    }
});

/*
app.post('/save', (req, res) => {
    store.save({
        owner: app.locals.user,
        filename: req.body.filename
    });
    fs.writeFile('C:/Users/Simon Buchholz/Documents/Programmierung/Projekte/LogiJS-DB/files/' + req.body.filename, req.body.content, 'utf8', function (err) {
        if (err) {
            return res.sendStatus(500);
        } else {
            return res.sendStatus(200);
        }
    });
});
*/

io.on('connection', (socket) => {
    socket.on('getUserSketch', (data) => {
        let path = './userSketches/' + app.locals.user + '/' + data.file + '.json';
        try {
            let raw = fs.readFileSync(path);
            let sketchData = JSON.parse(raw);
            io.sockets.emit('userSketchData', {
                data: sketchData,
                success: true
            });
        } catch (e) {
            console.log('[MAJOR] File loading error!');
            console.log(path);
            io.sockets.emit('userSketchData', {
                data: {},
                success: false
            });
        }
    });

    socket.on('savePreview', (data) => {
        if (!app.locals.authenticated) {
            return;
        }
        let img = data.img;
        img = img.replace(/^data:image\/\w+;base64,/, "");
        let buffer = new Buffer(img, 'base64');
        fs.writeFile('./views/previews/' + app.locals.user + '/temp.png', buffer, function (err) {
            if (err) {
                console.log('[MINOR] Preview saving error!');
                console.log('./views/previews/' + app.locals.user + '/' + data.name + '.png');
            } else {
                sharp('./views/previews/' + app.locals.user + '/temp.png').resize({ height: 200, width: 200, position: 'left' })
                    .toFile('./views/previews/' + app.locals.user + '/' + data.name + '.png');
            }
        });
    });
});

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

function getFiles(user) {
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
        return {
            sketches: sketches,
            sizes: sketchSizes,
            birthtimes: sketchBirthtimes,
            modified: sketchModified
        };
    });
}

function getUser(req) {
    let user = '';
    if (req.cookies.hasOwnProperty('access_token')) {
        user = jwt_handler.decode(req.cookies.access_token, { issuer: i, subject: s, audience: a }).payload.user;
    }
    return user;
}