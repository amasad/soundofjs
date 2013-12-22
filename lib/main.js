var recast = require('recast');
var types = recast.types.namedTypes;

var $ = require('jquery-browserify');
var playNodeSound = require('./sounds');
var Prism = require('../vendor/prism');

var formatCode = require('./format');
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
  var tmp = formatCode(code);
  var $cols = tmp.$cols;
  var $pre = tmp.$pre;

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
