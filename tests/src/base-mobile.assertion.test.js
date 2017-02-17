import chai from "chai";
import _ from "lodash";

import BaseAssertion from "../../lib/base-mobile-assertion";
import settings from "../../lib/settings";

const expect = chai.expect;
const assert = chai.assert;

const immutableClientMock = {
  options: {
    desiredCapabilities: {
      "browserName": "chrome",
      "javascriptEnabled": true,
      "acceptSslCerts": true,
      "platform": "Windows 10",
      "id": "chrome_latest_Windows_10_Desktop",
      "version": "55",
      "name": "Google"
    }
  },
  desiredCapabilities: {
    "browserName": "chrome",
    "javascriptEnabled": true,
    "acceptSslCerts": true,
    "platform": "Windows 10",
    "id": "chrome_latest_Windows_10_Desktop",
    "version": "55",
    "name": "Google"
  },
  locateStrategy: "css",
  assertion: () => { },
  runProtocolAction: (options, callback) => {
    callback();
    return {
      send() { }
    };
  }
};


describe("Base mobile assertion", () => {
  let baseAssertion = null;
  let clientMock = null;

  beforeEach(() => {
    clientMock = _.cloneDeep(immutableClientMock);
    baseAssertion = new BaseAssertion(clientMock);
  });

  it("Initialization", () => {
    expect(baseAssertion.startTime).to.equal(0);
    expect(baseAssertion.time.totalTime).to.equal(0);
    expect(baseAssertion.time.seleniumCallTime).to.equal(0);
    expect(baseAssertion.time.executeAsyncTime).to.equal(0);
    expect(baseAssertion.selector).to.equal(null);
    expect(baseAssertion.successMessage).to.equal("");
    expect(baseAssertion.failureMessage).to.equal("");
  });

  it("Pass", () => {
    baseAssertion.startTime = (new Date()).getTime();
    baseAssertion.pass("a", "a");
  });

  it("Fail", () => {
    baseAssertion.startTime = (new Date()).getTime();
    baseAssertion.fail("a", "a");
  });

  it("Protocol", (done) => {
    baseAssertion.protocol({}, () => {
      done();
    });
  });

  describe("checkConditions", () => {
    // it("Succeed with multi js seens", () => {
    //   baseAssertion = new BaseAssertion(clientMock);
    //   baseAssertion.seenCount = 0;
    //   baseAssertion.expected = "some_fake_value";
    //   baseAssertion.startTime = (new Date()).getTime();
    //   baseAssertion.do = (value)=>{
    //     baseAssertion.assert(value)
    //   };
    //   baseAssertion.assert = (value, expected) => {
    //     expect(baseAssertion.seenCount).to.equal(1);
    //     expect(expected).to.equal("some_fake_value");
    //     // expect(value).to.equal("magellan_selector_2f38e1cf");
    //   };
    //   baseAssertion.checkConditions();
    // });

    // it("Succeed with multi elements found warning", () => {
    //   let args = ["[name='q']", "return $el.length"];

    //   clientMock.api.executeAsync = (fn, args, callback) => {
    //     callback({
    //       state: 'success',
    //       sessionId: '60c692d2-7b53-4d43-a340-8d6133af13a8',
    //       hCode: 1895546026,
    //       value:
    //       {
    //         isSync: false,
    //         selectorLength: 2,
    //         isVisible: true,
    //         isVisibleStrict: true,
    //         seens: 3,
    //         value: { value: 'magellan_selector_2f38e1cf', sel: '[name=\'q\']' },
    //         selectorVisibleLength: 1
    //       },
    //       class: 'org.openqa.selenium.remote.Response',
    //       status: 0
    //     });
    //   };

    //   baseAssertion = new BaseAssertion(clientMock);
    //   baseAssertion.seenCount = 0;
    //   baseAssertion.expected = "some_fake_value";
    //   baseAssertion.startTime = (new Date()).getTime();
    //   baseAssertion.assert = (value, expected) => {
    //     expect(baseAssertion.seenCount).to.equal(1);
    //     expect(expected).to.equal("some_fake_value");
    //     expect(value).to.equal("magellan_selector_2f38e1cf");
    //   };
    //   baseAssertion.decide();
    //   baseAssertion.checkConditions();
    // });

    // it("Succeed with multi seens", (done) => {
    //   let args = ["[name='q']", "return $el.length"];

    //   clientMock.api.execute = (fn, args, callback) => {
    //     callback({
    //       state: 'success',
    //       sessionId: '60c692d2-7b53-4d43-a340-8d6133af13a8',
    //       hCode: 1895546026,
    //       value:
    //       {
    //         isSync: true,
    //         selectorLength: 1,
    //         isVisible: true,
    //         isVisibleStrict: true,
    //         seens: 1,
    //         value: { value: 'magellan_selector_2f38e1cf', sel: '[name=\'q\']' },
    //         selectorVisibleLength: 1
    //       },
    //       class: 'org.openqa.selenium.remote.Response',
    //       status: 0
    //     });
    //   };

    //   baseAssertion = new BaseAssertion(clientMock, {
    //     syncModeBrowserList: ["chrome:55", "iphone"]
    //   });
    //   baseAssertion.seenCount = 0;
    //   baseAssertion.expected = "some_fake_value";
    //   baseAssertion.startTime = (new Date()).getTime();
    //   baseAssertion.assert = (value, expected) => {
    //     expect(baseAssertion.seenCount).to.equal(3);
    //     expect(expected).to.equal("some_fake_value");
    //     expect(value).to.equal("magellan_selector_2f38e1cf");
    //     done();
    //   };
    //   baseAssertion.decide();
    //   baseAssertion.checkConditions();
    // });
  });
});