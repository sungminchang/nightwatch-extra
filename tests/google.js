var Test = require("../lib/base-test-class");

module.exports = new Test({

  "Load goole page": function (client) {
    client
      .url("http://www.google.com");
  },

  "wait for lage load": function (client) {
    client
      .getEl("#lst-ib:visible")
      .getEls("#lst-ib:visible", function (els) {
        console.log(els);
      });
  },

  "type search term": function (client) {
    client
      .setElValue("#lst-ib", "hahaha")
      .clickEl(".lsb")
      .assert.elContainsText("#resultStats", "About");
  },

  "move mouse to logo": function (client) {
    client
      .moveToEl("#logocont a", 0, 0);
  },

  "jump to about page and assert": function (client) {
    client
      .clickEl("#logocont a")
      .getEl("a[href='//www.google.com/intl/en/about.html?fg=1']")
      .clickEl("a[href='//www.google.com/intl/en/about.html?fg=1']")
      .waitForElNotPresent("#lst-ib")
      .getElValue("#corp-crumb", function (value) {
        console.log(value)
      })
      .assert.elContainsText("#corp-crumb", "About Google")
      .assert.selectorHasLength("#corp-crumb", 1);
  }

});
