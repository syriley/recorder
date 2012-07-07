/**
 * RequireJS JavaScript file loader
 *
 * RequireJS does this itself, if your dependency name ends in ".js", but I prefer the js! syntax ala curl.js, which can also be mixed with !order
 */
/*jslint nomen: false, plusplus: false, strict: false */
/*global require: false, define: false, window: false, document: false,
  setTimeout: false */

//Specify that requirejs optimizer should wrap this code in a closure that
//maps the namespaced requirejs API to non-namespaced local variables.
/*requirejs namespace: true */

(function () {
    'use strict';

    define({
        version: '0.1.0',

        load: function (name, req, onLoad, config) {
            var url = name,
                useOrder = false;

            if(url.indexOf('!order') === url.length - '!order'.length){
                useOrder = true;
                url = url.substring(0, url.length - '!order'.length);
            }else{
                url = url;
            }

            if(!config.isBuild){
                url = req.toUrl(url);
            }

            if(useOrder){
                url = "order!" + url;
            }

            require([url], onLoad);
        }
    });
}());