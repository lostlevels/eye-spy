
# I spy with my little eye.

A simple class that will watch files and directories.

I wrote this because I wanted to be able to do anything when a file changed that I was concerned about. I was also too lazy to learn the other tools already made available.

## Example

```
var Spy = require("eye-spy");
var spawn = require('child_process').spawn;

var server;
var builder;
var killing;

function restart ( spy ) {
  if ( !server ) {
    console.log("starting server...");
    start(spy);
  }
  else if ( !killing ) {
    console.log("restarting server...");
    killing = true;
    server.kill();
  }
}

function start ( spy ) {
  server = spawn("node", ["server/index"]);
  server.stdout.on('data', function ( data ) {
    process.stdout.write(String(data));
  });
  server.stderr.on('data', function ( data ) {
    process.stdout.write(String(data));
  });
  server.on("close", function () {
    server = null;
    killing = false;
    start(spy);
  });
  spy.watch();
}

function build ( spy ) {
  if ( builder ) { 
    spy.watch();
    return;
  }
  console.log("building...");
  builder = spawn("npm", ["run", "build"]);
  builder.stdout.on("data", function ( data ) {
    process.stdout.write(String(data));
  });
  builder.stderr.on("data", function ( data ) {
    process.stdout.write(String(data));
  })
  builder.on("close", function ( code ) {
    builder = null;
    spy.watch();
  });
}

new Spy({
  directories: ["./server"], 
  recursive: true,
  extensions: ["js"], 
  callback: restart
});

new Spy({
  directories: ["./webapp"],
  files: [
    "index.js", 
    "template.jade", 
    "input.less",
    "component.json"
  ],
  callback: build
});

new Spy({
  directories: ["./webapp/locals"],
  recursive: true,
  files: [
    "index.js", 
    "template.jade", 
    "input.less",
    "component.json"
  ],
  callback: build
});
```
