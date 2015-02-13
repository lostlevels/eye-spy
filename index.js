var chokidar = require("chokidar");
var fs = require("fs");
var path = require("path");

function onError (err) {
  console.error(err)
}

function create(item, process, opts) {
  if (!opts) {
    opts = {
      persistent: true,
      ignoreInitial: true
    }
  }
  var onPath = function (path) {
    if (process.busy) return
    process.busy = true
    process(path, function() {
      delete process.busy
    })
  }
  var wtc = chokidar.watch(item.path, opts)
  wtc
    .on('change', onPath)
    .on('unlink', onPath)
    .on('error', onError)
  if (item.stats.isDirectory()) {
    wtc
      .on('add', onPath)
      .on('addDir', onPath)
      .on('unlinkDir', onPath)
  }
  return wtc
}

function listing(uri) {
  var arr = []
  var list = fs.readdirSync(uri)
  list.forEach(function (auri) {
    var p = path.join(uri, auri)
    var stats = fs.lstatSync(p)
    arr.push({path: p, stats: stats})
    if (stats.isDirectory()) {
      arr = arr.concat(listing(p))
    }
  })
  return arr
}

module.exports = function spy (uri, rex, opts, process) {
  if (typeof opts == "function") {
    process = opts
    opts = undefined
  }
  var list = listing(uri)
  var arr = []
  list.forEach(function(item){
    if (!rex.test(item.path)) return
    arr.push({
      watcher: create(item, process, opts),
      item: item,
      rex: rex,
      process: process
    })
  })
  return arr
}