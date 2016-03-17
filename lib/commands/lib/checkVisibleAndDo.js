var util = require("util");
var clc = require("cli-color");
var _ = require("lodash");
var stringify = require("json-stringify-safe");
var EventEmitter = require("events").EventEmitter;
var fs = require("fs");
var sizzleSource = fs.readFileSync(__dirname + "/../../../injectable_scripts/sizzle.min.js").toString();
var acquireSizzle = require("../../acquire-jquery");
var settings = require("../../settings");
var selectorUtil = require("../../util/selector");



var chunkify = function (bigstr) {
  var chunkSize = 48000;
  var chunks = [];
  var lastAcc;

  bigstr.split("").reduce(function (acc, ch) {
    if (acc.length === chunkSize) {
      chunks.push(acc);
      acc = "";
    }
    acc += ch;
    lastAcc = acc;
    return acc;
  }, "");

  if (lastAcc && lastAcc.length > 0) {
    chunks.push(lastAcc);
  }

  return chunks;
};

function CheckVisibleAndDo() {
  this.remainingChunks = chunkify(sizzleSource);
  EventEmitter.call(this);
}

util.inherits(CheckVisibleAndDo, EventEmitter);

// Execute a browser-side function and if the result isn't an internal
// selenium error, call the callback. Otherwise fail
CheckVisibleAndDo.prototype.execute = function (fn, args, callback) {
  var self = this;

  var innerArgs = selectorUtil.depageobjectize(args, this.client.locateStrategy);

  // NOTE: we add two more arugments to every args array here:
  //  1) sizzleSource - optional sourcecode of jquery in case we need to inject it for external sites
  //  2) forceUseJQueryClick - optional boolean to configure the forced usage of useJQueryClick

  // Only inject this large block of source code to the browser side
  // if the last run of checkVisibleAndClick requested injection. This
  // saves us from having to transmit the entire source of jQuery every
  // time we run execute(), but does cost us one "beat" when we are
  // using an external site that needs injection for shimming.
  if (this.jqueryInjectionRequested === true) {
    if (this.remainingChunks.length > 0) {
      innerArgs.push(this.remainingChunks.shift());
      this.jqueryInjectionRequested = false;
    } else {
      innerArgs.push(undefined);
    }
  } else {
    innerArgs.push(undefined);
  }

  innerArgs.push(acquireSizzle);

  this.client.api.execute(fn, innerArgs, function (result) {
    console.log(result)
    if (settings.verbose) {
      console.log("execute(" + innerArgs + ") intermediate result: ", result);
    }
    if (result && result.status === 0 && result.value !== null) {
      // Note: by checking the result and passing result.value to the callback,
      // we are claiming that the result sent to the callback will always be truthy
      // and useful, relieving the callback from needing to check the structural
      // validity of result or result.value

      if (result.value.jqueryInjectionRequested === true) {
        // Check if checkVisibleAndClick requested jQuery to be injected
        self.jqueryInjectionRequested = true;
      }

      callback.call(self, result.value);
    } else {
      console.log(clc.yellowBright("\u2622  Received error result from Selenium. Raw Selenium result object:"));
      var resultDisplay;
      try {
        resultDisplay = stringify(result);
      } catch (e) {
        resultDisplay = result;
      }
      console.log(clc.yellowBright(resultDisplay));
      self.fail();
    }
  });
};

// Optionally take in a different text for expected, but default to "visible"
CheckVisibleAndDo.prototype.pass = function (expected) {
  expected = expected || "visible";
  var elapsed = (new Date()).getTime() - this.startTime;
  this.client.assertion(true, expected, expected, util.format(this.successMessage, elapsed), true);
  if (this.cb) {
    this.cb.apply(this.client.api, []);
  }
  this.emit("complete");
};

// Optionally take in a different text for expected and actual values, but default to "visible", and "not visible".
CheckVisibleAndDo.prototype.fail = function (expected, actual) {
  actual = actual || "not visible";
  expected = expected || "visible";
  var elapsed = (new Date()).getTime() - this.startTime;
  this.client.assertion(false, actual, expected, util.format(this.failureMessage, elapsed), true);
  if (this.cb) {
    this.cb.apply(this.client.api, []);
  }
  this.emit("complete");
};


