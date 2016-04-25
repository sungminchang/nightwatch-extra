var util = require("util");

var _ = require("lodash");
var SDC = require("statsd-client");

var enabled = process.env.MAGELLAN_STATSD ? true : false;
// second check for magellan compatibility
var magellanJobName = process.env.MAGELLAN_JOB_NAME;

module.exports = function statd(options) {
  /**
   *  options
   *  config:  {
          "enabled": true,
          "host": "jetski.feops.walmartlabs.com",
          "port": "8125",
          "prefix": "nightwatch-extra"
        }
   *
   *  event: { 
            "type"" "command"
            "cmd": "clickEl", 
            "value": 300 
        }
   */

  if (!enabled ||
    (!options.config.host || options.config.host === "") ||
    (!options.config.port || options.config.port === "")) {
    // let's do all kinds of validation here
    return;
  }

  var jobName = magellanJobName;
  if (!jobName || jobName === "") {
    // in case jobname isn't set externally
    jobName = "generic.generic.generic";
  }

  var fullEventKey = util.format(
    "%s%s.%s.%s",
    options.config.prefix,
    jobName,
    options.event.type,
    options.event.cmd
  );

  var client = new SDC(options.config);

  console.log("========>", fullEventKey, options.event.value)

  client.timing(fullEventKey, options.event.value);
};
