var util = require("util"),
  selectorUtil = require("../util/selector");

var BaseElAssertion = require("./base/BaseElAssertion");

function ElLengthGreaterThan() {
  BaseElAssertion.call(this);
};

util.inherits(ElLengthGreaterThan, BaseElAssertion);

ElLengthGreaterThan.prototype.command = function (selector, selectUsing, lengthToCompare) {
  var self = this;

  this.selector = selectorUtil.normalize(selector);
  this.selectUsing = selectUsing;
  this.lengthToCompare = lengthToCompare;

  this.message = util.format("Testing if selector <%s> length is greater than <%s> after %d milliseconds",
    this.selector, this.lengthToCompare);
  this.failureDetails = "actual result:[ %s ], expected:[ " + this.lengthToCompare + " ]";

  this.startTime = (new Date()).getTime();

  this.execute(
    this.selector,
    this.injectedJsCommand(),
    function (result) {
      self.assert(result.value.value, self.lengthToCompare);
    });
};

ElLengthGreaterThan.prototype.assert = function (actual, expected) {
  if (expected === undefined || actual <= expected) {
    this.fail(actual, expected, this.message, this.failureDetails);
  } else {
    this.pass(actual, expected, this.message);
  }
};

ElLengthGreaterThan.prototype.injectedJsCommand = function ($el, sizzle) {
  var ret = "";
  switch (this.selectUsing) {
    case "value":
      ret = "return $el[0].value.length;";
      break;
    case "text":
      ret = "return sizzle.getText($el).length;";
      break;
    case "html":
      ret = "return $el[0].innerHTML.length;";
      break;
    case "length":
      ret = "return $el.length;";
      break;
  }
  return ret;
};

module.exports = ElLengthGreaterThan;
