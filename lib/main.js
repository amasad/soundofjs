var recast = require('recast');
var types = recast.types.namedTypes;

var $ = require('jquery-browserify');
var playNodeSound = require('./sounds');
var Prism = require('../vendor/prism');

var format = require('./format');
var parse = require('./parse');

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
  parse(code, function (data) {
    path = data.path;
    ast = data.ast;
    var tmp = format(code, path);
    var $cols = tmp.$cols;
    var $pre = tmp.$pre;
    $textarea.replaceWith($pre);
  });
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
