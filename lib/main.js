var $ = require('jquery-browserify');
var Sounds = require('./sounds');

var format = require('./format');
var parse = require('./parse');
var Player = require('./player');

var $textarea = $('textarea');
$(window).focus(function () {
  $textarea.focus();
});
$('body').click(function () {
  $textarea.focus();
});
$textarea.focus();

$textarea.on('paste', function () {
  setTimeout(function () {
    onPaste($textarea.val());
  }, 0);
});

var player;

function onPaste(code) {
  parse(code, function (data) {
    var path = data.path;
    var $pre = format(code, path);
    $textarea.replaceWith($pre);
    player = new Player(path, $pre.find('code')[0], new Sounds());
    $('button').click(player.play.bind(player));
  });
}