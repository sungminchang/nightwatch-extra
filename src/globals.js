const _ = require("lodash");
const path = require("path");
const logger = require("./util/logger").default;

// load default plugins
const appium = require("./plugins/appium");
const dictionary = require("./plugins/dictionary");

const plugins = [appium, dictionary];

module.exports = {

  before(callback) {
    const userPlugins = this.test_settings.plugins;

    // load default plugin
    _.forEach(plugins, (p) => {
      logger.log(`Found default plugin ${p.name}`);
    });

    if (userPlugins) {
      if (!_.isArray(userPlugins)) {
        logger.warn("Plugins in nightwatch.json must be an array");

      } else {
        // prepare plugins if defined in nightwatch.json
        _.forEach(userPlugins, (p) => {
          try {
            const pg = require(path.resolve(process.cwd(), p));
            logger.log(`Found plugin ${pg.name}`);
            plugins.push(pg);
          } catch (e) {
            logger.err(`Error in loading plugin: ${e}, current plugin will be ignored. ` +
              `Please make sure it's configured correctly in nightwatch.json`);
          }
        });
      }
    }

    Promise
      .all(_.map(plugins, (plugin) => {

        if (plugin.before) {
          // we wrap rejection in plugin here
          return plugin
            .before(this)
            .then(() => Promise.resolve())
            .catch((err) => {
              logger.err(`[${plugin.name}] Error in plugin.before: ${err}`);
              // we eat error here
              throw err;
            });
        }
        return null;
      }))
      .then(() => callback())
      .catch(err => {
        // patch to error out test due to nightwatch implementation that continues test execution
        // if error happens in hooks
        logger.err(`Test process is terminated with exit code 10 due to ${err}`);
        process.exit(10);
      });
  },

  after(callback) {
    Promise
      .all(_.map(plugins, (plugin) => {
        if (plugin.after) {
          // we wrap rejection in plugin here
          return plugin
            .after(this)
            .then(() => Promise.resolve())
            .catch((err) => {
              logger.err(`[${plugin.name}] Error in plugin.after: ${err}`);
              // we eat error here
              return Promise.resolve();
            });
        }
        return null;
      }))
      .then(() => callback())
      .catch(err => {
        // patch to error out test due to nightwatch implementation that continues test execution
        // if error happens in hooks
        logger.err(`Test process is terminated with exit code 10 due to ${err}`);
        process.exit(10);
      });
  },

  beforeEach(client, callback) {
    Promise
      .all(_.map(plugins, (plugin) => {
        if (plugin.beforeEach) {
          // we wrap rejection in plugin here
          return plugin
            .beforeEach(this, client)
            .then(() => Promise.resolve())
            .catch((err) => {
              logger.err(`[${plugin.name}] Error in plugin.beforeEach: ${err}`);
              // we eat error here
              return Promise.resolve();
            });
        }
        return null;
      }))
      .then(() => callback())
      .catch(err => {
        // patch to error out test due to nightwatch implementation that continues test execution
        // if error happens in hooks
        logger.err(`Test process is terminated with exit code 10 due to ${err}`);
        process.exit(10);
      });
  },

  afterEach(client, callback) {
    Promise
      .all(_.map(plugins, (plugin) => {
        if (plugin.afterEach) {
          // we wrap rejection in plugin here
          return plugin
            .afterEach(this, client)
            .then(() => Promise.resolve())
            .catch((err) => {
              logger.err(`[${plugin.name}] Error in plugin.afterEach for: ${err}`);
              // we eat error here
              return Promise.resolve();
            });
        }
        return null;
      }))
      .then(() => callback())
      .catch(err => {
        // patch to error out test due to nightwatch implementation that continues test execution
        // if error happens in hooks
        logger.err(`Test process is terminated with exit code 10 due to ${err}`);
        process.exit(10);
      });
  }
};
