var EventEmitter = require("events").EventEmitter;
var util = require("util");

var _ = require("lodash");
var jsInjection = require("../../injections/js-injection");
var selectorUtil = require("../../util/selector");
var statsd = require("../../util/statsd");
var settings = require("../../settings");

function BaseAssertion() {
  EventEmitter.call(this);
  this.startTime = null;
  this.successMessage = "";
  this.failureMessage = "";

  this.time = {
    totalTime: 0,
    seleniumCallTime: 0,
    executeAsyncTime: 0
  };
};

util.inherits(BaseAssertion, EventEmitter);

_.assign(BaseAssertion.prototype, jsInjection);

BaseAssertion.prototype.execute = function (selector, injectedJsCommand, callback) {
  var self = this;

  var args = [
    selectorUtil.depageobjectize(selector, this.client.locateStrategy),
    injectedJsCommand,
    this.getSizzlejsSource(),
    settings.JS_WAIT_INTERNAL,
    settings.SEEN_MAX
  ];

  // .getEl guarantees Sizzle is always injected before assertion
  this.client.api
    .getEl(selector)
    .executeAsync(
      this.executeSizzlejs,
      args,
      function (result) {
        callback(result.value);
      });

};

BaseAssertion.prototype.pass = function (actual, expected, message) {
  this.time.totalTime = (new Date()).getTime() - this.startTime;
  this.client.assertion(true, actual, expected, util.format(message, this.time.totalTime), true);

  statsd({
    capabilities: this.client.options.desiredCapabilities,
    type: "assertion",
    cmd: this.cmd,
    value: this.time
  });

  this.emit("complete");
};

BaseAssertion.prototype.fail = function (actual, expected, message, detail) {
  var elapsed = (new Date()).getTime() - this.startTime;

  this.client.assertion(false, actual, expected, util.format(message, elapsed), true);
  this.emit("complete");
};

module.exports = BaseAssertion;
