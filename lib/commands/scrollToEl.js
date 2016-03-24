var util = require("util");
var clc = require("cli-color");

var selectorUtil = require("../util/selector");
var ClickEl = require("./clickEl");

function ScrollToEl() {
  ClickEl.call(this);
}

util.inherits(ScrollToEl, ClickEl);

ScrollToEl.prototype.do = function (magellanSel) {
  var self = this;

  this.client.api
    .moveToElement(
      "[data-magellan-temp-automation-id='" + magellanSel + "']",
      this.xoffset,
      this.yoffset,
      function () {
        self.pass();
      });
};

ScrollToEl.prototype.command = function (selector, xoffset, yoffset, cb) {
  this.selector = selectorUtil.normalize(selector);
  this.cb = cb;

  this.xoffset = xoffset;
  this.yoffset = yoffset;


  this.successMessage = "Scroll to selector <" + this.selector + "> after %d milliseconds";
  this.failureMessage = "Could not scroll to selector <" + this.selector + "> after %d milliseconds";

  this.startTime = (new Date()).getTime();

  // Track how many times we've seen selector as :visible
  this.seenCount = 0;

  this.checkConditions();

  return this;
};

module.exports = ScrollToEl;
