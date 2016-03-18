var fs = require("fs");
var sizzleSource =
  fs.readFileSync(__dirname + "/../injectable_scripts/sizzle.min.js").toString();
var acquireSizzle = require("./acquire-sizzle");

module.exports = {
  getSizzlejsSource: function () {
    return sizzleSource;
  },

  acquireSizzlejs: function () {
    return acquireSizzle;
  },

  executeSizzlejs: function (sel, injectedJsCommand, sizzleSource, acquireSizzle) {
    /* In context of browser, ask if the selector is :visible according to sizzle */
    var result = {
      isVisibleStrict: null,
      isVisible: false,
      selectorVisibleLength: 0,
      selectorLength: 0,
      value: {
        // for `clickEl`, need to check if it is still needed
        selector: sel,
        value: null
      }
    };
    /* The non-jQuery click solution has not been tested outside of Chrome and Phantom and
       likely does not work in IE. This needs to be tested. */
    // var useJQueryClick = true;

    var sizzleRef = (new Function(acquireSizzle))();
    
    if (sizzleRef) {
      try {

        var $el = sizzleRef(sel);
        if (sizzleRef.matchesSelector($el[0], "area")) {
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

        // var doSeleniumClick = false;

        /* If selector:visible and we have been told to click then signal back that it is okay to click(),
           unless we see a selector that is ambiguous (i.e number of results
           is greater than 1). */
        if (result.isVisible) {
          result.value.value = (new Function("$el", injectedJsCommand))($el);
        }
      } finally {
        /* if for whatever reason we fail here, we do not want Selenium returning
           a null result value back to Magellan. For now, we eat this exception. */
        return result;
      }
    } else if (!sizzleRef) {
      if (window.____injectedSizzleSource____) {

        /* Evaluation Phase */
        try {
          eval(window.____injectedSizzleSource____);
          window.____injectedSizzle____ = Sizzle;
          Sizzle.noConflict();
        } finally {
          // ignore the error there
          return result;
        }
      } else {
        /* Request injection if we do not have the jQuery source but we need it */
        window.____injectedSizzleSource____ = sizzleSource;
        return result;
      }
    } else {
      return result;
    }
  }
};
