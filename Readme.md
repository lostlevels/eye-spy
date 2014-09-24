# Eye Spy

A simple tool utilizing regex and file system changes. Any time a file changes and the path passes an added regex test, the corresponding function will be executed. Once you are done you must call the done function so that you can continue getting updates.

The use case for this tool was to compile my project when ever I saved files or restart my http server. I don't like build buttons.

## Example

```
var es = require("eye-spy");

// Watch all js files and log it out.
es.add(/^.*\.js$, function (path, done) {
  console.log("changed:", path);
  done();
});
```
