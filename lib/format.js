var domify = require('domify');
var Prism = require('../vendor/prism');

var langClass = 'language-javascript';

/**
 * @param {string} code
 * @return {string} html
 */
function highlight(code) {
  var preEl = domify(
    '<pre class="' + langClass +'">' +
      '<code class="' +langClass +'"></code>' +
    '</pre>'
  );
  var codeEl = preEl.childNodes[0];
  codeEl.textContent = code;

  Prism.highlightElement(codeEl, false);

  return codeEl.innerHTML;
}

function parentByClass(el, kls) {
  while (el.parentNode) {
    if (el.parentNode.classList.contains(kls)) {
      return el.parentNode;
    } else {
      el = el.parentNode;
    }
  }
  return null;
}

/**
 * Add node types as classes to their corresponding elements in the DOM.
 * @param {array<ASTNode>} path
 * @param {object} colElsMap
 */
function annotate(path, colElsMap) {
 for (var i = 0, l = path.length; i < l; i++) {
    var n = path[i];
    var nextEl = colElsMap[n.loc.start.line][n.loc.start.column];
    var col = n.loc.start.column;
    var startLine = n.loc.start.line;
    var line = startLine;
    var endLine = n.loc.end.line;
    var endCol = n.loc.end.column;
    while (nextEl && line <= endLine &&
            !(line === endLine && col >= endCol)) {
      if (line !== startLine && line !== endLine) {
        var lineEl = parentByClass(nextEl, 'loc');
        lineEl.classList.add(n.type);
        line++;
        col = 0;
      } else {
        nextEl.classList.add(n.type);
        col++;
      }
      var lineOfCols = colElsMap[line];
      var tmpEl = lineOfCols && lineOfCols[col];
      if (tmpEl) {
        nextEl = tmpEl;
      } else {
        line++;
      }
    }
  }
}

/**
 * Split highlighted line of code into columns.
 * @param {DOMElement} lineEl
 * @return {array<DOMElement>} array of consequitive column elements.
 */
function columnify(lineEl) {
  var colEls = [];

  // Pull out leaf text elements.
  var textEls = [];
  var stack = [lineEl];
  var el;
  while ((el = stack.pop()) != null) {
    if (el.nodeType === 3) {
      textEls.push(el);
    } else {
      stack.push.apply(
        stack,
        [].slice.call(el.childNodes).reverse()
      );
    }
  }

  var col = 0;
  while((el = textEls.shift()) != null) {
    var chars = el.textContent.split('');
    for (var i = 0; i < chars.length; i++) {
      var span = document.createElement('span');
      span.classList.add('col-' + col);
      span.textContent = chars[i];
      colEls.push(span);
      col++;
      el.parentNode.insertBefore(span, el);
    }
    el.parentNode.removeChild(el);
  }

  return colEls;
}

/**
 * Creates a line element.
 * @param {number} lineno
 * @param {string} html
 * @return {DOMElement}
 */
function createLineEl(lineno, html) {
  var div = document.createElement('div');
  div.classList.add('loc');
  div.classList.add('loc-' + lineno);
  div.innerHTML = html;
  return div;
}

/**
 * Format code by highlighting, annotating and columnifying.
 * @param {string} code
 * @param {array<ASTNode>} path
 */
module.exports = function (code, path) {
  var html = highlight(code);
  var colElMap = {};
  var codeEl = document.createElement('code');
  codeEl.classList.add(langClass);

  var lines = html.split('\n');
  var line;
  var n = 1;
  while ((line = lines.shift()) != null) {
    var lineEl = createLineEl(n, line || '&nbsp;');
    colElMap[n] = columnify(lineEl);
    codeEl.appendChild(lineEl);
    n++;
  }

  annotate(path, colElMap);

  var preEl = document.createElement('pre');
  preEl.classList.add(langClass);
  preEl.appendChild(codeEl);
  return preEl;
};
