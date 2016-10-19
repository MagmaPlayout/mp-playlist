var fs, configFile;
configFile = 'configFile.json';
fs = require('fs');

var config = JSON.parse(fs.readFileSync(configFile));


fs.watch(configFile, (eventType, filename) => {
  console.log(`event type is: ${eventType}`);
  if (filename) {
    config = JSON.parse(
        fs.readFileSync(configFile)
    );
    module.exports = config;
    console.log(`filename provided: ${filename}`);
  } else {
    console.log('filename not provided');
  }
});

module.exports = config;
