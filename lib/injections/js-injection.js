var fs = require("fs");
var sizzleSource =
  fs.readFileSync(__dirname + "/sizzle.min.js").toString();

module.exports = {
  getSizzlejsSource: function () {
    return sizzleSource;
  },

  executeSizzlejs: function (sel, injectedJsCommand, sizzleSource) {
    var result = {
      isVisibleStrict: null,
      isVisible: false,
      selectorVisibleLength: 0,
      selectorLength: 0,
      value: {
        sel: sel,
        value: null
      }
    };

    var sizzleRef;

    if (window.Sizzle) {
      sizzleRef = window.Sizzle;
    } else if (window.jQuery) {
      sizzleRef = window.jQuery.find;
    } else {
      eval(sizzleSource);
      sizzleRef = Sizzle;
      sizzleRef.noConflict();
    }

    if (!sizzleRef) {
      return result;
    }

    sizzleRef.selectors.pseudos.visible =
      function (elem) {
        return elem.offsetWidth > 0 || elem.offsetHeight > 0 || elem.getClientRects().length > 0;
      };
    sizzleRef.selectors.pseudos.hidden =
      function (elem) {
        return !sizzle.selectors.pseudos.visible(elem);
      };


    try {

      var $el = sizzleRef(sel);
      if ($el.length > 0 && sizzleRef.matchesSelector($el[0], "area")) {
        result.isVisible = result.isVisibleStrict = true;
        result.selectorVisibleLength = $el.length;
      } else {
        var length = sizzleRef(sel + ":visible").length;
        result.isVisibleStrict = result.isVisible = length > 0;
        result.selectorVisibleLength = length;
      }

      result.selectorLength = $el.length;

      if (result.isVisible) {
        var seleniumClickSelectorValue = "magellan_selector_" + Math.round(Math.random() * 999999999).toString(16);
        $el[0].setAttribute("data-magellan-temp-automation-id", seleniumClickSelectorValue);

        result.value.value = (new Function("$el", "sizzle", injectedJsCommand))($el, sizzleRef);
      }
    } finally {
      return result;
    }

  }
};
