var recast = require('recast');
var $ = require('jquery-browserify');
var playNodeSound = require('./sounds');

var $code = $('code');
var code = $code.text();
var $newCode = $('<code/>');
var $line = $('<div/>');

console.profile('split');
code.split('\n').forEach(function (loc, n) {
  $newCode.append(
    $line
      .clone()
      .addClass('loc-' + (n + 1))
      .addClass('loc')
      .html(loc.split('').map(function (col, i) {
        return $('<span/>', {class: 'col-' + i, text: col});
      }))
  );
});
console.profileEnd('split');

var ast = recast.parse(code);
var types = recast.types.namedTypes;
console.profile('type classes');
recast.types.traverse(ast, function (n) {
  var $start = $newCode.find('.loc-' + n.loc.start.line).find('.col-' + n.loc.start.column);
  var $end = $newCode.find('.loc-' + n.loc.end.line).find('.col-' + n.loc.end.column);
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
console.profileEnd('type classes')
$code.replaceWith($newCode);


function play() {
  var i = 0;
  var hist = {};
  var lastLine = null;
  var lastType = null;
  recast.types.traverse(ast, function (n) {
    if (types.Identifier.check(n) || types.VariableDeclarator.check(n)) return;
    if (n.loc.start.line == lastLine || n.type == lastType) {
      i += 0.5
    } else {
      i += 1
    }
    lastLine = n.loc.start.line;
    lastType = n.type;
    setTimeout(function () {
      if (!playNodeSound(n)) {
        hist[n.type] = (hist[n.type] || 0) + 1;
      }
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
  console.log(hist);
}

$('button').click(play);
