
var fs = require('fs');

function Spy ( config ) {
  this.watchers = [];
  this.directories = config.directories;
  this.files = config.files || [];
  this.extensions = config.extensions || [];
  this.callback = config.callback;
  this.recursive = config.recursive;
  this.timer = -1;
  this.interval = 1000;
  this.restart();
}

Spy.prototype.restart = function () {
  if ( this.timer != -1 ) {
    clearTimeout(this.timer);
  }

  this.timer = setTimeout((function () {
    for ( var i = 0; i < this.watchers.length; i++ ) {
      var watcher = this.watchers[i];
      watcher.close();
    }
    this.watchers = [];
    this.callback(this);
  }).bind(this), this.interval);
};

Spy.prototype.isSecret = function ( name ) {
  return name.indexOf(".") == 0;
};

Spy.prototype.isWatchable = function ( name ) {
  return (this.files.length == 0 && this.extensions.length == 0) || 
  this.files.indexOf(name) >= 0 || 
  this.extensions.indexOf(this.getExtension(name)) >= 0;
};

Spy.prototype.getExtension = function ( name ) {
  return name.substr(name.lastIndexOf('.')+1, name.length);
};

Spy.prototype.watch = function () {
  for ( var i = 0; i < this.directories.length; i++ ) {
    this.watchDirectory(this.directories[i]);
  }
};

Spy.prototype.watchFile = function ( file ) {
  this.watchers.push(fs.watch(file, this.onChange.bind(this)));
};

Spy.prototype.watchDirectory = function ( dir ) {
  this.watchers.push(fs.watch(dir, this.onChange.bind(this)));
  var listing = fs.readdirSync(dir);
  for ( var i = 0; i < listing.length; i++ ) {
    var name = listing[i];
    if ( !this.isSecret(name) ) {
      var f = dir + "/" + name;
      var stats = fs.statSync(f);
      if ( stats.isDirectory() && this.recursive ) {
        this.watchDirectory(f);
      }
      else if ( stats.isFile() && this.isWatchable(name) ) {
        this.watchFile(f);
      }
    }
  }
};

Spy.prototype.onChange = function ( ev, file ) {
  if ( !file || (file && this.isWatchable(file)) ) {
    this.restart();
  }
};

module.exports = Spy;
