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
            "type"" "command"
            "cmd": "clickEl", 
            "value": 300 
        }
   */
  if (!enabled || !host || !port) {
    return;
  }

  var fullEventKey = util.format(
    "%s%s.%s.%s",
    prefix,
    jobName,
    event.type,
    event.cmd
  );

  var client = new SDC({ host: host, port: port, prefix: prefix });

  client.timing(fullEventKey, event.value);
};
