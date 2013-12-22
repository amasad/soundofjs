var esprima = require('esprima');
var types = require('ast-types');

self.onmessage = function (e) {
  var code = e.data;
  var ast;
  try {
    ast = esprima.parse(code, { loc: true });
  } catch (error) {
    self.postMessage({
      error: error.message
    });
    return;
  }
  var path = [];
  types.traverse(ast, function (n) {
    path.push(n);
  });
  self.postMessage({
    ast: ast,
    path: path
  });
};
