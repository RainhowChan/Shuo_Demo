var fs = require('fs');
var gm = require('gm');


gm('./timg.jpg')
    .crop(300, 300, 150, 130)
    .blur(7, 3)
    .stroke("#f00")
    .font("Helvetica.ttf", 12)
    .drawText(30, 20, "GMagick!")
    .noProfile()
    .write('./33.jpg', function (err) {
        if (err)
            console.log(err);
    });
