var fs = require("fs");
var sizzleSource =
  fs.readFileSync(__dirname + "/sizzle.min.js").toString();

module.exports = {
  getSizzlejsSource: function() {
    return sizzleSource;
  },

  executeSizzlejs: function(sel, injectedJsCommand, sizzleSource) {
    /* In context of browser, ask if the selector is :visible according to sizzle */
    var result = {
      isVisibleStrict: null,
      isVisible: false,
      selectorVisibleLength: 0,
      selectorLength: 0,
      value: {
        // for `clickEl`, need to check if it is still needed
        sel: sel,
        value: null
      }
    };


    var sizzleRef;

    if (window.Sizzle) {
      sizzleRef = window.Sizzle;
    } else {
      eval(sizzleSource);
      sizzleRef = Sizzle;
      sizzleRef.noConflict();
    }

    if (!sizzleRef) {
      // there might be error eval() here. we eat the error here and return result as nothing found on page
      return result;
    }

    sizzleRef.selectors.pseudos.visible =
      function(elem) {
        return elem.offsetWidth > 0 || elem.offsetHeight > 0 || elem.getClientRects().length > 0;
      };
    sizzleRef.selectors.pseudos.hidden =
      function(elem) {
        return !sizzle.selectors.pseudos.visible(elem);
      };


    try {

      var $el = sizzleRef(sel);
      if ($el.length > 0 && sizzleRef.matchesSelector($el[0], "area")) {
        /* Note: this is the only case in which we return a boolean for isVisibleStrict
         In all other cases, we return null because we effectively "do not know yet".
         This helps cases like waitForElNotPresent that cannot have "false" returned
         unless we have successfully checked if it is not visible. */
        result.isVisible = result.isVisibleStrict = true;
        result.selectorVisibleLength = $el.length;
      } else {
        var length = sizzleRef(sel + ":visible").length;
        result.isVisibleStrict = result.isVisible = length > 0;
        result.selectorVisibleLength = length;
      }

      result.selectorLength = $el.length;

      /* If selector:visible and we have been told to click then signal back that it is okay to click(),
         unless we see a selector that is ambiguous (i.e number of results
         is greater than 1). */
      if (result.isVisible) {
        /* We avoid using data-automation-id so that we do not accidentally blow away existing attributes. */
        var seleniumClickSelectorValue = "magellan_selector_" + Math.round(Math.random() * 999999999).toString(16);
        $el[0].setAttribute("data-magellan-temp-automation-id", seleniumClickSelectorValue);

        result.value.value = (new Function("$el", "sizzle", injectedJsCommand))($el, sizzleRef);
      }
    } finally {
      /* if for whatever reason we fail here, we do not want Selenium returning
         a null result value back to Magellan. For now, we eat this exception. */
      return result;
    }

  }
};
