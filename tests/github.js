var Test = require("../lib/base-test-class");

module.exports = new Test({

  "Load TestArmada GitHub page": function (client) {
    client
      .url("http://www.google.com");
  },

  "Navigate to magellan-nightwatch repo": function (client) {
    client
      .getEl("#lst-ib")
  }

});
