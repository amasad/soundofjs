var Howl = require('../vendor/howler').Howl;

function generateSoundUrls(name) {
  var url = 'drum-samples/' + name;
  return [url + '.wav'];
}

var NOTES = [
  'hihat',
  'kick',
  'snare',
  'clap',
  'bass',
  'tom'
];

var sounds = {};
NOTES.forEach(function (name) {
  sounds[name] = new Howl({
    urls: generateSoundUrls(name)
  });
});

function Sounds() {
  this.nodeTypeToNote = {
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
    ForInStatement: 'kick',
    ForStatement: 'kick',
    FunctionExpression: 'tom',
    LogicalExpression: 'snare',
    NewExpression: 'bass',
    ObjectExpression: 'bass',
    Property: 'snare',
    ThisExpression: 'kick',
    ThrowStatement: 'kick',
    TryStatement: 'kick',
    UpdateExpression: 'bass',
  };
  this.bpm = 100;
}

Sounds.NOTES = NOTES;

Sounds.prototype.play = function (n) {
  var name = this.nodeTypeToNote[n.type];
  if (name) {
    sounds[name].play();
    return true;
  }
  return false;
};

Sounds.prototype.msPerBeat = function () {
  console.log(this.bpm);
  return 60 * 1000 / this.bpm;
}

module.exports = Sounds;
