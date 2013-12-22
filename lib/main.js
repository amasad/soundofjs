var types = require('ast-types').namedTypes;

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

function addClass(els, kls) {
  if (els.nodeType) {
    els = [els]
  }
  for (var i = 0; i < els.length; i++) {
    els[i].classList.add(kls);
  }
}

function removeClass(els, kls) {
  if (els.nodeType) {
    els = [els]
  }
  for (var i = 0; i < els.length; i++) {
    els[i].classList.remove(kls);
  }
}

// ideally https://www.youtube.com/watch?v=sBg4h_GEhfk
function play () {
  var step = 0;
  var lastLine = null;
  var lastType = null;
  var highlightedLineEls = [];
  var highlightedNodeEls = [];
  var codeEl = $('code')[0];
  var prev = Date.now();
  for (var i = 0; i < path.length; i++) {
    var node = path[i];
    if (types.Identifier.check(node) || types.VariableDeclarator.check(node)) {
      continue;
    }
    if (node.loc.start.line == lastLine || node.type == lastType) {
      step += 0.5;
    } else {
      step += 1;
    }
    lastLine = node.loc.start.line;
    lastType = node.type;
    setTimeout(function (node) {
      console.log(Date.now() - prev);
      prev = Date.now();
      playNodeSound(node);
      removeClass(highlightedLineEls, 'highlight');
      removeClass(highlightedNodeEls, 'highlight-2');
      setTimeout(function () {
        highlightedLineEls = [];
        highlightedNodeEls = [];
        var start = node.loc.start.line;
        var end = node.loc.end.line;
        var lineEl = codeEl.querySelector('.loc-' + start);
        for (;start < end + 1; start++) {
          addClass(lineEl, 'highlight');
          highlightedLineEls.push(lineEl);
          var nodeChars = lineEl.querySelectorAll('.' + node.type);
          addClass(nodeChars, 'highlight-2');
          highlightedNodeEls.push.apply(
            highlightedNodeEls, nodeChars
          );
          lineEl = lineEl.nextSibling;
        }
      }, 0);
    }.bind(null, node), step * 300);
  }
}

$('button').click(play);
