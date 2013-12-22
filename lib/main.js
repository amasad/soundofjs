var Sounds = require('./sounds');
var Player = require('./player');
var GUI = require('../vendor/dat.gui').GUI;

var $ = require('jquery-browserify');
var format = require('./format');
var parse = require('./parse');


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


function onPaste(code) {
  parse(code, function (data) {
    var path = data.path;
    var $pre = format(code, path);
    $textarea.replaceWith($pre);
    var sounds =  new Sounds();
    var player = new Player(path, $pre.find('code')[0], sounds);
    var gui = new GUI();
    gui.add(player, 'play');
    Object.keys(sounds.nodeTypeToNote).forEach(function (note) {
      gui.add(sounds.nodeTypeToNote, note, Sounds.NOTES);
    });
  });
}
