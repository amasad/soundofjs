var worker = new Worker('worker-parser-bundle.js');

/**
 * @param {string} code
 * @param {function} cb
 */
module.exports = function (code, cb) {
  worker.onmessage = function (e) {
    cb({
      path: e.data.path,
      ast: e.data.ast
    });
  };
  worker.postMessage(code);
};
