

import yargs from "yargs";
import { Webdriver } from "wd";
import _ from "lodash";
import fs from "fs";
import path from "path";
import settings from "./settings";
import logger from "./util/logger";

/* eslint-disable max-len */
const createCommandContent = (wdcommand) => `
'use strict';

var wd = require('wd');
var _ = require('lodash');
var util = require("util");
var BaseCommand = require("testarmada-nightwatch-extra/lib/base-mobile-command");
var settings = require("testarmada-nightwatch-extra/lib/settings");

var MAX_TIMEOUT = settings.COMMAND_MAX_TIMEOUT;
var WAIT_INTERVAL = settings.WAIT_INTERVAL;

var Element = function Element(nightwatch) {

  BaseCommand.call(this, nightwatch);

  this.asyncwd = wd.remote(this.client.options.selenium_host, this.client.options.selenium_port, 'async');
  this.cmd = '${wdcommand}';
};

util.inherits(Element, BaseCommand);

Element.prototype.command = function (...args) {
  let cb = null;
  const wdArguments = _.values(arguments);

  if (arguments.length > 0) {
    cb = arguments[arguments.length - 1];
    // trim arguments if last argument isn't callback

    if (typeof cb === 'function') {
      this.cb = cb;
      // remove last argument 
      delete wdArguments[arguments.length - 1];
    }
  }

  this.successMessage = '[wd command {' + this.cmd + '}] is successful after %d milliseconds.';
  this.failureMessage = '[wd command {' + this.cmd + '}] wasn\\'t successful after %d milliseconds.';

  this.startTime = new Date().getTime();

  this.asyncwd.attach(this.client.sessionId, (err, cap) => {
    if (err) {
      this.fail(err);
    }
    this.asyncwd.${wdcommand}.apply(this.asyncwd, _.flatten([wdArguments, (err, actual) => {
      !!err === true ? this.fail(err) : this.pass(actual);
    }]));
  });

  return this;
};

module.exports = Element;
`;
module.exports = () => {
  const argv = yargs
    .usage("Usage: $0 --output path")
    .option("output", {
      alias: "o",
      describe: "Location where owl writes nightwatch compatible wd command to",
      demand: true
    })
    .help("help")
    .argv;

  const output = argv.output;

  const wd = new Webdriver(`http://`
    + `${settings.nightwatchConfig.test_settings.default.selenium_host}`
    + `:${settings.nightwatchConfig.test_settings.default.selenium_port}`);

  logger.log(`All nightwatch compatible wd commands will be saved to ${output}`);

  _.forEach(_.functionsIn(wd), (command) => {
    const arr = _.startCase(command).split(" ");
    arr.unshift("wd");
    const cmd = arr.join("");
    const file = path.normalize(`${output}/${cmd}.js`);

    logger.debug(`Creating ${cmd}.js for wd's [${command}]`);
    fs.writeFileSync(file, createCommandContent(command));
  });
};
