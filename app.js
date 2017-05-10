var express = require("express");
var fs = require("fs");
var gm = require("gm");
var session = require("express-session");
var router = require('./router/router');

var app = express();
app.set("view engine","ejs");
app.use(express.static("./public"));
app.use(express.static("./avatar"));
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    cookie: {secure: false}
}));
app.get('/', router.showIndex);
app.get('/register', router.showRegister);
app.post('/doregister', router.doRegister);
app.get('/login', router.showLogin);
app.post('/dologin', router.doLogin);
app.get('/doExit', router.doExit);
app.get('/editUserInfo', router.showEditUserInfo);
app.post('/doEditInfo', router.doEditInfo);
app.get('/editAvatar',router.editAvatar);
app.get('/docut', router.doCut);
app.post('/doComment', router.doComment);
app.get('/getComment', router.doGetComment);
app.get('/showUserComment/:username', router.showUserComment);

app.use(function (req,res) {
    res.render('error',{
        login: req.session.login,
        username: req.session.username,
        active: "index",
        userAvatar: req.session.avatar,
        friends: []
    });
});

app.listen(3000);