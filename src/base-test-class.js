import _ from "lodash";
import settings from "./settings";
import Worker from "./worker/magellan";
import ExecutorFactory from "./executor/factory";
import { main as appium } from "appium/build/lib/main";

const BaseTest = function (steps, customizedSettings = null) {
  /**
   * NOTICE: we don't encourage to pass [before, beforeEach, afterEach, after]
   *         together with steps into the constructor. PLEASE extend the base test
   *         and define these four methods there if they are necessary
   */
  const self = this;
  const enumerables = ["before", "after", "beforeEach", "afterEach"];

  this.isWorker = settings.isWorker;
  this.env = settings.env;
  this.appium = appium;

  if (customizedSettings) {
    this.isWorker = customizedSettings.isWorker;
    this.env = customizedSettings.env;
    this.appium = customizedSettings.appium;
  }

  // copy steps to self
  _.forEach(steps, (v, k) => {
    Object.defineProperty(self, k,
      { enumerable: true, value: v });
  });

  const executor = new ExecutorFactory(this.env);
  this.executorCreateMetaData = executor.createMetaData;
  this.executorSummerize = executor.summerize;

  // copy before, beforeEach, afterEach, after to prototype
  _.forEach(enumerables, (k) => {
    const srcFn = self[k] || BaseTest.prototype[k];
    if (srcFn) {
      Object.defineProperty(self, k,
        { enumerable: true, value: srcFn });
    }
  });

  // remove methods from nightwatch scan
  Object.defineProperty(self, "executorCreateMetaData",
    { enumerable: false, value: this.executorCreateMetaData });

  Object.defineProperty(self, "executorSummerize",
    { enumerable: false, value: this.executorSummerize });
};

BaseTest.prototype = {
  /*eslint-disable callback-return*/
  before(client, callback) {
    const self = this;

    this.failures = [];
    this.passed = 0;

    // we only want timeoutsAsyncScript to be set once the whole session to limit
    // the number of http requests we sent
    this.isAsyncTimeoutSet = false;

    this.notifiedListenersOfStart = false;

    this.isSupposedToFailInBefore = false;

    if (this.isWorker) {
      this.worker = new Worker({ nightwatch: client });
    }

    if (client.globals.test_settings.appium
      && client.globals.test_settings.appium.start_process) {
      // we need to launch appium programmingly for each test
      let loglevel = client.globals.test_settings.appium.loglevel ?
        client.globals.test_settings.appium.loglevel : "info";

      if (settings.verbose) {
        loglevel = "debug";
      }

      this.appium({
        throwInsteadOfExit: true,
        loglevel,
        // borrow selenium port here as magellan-nightwatch-plugin doesnt support appium for now
        port: client.globals.test_settings.selenium_port
      }).then((server) => {
        self.appiumServer = server;
        callback();
      });
    } else {
      callback();
    }
  },

  beforeEach(client) {
    // Tell reporters that we are starting this test.
    // This logic would ideally go in the "before" block and not "beforeEach"
    // but Nightwatch does not give us access to the module (file) name in the
    // "before" block, so we have to put it here (hence the `notifiedListenersOfStart`
    // flag, so that we only perform this update once per-file.)
    if (!this.notifiedListenersOfStart && this.isWorker) {
      this.worker.emitTestStart(client.currentTest.module);
      process.addListener("message", this.worker.handleMessage);
      this.notifiedListenersOfStart = true;
    }

    if (!this.isAsyncTimeoutSet) {
      client.timeoutsAsyncScript(settings.JS_MAX_TIMEOUT);
      this.isAsyncTimeoutSet = true;
    }

    // Note: Sometimes, the session hasn't been established yet but we have control.
    if (client.sessionId) {
      settings.sessionId = client.sessionId;
      this.worker.emitSession(client.sessionId);
    }
  },

  afterEach(client, callback) {
    if (this.results) {
      // in case we failed in `before`
      // keep track of failed tests for reporting purposes
      if (this.results.failed || this.results.errors) {
        // Note: this.client.currentTest.name is also available to display
        // the name of the specific step within the test where we've failed.
        this.failures.push(client.currentTest.module);
      }

      if (this.results.passed) {
        this.passed += this.results.passed;
      }
    }

    if (!this.isAsyncTimeoutSet) {
      client.timeoutsAsyncScript(settings.JS_MAX_TIMEOUT);
      this.isAsyncTimeoutSet = true;
    }

    // Note: Sometimes, the session hasn't been established yet but we have control.
    if (client.sessionId) {
      settings.sessionId = client.sessionId;
    }

    callback();
  },

  /*eslint-disable callback-return*/
  after(client, callback) {
    const self = this;
    const numFailures = self.failures.length;

    if (this.isWorker) {
      self.worker.emitTestStop({
        testName: client.currentTest.module,
        testResult: numFailures === 0,
        metaData: this.executorCreateMetaData({ sessionId: client.sessionId })
      });

      process.removeListener("message", self.worker.handleMessage);
    }

    if (self.isSupposedToFailInBefore) {
      // there is a bug in nightwatch that if test fails in `before`, test
      // would still be reported as passed with a exit code = 0. We'll have
      // to let magellan know the test fails in this way
      /* istanbul ignore next */
      /*eslint no-process-exit:0 */
      /*eslint no-magic-numbers:0 */
      process.exit(100);
    }
    // executor should eat it's own error in summerize()
    client.end(() => {
      self
        .executorSummerize({
          magellanBuildId: process.env.MAGELLAN_BUILD_ID,
          testResult: numFailures === 0,
          options: client.options
        })
        .then(() => {
          if (self.appiumServer) {
            self.appiumServer
              .close()
              .then(() => {
                self.appiumServer = null;
                callback();
              })
              .catch((err) => {
                callback(err);
              });
          } else {
            callback();
          }
        });
    });


  }
};

module.exports = BaseTest;
