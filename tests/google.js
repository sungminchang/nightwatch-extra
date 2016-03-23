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

  "test elLengthGreaterThan": function (client) {
    client
      .assert.elLengthGreaterThan("[value='Google Search']", "value", 12)
      .assert.elLengthGreaterThan("#fsl a", "length", 2)
      .assert.elLengthGreaterThan("#fsl a:eq(1)", "text", 4)
  },

  "type search term": function (client) {
    client
      .setElValue("#lst-ib", "hahaha")
      .clearValue("#lst-ib")
      .setMaskedElValue("#lst-ib", "hahaha")
      .clickEl(".lsb")
      .assert.elContainsText("#resultStats", "About");
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
      .assert.selectorHasLength("#corp-crumb", 1)
      .assert.elLengthGreaterThan("#about-mission", "html", 100);
  },

  "move mouse to logo": function (client) {
    client
      .moveToEl("#maia-footer-global li:eq(2) a", 0, 0)
      // .takeScreenshot("hehehehe");
  }

});
