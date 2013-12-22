var $ = require('jquery-browserify');
var Prism = require('../vendor/prism');

var langClass = 'language-javascript';

/**
 * @param {string} code
 * @return {string} html
 */
function highlight(code) {
  var highlightedEl = $('<pre/>')
      .append('<code/>')
      .find('code')
      .addClass(langClass)
      .text(code)
      .get(0);

  Prism.highlightElement(highlightedEl, false);

  return $(highlightedEl).html();
}

/**
 * Add node types as classes to their corresponding elements in the DOM.
 * @param {array<ASTNode>} path
 * @param {object} $cols
 */
function annotate(path, $cols) {
 for (var i = 0, l = path.length; i < l; i++) {
    var n = path[i];
    var $next = $cols[n.loc.start.line][n.loc.start.column];
    var col = n.loc.start.column;
    var line = n.loc.start.line;
    var endLine = n.loc.end.line;
    var endCol = n.loc.end.column;
    while ($next.length && line <= endLine &&
            !(line === endLine && col >= endCol)) {
      $next[0].classList.add(n.type);
      col++;
      var lineOfCols = $cols[line];
      var $tmp = lineOfCols && lineOfCols[col];
      if ($tmp) {
        $next = $tmp;
      } else {
        line++;
        col = 0;
      }
    }
  }
}

/**
 * Split highlighted line of code into columns.
 * @param {jQuery} $line
 * @return {object} array of consequitive column jQuery elements.
 */
function columnify($line) {
  var $cols = [];

  // Pull out leaf text elements.
  var textEls = [];
  var stack = [$line[0]];
  var el;
  while ((el = stack.pop()) != null) {
    if (el.nodeType === 3) {
      textEls.push(el);
    } else {
      stack.push.apply(
        stack,
        $(el).contents().toArray().reverse()
      );
    }
  }

  var col = 0;
  while((el = textEls.shift()) != null) {
    var $el = $(el);
    var chars = $el.text().split('');
    for (var i = 0; i < chars.length; i++) {
      var $col = $('<span/>', { class: 'col-' + col }).text(chars[i]);
      $cols.push($col);
      col++;
      $el.before($col);
    }
    $el.remove();
  }

  return $cols;
}

/**
 * Format code by highlighting, annotating and columnifying.
 * @param {string} code
 * @param {array<ASTNode>} path
 */
module.exports = function (code, path) {
  var html = highlight(code);
  var $code = $('<code/>', { class: langClass });
  var $cols = {};

  var $Line = $('<div/>', { class: 'loc' });
  var lines = html.split('\n');
  var line;
  var n = 1;
  while ((line = lines.shift()) != null) {
    var $line = $Line
      .clone()
      .addClass('loc-' + n)
      .html(line || '&nbsp;');
    $cols[n] = columnify($line);
    $code.append($line);
    n++;
  }

  annotate(path, $cols);

  return {
    $pre: $('<pre/>')
            .append($code)
            .addClass(langClass),
    $cols: $cols
  };
};
