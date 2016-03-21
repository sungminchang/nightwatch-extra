// Assert whether a selector has a given expected query result length

var util = require("util"),
  selectorUtil = require("../util/selector");

var BaseElAssertion = require("./base/BaseElAssertion");

function SelectorHasLength() {
  BaseElAssertion.call(this);
};

util.inherits(SelectorHasLength, BaseElAssertion);

SelectorHasLength.prototype.command = function (selector, expectedLength) {
  var self = this;

  this.selector = selectorUtil.normalize(selector);
  this.expected = typeof expectedLength === "number" ? expectedLength.toString() : expectedLength;

  this.message = util.format("Testing if selector <%s> has length <%s> after %d milliseconds ",
    this.selector, this.expected);
  this.failureDetails = "actual result:[ %s ], expected:[ " + this.expected + " ]";

  this.startTime = (new Date()).getTime();

  this.execute(
    this.selector,
    this.injectedJsCommand(),
    function (result) {
      self.assert(result.value.value, self.expected);
    });
};

SelectorHasLength.prototype.assert = function (actual, expected) {
  if (expected === undefined || actual === expected) {
    this.fail(actual, expected, this.message, this.failureDetails);
  } else {
    this.pass(actual, expected, this.message);
  }
};

SelectorHasLength.prototype.injectedJsCommand = function ($el) {
  return "return $el.length";
};

module.exports = SelectorHasLength;
