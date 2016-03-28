var util = require("util");
var clc = require("cli-color");

var selectorUtil = require("../util/selector");
var ClickEl = require("./clickEl");

function MoveToEl() {
  ClickEl.call(this);
}

util.inherits(MoveToEl, ClickEl);

MoveToEl.prototype.do = function (magellanSel) {
  var self = this;

  this.client.api
    .moveToElement(
      "css selector",
      "[data-magellan-temp-automation-id='" + magellanSel + "']",
      this.xoffset,
      this.yoffset,
      function () {
        self.pass();
      });
};

MoveToEl.prototype.command = function (selector, xoffset, yoffset, cb) {
  this.selector = selectorUtil.normalize(selector);
  this.cb = cb;

  this.xoffset = xoffset;
  this.yoffset = yoffset;


  this.successMessage = "Moved to selector <" + this.selector + "> after %d milliseconds";
  this.failureMessage = "Could not move to selector <" + this.selector + "> after %d milliseconds";

  this.startTime = (new Date()).getTime();

  // Track how many times we've seen selector as :visible
  this.seenCount = 0;

  this.checkConditions();

  return this;
};

module.exports = MoveToEl;
