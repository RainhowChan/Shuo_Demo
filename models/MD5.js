var crypto = require("crypto");
module.exports = function (mingma) {
    var md5 = crypto.createHash('md5');
    return md5.update(mingma).digest('base64');
};