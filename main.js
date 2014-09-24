var chokidar = require("chokidar");
var tests = [];

function onPath (path) {
  tests.forEach(function (item){
    if ( item.state != "busy" && item.regex.test(path) ) {
      item.state = "busy";
      item.relay(path, function(){
        delete item.state;
      });
    }
  });
}

function onError (error) {
  console.error(error);
}

var watcher = chokidar.watch(".", {persistent:true, ignoreInitial:true})
  .on('add', onPath)
  .on('addDir', onPath)
  .on('change', onPath)
  .on('unlink', onPath)
  .on('unlinkDir', onPath)
  .on('error', onError);

module.exports = {
  add: function (regex, relay) {
    if (regex && relay) 
      tests.push({regex: regex, relay: relay});
  }
};