

// Gets clip files from a directory
var getFromDir= function (currentDirPath, callback) {
    var fs = require('fs'),
        path = require('path');
    var lstClip = [];
    fs.readdir(currentDirPath, function (err, files) {
        if (err) {
            throw new Error(err);
        }
        files.forEach(function (name) {
            var filePath = path.join(currentDirPath, name);
            var stat = fs.statSync(filePath);
            if (stat.isFile()) {
              lstClip.push({id:lstClip.length, name:name, path:filePath, idFilter:null})
            }

        });
        callback(lstClip);
    });

}

exports.getFromDir = getFromDir;
