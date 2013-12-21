var recast = require('recast');
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
  console.log(code)
  var $code = $('<code/>', { class: 'language-javascript' });
  var $line = $('<div/>');

  code.split('\n').forEach(function (loc, n) {
    $code.append(
      $line
        .clone()
        .addClass('loc-' + (n + 1))
        .addClass('loc')
        .append(
          (loc.length && loc.split('').map(function (col, i) {
            return $('<span/>', {class: 'col-' + i}).append($('<span/>', { class: 'text', text: col }));
          })) || "&nbsp;"
        )
    );
  });

  $textarea.replaceWith($('<pre/>').append($code).addClass('language-javascript'));

  $highlighted = $('<code/>').text(code);
  $pre = $('<pre/>').append($highlighted).addClass('highlighted-code').addClass('language-javascript')
  $('body').append($pre);
  Prism.highlightElement($highlighted[0], false);

  worker.onmessage = function (e) {
    path = e.data.path;
    ast = e.data.ast;
  };

  worker.postMessage(code);
}

// ideally https://www.youtube.com/watch?v=sBg4h_GEhfk
function play () {
    var types = recast.types.namedTypes;
    var $code = $('code');
    path.forEach(function (n) {
      var $start = $code.find('.loc-' + n.loc.start.line).find('.col-' + n.loc.start.column);
      var $end = $code.find('.loc-' + n.loc.end.line).find('.col-' + n.loc.end.column);
      var $next = $start;
      var path = [];
      while (!$next.is($end) && $next.length) {
        path.push($next[0]);
        $tmp = $next.next();
        if (!$tmp.length) {
          var $parentLine = $next.closest('.loc');
          var $nextLine = $parentLine.next();
          $next = $nextLine.children().first();
        } else {
          $next = $tmp;
        }
      }
      // optimizaiton.
      for (var i = 0, el; el = path[i]; i++) {
        el.classList.add(n.type);
      }
    });

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
