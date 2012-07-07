/**
 * curl mustache plugin
 *
 * Steve Mason Brandwatch 2011
 *
 * usage:
 *  require(['ModuleA', 'mustache!myTemplate'], function (ModuleA, myTemplate) {
 *      var a = new ModuleA();
 *    var html = myTemplate({foo: 'bar'});
 *
 *      $(a.el).html(html);
 *  });
 *
 * The module will also automatically use innerShiv to "fix" HTML5 elements in IE
 *
 *
 * Configuration:
 *  var curl = {
 *    ... curl configuration ...
 *    mustache: {
 *      rootUrl: '/js/templates'
 *      templateExtension: 'bar'  // Default = 'template'
 *    }
 *  };
 */
(function (window) {
    'use strict';
/*!
  mustache.js -- Logic-less templates in JavaScript

  by @janl (MIT Licensed, https://github.com/janl/mustache.js/blob/master/LICENSE).

  See http://mustache.github.com/ for more info.
*/

var Mustache = function() {
  var Renderer = function() {};

  Renderer.prototype = {
    otag: "{{",
    ctag: "}}",
    pragmas: {},
    buffer: [],
    pragmas_implemented: {
      "IMPLICIT-ITERATOR": true
    },
    context: {},

    render: function(template, context, partials, in_recursion) {
      // reset buffer & set context
      if(!in_recursion) {
        this.context = context;
        this.buffer = []; // TODO: make this non-lazy
      }

      // fail fast
      if(!this.includes("", template)) {
        if(in_recursion) {
          return template;
        } else {
          this.send(template);
          return;
        }
      }

      template = this.render_pragmas(template);
      var html = this.render_section(template, context, partials);
      if(in_recursion) {
        return this.render_tags(html, context, partials, in_recursion);
      }

      this.render_tags(html, context, partials, in_recursion);
    },

    /*
      Sends parsed lines
    */
    send: function(line) {
      if(line != "") {
        this.buffer.push(line);
      }
    },

    /*
      Looks for %PRAGMAS
    */
    render_pragmas: function(template) {
      // no pragmas
      if(!this.includes("%", template)) {
        return template;
      }

      var that = this;
      var regex = new RegExp(this.otag + "%([\\w-]+) ?([\\w]+=[\\w]+)?" +
            this.ctag);
      return template.replace(regex, function(match, pragma, options) {
        if(!that.pragmas_implemented[pragma]) {
          throw({message:
            "This implementation of mustache doesn't understand the '" +
            pragma + "' pragma"});
        }
        that.pragmas[pragma] = {};
        if(options) {
          var opts = options.split("=");
          that.pragmas[pragma][opts[0]] = opts[1];
        }
        return "";
        // ignore unknown pragmas silently
      });
    },

    /*
      Tries to find a partial in the curent scope and render it
    */
    render_partial: function(name, context, partials) {
      name = this.trim(name);
      if(!partials || partials[name] === undefined) {
        throw({message: "unknown_partial '" + name + "'"});
      }
      if(typeof(context[name]) != "object") {
        return this.render(partials[name], context, partials, true);
      }
      return this.render(partials[name], context[name], partials, true);
    },

    /*
      Renders inverted (^) and normal (#) sections
    */
    render_section: function(template, context, partials) {
      if(!this.includes("#", template) && !this.includes("^", template)) {
        return template;
      }

      var that = this;
      // CSW - Added "+?" so it finds the tighest bound, not the widest
      var regex = new RegExp(this.otag + "(\\^|\\#)\\s*(.+)\\s*" + this.ctag +
              "\n*([\\s\\S]+?)" + this.otag + "\\/\\s*\\2\\s*" + this.ctag +
              "\\s*", "mg");

      // for each {{#foo}}{{/foo}} section do...
      return template.replace(regex, function(match, type, name, content) {
        var value = that.find(name, context);
        if(type == "^") { // inverted section
          if(!value || that.is_array(value) && value.length === 0) {
            // false or empty list, render it
            return that.render(content, context, partials, true);
          } else {
            return "";
          }
        } else if(type == "#") { // normal section
          if(that.is_array(value)) { // Enumerable, Let's loop!
            return that.map(value, function(row) {
              return that.render(content, that.create_context(row),
                partials, true);
            }).join("");
          } else if(that.is_object(value)) { // Object, Use it as subcontext!
            return that.render(content, that.create_context(value),
              partials, true);
          } else if(typeof value === "function") {
            // higher order section
            return value.call(context, content, function(text) {
              return that.render(text, context, partials, true);
            });
          } else if(value) { // boolean section
            return that.render(content, context, partials, true);
          } else {
            return "";
          }
        }
      });
    },

    /*
      Replace {{foo}} and friends with values from our view
    */
    render_tags: function(template, context, partials, in_recursion) {
      // tit for tat
      var that = this;

      var new_regex = function() {
        return new RegExp(that.otag + "(=|!|>|\\{|%)?([^\\/#\\^]+?)\\1?" +
          that.ctag + "+", "g");
      };

      var regex = new_regex();
      var tag_replace_callback = function(match, operator, name) {
        switch(operator) {
        case "!": // ignore comments
          return "";
        case "=": // set new delimiters, rebuild the replace regexp
          that.set_delimiters(name);
          regex = new_regex();
          return "";
        case ">": // render partial
          return that.render_partial(name, context, partials);
        case "{": // the triple mustache is unescaped
          return that.find(name, context);
        default: // escape the value
          return that.escape(that.find(name, context));
        }
      };
      var lines = template.split("\n");
      for(var i = 0; i < lines.length; i++) {
        lines[i] = lines[i].replace(regex, tag_replace_callback, this);
        if(!in_recursion) {
          this.send(lines[i]);
        }
      }

      if(in_recursion) {
        return lines.join("\n");
      }
    },

    set_delimiters: function(delimiters) {
      var dels = delimiters.split(" ");
      this.otag = this.escape_regex(dels[0]);
      this.ctag = this.escape_regex(dels[1]);
    },

    escape_regex: function(text) {
      // thank you Simon Willison
      if(!arguments.callee.sRE) {
        var specials = [
          '/', '.', '*', '+', '?', '|',
          '(', ')', '[', ']', '{', '}', '\\'
        ];
        arguments.callee.sRE = new RegExp(
          '(\\' + specials.join('|\\') + ')', 'g'
        );
      }
      return text.replace(arguments.callee.sRE, '\\$1');
    },

    /*
      find `name` in current `context`. That is find me a value
      from the view object
    */
    find: function(name, context) {
      name = this.trim(name);

      // Checks whether a value is thruthy or false or 0
      function is_kinda_truthy(bool) {
        return bool === false || bool === 0 || bool;
      }

      var value;
      if(is_kinda_truthy(context[name])) {
        value = context[name];
      } else if(is_kinda_truthy(this.context[name])) {
        value = this.context[name];
      }

      if(typeof value === "function") {
        return value.apply(context);
      }
      if(value !== undefined) {
        return value;
      }
      // silently ignore unkown variables
      return "";
    },

    // Utility methods

    /* includes tag */
    includes: function(needle, haystack) {
      return haystack.indexOf(this.otag + needle) != -1;
    },

    /*
      Does away with nasty characters
    */
    escape: function(s) {
      s = String(s === null ? "" : s);
      return s.replace(/&(?!\w+;)|["<>\\]/g, function(s) {
        switch(s) {
        case "&": return "&amp;";
        case "\\": return "\\\\";
        case '"': return '\"';
        case "<": return "&lt;";
        case ">": return "&gt;";
        default: return s;
        }
      });
    },

    // by @langalex, support for arrays of strings
    create_context: function(_context) {
      if(this.is_object(_context)) {
        return _context;
      } else {
        var iterator = ".";
        if(this.pragmas["IMPLICIT-ITERATOR"]) {
          iterator = this.pragmas["IMPLICIT-ITERATOR"].iterator;
        }
        var ctx = {};
        ctx[iterator] = _context;
        return ctx;
      }
    },

    is_object: function(a) {
      return a && typeof a == "object";
    },

    is_array: function(a) {
      return Object.prototype.toString.call(a) === '[object Array]';
    },

    /*
      Gets rid of leading and trailing whitespace
    */
    trim: function(s) {
      return s.replace(/^\s*|\s*$/g, "");
    },

    /*
      Why, why, why? Because IE. Cry, cry cry.
    */
    map: function(array, fn) {
      if (typeof array.map == "function") {
        return array.map(fn);
      } else {
        var r = [];
        var l = array.length;
        for(var i = 0; i < l; i++) {
          r.push(fn(array[i]));
        }
        return r;
      }
    }
  };

  return({
    name: "mustache.js",
    version: "0.3.0",

    /*
      Turns a template and view into HTML
    */
    to_html: function(template, view, partials, send_fun) {
        var renderer = new Renderer();
        if(send_fun) {
            renderer.send = send_fun;
        }
        renderer.render(template, view, partials);
        if(!send_fun) {
            return renderer.buffer.join("\n");
        }
    }
    
  });
}();

/*
 * xhr code taken from curl's text plugin (https://github.com/unscriptable/curl/blob/master/src/curl/plugin/text.js)
 *
 * We use this to avoid taking a dependency on jQuery (which would be overwritten by mockjax)
**/
var progIds = ['Msxml2.XMLHTTP', 'Microsoft.XMLHTTP', 'Msxml2.XMLHTTP.4.0'],
    // collection of modules that have been written to the built file
    built = {};

function xhr () {
    if (typeof XMLHttpRequest !== "undefined") {
        // rewrite the getXhr method to always return the native implementation
        xhr = function () { return new XMLHttpRequest(); };
    }
    else {
        // keep trying progIds until we find the correct one, then rewrite the getXhr method
        // to always return that one.
        var noXhr = xhr = function () {
                throw new Error("getXhr(): XMLHttpRequest not available");
            };
        while (progIds.length > 0 && xhr === noXhr) (function (id) {
            try {
                new ActiveXObject(id);
                xhr = function () { return new ActiveXObject(id); };
            }
            catch (ex) {}
        }(progIds.shift()));
    }
    return xhr();
}

function fetchText (url, callback, errback) {
    var x = xhr();
    x.open('GET', url, true);
    x.onreadystatechange = function (e) {
        if (x.readyState === 4) {
            if (x.status < 400) {
                callback(x.responseText);
            }
            else {
                errback(new Error('fetchText() failed. status: ' + x.statusText));
            }
        }
    };
    x.send(null);
}

    /*
     * Actual plugin code
    **/
    var templateCache = {},
        partialCache = {},
        rendererCache = {},
        parseHtml = function(html){
            return $(html);
        };

    // innerShiv fixes setting .html() on HTML5 elements
    // And should only be included on the page if we're IE8 or below
    if(window.innerShiv){ // Obviously innerShiv should be included before this plugin is loaded
        parseHtml = function(html){
            return $(innerShiv(html, false));
        }
    }

    define(/*=='mustache',==*/ {
        'load': function (resourceId, require, callback, config) {
            var split = resourceId.split('!'),
            name = split[0],
            partials = [],
            partialNames;

            if(split[1]){
                partialNames = /partials:([a-zA-Z,]+)/.exec(split[1]);
                if(partialNames[1]){
                    partials = partials.concat(partialNames[1].split(','));
                }
            }

            if(partials.length){
                console.log('loading partials', partials);
            }

            config = config.mustache || config;
            config.rootUrl = (config.rootUrl || (config.baseUrl + '/templates/')).replace('//', '/');
            config.templateExtension = config.templateExtension || '.template';

            if(rendererCache[name]){
                callback(rendererCache[name]);
                return;
            } else {
                if(partials.length){
                    async.forEach(partials, function(name, done){
                        if(partialCache[name]){
                            console.log('already have partial:', name);
                            done();
                            return;
                        }

                        fetchText(config.rootUrl + name + '.partial', 
                                    function(partial){
                                        if(!partialCache[name]){
                                            partialCache[name] = partial;
                                            console.log('fetched and now caching partial:', name);
                                        }

                                        done();
                                    },
                                    function(){
                                        throw new Error('partial ' + name + ' could not be retrieved');
                                    });
                        }
                        , function(){fetchTemplate(name, config, callback);}
                    );
                } else {
                    fetchTemplate(name, config, callback);
                }
            }
        }
    });

    function fetchTemplate(name, config, callback){
        var url = config.rootUrl + name + config.templateExtension;
        fetchText(url, 
                    function(template){
                        if(!templateCache[name]){
                            templateCache[name] = template;

                            rendererCache[name] = function(data){
                                var html = Mustache.to_html(templateCache[name], data, partialCache);
                                
                                return parseHtml(html);
                            };
                        }

                        callback(rendererCache[name]);
                    },
                    function(){
                        throw new Error('Template ' + url + ' could not be retrieved');
                    });
    }

}(typeof window !== 'undefined' ? window : {}));