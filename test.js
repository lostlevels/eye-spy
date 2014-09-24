var es = require("./main");
es.add(/^.*\.js$/, function (path, done){ 
  console.log("Changed:", path);
  done(); 
});