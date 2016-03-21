var Test = require("../lib/base-test-class");

module.exports = new Test({

  "Load TestArmada GitHub page": function (client) {
    client
      .url("http://www.google.com");
  },

  "Navigate to magellan-nightwatch repo": function (client) {
    client
      .getEl("#lst-ib:visible")
      .getEls("#lst-ib:visible", function (els) {
        console.log(els);
      })
      .clickEl("a[href='//www.google.com/intl/en/about.html?fg=1']")
      .getElValue("#corp-crumb", function (value) {
        console.log(value)
      })
      .assert.elContainsText("#corp-crumb", "About Google")
      .assert.selectorHasLength("#corp-crumb", 1);
  }

});
