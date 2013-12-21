var recast = require('recast');
var types = recast.types.namedTypes;

var $ = require('jquery-browserify');
var playNodeSound = require('./sounds');
var Prism = require('../vendor/prism');

var worker = new Worker('worker-parser-bundle.js');

$textarea = $('textarea');
$(window).focus(function () {
  $textarea.focus();
});
$('body').click(function () {
  $textarea.focus();
})
$textarea.focus();

$textarea.on('paste', function (e) {
  setTimeout(function () {
    onPaste($textarea.val());
  }, 0);
});

var ast = null;
var path = null;

function onPaste(code) {
  var $code = $('<code/>', { class: 'language-javascript' });
  var $locs = {};
  var $cols = {};

  var highlightedEl = $('<pre/>')
      .append('<code/>')
      .find('code')
      .addClass('language-javascript')
      .text(code)
      .get(0);

  Prism.highlightElement(highlightedEl, false);

  var col = 0;
  $(highlightedEl).html().split('\n').forEach(function (loc, n) {
      var col = 0;
      var $div = $('<div/>')
        .html(loc || '&nbsp;')
        .addClass('loc-' + (n + 1))
        .addClass('loc');

      var textEls = [];
      (function getTextEls(el) {
        $(el).contents().filter(function () {
          if (this.nodeType == 3) {
            textEls.push(this);
          } else {
            getTextEls(this);
          }
        });
      })($div[0]);

      textEls.forEach(function (el) {
        var $el = $(el);
        var chars = $el.text().split('');
        $el.before.apply(
          $el,
          chars.map(function (c) {
            var $col = $('<span/>', { class: 'col-' + col }).text(c);
            if (!$cols[n + 1]) {
              $cols[n + 1] = {};
            }
            $cols[n + 1][col] = $col;
            col++;
            return $col;
          })
        );
        $el.remove();
      });

      $locs[n + 1] = $div;
      $code.append($div);
  });

  var $pre = $('<pre/>').append($code).addClass('highlighted-code').addClass('language-javascript');


  worker.onmessage = function (e) {
    console.log('message');
    path = e.data.path;
    ast = e.data.ast;
    console.profile('wat');
    console.time('wat');
    for (var i = 0, l = path.length; i < l; i++) {
      n = path[i];
      var $start = $cols[n.loc.start.line][n.loc.start.column];
      var $end = $cols[n.loc.end.line][n.loc.end.column];
      var $next = $start;

      var col = n.loc.start.column;
      var line = n.loc.start.line;
      var endLine = n.loc.end.line;
      var endCol = n.loc.end.column;
      var els = [];
      while ($next.length && line <= endLine && !(line === endLine && col >= endCol)) {
        $next[0].classList.add(n.type);
        col++;
        var lineOfCols = $cols[line];
        $tmp = lineOfCols && lineOfCols[col];
        if ($tmp) {
          $next = $tmp;
        } else {
          line++;
          col = 0;
          continue;
        }
      }
    }
    console.profileEnd('wat');
    console.timeEnd('wat');
    $textarea.replaceWith($pre);
  };

  worker.postMessage(code);
}

// ideally https://www.youtube.com/watch?v=sBg4h_GEhfk
function play () {
  var i = 0;
  var lastLine = null;
  var lastType = null;
  path.forEach(function (n) {
    if (types.Identifier.check(n) || types.VariableDeclarator.check(n)) return;
    if (n.loc.start.line == lastLine || n.type == lastType) {
      i += 0.5;
    } else {
      i += 1;
    }
    lastLine = n.loc.start.line;
    lastType = n.type;
    setTimeout(function () {
      playNodeSound(n);
      $('.highlight').removeClass('highlight');
      $('.highlight-2').removeClass('highlight-2');
      var start = n.loc.start.line;
      var end = n.loc.end.line;

      for (;start < end + 1; start++) {
        $('.loc-' + start).addClass('highlight');
      }
      $('.highlight').find('.' + n.type).addClass('highlight-2');
    }, 300 * i);
  });
}

$('button').click(play);
