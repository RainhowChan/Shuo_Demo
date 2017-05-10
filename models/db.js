var MongoClient = require("mongodb").MongoClient;
var dbconfig = require('./dbconfig');
function __connectDB(callback) {
    var url = dbconfig.dburl;
    MongoClient.connect(url, function (err, db) {
        if (err) {
            throw Error("数据库连接失败");
        }
        callback(err, db);
    });
}
exports.insertOne = function (collectionName, json, callback) {
    __connectDB(function (err, db) {
        db.collection(collectionName).insertOne(json, function (error, result) {
            callback(error, result);
            db.close();
        });
    });
};

exports.query = function (collectionName, json, argument, cb) {
    var skipNumber = 0;
    var limit = 0;
    var sort = {};
    if (arguments.length === 3) {
        var callback = argument;
    } else if (arguments.length === 4) {
        var callback = cb;
        args = argument;
        var limit = parseInt(args.pageAmount);
        skipNumber = limit * parseInt(args.page);
        sort = args.sort || {};
    } else {
        throw new Error("find函数需要至少传入3个函数", null);
    }
    var result = [];
    var jsons = json || {};
    __connectDB(function (error, db) {
        var cursor = db.collection(collectionName).find(jsons).skip(skipNumber).limit(limit).sort(sort);
        cursor.each(function (err, doc) {
            if (err) {
                callback(err, null);
                db.close();
                return;
            }
            if (doc !== null) {
                result.push(doc);
            } else {
                callback(null, result);
                db.close();
            }
        });
    });
};

exports.deleteMany = function (collectionName, json, callback) {
    __connectDB(function (err, db) {
        db.collection(collectionName).deleteMany(json, function (error, result) {
            callback(error, result);
            db.close();
        });
    });
};

exports.updateMany = function (collectionName, jsonTarget, jsonOption, callback) {
    __connectDB(function (err, db) {
        db.collection(collectionName).updateMany(jsonTarget, jsonOption, function (err, result) {
            callback(err, result);
            db.close();
        });
    });
};

exports.getCount = function (collectionName, json, callback) {
    __connectDB(function (err, db) {
        db.collection(collectionName).count(json).then(function (count) {
            callback(parseInt(count));
            db.close();
        })
    });
};

(function () {
    __connectDB(function (err, db) {
        if (err) {
            throw Error("数据库连接失败");
        }
        db.collection('user').createIndex({username: 1}, null, function (err, result) {
            console.log('索引建立成功');
        });
    });
})();