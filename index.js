var recast = require('recast');
var $ = require('jquery-browserify');
var playNodeSound = require('./sounds');

var worker = new Worker('worker-parser-bundle.js');
// ideally https://www.youtube.com/watch?v=sBg4h_GEhfk
function play () {
  var code = $('textarea').val();
  var $code = $('<code/>');
  var $line = $('<div/>');

  code.split('\n').forEach(function (loc, n) {
    $code.append(
      $line
        .clone()
        .addClass('loc-' + (n + 1))
        .addClass('loc')
        .html(loc.split('').map(function (col, i) {
          return $('<span/>', {class: 'col-' + i, text: col});
        }))
    );
  });

  worker.onmessage = function (e) {
    var path = e.data.path;
    var ast = e.data.ast;
    var types = recast.types.namedTypes;

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

    $('textarea').replaceWith($code);

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

  worker.postMessage(code);
}

$('button').click(play);
