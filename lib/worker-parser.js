var recast = require('recast');

self.onmessage = function (e) {
  var code = e.data;
  var ast = recast.parse(code);
  var path = [];
  recast.types.traverse(ast, function (n) {
    path.push(n);
  });
  self.postMessage({
    ast: ast,
    path: path
  });
};
