# Nightwatch-Extra

Enhanced [nightwatchjs](http://nightwatchjs.org/) commands and assertions. 

## Usage

In `nightwatch.json` add following content

```
  "custom_assertions_path": [
    "./node_modules/testarmada-nightwatch-extra/lib/assertions"
  ],
  "custom_commands_path": [
    "./node_modules/testarmada-nightwatch-extra/lib/commands"
  ]
```

If you're using this repo together with [testarmada-magellan](http://github.com/TestArmada/magellan), your base test can inherit from the base test by 
```
var BaseTest = require("testarmada-nightwatch-extra/lib/base-test-class");
```

For full example, please checkout [boilerplate-nightwatch](https://github.com/TestArmada/boilerplate-nightwatch)

## Command vocabulary

If you're familiar with `nightwatch` or are looking to translate `nightwatch` examples into `nightwatch-extra`, refer to the tables below for equivalent enhanced (i.e. more reliable) versions of `nightwatch` commands and assertions.
All commands and assertions are fully compatible with nightwatchjs page object.

### Enhanced command list

<table>
  <tr>
    <th>Nightwatch-Extra Equivalent</th>
    <th>Nightwatch Command</th>
  </tr>
  <tr>
    <td>clickAutomationEl("mybutton")</td>
    <td>click("[data-automation-id="mybutton"])</td>
  </tr>
  <tr>
    <td>clickEl(selector)</td>
    <td>click(selector)</td>
  </tr>
  <tr>
    <td>getEl(selector)</td>
    <td>waitForElementPresent or waitForElementVisible</td>
  </tr>
  <tr>
    <td>moveToEl(selector, xoffset, yoffset)</td>
    <td>moveToElement</td>
  </tr>
  <tr>
    <td>setElValue(selector, value)</td>
    <td>setValue(selector, value)</td>
  </tr>
  <tr>
    <td>getElValue(selector, callback)</td>
    <td>getValue(selector)</td>
  </tr>
  <tr>
    <td>getEls(selector, callback)</td>
    <td>elements(using, value, callback)</td>
  </tr>
  <tr>
    <td>setMaskedElValue(selector, value, [fieldLength])</td>
    <td>(no nightwatch equivalent)</td>
  </tr>
  <tr>
    <td>getPerformance(url)</td>
    <td>Retrieves basic performance metrics using Navigation API (http://www.w3.org/TR/navigation-timing/)</td>
  </tr>
  <tr>
    <td>waitForElNotPresent(selector)</td>
    <td>waitForElementNotPresent(selector)</td>
  </tr>
</table>

### Enhanced assertion list

<table>
  <tr>
    <th>Nightwatch-Extra Equivalent</th>
    <th>Nightwatch Assertion</th>
  </tr>
  
  <tr>
    <td>assert.elContainsText(selector, regex or text)</td>
    <td>assert.containsText(selector, text)</td>
  </tr>
  <tr>
    <td>assert.elNotContainsText(selector, text)</td>
    <td>(no nightwatch equivalent)</td>
  </tr>
  <tr>
    <td>assert.selectorHasLength(selector, expectedLength)</td>
    <td>(no nightwatch equivalent)</td>
  </tr>
  <tr>
    <td>assert.elLengthGreaterThan(selector, selectUsing, lengthToCompare)</td>
    <td>(no nightwatch equivalent)</td>
  </tr>
</table>

### As-is Supported Nightwatch Vocabulary

All Nightwatch commands and assertions are supported out of the box.

#### Supported Nightwatch Commands

* Please refer to [Nightwatch Commands API](http://nightwatchjs.org/api#commands) for a list of supported Nightwatch commands

#### Supported Nightwatch Assertions

* Please refer to [Nightwatch Assertions API](http://nightwatchjs.org/api#assertions) for a list of supported Nightwatch assertions

#### Supported Node Assertions

* `fail`
* `equal`
* `notEqual`
* `deepEqual`
* `notDeepEqual`
* `strictEqual`
* `notStrictEqual`
* `throws`
* `doesNotThrow`
* `ifError`

## *Important migration notice*

If you're migrating from [magellan-nightwatch](http://github.com/TestArmada/magellan-nightwatch) to [nightwatch-extra](http://github.com/TestArmada/nightwatch-extra), please follow the steps

1. Delete `./node_modules/testarmada-magellan-nightwatch` from your project.
2. In `package.json` 
```
dependencies:{
    "testarmada-magellan-nightwatch: VERSION   <---- DELETE THIS LINE
    "testarmada-nightwatch-extra: "^1.0.0"     <---- ADD THIS LINE
}
```
3. Run `npm install` again under your project root folder.
4. Make sure your `nightwatch.json` file has the following changes
```
"custom_commands_path":[
    "./node_modules/testarmada-magellan-nightwatch/lib/commands"  <---- DELETE THIS LINE
    "./node_modules/testarmada-nightwatch-extra/lib/commands"     <---- ADD THIS LINE
],
"custom_assertions_path":[
    "./node_modules/testarmada-magellan-nightwatch/lib/assertions"  <---- DELETE THIS LINE
    "./node_modules/testarmada-nightwatch-extra/lib/assertions"     <---- ADD THIS LINE
]

```
5. Change parent of your base test class (if there is)
```
require("testarmada-magellan-nightwatch/lib/base-test-class"); <---- DELETE THIS LINE
require("testarmada-nightwatch-extra/lib/base-test-class");    <---- ADD THIS LINE
```
