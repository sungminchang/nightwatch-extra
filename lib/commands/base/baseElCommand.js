var util = require("util");
var EventEmitter = require("events").EventEmitter;
var _ = require("lodash");
var clc = require("cli-color");

var selectorUtil = require("../../util/selector");
var jsInjection = require("../../injections/js-injection");
var acquireSizzle = require("../../injections/acquire-sizzle");
var settings = require("../../settings");

function BaseElCommand() {
  EventEmitter.call(this);
  this.startTime = null;
  this.successMessage = "";
  this.failureMessage = "";
};

util.inherits(BaseElCommand, EventEmitter);

_.assign(BaseElCommand.prototype, jsInjection);

BaseElCommand.prototype.execute = function (fn, args, callback) {
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
  // if (this.jqueryInjectionRequested === true) {
  //   if (this.remainingChunks.length > 0) {
  //     innerArgs.push(this.remainingChunks.shift());
  //     this.jqueryInjectionRequested = false;
  //   } else {
  //     innerArgs.push(undefined);
  //   }
  // } else {
  //   innerArgs.push(undefined);
  // }
  innerArgs.push(this.getSizzlejsSource());
  innerArgs.push(this.acquireSizzlejs());

  this.client.api.execute(fn, innerArgs, function (result) {
    if (settings.verbose) {
      console.log("execute(" + innerArgs + ") intermediate result: ", result);
    }
    if (result && result.status === 0 && result.value !== null) {
      // Note: by checking the result and passing result.value to the callback,
      // we are claiming that the result sent to the callback will always be truthy
      // and useful, relieving the callback from needing to check the structural
      // validity of result or result.value

      // if (result.value.jqueryInjectionRequested === true) {
      //   // Check if checkVisibleAndClick requested jQuery to be injected
      //   self.jqueryInjectionRequested = true;
      // }

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

BaseElCommand.prototype.pass = function (actual, expected) {
  var pactual = pexpected = actual || "visible";
  var elapsed = (new Date()).getTime() - this.startTime;
  this.client.assertion(true, pactual, pexpected, util.format(this.successMessage, elapsed), true);
  if (this.cb) {
    this.cb.apply(this.client.api, [actual]);
  }
  this.emit("complete");
};

// Optionally take in a different text for expected and actual values, but default to "visible", and "not visible".
BaseElCommand.prototype.fail = function (actual, expected) {
  var pactual = actual || "not visible";
  var pexpected = expected || "visible";
  var elapsed = (new Date()).getTime() - this.startTime;
  this.client.assertion(false, pactual, pexpected, util.format(this.failureMessage, elapsed), true);
  if (this.cb) {
    this.cb.apply(this.client.api, []);
  }
  this.emit("complete");
};

module.exports = BaseElCommand;
