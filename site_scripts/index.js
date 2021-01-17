const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const store = require('./store');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');
const glob = require('glob');
const crypto = require('crypto');
const validator = require('email-validator');
const passwordValidator = require('password-validator');
const base64url = require('base64url'); // encodes bytes url safe (for random link sharing IDs)
const app = express();

const PORT = 8080;

let jwt_handler = require('./jwt_module.js');
let user_data = require('./user_data.js');
const { config } = require('process');

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

let configuration = JSON.parse(fs.readFileSync('./config.json'));
let custom = configuration.custom_index_page.use_custom_page === 'true';

// account options: standard: signup and login as on logijs.com, disabled: no account system, limited: signup disabled

router.use(function (req, res, next) {
    if (req.url === '/dashboard') {
        if (!jwt_handler.verify(req.cookies.access_token, { issuer: i, subject: s, audience: a })) {
            if (custom) {
                res.redirect('/');
            } else {
                res.redirect('/login');
            }
            return;
        }
    }
    next();
});

router.use(function (req, res, next) {
    if (req.url === '/') {
        if (jwt_handler.verify(req.cookies.access_token, { issuer: i, subject: s, audience: a })) {
            if (custom) {
                res.redirect('/dashboard');
                return;
            }
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
    if (configuration.custom_index_page.use_custom_page === 'false') {
        res.render('index', {
            user: getUser(req)
        });
    } else if (configuration.accounts.enable_login === 'true') {
        res.render('eduLogin', {
            failed: req.query.failed,
            signup_success: req.query.signup_success,
            show_registration: configuration.accounts.allow_signups === 'true',
            organization: configuration.organization.name,
            show_org_name: configuration.custom_index_page.show_organization_name === 'true',
            org_first_line: configuration.organization.first_line,
            org_second_line: configuration.organization.second_line,
            background: configuration.custom_index_page.background_image,
            show_login: true,
            refer_to_logijs_com: configuration.custom_index_page.refer_to_logijs_com === 'true',
            background_text: configuration.custom_index_page.background_text,
            allow_enter: configuration.custom_index_page.allow_entering_without_login === 'true',
            made_in_luebeck: configuration.custom_index_page.show_made_in_luebeck === 'true',
            localization: configuration.localization
        });
    } else {
        res.render('logijs', {
            user: '',
            sketchData: { sketches: {} },
            images: {},
            descriptions: {},
            no_login: true
        });
    }
});

router.get('/education', function (req, res) {
    if (!custom) {
        res.render('education', {
            user: getUser(req)
        });
    }
});

router.get('/getstarted', function (req, res) {
    if (!custom) {
        res.render('getstarted', {
            user: getUser(req)
        });
    }
});

router.get('/editor', function (req, res) {
    let user = getUser(req);
    if (user !== '') {
        user_data.getSketches(user, function (data) {
            res.render('logijs', {
                user: user,
                sketchData: data.sketches,
                images: data.images,
                descriptions: data.descriptions,
                custom: custom
            });
        });
    } else {
        res.render('logijs', {
            user: '',
            sketchData: { sketches: {} },
            images: {},
            descriptions: {},
            custom: custom
        });
    }
});

router.get('/legal', function (req, res) {
    if (!custom) {
        res.render('legal', {
            user: getUser(req)
        });
    }
});

router.get('/how-to-host', function (req, res) {
    if (!custom) {
        res.render('hosting-tutorial', {
            user: getUser(req)
        });
    }
});

router.get('/terms-of-service', function (req, res) {
    if (!custom) {
        res.render('tos', {
            user: getUser(req)
        });
    }
});

router.get('/login', function (req, res) {
    if (!custom) {
        res.render('login', {
            failed: req.query.failed,
            signup_success: req.query.signup_success
        });
    }
});

router.get('/signup', function (req, res) {
    if (configuration.custom_index_page.use_custom_page === 'false') {
        res.render('signup', { error_code: req.query.error_code });
    } else if (configuration.accounts.enable_login === 'true') {
        res.render('eduSignup', {
            error_code: req.query.error_code,
            organization: configuration.organization.name,
            show_org_name: configuration.custom_index_page.show_organization_name === 'true',
            org_first_line: configuration.organization.first_line,
            org_second_line: configuration.organization.second_line,
            background: configuration.custom_index_page.background_image,
            refer_to_logijs_com: configuration.custom_index_page.refer_to_logijs_com === 'true',
            background_text: configuration.custom_index_page.background_text,
            made_in_luebeck: configuration.custom_index_page.show_made_in_luebeck === 'true',
            localization: configuration.localization
        });
    }
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
            descriptions: data.descriptions,
            custom: custom
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
    if(configuration.accounts.allow_signups !== 'true') {
        console.log('Failure: account creation prohibited');
        res.status(401).send({ error_code: 5 }).end();
        return;
    }

    if (!req.body.username.match(usernameRegex)) {
        console.log('Failure: username doesn\'t match regex!');
        res.status(401).send({ error_code: 1 }).end();
        return;
    }

    if (req.body.email.length > 50 || !validator.validate(req.body.email)) {
        console.log('Failure: email invalid!');
        res.status(401).send({ error_code: 2 }).end();
        return;
    }

    if (!pwSchema.validate(req.body.password)) {
        console.log('Failure: password invalid!');
        res.status(401).send({ error_code: 3 }).end();
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
                res.status(401).send({ error_code: 0 }).end();
                if (!fs.existsSync('./userSketches/' + req.body.username + '/')) {
                    fs.mkdirSync('./userSketches/' + req.body.username + '/');
                }
            } else {
                console.log('Failure: username already exists!');
                res.status(401).send({ error_code: 4 }).end();
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

    socket.on('createLink', (data) => {
        let filename = base64url(crypto.randomBytes(10)).slice(0, 10);

        fs.writeFile('./views/sharedSketches/' + filename + '.json', JSON.stringify(data.json), 'utf8', function (err) {
            socket.emit('createdLink', { filename: filename });
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