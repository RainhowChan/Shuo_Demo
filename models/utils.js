exports.checkRegister = function (obj, callback) {
    if (obj.username && obj.username.length > 3 && obj.username.length < 12) {
        if (obj.password && obj.password.length > 3 && obj.password.length < 12) {
            callback({status: 200, result: "符合要求"});
        } else {
            callback({status: 400, result: "密码长度不符合要求"});
        }
    } else {
        callback({status: 400, result: "用户名长度不符合要求"});
    }

};