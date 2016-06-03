var fs = require("fs");
var sizzleSource =
  fs.readFileSync(__dirname + "/sizzle.min.js").toString();

module.exports = {
  getSizzlejsSource: function () {
    return sizzleSource;
  },


  /**
   *  android emulator doesn't allow js injection with comments. so add comments
   *  here if comments are needed for `executeSizzlejs` function
   *  
   *  element visibility counter has been moved into injected js to limit the number 
   *  of http requests we have to send to selenium server. this is extremely fast 
   *  when tests are running against a cloud service provider like saucelabs
   *
   */
  executeSizzlejs: function (pSel, pInjectedJsCommand, pSizzleSource,
    waitInterval, seenMax, done) {
    var result = {
      seens: 0,
      jsDuration: 0,
      jsStepDuration: [],
      isVisibleStrict: null,
      isVisible: false,
      selectorVisibleLength: 0,
      selectorLength: 0,
      value: {
        sel: pSel,
        value: null
      }
    };
    var startTime = (new Date()).getTime();

    var sizzleRef;

    if (window.Sizzle) {
      sizzleRef = window.Sizzle;
    } else if (window.jQuery) {
      sizzleRef = window.jQuery.find;
    } else {
      eval(pSizzleSource);
      sizzleRef = Sizzle;
      sizzleRef.noConflict();

      sizzleRef.selectors.pseudos.visible =
        function (elem) {
          return elem.offsetWidth > 0 || elem.offsetHeight > 0 || elem.getClientRects().length > 0;
        };
      sizzleRef.selectors.pseudos.hidden =
        function (elem) {
          return !sizzle.selectors.pseudos.visible(elem);
        };

      window.Sizzle = sizzleRef;
    }

    if (!sizzleRef) {
      return result;
    }

    var calculateElapseAndReturn = function () {
      var elapsed = (new Date()).getTime() - startTime;
      result.jsDuration = elapsed;
      done(result);
    }

    var count = function () {
      try {
        var $el = sizzleRef(result.value.sel);
        if ($el.length > 0 && sizzleRef.matchesSelector($el[0], "area")) {
          result.isVisible = result.isVisibleStrict = true;
          result.selectorVisibleLength = $el.length;
        } else {
          var length = sizzleRef(result.value.sel + ":visible").length;
          result.isVisibleStrict = result.isVisible = length > 0;
          result.selectorVisibleLength = length;
        }

        result.selectorLength = $el.length;

        if (result.isVisible) {
          result.jsStepDuration.push((new Date()).getTime() - startTime);

          result.seens += 1;
          if (result.seens >= seenMax) {
            var seleniumClickSelectorValue = "magellan_selector_" + Math.round(Math.random() * 999999999).toString(16);
            $el[0].setAttribute("data-magellan-temp-automation-id", seleniumClickSelectorValue);

            result.value.value = (new Function("$el", "sizzle", pInjectedJsCommand))($el, sizzleRef);
            result.jsStepDuration.push((new Date()).getTime() - startTime);
            calculateElapseAndReturn();
          } else {
            setTimeout(count, waitInterval);
          }
        } else {
          calculateElapseAndReturn();
        }
      } catch (e) {
        calculateElapseAndReturn();
      }
    };

    count();
  }
};
