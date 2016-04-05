// Base test class that should be used for all Magellan tests
//
// Exposes a before/after function that are run *per-file*

var sauce = require("./util/sauce"),
  clc = require("cli-color"),
  Q = require("q"),
  settings = require("./settings.js");


var MagellanBaseTest = function (steps) {
  var self = this;
  this.isWorker = settings.isWorker;
  var enumerables = ["before", "after", "beforeEach", "afterEach", "emitStartedTest", "emitFinishedTest"];

  // Add step wrapper to capture selenium session id
  // SessionAcquisitionWrapper.initialize(this, steps);

  // copy incoming steps onto self
  Object.keys(steps).forEach(function (k) {
    if (typeof steps[k] === "function") {
      Object.defineProperty(self, k, { enumerable: true, value: steps[k].bind(self) });
    } else {
      Object.defineProperty(self, k, { enumerable: true, value: steps[k] });
    }
  });

  enumerables.forEach(function (k) {
    var srcFn = self[k] || MagellanBaseTest.prototype[k];
    if (srcFn) {
      Object.defineProperty(self, k, { enumerable: true, value: srcFn });
    }
  });
};

MagellanBaseTest.prototype = {
  emitStartedTest: function (client) {
    if (this.isWorker === true) {
      var testName = client.currentTest.module;

      this.handleExternalMessage = function (message) {
        if (message && message.signal === "bail") {
          client.assert.equal(false, true, message.customMessage || "Test killed.");
        }
      };

      process.addListener("message", this.handleExternalMessage);

      // Note: This is for Magellan versions earlier than 8 and will be ignored by
      // magellan versions 8 and above.
      if (process.send) {
        process.send({
          type: "worker-status",
          status: "started",
          name: testName
        });
      }
    }
  },

  emitFinishedTest: function (client, numFailures) {
    if (this.isWorker === true) {
      var testName = client.currentTest.module;

      if (process.send) {
        process.send({
          type: "worker-status",
          status: "finished",
          name: testName,
          passed: (numFailures === 0) ? true : false,
          metadata: {
            resultURL: sauce.getTestUrl(client),
            // Note: browserErrors has been deprecated, but we don't want to regress
            // versions of magellan that consume this property, so we pass it along.
            browserErrors: []
          }
        });
      }
    }
  },

  /*- begin ------------common base test methods-----------------------*/
  before: function (client) {
    this.emitStartedTest(client);
  },

  /*
   * Runs at the beginning of each step
   */
  beforeEach: function (client, callback) {
    // Note: Sometimes, the session hasn't been established yet but we have control.
    if (client.sessionId && settings.sessionId === undefined) {
      settings.sessionId = client.sessionId;

      if (process.send) {
        process.send({
          type: "selenium-session-info",
          sessionId: client.sessionId
        });
      }
    }

    callback();
  },

  /*
   * Runs at the beginning of each step
   */
  afterEach: function (client, callback) {
    this.failures = this.failures || [];
    this.passed = (this.passed || 0) + this.results.passed;

    // keep track of failed tests for reporting purposes
    if (this.results.failed || this.results.errors) {
      // Note: this.client.currentTest.name is also available to display
      // the name of the specific step within the test where we've failed.
      this.failures.push(this.client.currentTest.module);
    };
    callback();
  },

  /*
   * Runs at the end of each file
   */
  after: function (client, callback) {
      var self = this;

      var numFailures = this.failures.length;
      var totalTests = this.passed + this.failures.length;

      if (this.isWorker === true && this.handleExternalMessage) {
        process.removeListener("message", this.handleExternalMessage);
      }

      Q
        .fcall(this.emitFinishedTest, client, numFailures)
        .then(function () {
          // update saucelabs stats
          if (sauce.isSauceTest(client)) {
            Q.fcall(sauce.updateStats, client, numFailures, function () {});
          } else {
            Q.fcall();
          }
        })
        .then(function () {
          // close nightwatch session
          return Q.fcall(client.end);
        })
        .then(function () {
          callback();
        });
    }
    /*-- end -------------common base test methods-----------------------*/
};

module.exports = MagellanBaseTest;
