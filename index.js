var recast = require('recast');
var types = recast.types.namedTypes;

var $ = require('jquery-browserify');
var playNodeSound = require('./sounds');

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
            return $('<span/>', { class: 'col-' + (col++) }).text(c);
          })
        );
        $el.remove();
      });

    $code.append($div);
  });

  var $pre = $('<pre/>').append($code).addClass('highlighted-code').addClass('language-javascript');


  worker.onmessage = function (e) {
    path = e.data.path;
    ast = e.data.ast;
    path.forEach(function (n) {
      var $start = $code.find('.loc-' + n.loc.start.line).find('.col-' + n.loc.start.column);
      var $end = $code.find('.loc-' + n.loc.end.line).find('.col-' + n.loc.end.column);
      var $next = $start;

      var col = n.loc.start.column;
      var line = n.loc.start.line;
      var endLine = n.loc.end.line;
      var endCol = n.loc.end.column;
      while ($next.length && line <= endLine && !(line === endLine && col >= endCol)) {
        $next.addClass(n.type);
        col++;
        $tmp = $code.find('.loc-' + line + ' .col-' + col);
        if ($tmp.length) {
          $next = $tmp;
        } else {
          line++;
          col = 0;
          continue;
        }
      }
    });
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
