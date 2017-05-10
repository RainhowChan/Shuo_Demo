var Formidable = require("formidable");
var DBUtil = require("../models/db");
var CheckUtil = require("../models/utils");
var MD5 = require("../models/MD5");
var path = require('path');
var fs = require('fs');
var gm = require('gm');
var moment = require('moment');

exports.showIndex = function (req, res, next) {
    if (req.session.login === 1) {
        DBUtil.query('user', {}, function (err, result) {
            res.render('index', {
                login: req.session.login === 1,
                username: req.session.username,
                active: "index",
                userAvatar: req.session.avatar,
                friends: result
            });
        })
    } else {
        res.render('index', {
            login: req.session.login === 1,
            username: req.session.username,
            active: "index",
            userAvatar: req.session.avatar,
            friends: []
        });
    }

};

exports.showRegister = function (req, res, next) {
    res.render('register', {
        login: req.session.login = 0,
        username: '',
        active: "register",
        userAvatar: 'default-avatar.jpg'
    });
};
exports.doRegister = function (req, res, next) {
    var form = new Formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
        var username = fields.username;
        var password = fields.password;
        DBUtil.getCount('user', {username: username}, function (count) {
            if (count > 0) {
                res.json({status: 400, result: "用户名已存在"});
            } else {
                CheckUtil.checkRegister({username: username, password: password}, function (cb) {
                    if (cb.status === 200) {
                        var decodePassword = MD5(MD5(password) + 'rainhowchan');
                        DBUtil.insertOne('user', {
                            username: username,
                            password: decodePassword,
                            avatar: 'default-avatar.jpg'
                        }, function (err, result) {
                            if (err) {
                                res.json({status: 500, result: "未知错误，注册失败"});
                            } else {
                                res.json({status: 200, result: "注册成功"});
                            }
                        });
                    } else {
                        res.json(cb);
                    }
                });
            }
        })
    })
};

exports.showLogin = function (req, res, next) {
    if (req.session.login === 1) {
        res.redirect('/');
    } else {
        res.render('login', {
            login: req.session.login = 0,
            username: '',
            active: "login",
            userAvatar: req.session.avatar
        });
    }

};
exports.doLogin = function (req, res, next) {
    var form = new Formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
        var username = fields.username;
        var password = fields.password;
        if (req.session.login === 1) {
            res.json({status: 400, result: "请勿重复登陆"});
            return;
        }
        CheckUtil.checkRegister({username: username, password: password}, function (cb) {
            if (cb.status === 200) {
                var decodePassword = MD5(MD5(password) + 'rainhowchan');
                DBUtil.query('user', {username: username, password: decodePassword}, function (err, result) {
                    if (err) {
                        res.json({status: 500, result: "未知错误，登陆失败"});
                    } else if (result.length === 1) {
                        req.session.login = 1;
                        req.session.username = username;
                        req.session.avatar = result[0].avatar;
                        res.json({status: 200, result: "登陆成功"});
                    } else {
                        res.json({status: 400, result: "用户名或密码错误"});
                    }
                });
            } else {
                res.json(cb);
            }
        });
    });
};

exports.doExit = function (req, res, next) {
    req.session.login = 0;
    req.session.username = '';
    req.session.avatar = 'default-avatar.jpg';
    res.redirect('/');
};

exports.showEditUserInfo = function (req, res, next) {
    if (req.session.login) {
        res.render('set-avatar', {
            login: req.session.login,
            username: req.session.username,
            active: "index",
            userAvatar: req.session.avatar
        });
    } else {
        res.redirect('/login');
    }
};
exports.doEditInfo = function (req, res, next) {
    if (req.session.login) {
        var form = new Formidable.IncomingForm();
        form.uploadDir = path.normalize(__dirname + "/../avatar");
        form.parse(req, function (err, fields, files) {
            var extName = path.extname(files.avatar.name);
            var oldPath = files.avatar.path;
            var newPath = path.normalize(__dirname + "/../avatar/") + req.session.username + extName;
            fs.rename(oldPath, newPath, function () {
                fs.unlink(oldPath, function (err) {
                    req.session.avatar = req.session.username + extName;
                    res.redirect('/editAvatar');
                });
            });
        });
    } else {
        res.redirect('/login');
    }
};

exports.editAvatar = function (req, res, next) {
    if (req.session.login) {
        res.render('editAvatar', {
            userAvatar: req.session.avatar
        });
    } else {
        res.redirect('/login');
    }
};

exports.doCut = function (req, res, next) {
    var filename = req.query.filename;
    var w = req.query.w;
    var h = req.query.h;
    var x = req.query.x;
    var y = req.query.y;

    gm("./avatar/" + req.session.avatar)
        .crop(w, h, x, y)
        .resize(100, 100, "!")
        .write("./avatar/" + req.session.avatar, function (err) {
            if (err) {
                res.json({status: 500, result: "修改失败"});
                return;
            }
            DBUtil.updateMany('user', {username: req.session.username},
                {$set: {avatar: req.session.avatar}}, function (err, result) {
                    if (err)
                        res.json({status: 500, result: "修改失败2"});
                    else
                        res.json({status: 200, result: "修改成功"});
                });
        });
};

exports.doComment = function (req, res, next) {
    if (req.session.login) {
        var form = new Formidable.IncomingForm();
        form.parse(req, function (err, fields, files) {
            if (err) {
                res.json({status: 500, result: "系统出现错误"});
                return;
            }
            var comment = fields.comment;
            if (comment) {
                DBUtil.insertOne('comment', {
                    username: req.session.username,
                    comment: comment,
                    userAvatar: req.session.avatar,
                    time: moment().format('YYYY-MM-DD H:mm:ss')
                }, function (err, result) {
                    if (result.result.n === 1) {
                        res.json({status: 200, result: "说说发表成功"});
                    } else {
                        res.json({status: 500, result: "说说发表失败"});
                    }
                });
            } else {
                res.json({status: 400, result: "说说必须要有内容"});
            }

        });
    } else {
        res.redirect('/');
    }
};
exports.doGetComment = function (req, res, next) {
    if (req.session.login) {
        var type = parseInt(req.query.type);
        var page = req.query.page || 1;
        var pageAmount = req.query.pageAmount || 10;
        var option = {};
        if (type === 2) {
            option = {username: req.session.username}
        }
        DBUtil.query('comment', option, {pageAmount: pageAmount, page: page - 1},
            function (err, json) {
                if (err) {
                    res.json({status: 500, result: "拉取说说失败"});
                } else {
                    DBUtil.getCount('comment', option, function (count) {

                        res.json({status: 200, count: count, result: json});
                    });
                }
            }
        )
    } else {
        res.json({status: 300, result: "您还未登录"});
    }
};

exports.showUserComment = function (req, res, next) {
    if (req.session.login) {
        var username = req.params.username;
        DBUtil.query('user', {username: username}, function (err,json) {
            DBUtil.query('comment', {username: username}, function (err, result) {
                res.render('user', {
                    username: req.params.username,
                    userAvatar: json[0].avatar,
                    comments: result
                });
            });
        });
    }else{
        res.redirect('/');
    }

};