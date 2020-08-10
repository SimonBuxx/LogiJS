const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const store = require('./store');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');
const glob = require('glob');
const validator = require('email-validator');
const passwordValidator = require('password-validator');
const app = express();

const PORT = 8080;

let jwt_handler = require('./jwt_module.js');
let user_data = require('./user_data.js');
let library = require('./samples.js');

let server = app.listen(PORT, () => {
    console.log('Server running http://localhost:' + PORT);
});

const io = require('socket.io')(server);

const router = express.Router();

sharp.cache(false);

app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('views'));
app.use(express.static('libraries'));
app.use(express.static('site_scripts'));
//app.use(express.static('sketches'));
app.set('view engine', 'pug');

var i = 'LogiJS';                    // Issuer 
var s = 'logijs@outlook.com';        // Subject 
var a = 'http://logijs.com'; // Audience

var pwSchema = new passwordValidator();
pwSchema
    .is().min(6)                                    // Minimum length 6
    .is().max(50)                                   // Maximum length 50
    .has().uppercase()                              // Must have uppercase letters
    .has().lowercase()                              // Must have lowercase letters
    .has().digits()                                 // Must have digits
    .has().not().spaces();                          // Should not have spaces

app.use('/', router);

let usernameRegex = /^[A-Za-z0-9\-\_]{1,30}$/;
let filenameRegex = /^[A-Za-z0-9\-\_]{1,30}$/;

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
    let user = getUser(req);
    if (user !== '') {
        user_data.getSketches(user, function (data) {
            res.render('logijs', {
                user: user,
                sketchData: data.sketches,
                images: data.images,
                descriptions: data.descriptions
            });
        });
    } else {
        res.render('logijs', {
            user: '',
            sketchData: { sketches: {}},
            images: {},
            descriptions: {}
        });
    }
});

router.get('/features', function (req, res) {
    res.render('features', {
        user: getUser(req)
    });
});

router.get('/legal', function (req, res) {
    res.render('legal', {
        user: getUser(req)
    });
});

router.get('/terms-of-service', function (req, res) {
    res.render('tos', {
        user: getUser(req)
    });
});

router.get('/login', function (req, res) {
    res.render('login', {
        failed: req.query.failed,
        signup_success: req.query.signup_success
    });
});

router.get('/signup', function (req, res) {
    res.render('signup', {error_code: req.query.error_code});
});

router.get('/dashboard', function (req, res) {
    let user = getUser(req);
    store.getEmail(user).then(data => {
        //console.log(data);
    });
    user_data.getSketches(user, function (data) {
        res.render('dashboard', {
            user: user,
            sketchData: data.sketches,
            images: data.images,
            descriptions: data.descriptions
        });
    });
});

router.get('/profile', function (req, res) {
    let user = getUser(req);
    store.getEmail(user).then(email => {
        res.render('profile', {
            user: user,
            email: email
        });
    });
});

router.get('/samples', function (req, res) {
    let user = getUser(req);
    library.getLibrarySketches(function (data) {
        res.render('samples', {
            user: user,
            sketches: data.sketches,
            images: data.images,
            descriptions: data.descriptions,
            sketchNames: data.sketchNames
        });
    });
});

router.get('/download', (req, res) => {
    try {
        res.download('./userSketches/' + getUser(req) + '/' + req.query.file + '.json', function (err) {
            //return res.sendStatus('200');
        });
    } catch (e) {
        return res.sendStatus('200');
    }
});

router.get('/libDownload', (req, res) => {
    try {
        res.download('./views/librarySketches/' + req.query.file + '.json', function (err) {
            //return res.sendStatus('200');
        });
    } catch (e) {
        return res.sendStatus('200');
    }
});

