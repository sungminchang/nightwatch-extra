var Test = require("../lib/base-test-class");

module.exports = new Test({

  "Load goole page": function (client) {
    client
      .url("http://www.google.com");
  },

  "wait for lage load": function (client) {
    client
      .getEl("[name='q']:visible")
      .getEls("[name='q']:visible", function (els) {
        console.log(els);
      });
  },

  "test elLengthGreaterThan": function (client) {
    client
      .assert.elLengthGreaterThan("[value='Google Search']", "value", 12)
      .assert.elValueContains("[value='Google Search']", "Google Search");
  },

  "type search term": function (client) {
    client
      .setElValue("[name='q']", "hahaha")
      // .clearValue("[name='q']")
      // .setMaskedElValue("[name='q']", "hahaha")
      .clickEl(".lsb")
      .assert.elContainsText("#resultStats", "About");
  },

  "jump to about page and assert": function (client) {
    client
      .clickEl("#logocont a")
      .getEl("a[href='//www.google.com/intl/en/about.html?fg=1']")
      .clickEl("a[href='//www.google.com/intl/en/about.html?fg=1']")
      .waitForElNotPresent("[name='q']:visible")
      .getElValue("#corp-crumb", function (value, sel) {
        console.log(value, sel)
      })
      .assert.elContainsText("#corp-crumb", "About Google")
      .assert.elContainsText("#corp-crumb", "\\w+")
      .assert.elNotContainsText("#corp-crumb", "ahhahahaha")
      .assert.selectorHasLength("#corp-crumb", 1)
      .assert.elLengthGreaterThan("#about-mission", "html", 100);
  },

  "move mouse to logo": function (client) {
    client
      .moveToEl("#maia-footer-global li:eq(2) a", 0, 0)
      .assert.elLengthGreaterThan("#maia-footer-global li", "length", 2);
  }

});
