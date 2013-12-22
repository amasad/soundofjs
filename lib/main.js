var Sounds = require('./sounds');
var Player = require('./player');
var GUI = require('../vendor/dat.gui').GUI;

var format = require('./format');
var parse = require('./parse');
var events = require('event-component');

var textarea = document.querySelector('textarea');

events.bind(window, 'focus', function () {
  textarea.focus();
});

events.bind(document.body, 'click', function () {
  textarea.focus();
});

textarea.focus();

events.bind(textarea, 'paste', function () {
  setTimeout(function () {
    onPaste(textarea.value);
  }, 0);
});

/**
 * @param {string} code
 */
function onPaste(code) {
  parse(code, function (data) {
    var path = data.path;
    var preEl = format(code, path);
    textarea.parentNode.replaceChild(preEl, textarea);
    var sounds =  new Sounds();
    var player = new Player(path, preEl.childNodes[0], sounds);
    var gui = new GUI();
    gui.add(player, 'play');
    gui.add(sounds, 'bpm', 10, 200);
    var notes = gui.addFolder('Change Sounds');
    Object.keys(sounds.nodeTypeToNote).forEach(function (note) {
      notes.add(sounds.nodeTypeToNote, note, Sounds.NOTES);
    });
  });
}