router.post('/createUser', (req, res) => {
    if (!req.body.username.match(usernameRegex)) {
        console.log('Failure: username doesn\'t match regex!');
        res.status(401).send({error_code: 1}).end();
        return;
    }

    if (req.body.email.length > 50 || !validator.validate(req.body.email)) {
        console.log('Failure: email invalid!');
        res.status(401).send({error_code: 2}).end();
        return;
    }

    if (!pwSchema.validate(req.body.password)) {
        console.log('Failure: password invalid!');
        res.status(401).send({error_code: 3}).end();
        return;
    }

    store
        .createUser({
            username: req.body.username,
            email: req.body.email,
            password: req.body.password
        })
        .then(({ success }) => {
            if (success) {
                res.status(401).send({error_code: 0}).end();
                if (!fs.existsSync('./userSketches/' + req.body.username + '/')) {
                    fs.mkdirSync('./userSketches/' + req.body.username + '/');
                }
            } else {
                console.log('Failure: username already exists!');
                res.status(401).send({error_code: 4}).end();
            }
        });
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

router.post('/delete', (req, res) => {
    let user = getUser(req);
    if (!req.body.sketch.match(filenameRegex)) {
        console.log('[MAJOR] File delete error!');
        console.log('./userSketches/' + user + '/' + req.body.sketch + '.json');
        return;
    }
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
        fs.unlink('./userSketches/' + user + '/' + req.body.sketch + '.png', (err) => {
            if (err) {
                console.log('[MINOR] File delete error!');
                console.log('./userSketches/' + user + '/' + req.body.sketch + '.png');
            }
        });
    } catch (e) {

    }
    try {
        fs.unlink('./userSketches/' + user + '/' + req.body.sketch + '.txt', (err) => {
            if (err) {
                console.log('[MINOR] File delete error!');
                console.log('./userSketches/' + user + '/' + req.body.sketch + '.txt');
            }
        });
    } catch (e) {

    }
});

io.on('connection', (socket) => {
    socket.on('getUserSketch', (data) => {
        let path = '';
        if (data.access_token === '') {
            path = './views/sketches/' + data.file + '.json';
        } else {
            let user = jwt_handler.decode(data.access_token, { issuer: i, subject: s, audience: a }).payload.user;
            path = './userSketches/' + user + '/' + data.file + '.json';
        }
        if (!data.file.match(filenameRegex)) {
            console.log('[MAJOR] File loading error!');
            console.log(path);
            socket.emit('userSketchData', {
                data: {},
                success: false
            });
            return;
        }
        try {
            let raw = fs.readFileSync(path);
            let sketchData = JSON.parse(raw);
            socket.emit('userSketchData', {
                data: sketchData,
                success: true
            });
        } catch (e) {
            try {
                path = './views/librarySketches/' + data.file + '.json';
                let raw = fs.readFileSync(path);
                let sketchData = JSON.parse(raw);
                socket.emit('userSketchData', {
                    data: sketchData,
                    success: true
                });
            } catch (e) {
                console.log('[MAJOR] File loading error!');
                console.log(path);
                socket.emit('userSketchData', {
                    data: {},
                    success: false
                });
            }
        }
    });

    socket.on('getDescription', (data) => {
        let path = '';
        if (data.access_token === '') {
            path = './views/sketches/' + data.file + '.txt';
        } else {
            let user = jwt_handler.decode(data.access_token, { issuer: i, subject: s, audience: a }).payload.user;
            path = './userSketches/' + user + '/' + data.file + '.txt';
        }
        if (!data.file.match(filenameRegex)) {
            console.log('[MINOR] File loading error!');
            console.log(path);
            socket.emit('sketchDescription', {
                data: {},
                success: false
            });
            return;
        }
        try {
            let desc = fs.readFileSync(path, 'utf8');
            socket.emit('sketchDescription', {
                data: desc,
                success: true
            });
        } catch (e) {
            console.log('[MINOR] File loading error!');
            console.log(path);
            socket.emit('sketchDescription', {
                data: {},
                success: false
            });
        }
    });

    socket.on('getImportSketches', (data) => {
        let userPath = '';
        if (data.access_token === '') {
            socket.emit('importSketches', {
                sketches: {},
                images: {},
                looks: {},
                success: false
            });
            return;
        } else {
            let user = jwt_handler.decode(data.access_token, { issuer: i, subject: s, audience: a }).payload.user;
            userPath = './userSketches/' + user;
        }
        let sketchList = [];
        let images = [];
        let looks = [];
        try {
            glob(userPath + '/*.json', { nodir: true }, function (err, files) {
                for (let i = 0; i < files.length; i++) {
                    sketchList.push(path.basename(files[i], '.json'));
                    try {
                        if (fs.existsSync(userPath + '/' + path.basename(files[i], '.json') + '.png')) {
                            images.push(fs.readFileSync(userPath + '/' + path.basename(files[i], '.json') + '.png'));
                            images[i] = new Buffer(images[i], "binary").toString("base64");
                        } else {
                            images.push('');
                        }
                    } catch (e) {
                        images.push('');
                    }
                    if (fs.existsSync(userPath + '/' + path.basename(files[i], '.json') + '.txt')) {
                        try {
                            let look = fs.readFileSync(userPath + '/' + path.basename(files[i], '.json') + '.txt');
                            try {
                                look = JSON.parse(look);
                                looks.push(look);
                            } catch (e) {
                                console.log('[MINOR] Couldn\'t parse JSON!');
                                console.log(userPath + '/' + path.basename(files[i], '.json') + '.txt');
                                looks.push({});
                            }
                        } catch (e) {
                            console.log('[MINOR] File loading error!');
                            console.log(userPath + '/' + path.basename(files[i], '.json') + '.txt');
                            looks.push({});
                        }
                    } else {
                        looks.push({});
                    }
                }
                socket.emit('importSketches', {
                    sketches: sketchList,
                    images: images,
                    looks: looks,
                    success: true
                });
            });
        } catch (e) {
            socket.emit('importSketches', {
                sketches: {},
                images: {},
                looks: {},
                success: false
            });
        }
    });

    socket.on('savePreview', (data) => {
        if (data.access_token === '') {
            return;
        } else if (!data.name.match(filenameRegex)) {
            console.log('[MINOR] Preview saving error!');            
        } else {
            let user = jwt_handler.decode(data.access_token, { issuer: i, subject: s, audience: a }).payload.user;
            if (user === 'demouser') {
                return;
            } else {
                let img = data.img;
                let desc = data.desc;
                img = img.replace(/^data:image\/\w+;base64,/, "");
                let buffer = new Buffer(img, 'base64');
                sharp(buffer)
                    .resize({ height: 200, width: 200, position: 'left' })
                    .toFile('./userSketches/' + user + '/' + data.name + '.png');
                if (desc.length > 0) {
                    fs.writeFile('./userSketches/' + user + '/' + data.name + '.txt', desc, 'utf8', function (err) {

                    });
                } else {
                    try {
                        fs.unlink('./userSketches/' + user + '/' + data.name + '.txt', (err) => {
                            console.log('[MINOR] File delete error!');
                            console.log('./userSketches/' + user + '/' + data.name + '.txt');
                        });
                    } catch (e) {

                    }
                }
            }
        }
    });

    socket.on('saveUserSketch', (data) => {
        if (data.access_token === '') {
            return;
        } else {
            let user = jwt_handler.decode(data.access_token, { issuer: i, subject: s, audience: a }).payload.user;
            if (data.file.length > 50) {
                socket.emit('nametoolongerror');
                return;
            } else if (!data.file.substring(0, data.file.length - 5).match(filenameRegex)) {
                console.log('[MAJOR] File saving error!');
                console.log('./userSketches/' + user + '/' + data.file);
                socket.emit('regexerror');
                return;
            } else if (user === 'demouser') {
                socket.emit('demousererror');
                return;
            } else {
                fs.writeFile('./userSketches/' + user + '/' + data.file, JSON.stringify(data.json), 'utf8', function (err) {
                });
            }
        }
    });
});

function getUser(req) {
    let user = '';
    if (Object.hasOwnProperty.call(req.cookies, 'access_token')) {
        user = jwt_handler.decode(req.cookies.access_token, { issuer: i, subject: s, audience: a }).payload.user;
    }
    return user;
}