const express = require('express');
const bodyParser = require('body-parser');
const store = require('./store');
const fs = require('fs');
const app = express();

const router = express.Router();

let loginFailed = false;
let signupFailed = false;
let tooLong = false;

app.use(bodyParser.json());
app.use(express.static('views'));
app.use(express.static('libraries'));
app.use(express.static('site_scripts'));
app.use(express.static('sketches'));
app.set('view engine', 'pug');

router.use(function (req, res, next) {
    if (req.url === '/dashboard' && !app.locals.authenticated) {
        res.redirect('/login');
        return;
    }
    next();
});

router.use(function (req, res, next) {
    if ((req.url === '/login' || req.url === '/signup') && app.locals.authenticated) {
        res.redirect('/dashboard');
        return;
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
    res.render('index');
});

router.get('/editor', function (req, res) {
    res.render('logijs');
});

router.get('/features', function (req, res) {
    res.render('features');
});

router.get('/imprint', function (req, res) {
    res.render('imprint');
});

router.get('/login', function (req, res) {
    res.render('login', {
        failed: loginFailed
    });
    loginFailed = false;
});

router.get('/signup', function (req, res) {
    res.render('signup', {
        failed: signupFailed,
        tooLong: tooLong
    });
    signupFailed = false;
    tooLong = false;
});

router.get('/dashboard', function (req, res) {
    res.render('dashboard');
});

app.use('/', router);

router.post('/createUser', (req, res) => {
    if (req.body.username.length > 50 || req.body.password.length > 50) {
        signupFailed = true;
        tooLong = true;
        res.sendStatus(401);
        return;
    }
    store
        .createUser({
            username: req.body.username,
            password: req.body.password
        })
        .then(({ success }) => {
            if (success) {
                signupFailed = false;
                tooLong = false;
                res.sendStatus(200);
            } else {
                signupFailed = true;
                tooLong = false;
                res.sendStatus(401);
            }
        });
});

router.post('/login', (req, res) => {
    if (req.body.username.length > 50 || req.body.password.length > 50) {
        loginFailed = true;
        res.sendStatus(401);
        return;
    }
    store
        .authenticate({
            username: req.body.username,
            password: req.body.password
        })
        .then(({ success }) => {
            if (success) {
                app.locals.user = req.body.username;
                app.locals.authenticated = true;
                loginFailed = false;
                res.sendStatus(200);
            } else {
                app.locals.user = '';
                app.locals.authenticated = false;
                loginFailed = true;
                res.sendStatus(401);
            }
        });
});

router.post('/logout', (req, res) => {
    app.locals.user = '';
    app.locals.authenticated = false;
    loginFailed = false;
    signupFailed = false;
    res.sendStatus(200);
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
app.listen(7555, () => {
    console.log('Server running on http://localhost:7555');
});