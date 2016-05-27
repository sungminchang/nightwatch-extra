var util = require("util");

var _ = require("lodash");
var SDC = require("statsd-client");

// second check for magellan compatibility
var enabled = process.env.MAGELLAN_STATSD ? true : false;
var host = process.env.MAGELLANSTATS_STATSD_URL;
var port = process.env.MAGELLANSTATS_STATSD_PORT;
var prefix = process.env.MAGELLANSTATS_STATSD_PREFIX + ".";
var jobName = process.env.MAGELLAN_JOB_NAME;


module.exports = function statd(event) {
  /**
   *  event: { 
            "capabilities": {
                id: 'chrome_latest_Windows_10_Desktop',
                browserName: 'chrome',
                version: '50',
                platform: 'Windows 10',
                'tunnel-identifier': 'some-tunnel-value',
                name: 'Google'
            }
            "type"" "command"
            "cmd": "clickEl", 
            "value": {
              totalTime: 300,
              seleniumCallTime: 180,
              executeAsyncTime: 120
            } 
        }
   */
  if (!enabled || !host || !port) {
    return;
  }

  var fullEventKey = util.format(
    "%s%s.%s.%s.%s.%s",
    prefix,
    event.capabilities.id || event.capabilities.browserName,
    event.capabilities["tunnel-identifier"] ? "tunnel" : "notunnel",
    jobName,
    event.type,
    event.cmd
  );

  var client = new SDC({ host: host, port: port, prefix: prefix });

  client.timing(fullEventKey + ".totalTime", event.value.totalTime);
  client.timing(fullEventKey + ".seleniumCallTime", event.value.seleniumCallTime);
  client.timing(fullEventKey + ".executeAsyncTime", event.value.executeAsyncTime);
};
