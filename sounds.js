var $ = require('jquery-browserify');

function generateSoundUrls(name) {
  var url = 'drum-samples/' + name;
  return [url + '.wav'];
}

var sounds = {};
[ 'hihat',
  'kick',
  'snare',
  'clap',
  'bass',
  'tom'
].forEach(function (name) {
  sounds[name] = new Howl({
    urls: generateSoundUrls(name)
  });
});

var nodeTypeToSound = {
  VariableDeclaration: 'kick',
  AssignmentExpression: 'kick',
  BinaryExpression: 'snare',
  UnaryExpression: 'kick',
  CallExpression: 'bass',
  FunctionDeclaration: 'bass',
  Literal: 'snare',
  MemberExpression: 'clap',
  BlockStatement: 'hihat',
  IfStatement: 'hihat',
  ExpressionStatement: 'hihat',
  ReturnStatement: 'clap',
  ArrayExpression: 'clap',
  BreakStatement: 'kick',
  CatchClause: 'kick',
  ConditionalExpression: 'hihat',
  ContinueStatement: 'kick',
  File: 'clap',
  ForInStatement: 'kick',
  ForStatement: 'kick',
  FunctionExpression: 'tom',
  LogicalExpression: 'snare',
  NewExpression: 'bass',
  ObjectExpression: 'bass',
  Program: 'tom',
  Property: 'snare',
  ThisExpression: 'kick',
  ThrowStatement: 'kick',
  TryStatement: 'kick',
  UpdateExpression: 'bass',
};


var $sel = $('<select/>');
Object.keys(sounds).forEach(function (name) {
  $sel.append($('<option value="' + name + '">' + name + '</option>' ));
});

var $menu = $('menu');
Object.keys(nodeTypeToSound).forEach(function (type) {
  $menu.append(
    $('<div/>').append(
      $('<label>' + type + '</label>'),
      $sel
        .clone()
        .val(nodeTypeToSound[type])
        .change(function () {
          nodeTypeToSound[type] = $(this).val();
        })
    ).mouseenter(function () {
      $('code').find('.' + type).addClass('highlight').addClass('menuhover')
    }).mouseleave(function () {
      $('code').find('.highlight.menuhover').removeClass('highlight').removeClass('menuhover');
    })
  );
});

function playNodeSound(n) {
  var name = nodeTypeToSound[n.type];
  if (name) {
    sounds[name].play();
    return true;
  }
  return false;
}

module.exports = playNodeSound;
