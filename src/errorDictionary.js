
var http = require('http');
var https = require('https');
let dictionary;

module.exports = {
  init: function (config) {
    if(!dictionary && config){

      var client = config.protocol === 'https:' ? https : http;

      client.get(config, function(response) {
          // Continuously update stream with data
          var body = '';
          response.on('data', function(d) {
              body += d;
          });
          response.on('end', function() {
              dictionary = JSON.parse(body);
          });
          response.on('error', function(e){
            console.log(e);
          });
      });
    }
  },
  format: function (error) {
    let ret = error;
    if(dictionary){
      Object.entries(dictionary).forEach(([key, value]) => {
        if(error.match(new RegExp(key))){
          ret += ". " + value;
        }
      });
    }
    return ret;
  }
}