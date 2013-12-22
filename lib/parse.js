var worker = new Worker('worker-parser-bundle.js');

/**
 * @param {string} code
 * @param {function} cb
 */
module.exports = function (code, cb) {
  worker.onmessage = function (e) {
    if (e.data.error) {
      cb(new Error(e.data.error));
    } else {
      cb(null, {
        path: e.data.path,
        ast: e.data.ast
      });
    }
  };
  worker.postMessage(code);
};
