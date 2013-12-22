var Sounds = require('./sounds');
var Player = require('./player');
var GUI = require('../vendor/dat.gui').GUI;
var Spinner = require('../vendor/spin');

var format = require('./format');
var parse = require('./parse');
var events = require('event-component');
var example = require('./example');

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
    textarea.value = '';
  }, 0);
});

var seeExampleEl = document.querySelector('.see-example');
events.bind(seeExampleEl, 'click', function () {
  onPaste(example);
});

var orEl = document.querySelector('.or');
var container = document.querySelector('.container');
var gui;

function reset() {
  textarea.style.display = 'block';
  seeExampleEl.style.display = 'block';
  document.querySelector('.or').style.display = 'block';
  container.replaceChild(textarea, document.querySelector('pre'));
  gui.destroy();
}

var domify = require('domify');

function addIcon(el, icon) {
  var iEl = domify('<i class="fa fa-' + icon + '"></i>');
  el.previousSibling.insertBefore(iEl, el.previousSibling.childNodes[0]);
}

/**
 * @param {string} code
 */
function onPaste(code) {
  var spinner = new Spinner({color: '#fff'}).spin(document.body);
  seeExampleEl.style.display = 'none';
  textarea.style.display = 'none';
  document.querySelector('.or').style.display = 'none';

  parse(code, function (error, data) {
    spinner.stop();
    if (error) {
      alert('Error parsing code: ' + error.message);
      reset();
      return;
    }
    var path = data.path;
    var preEl = format(code, path);
    container.replaceChild(preEl, textarea);
    var sounds =  new Sounds();
    var player = new Player(path, preEl.childNodes[0], sounds);
    gui = new GUI();
    addIcon(gui.add({new: reset}, 'new').domElement, 'edit');
    addIcon(gui.add(player, 'play').domElement, 'play');
    addIcon(gui.add(sounds, 'bpm', 10, 200).domElement, 'music');
    var notes = gui.addFolder('Change Sounds');
    Object.keys(sounds.nodeTypeToNote).forEach(function (note) {
      notes.add(sounds.nodeTypeToNote, note, Sounds.NOTES);
    });
  });
}
