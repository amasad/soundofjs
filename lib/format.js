
module.exports = function (code) {
  var $code = $('<code/>', { class: 'language-javascript' });
  var $cols = {};

  var highlightedEl = $('<pre/>')
      .append('<code/>')
      .find('code')
      .addClass('language-javascript')
      .text(code)
      .get(0);

  Prism.highlightElement(highlightedEl, false);

  var $Line = $('<div/>', { class: 'loc' });
  var lines = $(highlightedEl).html().split('\n');
  var line;
  var n = 1;
  while ((line = lines.shift()) != null) {
    var $line = $Line
      .clone()
      .addClass('loc-' + n)
      .html(line || '&nbsp;');

    var textEls = [];
    var stack = [$line[0]];
    var el;
    while ((el = stack.pop()) != null) {
      if (el.nodeType === 3) {
        textEls.push(el);
      } else {
        stack.push.apply(
          stack,
          $(el).contents().toArray().reverse()
        );
      }
    }

    var col = 0;
    textEls.forEach(function (el) {
      var $el = $(el);
      var chars = $el.text().split('');
      $el.before.apply(
        $el,
        chars.map(function (c) {
          var $col = $('<span/>', { class: 'col-' + col }).text(c);
          if (!$cols[n]) {
            $cols[n] = {};
          }
          $cols[n][col] = $col;
          col++;
          return $col;
        })
      );
      $el.remove();
    });

    $code.append($line);
    n++;
  }

  return {
    $pre: $('<pre/>').append($code).addClass('highlighted-code').addClass('language-javascript'),
    $cols: $cols
  };
};