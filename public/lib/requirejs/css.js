/**
 * Fork of the curl.js css module, Copyright (c) 2010 unscriptable.com
 *
 * Modified 2011 by Steve Mason @ Brandwatch Ltd - to make compatible for requirejs & simplify loading somewhat
 */

(function (global) {
"use strict";

/*
 * AMD css! plugin
 * This plugin will load and wait for css files.  This could be handy when
 * loading css files as part of a layer or as a way to apply a run-time theme.
 * Most browsers do not support the load event handler of the link element.
 * Therefore, we have to use other means to detect when a css file loads.
 * (The HTML5 spec states that the LINK element should have a load event, but
 * not even Chrome 8 or FF4b7 have it, yet.
 * http://www.w3.org/TR/html5/semantics.html#the-link-element)
 *
 * This plugin tries to use the load event and a universal work-around when
 * it is invoked the first time.  If the load event works, it is used on
 * every successive load.  Therefore, browsers that support the load event will
 * just work (i.e. no need for hacks!).  FYI, Feature-detecting the load
 * event is tricky since most browsers have a non-functional onload property.
 *
 * The universal work-around watches a stylesheet until its rules are
 * available (not null or undefined).  There are nuances, of course, between
 * the various browsers.  The isLinkReady function accounts for these.
 *
 * Note: it appears that all browsers load @import'ed stylesheets before
 * fully processing the rest of the importing stylesheet. Therefore, we
 * don't need to find and wait for any @import rules explicitly.
 *
 * Note #2: for Opera compatibility, stylesheets must have at least one rule.
 * AFAIK, there's no way to tell the difference between an empty sheet and
 * one that isn't finished loading in Opera (XD or same-domain).
 *
 * Options:
 *      !nowait - does not wait for the stylesheet to be parsed, just loads it
 *
 * Global configuration options:
 *
 * cssDeferLoad: Boolean. You can also instruct this plugin to not wait
 * for css resources. They'll get loaded asap, but other code won't wait
 * for them. This is just like using the !nowait option on every css file.
 *
 * cssWatchPeriod: if direct load-detection techniques fail, this option
 * determines the msec to wait between brute-force checks for rules. The
 * default is 50 msec.
 *
 * You may specify an alternate file extension:
 *      require('css!myproj/component.less') // --> myproj/component.less
 *      require('css!myproj/component.scss') // --> myproj/component.scss
 *
 * When using alternative file extensions, be sure to serve the files from
 * the server with the correct mime type (text/css) or some browsers won't
 * parse them, causing an error in the plugin.
 *
 * usage:
 *      require(['css!myproj/comp']); // load and wait for myproj/comp.css
 *      define(['css!some/folder/file'], {}); // wait for some/folder/file.css
 *      require(['css!myWidget!nowait']);
 *
 * Tested in:
 *      Firefox 1.5, 2.0, 3.0, 3.5, 3.6, and 4.0b6
 *      Safari 3.0.4, 3.2.1, 5.0
 *      Chrome 7 (8+ is partly b0rked)
 *      Opera 9.52, 10.63, and Opera 11.00
 *      IE 6, 7, and 8
 *      Netscape 7.2 (WTF? SRSLY!)
 * Does not work in Safari 2.x :(
 * In Chrome 8+, there's no way to wait for cross-domain (XD) stylesheets.
 * See comments in the code below.
 * TODO: figure out how to be forward-compatible when browsers support HTML5's
 *  load handler without breaking IE and Opera
*/


    var
        // compressibility shortcuts
        onreadystatechange = 'onreadystatechange',
        onload = 'onload',
        createElement = 'createElement',
        // failed is true if RequireJS threw an exception
        failed = false,
        undef,
        insertedSheets = {},
        features = {
            // true if the onload event handler works
            // "event-link-onload" : false
        },
        // this actually tests for absolute urls and root-relative urls
        // they're both non-relative
        nonRelUrlRe = /^\/|^[^:]*:\/\//,
        // Note: this will fail if there are parentheses in the url
        findUrlRx = /url\s*\(['"]?([^'"\)]*)['"]?\)/g,
        // doc will be undefined during a build
        doc = global.document,
        // find the head element and set it to it's standard property if nec.
        head,
        // collection of modules that have been written to the built file
        built = {};
            
        if (doc) {
            head = doc.head || (doc.head = doc.getElementsByTagName('head')[0]);
        }

        function has (feature) {
            return features[feature];
        }

/***** load-detection functions *****/

    function loadHandler (params, cb) {
        // We're using 'readystatechange' because IE and Opera happily support both
        var link = params.link;
            link[onreadystatechange] = link[onload] = function () {
            if (!link.readyState || link.readyState == 'complete') {
                    features["event-link-onload"] = true;
                cleanup(params);
                cb();
            }
        };
    }

    function nameWithExt (name, defaultExt) {
        return name.lastIndexOf('.') <= name.lastIndexOf('/') ?
            name + '.' + defaultExt : name;
    }

    function parseSuffixes (name) {
        // creates a dual-structure: both an array and a hashmap
        // suffixes[0] is the actual name
        var parts = name.split('!'),
            suf, i = 1, pair;
        while ((suf = parts[i++])) { // double-parens to avoid jslint griping
            pair = suf.split('=', 2);
            parts[pair[0]] = pair.length == 2 ? pair[1] : true;
        }
        return parts;
    }

    var collectorSheet;
    function createLink (doc, optHref) {
        // detect if we need to avoid 31-sheet limit in IE (how to detect this for realz?)
        if (document.createStyleSheet) {
            if (!collectorSheet) {
                collectorSheet = document.createStyleSheet();
            }
            if (document.styleSheets.length >= 30) {
                moveLinksToCollector();
            }
        }
        var link = doc[createElement]('link');
        link.rel = "stylesheet";
        link.type = "text/css";
        link.setAttribute('_curl_movable', true);
        if (optHref) {
            link.href = optHref;
        }
        return link;
    }

    var testEl;
    function styleIsApplied () {
        // Chrome 8 hax0rs!
        // This is an ugly hack needed by Chrome 8+ which no longer waits for rules
        // to be applied to the document before exposing them to javascript.
        // Unfortunately, this routine will never fire for XD stylesheets since
        // Chrome will also throw an exception if attempting to access the rules
        // of an XD stylesheet.  Therefore, there's no way to detect the load
        // event of XD stylesheets until Google fixes this, preferably with a
        // functional load event!  As a work-around, use domReady() before
        // rendering widgets / components that need the css to be ready.
        if (!testEl) {
                testEl = doc[createElement]('div');
            testEl.id = '_cssx_load_test';
            head.appendChild(testEl);
        }
        return doc.defaultView.getComputedStyle(testEl, null).marginTop == '-5px';
    }

    function isLinkReady (link) {
        // This routine is a bit fragile: browser vendors seem oblivious to
        // the need to know precisely when stylesheets load.  Therefore, we need
        // to continually test beta browsers until they all support the LINK load
        // event like IE and Opera.
        var sheet, rules, ready = false;
        try {
            // webkit's and IE's sheet is null until the sheet is loaded
            sheet = link.sheet || link.styleSheet;
            // mozilla's sheet throws an exception if trying to access xd rules
            rules = sheet.cssRules || sheet.rules;
            // webkit's xd sheet returns rules == null
            // opera's sheet always returns rules, but length is zero until loaded
            // friggin IE doesn't count @import rules as rules, but IE should
            // never hit this routine anyways.
            ready = rules ?
                rules.length > 0 : // || (sheet.imports && sheet.imports.length > 0) :
                rules !== undef;
            // thanks, Chrome 8+, for this lovely hack. TODO: find a better way
            if (ready && {}.toString.call(window.chrome) == '[object Chrome]') {
                // fwiw, we'll never get this far if this is an XD stylesheet
                sheet.insertRule('#_cssx_load_test{margin-top:-5px;}', 0);
                ready = styleIsApplied();
                sheet.deleteRule(0);
            }
        }
        catch (ex) {
            // 1000 means FF loaded an xd stylesheet
            // other browsers just throw a security error here (IE uses the phrase 'Access is denied')
            ready = (ex.code == 1000) || (ex.message.match(/security|denied/i));
        }
        return ready;
    }

    function ssWatcher (params, cb) {
        // watches a stylesheet for loading signs.
        if (isLinkReady(params.link)) {
            cleanup(params);
            cb();
        }
        else if (!failed) {
            setTimeout(function () { ssWatcher(params, cb); }, params.wait);
        }
    }

    function loadDetector (params, cb) {
        // It would be nice to use onload everywhere, but the onload handler
        // only works in IE and Opera.
        // Detecting it cross-browser is completely impossible, too, since
        // THE BROWSERS ARE LIARS! DON'T TELL ME YOU HAVE AN ONLOAD PROPERTY
        // IF IT DOESN'T DO ANYTHING!
        var loaded;
        function cbOnce () {
            if (!loaded) {
                loaded = true;
                cb();
            }
        }
        loadHandler(params, cbOnce);
        if (!has("event-link-onload")) {
            ssWatcher(params, cbOnce);
        }
    }

    function cleanup (params) {
        var link = params.link;
        link[onreadystatechange] = link[onload] = null;
    }

    function moveLinksToCollector () {
        // IE 6-8 fails when over 31 sheets, so we collect them.
        // Note: this hack relies on proper cache headers.
        var link, links, collector, pos = 0;
        collector = collectorSheet;
        collectorSheet = null; // so a new one will be created
        links = document.getElementsByTagName('link');
        while ((link = links[pos])) {
            if (link.getAttribute('_curl_movable')) {
                // move to the collectorSheet (note: bad cache directive will cause a re-download)
                collector.addImport(link.href);
                // remove from document
                link.parentNode && link.parentNode.removeChild(link);
            }
            else {
                // skip this sheet
                pos++;
            }
        }
    }

    /***** style element functions *****/
    
    var currentStyle;

    function translateUrls (cssText, baseUrl) {
        return cssText.replace(findUrlRx, function (all, url) {
            return 'url("' + translateUrl(url, baseUrl) + '")';
        });
    }

    function translateUrl (url, parentPath) {
        // if this is a relative url
        if (!nonRelUrlRe.test(url)) {
            // append path onto it
            url = parentPath + url;
        }
        return url;
    }

    function createStyle (cssText) {
        clearTimeout(createStyle.debouncer);
        if (createStyle.accum) {
            createStyle.accum.push(cssText);
        }
        else {
            createStyle.accum = [cssText];
            currentStyle = doc.createStyleSheet ? doc.createStyleSheet() :
                head.appendChild(doc.createElement('style'));
        }

        createStyle.debouncer = setTimeout(function () {
            // Note: IE 6-8 won't accept the W3C method for inserting css text
            var style, allCssText;

            style = currentStyle;
            currentStyle = undef;

            allCssText = createStyle.accum.join('\n');
            createStyle.accum = undef;

            // for safari which chokes on @charset "UTF-8";
            allCssText = allCssText.replace(/.+charset[^;]+;/g, '');

            // TODO: hoist all @imports to the top of the file to follow w3c spec

            'cssText' in style ? style.cssText = allCssText :
                style.appendChild(doc.createTextNode(allCssText));
                
        }, 0);
        
        return currentStyle;
    }

    function createSheetProxy (sheet) {
        return {
            cssRules: function () {
                return sheet.cssRules || sheet.rules;
            },
            insertRule: sheet.insertRule || function (text, index) {
                var parts = text.split(/\{|\}/g);
                sheet.addRule(parts[0], parts[1], index);
                return index;
            },
            deleteRule: sheet.deleteRule || function (index) {
                sheet.removeRule(index);
                return index;
            },
            sheet: function () {
                return sheet;
            }
        };
    }

    function jsEncode (text) {
        // TODO: hoist the map and regex to the enclosing scope for better performance
        var map = { 34: '\\"', 13: '\\r', 12: '\\f', 10: '\\n', 9: '\\t', 8: '\\b' };
        return text.replace(/(["\n\f\t\r\b])/g, function (c) {
            return map[c.charCodeAt(0)];
        });
    }

/***** finally! the actual plugin *****/

    define(/*=='css',==*/ {

        'normalize': function (resourceId, toAbsId) {
            var resources, normalized;

            if (!resourceId) return resourceId;

            resources = resourceId.split(",");
            normalized = [];

            for (var i = 0, len = resources.length; i < len; i++) {
                normalized.push(toAbsId(resources[i]));
            }

            return normalized.join(',');
        },
// PATCH: Simplified this to only support loading one stylesheet at a time (because that's all we use)
        'load': function (name, require, callback, config) {
            var
                // TODO: this is a bit weird: find a better way to extract name?
                opts = parseSuffixes(name),
                fileName = opts.shift(),
                url = require.toUrl(config.baseUrl + nameWithExt(fileName, 'css')),
                link = createLink(doc),
                nowait = 'nowait' in opts ? opts['nowait'] != 'false' : !!config['cssDeferLoad'],
                params = {
                    link: link,
                    url: url,
                    wait: config['cssWatchPeriod'] || 50
                };

            if (nowait) {
                callback(createSheetProxy(link.sheet || link.styleSheet));
            }
            else {
                // hook up load detector(s)
                loadDetector(params, loaded);
            }

            // go!
            link.href = url;

            head.appendChild(link);
            insertedSheets[url] = link;

            // all detector functions must ensure that this function only gets
            // called once per stylesheet!
            function loaded () {
                // load/error handler may have executed before stylesheet is
                // fully parsed / processed in Opera, so use setTimeout.
                // Opera will process before the it next enters the event loop
                // (so 0 msec is enough time).
                setTimeout(function () { callback(createSheetProxy(link.sheet || link.styleSheet)); }, 0);
            }
        },
// /PATCH
        /***** build methods *****/

        'build': function (writer, fetcher, config) {
            // writer is a function used to output to the built file
            // fetcher is a function used to fetch a text file
            // config is the global config
            // returns a function that the build tool can use to tell this
            // plugin to write-out a resource
            return function write (pluginId, resource, resolver) {
                var opts, name, url, absId, text, output;
                // TODO: implement !nowait and comma-sep files!
                opts = parseSuffixes(resource);
                name = opts.shift();
                absId = resolver['toAbsMid'](name);
                if (!(absId in built)) {
                    built[absId] = true;
                    url = resolver['toUrl'](nameWithExt(absId, 'css'));
                    // fetch text
                    text = jsEncode(fetcher(url));
                    // write out a define
                    // TODO: wait until sheet's rules are active before returning (use an amd promise)
                    // TODO: fix parser so that it doesn't choke on the word define( in a string
                    output = 'def' + 'ine("' + pluginId + '!' + absId + '", ["' + pluginId + '!"], function (api) {\n' +
                        // translate urls
                        '\tvar cssText = "' + text + '";\n' +
                        '\tcssText = api.translateUrls(cssText, "' + absId + '");\n' +
                        // call the injectStyle function
                        '\treturn api.proxySheet(api.injectStyle(cssText));\n' +
                    '});\n';
                    writer(output);
                }
            };
        }

    });

})(this);