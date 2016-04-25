var EventEmitter = require("events").EventEmitter;
var util = require("util");

var _ = require("lodash");
var jsInjection = require("../../injections/js-injection");
var selectorUtil = require("../../util/selector");
var statsd = require("../../util/statsd");

function BaseAssertion() {
  EventEmitter.call(this);
  this.startTime = null;
  this.successMessage = "";
  this.failureMessage = "";
};

util.inherits(BaseAssertion, EventEmitter);

_.assign(BaseAssertion.prototype, jsInjection);

BaseAssertion.prototype.execute = function (selector, injectedJsCommand, callback) {
  var self = this;

  var args = [
    selectorUtil.depageobjectize(selector, this.client.locateStrategy),
    injectedJsCommand,
    this.getSizzlejsSource()
  ];

  // .getEl guarantees Sizzle is always injected before assertion
  this.client.api
    .getEl(selector)
    .execute(
      this.executeSizzlejs,
      args,
      function (result) {
        callback(result.value);
      });

};

BaseAssertion.prototype.statsd = function (event) {
  if (!this.client.api.globals ||
    !this.client.api.globals.statsd ||
    !this.client.api.globals.statsd.enabled) {
    // no statsd defined in global
    return;
  }

  statsd({ config: this.client.api.globals.statsd, event: event });
};

BaseAssertion.prototype.pass = function (actual, expected, message) {
  var elapsed = (new Date()).getTime() - this.startTime;

  this.client.assertion(true, actual, expected, util.format(message, elapsed), true);
  this.statsd({ type: "assertion", cmd: this.cmd, value: elapsed });

  this.emit("complete");
};

BaseAssertion.prototype.fail = function (actual, expected, message, detail) {
  var elapsed = (new Date()).getTime() - this.startTime;

  this.client.assertion(false, actual, expected, util.format(message, elapsed), true);
  this.emit("complete");
};

module.exports = BaseAssertion;