// Ask if the selector is :visible according to jQuery. Report
// back about selector result length and how much of those
// resulting elements were visible. If shouldClick is set to true,
// then optionally click if the selector result length is 1 (i.e.
// if the selector result is unambigous -- don't click multiple things)
// supported operations
// {
//    getLength: get total number of elements by sel
//    click: trigger click operation on sel
//    getValue: return textual value of sel
//    getTempSel: return injected magellan temporary id
//    mouseOver: scroll page to given element
// }
CheckVisibleAndDo.prototype.checkVisibleAndDo = function (sel, operations, sizzleSourceChunk, acquireSizzle) {
  /* In context of browser, ask if the selector is :visible according to jQuery */
  var sizzleRef;

  var defaultResponse = {
    isVisibleStrict: null,
    isVisible: false,
    selectorVisibleLength: 0,
    selectorLength: 0
  };
  /* The non-jQuery click solution has not been tested outside of Chrome and Phantom and
     likely does not work in IE. This needs to be tested. */
  var useJQueryClick = true;

  var sizzleRef = (new Function(acquireSizzle))();

  if (sizzleRef) {
    try {

      var $el = sizzleRef(sel);
      if (sizzleRef.matchesSelector($el[0], "area")) {
        defaultResponse.isVisible = true;
        defaultResponse.isVisibleStrict = true;
        defaultResponse.selectorVisibleLength = $el.length;
      } else {
        defaultResponse.isVisible = sizzleRef(sel + ":visible").length > 0;
        defaultResponse.isVisibleStrict = defaultResponse.isVisible;
        defaultResponse.selectorVisibleLength = sizzleRef(sel + ":visible").length;
      }

      defaultResponse.selectorLength = $el.length;

      var doSeleniumClick = false;

      var value = {
        selector: sel,
        value: null
      };

      /* If selector:visible and we have been told to click then signal back that it is okay to click(),
         unless we see a selector that is ambiguous (i.e number of results
         is greater than 1). */
      if (defaultResponse.isVisible) {
        if (operations.getLength) {
          value.value = $el.length;
        } else if ($el.length === 1) {
          /* We avoid using data-automation-id so that we do not accidentally blow away existing attributes. */
          var seleniumClickSelectorValue = "magellan_click_" + Math.round(Math.random() * 999999999).toString(16);
          var seleniumClickSelector = "[data-magellan-temp-automation-id='" + seleniumClickSelectorValue + "']";
          $el[0].setAttribute("data-magellan-temp-automation-id", seleniumClickSelectorValue);

          if (operations.click) {
            /* Unfortunately in Thorax applications we have trouble clicking */
            if (sizzleRef.matchesSelector($el[0], "input[type='radio']") || sizzleRef.matchesSelector($el[0], "input[type='checkbox']")) {
              $el.click();
            } else {
              value.seleniumClickSelector = seleniumClickSelector;
              value.value = true;
            }
          }

          if (operations.getValue) {
            value.value = $el.text();
          }

          if (operations.getTempSel) {
            value.value = seleniumClickSelector;
          }

          if (operations.mouseOver) {
            sizzleRef(document).scrollTop($el.offset().top);
            value.value = true;
          }
        }
      }

      defaultResponse.value = value;


      /* Note: this is the only case in which we return a boolean for isVisibleStrict
         In all other cases, we return null because we effectively "do not know yet".
         This helps cases like waitForElNotPresent that cannot have "false" returned
         unless we have successfully checked if it is not visible. */
      return defaultResponse;
    } catch (e) {
      /* if for whatever reason we fail here, we do not want Selenium returning
         a null result value back to Magellan. For now, we eat this exception. */
      return defaultResponse;
    }
  } else if (!sizzleRef) {

    /* Check if we have the source code available. If not, we will need
       to request it with jqueryInjectionRequested (see below). */
    if (typeof sizzleSourceChunk === "string" && sizzleSourceChunk.length > 1) {

      /* Accumulation phase. */
      if (!window.____injectedSizzleSource____) {
        window.____injectedSizzleSource____ = "";
      }

      window.____injectedSizzleSource____ += sizzleSourceChunk;

      /* Ask for more */
      defaultResponse.jqueryInjectionRequested = true;
      return defaultResponse;

    } else if (window.____injectedSizzleSource____) {

      /* Evaluation Phase */
      try {
        eval(window.____injectedSizzleSource____);
        window.____injectedSizzle____ = Sizzle;
        Sizzle.noConflict();
      } catch (e) {
        // ignore the error there
      } finally {
        return defaultResponse;
      }
    } else {
      /* Request injection if we do not have the jQuery source but we need it */
      defaultResponse.jqueryInjectionRequested = true;
      return defaultResponse;
    }
  } else {
    return defaultResponse;
  }
};


module.exports = CheckVisibleAndDo;
