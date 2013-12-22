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

var animating = false;
function animateScrollToLine(el, lineEl) {
  if (!animating &&
      (el.scrollTop + el.clientHeight <=
      lineEl.offsetTop + (lineEl.offsetHeight * 2))) {
    var position = lineEl.offsetTop - (lineEl.offsetHeight * 3);
    var start;

    function step(t) {
      var progress;
      if (start == null) {
        start = t;
      }
      progress = t - start;
      el.scrollTop = Math.min(el.scrollTop + (progress / 5), position);
      if (el.scrollTop < position &&
          el.scrollTop !== el.scrollHeight - el.clientHeight) {
        requestAnimationFrame(step);
      } else {
        animating = false;
      }
    }
    animating = true;
    requestAnimationFrame(step);
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

Player.prototype._detectPattern = function (node) {
  var prevNode = this.path[this.index - 1];
  if (!prevNode) {
    return;
  }
  if (node.loc.start.line == prevNode.loc.start.line) {
    // Nodes on the same line.
    if (this.factor === 1) {
      this.factor = 0.5;
    }
  } else {
    // Try to detect a pattern to fast forward. Useful for when we have a big
    // array or object.
    var pathToFirst = [];
    var foundFirst = false;
    var found = false;
    for (var i = this.index - 1; i >= 0; i--) {
      var curNode = this.path[i];
      if (curNode.type === node.type) {
        if (foundFirst) {
          found = true;
          break;
        } else {
          foundFirst = true;
        }
      } else {
        if (foundFirst) {
          if (!pathToFirst.length ||
              curNode.type !== pathToFirst.shift().type) {
            break;
          }
        } else {
          pathToFirst.push(curNode);
        }
      }
    }

    if (found) {
      this.factor = Math.max(0.4, this.factor * 0.7);
    } else {
      this.factor = 1;
    }
  }
};

/**
 * Schedule the play loop.
 * ideally https://www.youtube.com/watch?v=sBg4h_GEhfk
 */
Player.prototype.play = function () {
  this.index = 0;
  this.pattern = {};
  this.factor = 1;
  this.highlightedLineEls = [];
  this.highlightedNodeEls = [];
  console.time('step');
  this._step();
};

Player.prototype._step = function () {
  console.timeEnd('step');
  var node = this.path[this.index];
  if (!node) {
    return;
  }
  if (types.Identifier.check(node) || types.VariableDeclarator.check(node)) {
    this.index++;
    this._step();
    return;
  }
  this._detectPattern(node);
  this.sounds.play(node);
  removeClass(this.highlightedLineEls, 'highlight');
  removeClass(this.highlightedNodeEls, 'highlight-2');
  setTimeout(this._update.bind(this), 0);
};

Player.prototype._update = function () {
  this.highlightedLineEls = [];
  this.highlightedNodeEls = [];
  var node = this.path[this.index];
  var start = node.loc.start.line;
  var end = node.loc.end.line;
  var lineEl = this.codeEl.querySelector('.loc-' + start);
  animateScrollToLine(this.codeEl.parentNode, lineEl);
  for (;start < end + 1; start++) {
    addClass(lineEl, 'highlight');
    this.highlightedLineEls.push(lineEl);
    var nodeChars = lineEl.querySelectorAll('.' + node.type);
    addClass(nodeChars, 'highlight-2');
    this.highlightedNodeEls.push.apply(this.highlightedNodeEls, nodeChars);
    lineEl = lineEl.nextSibling;
  }
  this.index++;
  console.time('step');
  setTimeout(this._step.bind(this), this.sounds.msPerBeat() * this.factor);
};

module.exports = Player;
