var worker = new Worker('worker-parser-bundle.js');

module.exports = function (code, cb) {
  worker.onmessage = function (e) {
    cb({
      path: e.data.path,
      ast: e.data.ast
    });
  };
  worker.postMessage(code);
};
