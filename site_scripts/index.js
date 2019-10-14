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

router.get('/legal', function (req, res) {
    res.render('legal', {
        user: getUser(req)
    });
});

router.get('/login', function (req, res) {
    res.render('login', {
        failed: req.query.failed
    });
});

router.get('/signup', function (req, res) {
    res.render('signup',
        {
            username_length: req.query.username_length,
            email_length: req.query.email_length,
            email_invalid: req.query.email_invalid,
            password_invalid: req.query.password_invalid,
            username_taken: req.query.username_taken
        });
});

router.get('/dashboard', function (req, res) {
    let user = getUser(req);
    user_data.getSketches(user, function (data) {
        res.render('dashboard', {
            user: user,
            sketchData: data.sketches,
            images: data.images,
            descriptions: data.descriptions
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

router.post('/createUser', (req, res) => {
    if (req.body.username.length > 50) {
        console.log('Failure: username too long!');
        res.status(401).send(
            {
                success: false, // overall success
                username_length: false, // username <= 50 chars
                email_length: true, // email <= 50 chars
                email_valid: true, // email valid (syntax check)
                password_valid: true, // password valid (strong enough) + <= 50 chars (checked by password-validator)
                username_unused: true // false, if the username is already in use
            });
        res.end();
        return;
    }

    if (req.body.email.length > 50) {
        console.log('Failure: email too long!');
        res.status(401).send(
            {
                success: false, // overall success
                username_length: true, // username <= 50 chars
                email_length: false, // email <= 50 chars
                email_valid: true, // email valid (syntax check)
                password_valid: true, // password valid (strong enough) + <= 50 chars (checked by password-validator)
                username_unused: true // false, if the username is already in use
            });
        res.end();
        return;
    }

    if (!validator.validate(req.body.email)) {
        console.log('Failure: email invalid!');
        res.status(401).send(
            {
                success: false, // overall success
                username_length: true, // username <= 50 chars
                email_length: true, // email <= 50 chars
                email_valid: false, // email valid (syntax check)
                password_valid: true, // password valid (strong enough) + <= 50 chars (checked by password-validator)
                username_unused: true // false, if the username is already in use
            });
        res.end();
        return;
    }

    if (!pwSchema.validate(req.body.password)) {
        console.log('Failure: password invalid!');
        res.status(401).send(
            {
                success: false, // overall success
                username_length: true, // username <= 50 chars
                email_length: true, // email <= 50 chars
                email_valid: true, // email valid (syntax check)
                password_valid: false, // password valid (strong enough) + <= 50 chars (checked by password-validator)
                username_unused: true // false, if the username is already in use
            });
        res.end();
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
                console.log('Success!');
                res.status(200).send(
                    {
                        success: true, // overall success
                        username_length: true, // username <= 50 chars
                        email_length: true, // email <= 50 chars
                        email_valid: true, // email valid (syntax check)
                        password_valid: true, // password valid (strong enough) + <= 50 chars (checked by password-validator)
                        username_unused: true // false, if the username is already in use
                    });
                res.end();
            } else {
                console.log('Failure: username taken!');
                res.status(401).send(
                    {
                        success: false, // overall success
                        username_length: true, // username <= 50 chars
                        email_length: true, // email <= 50 chars
                        email_valid: true, // email valid (syntax check)
                        password_valid: true, // password valid (strong enough) + <= 50 chars (checked by password-validator)
                        username_unused: false // false, if the username is already in use
                    });
                res.end();
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

/*router.post('/createUser', (req, res) => {
    if (!validator.validate(req.body.email)) {
        console.log('Failure: email invalid!');
        res.status(401).send('email');
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
                res.sendStatus(200);
            } else {
                res.sendStatus(401);
            }
        });
});*/

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
        fs.unlink('./userSketches/' + user + '/' + req.body.sketch + '.png', (err) => {
            console.log('[MINOR] File delete error!');
            console.log('./userSketches/' + user + '/' + req.body.sketch + '.png');
        });
    } catch (e) {

    }
    try {
        fs.unlink('./userSketches/' + user + '/' + req.body.sketch + '.txt', (err) => {
            console.log('[MINOR] File delete error!');
            console.log('./userSketches/' + user + '/' + req.body.sketch + '.txt');
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
        try {
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
    });

    socket.on('getDescription', (data) => {
        let path = '';
        if (data.access_token === '') {
            path = './views/sketches/' + data.file + '.txt';
        } else {
            let user = jwt_handler.decode(data.access_token, { issuer: i, subject: s, audience: a }).payload.user;
            path = './userSketches/' + user + '/' + data.file + '.txt';
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
        }
        let user = jwt_handler.decode(data.access_token, { issuer: i, subject: s, audience: a }).payload.user;
        if (user === 'demouser') {
            return;
        }
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
    });

    socket.on('saveUserSketch', (data) => {
        if (data.access_token === '') {
            return;
        }
        let user = jwt_handler.decode(data.access_token, { issuer: i, subject: s, audience: a }).payload.user;
        if (user === 'demouser') {
            socket.emit('demousererror');
            return;
        }
        fs.writeFile('./userSketches/' + user + '/' + data.file, JSON.stringify(data.json), 'utf8', function (err) {

        });
    });
});

function getUser(req) {
    let user = '';
    if (Object.hasOwnProperty.call(req.cookies, 'access_token')) {
        user = jwt_handler.decode(req.cookies.access_token, { issuer: i, subject: s, audience: a }).payload.user;
    }
    return user;
}
