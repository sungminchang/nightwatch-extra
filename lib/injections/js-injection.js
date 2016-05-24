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
  executeSizzlejs: function (pSel, pInjectedJsCommand, pSizzleSource, done) {
    var result = {
      seens: 0,
      isVisibleStrict: null,
      isVisible: false,
      selectorVisibleLength: 0,
      selectorLength: 0,
      value: {
        sel: pSel,
        value: null
      }
    };

    var sizzleRef;

    if (window.Sizzle) {
      sizzleRef = window.Sizzle;
    } else if (window.jQuery) {
      sizzleRef = window.jQuery.find;
    } else {
      eval(pSizzleSource);
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


    result.count = function () {
      try {
        var $el = sizzleRef(this.value.sel);
        this.el = $el
        if ($el.length > 0 && sizzleRef.matchesSelector($el[0], "area")) {
          this.isVisible = this.isVisibleStrict = true;
          this.selectorVisibleLength = $el.length;
        } else {
          var length = sizzleRef(this.value.sel + ":visible").length;
          this.isVisibleStrict = this.isVisible = length > 0;
          this.selectorVisibleLength = length;
        }

        this.selectorLength = $el.length;

        if (this.isVisible) {
          this.seens += 1;
          if (this.seens >= 3) {
            var seleniumClickSelectorValue = "magellan_selector_" + Math.round(Math.random() * 999999999).toString(16);
            $el[0].setAttribute("data-magellan-temp-automation-id", seleniumClickSelectorValue);

            this.value.value = (new Function("$el", "sizzle", pInjectedJsCommand))($el, sizzleRef);
            done(this);
          }else{
            setTimeout(this.count, 50);
          }
        }else{
          done(this);
        }
      } catch(e) {
        done(this);
      }
    }.bind(result);

    result.count();
  }
};
