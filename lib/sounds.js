var Howl = require('../vendor/howler').Howl;

/**
 * Generate a url array that howler.js understands.
 * @param {string} name
 * @return {array<string>}
 */
function generateSoundUrls(name) {
  var url = 'drum-samples/808/' + name;
  return [url + '.mp3', url + '.ogg', url + '.wav'];
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

/**
 * @constructor
 */
function Sounds() {
  // TODO add missing shit.
  this.nodeTypeToNote = {
    Program: 'tom',
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
    WhileStatement: 'hihat',
    SwitchStatement: 'hihat',
    SwitchCase: 'kick'
  };
  this.bpm = 130;
}

Sounds.NOTES = NOTES;

/**
 * @param {ASTNode} n
 * @return {bool} whether played
 */
Sounds.prototype.play = function (n) {
  var name = this.nodeTypeToNote[n.type];
  if (name) {
    sounds[name].play();
    return true;
  }
  return false;
};

/**
 * @return {number} milliseconds between steps.
 */
Sounds.prototype.msPerBeat = function () {
  return 60 * 1000 / this.bpm;
};

module.exports = Sounds;
