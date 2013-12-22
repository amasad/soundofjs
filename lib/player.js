var types = require('ast-types').namedTypes;

/**
 * Add class on one or many elements.
 * @param {array<DOMElement>} els
 * @param {string} kls
 */
function addClass(els, kls) {
  if (els.nodeType) {
    els = [els];
  }
  for (var i = 0; i < els.length; i++) {
    els[i].classList.add(kls);
  }
}

/**
 * Remove class on one or many elements.
 * @param {array<DOMElement>} els
 * @param {string} kls
 */
function removeClass(els, kls) {
  if (els.nodeType) {
    els = [els];
  }
  for (var i = 0; i < els.length; i++) {
    els[i].classList.remove(kls);
  }
}

/**
 * @constructor
 * @param {DOMElement} codeEl
 * @param {Sounds} sound
 * @param {array<ASTNode} path
 */
function Player(path, codeEl, sounds) {
  this.path = path;
  this.codeEl = codeEl;
  this.sounds = sounds;
}

/**
 * Schedule the play loop.
 * ideally https://www.youtube.com/watch?v=sBg4h_GEhfk
 */
Player.prototype.play = function () {
  var path = this.path;
  var codeEl = this.codeEl;
  var sounds = this.sounds;
  var step = 0;
  var lastLine = null;
  var lastType = null;
  var highlightedLineEls = [];
  var highlightedNodeEls = [];
  for (var i = 0; i < path.length; i++) {
    var node = path[i];
    if (types.Identifier.check(node) || types.VariableDeclarator.check(node)) {
      continue;
    }
    if (node.loc.start.line == lastLine || node.type == lastType) {
      step += 0.5;
    } else {
      step += 1;
    }
    lastLine = node.loc.start.line;
    lastType = node.type;
    setTimeout(function (node) {
      sounds.play(node);
      removeClass(highlightedLineEls, 'highlight');
      removeClass(highlightedNodeEls, 'highlight-2');
      setTimeout(function () {
        highlightedLineEls = [];
        highlightedNodeEls = [];
        var start = node.loc.start.line;
        var end = node.loc.end.line;
        var lineEl = codeEl.querySelector('.loc-' + start);
        for (;start < end + 1; start++) {
          addClass(lineEl, 'highlight');
          highlightedLineEls.push(lineEl);
          var nodeChars = lineEl.querySelectorAll('.' + node.type);
          addClass(nodeChars, 'highlight-2');
          highlightedNodeEls.push.apply(
            highlightedNodeEls, nodeChars
          );
          lineEl = lineEl.nextSibling;
        }
      }, 0);
    }.bind(null, node), step * 300);
  }
};

module.exports = Player;