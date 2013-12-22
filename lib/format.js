
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

  $(highlightedEl).html().split('\n').forEach(function (loc, n) {
      var col = 0;
      var $div = $('<div/>')
        .html(loc || '&nbsp;')
        .addClass('loc-' + (n + 1))
        .addClass('loc');

      var textEls = [];
      (function getTextEls(el) {
        $(el).contents().filter(function () {
          if (this.nodeType == 3) {
            textEls.push(this);
          } else {
            getTextEls(this);
          }
        });
      })($div[0]);

      textEls.forEach(function (el) {
        var $el = $(el);
        var chars = $el.text().split('');
        $el.before.apply(
          $el,
          chars.map(function (c) {
            var $col = $('<span/>', { class: 'col-' + col }).text(c);
            if (!$cols[n + 1]) {
              $cols[n + 1] = {};
            }
            $cols[n + 1][col] = $col;
            col++;
            return $col;
          })
        );
        $el.remove();
      });

      $code.append($div);
  });

  return {
    $pre: $('<pre/>').append($code).addClass('highlighted-code').addClass('language-javascript'),
    $cols: $cols
  };
};