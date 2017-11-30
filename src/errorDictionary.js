import fs from "fs";

let dictionary;

module.exports = {
  init: function (config) {
    if(!dictionary && config){

      // check if file
      if(typeof(config) === 'string' && fs.existsSync(config)){
        try{
          dictionary = JSON.parse(fs.readFileSync(config, 'utf8'));
        }catch(e){
          console.warn("Error loading error dictionary from file " + config + ". " + JSON.stringify(e));
        }
      }else{

        if(typeof(config) === 'string' && config.startsWith("{")){
          config = JSON.parse(config);
        }

        var client = config.protocol === "https:" || (typeof(config) === "string" && config.startsWith("https")) ? require("https") : require("http");

        try{
          client.get(config, function (response) {
            // Continuously update stream with data
            var body = "";
            response.on("data", function (d) {
              body += d;
            });
            response.on("end", function () {
              try{
                dictionary = JSON.parse(body);
              }catch(e){
                console.warn("Error parsing nightwatch extra dictionary. " + JSON.stringify(body) + ". " + JSON.stringify(e));
              }
            });
            response.on("error", function (e) {
              console.warn("Error loading error dictionary. " + JSON.stringify(config) + ". " + JSON.stringify(e));
            });
          }).on("error", function(e){
            console.warn("Error loading error dictionary. " + JSON.stringify(config) + ". " + JSON.stringify(e));
          });
        }catch(e){
          console.warn("Error loading error dictionary. " + JSON.stringify(config) + ". " + JSON.stringify(e));
        }
      }
    }
  },
  format: function (error) {
    let ret = error;
    if(dictionary){
      for(var key in dictionary){
        let value = dictionary[key];
        let regex = new RegExp(key);
        if(error.match(regex)){
          ret = error.replace(regex, value);
        }
      }
    }
    return ret;
  }
}