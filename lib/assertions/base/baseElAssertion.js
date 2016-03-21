var EventEmitter = require("events").EventEmitter;
var util = require("util");

var _ = require("lodash");
var jsInjection = require("../../injections/js-injection");

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
    selector,
    injectedJsCommand,
    this.getSizzlejsSource(),
    this.acquireSizzlejs()
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

BaseAssertion.prototype.pass = function (actual, expected, message) {
  var elapsed = (new Date()).getTime() - this.startTime;

  this.client.assertion(true, actual, expected, util.format(message, elapsed), true);
  this.emit("complete");
};

BaseAssertion.prototype.fail = function (actual, expected, message, detail) {
  var elapsed = (new Date()).getTime() - this.startTime;

  this.client.assertion(false, actual, expected, util.format(message, elapsed), true);
  this.emit("complete");
};

module.exports = BaseAssertion;
