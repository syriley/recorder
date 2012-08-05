'use strict';
/*
 * Serves up static files and templates HTML. For the API itself see support/bwjsonapi
 *
 * Recommend running via ./runInDevelopmentMode for the best development experience
**/
var os = require('os'),
    fs = require('fs'),
    path = require('path'),
    url = require('url'),
    qs = require('querystring'),
    http = require('http'),
    express = require('express'),
    _ = require('underscore'),
    httpProxy = require('http-proxy'),
    walker = require('walker'),
    http = require('http'),
    proxy = new httpProxy.RoutingProxy(),
    options,
    apiUrl;

if(!module.parent){
    console.log('Using filesystem session store.');
}

if(!path.existsSync('./sessions')){
    fs.mkdirSync('./sessions', 766);
}

options = {
    apiHost: 'local.9dials.com',
    apiPort: 9000
};

/*
 * Helper for sending JSON responses to the client
**/
function sendAsJson(data, response, statusCode){
    statusCode = statusCode || 200;
    response.send(JSON.stringify(data),{'Content-Type':'application/javascript'}, statusCode);
}

/*
 * Gets the path & query part of the given URL
**/
function getPathAndQuery(fullUrl){
    var builtUrl = '',
        parsedUrl = url.parse(fullUrl);

    if(!parsedUrl){
        return /*undefined*/;
    }

    return parsedUrl.pathname + (parsedUrl.search || '') + (parsedUrl.hash || '');
}

/*
 * The meat of this script - handling the different routes
**/
function routing(app){

    /*
     * Tests template doesn't use a layout, has its own.
     *
     * Calls out to getLocalsForUnitTests to fetch the appropriate template values
    **/
    app.get('/tests', function(req, res, next){
        var root = __dirname + '/public/',
            tests = [],
            error;

        walker(__dirname + '/public/test/')
            .on('file', function(file){
                if(/tests\.js$/.test(file)){
                    tests.push(file.substring(root.length));
                }
            })
            .on('error', function(err){
                console.error(err);
                error = err;
            })
            .on('end', function(){
                res.render('tests.template', {
                    layout: false,
                    tests: tests
                });
            });
    });

    /*
     * simply renders the HTML to the client
    **/
    app.get('/', function(req, res){
        var forwardCookies = req.headers.cookie;
        res.render('recorder.template', {
            locals: {
                baseHref: req.url
            }
        });
    });
}

/*
 * [express](http://expressjs.com) is used for routing, logging and static file handling
**/
var app = express.createServer(
    express.router(function(app){
        app.all('/api*', function(req, res){
            console.log('Proxying', req.url, 'to', options.apiHost +':' + options.apiPort + req.url);

            proxy.proxyRequest(req, res, {
                host: options.apiHost,
                port: options.apiPort
            });
        });
        app.all('/auth*', function(req, res){
            console.log('Proxying', req.url, 'to', options.apiHost +':' + options.apiPort + req.url);

            proxy.proxyRequest(req, res, {
                host: options.apiHost,
                port: options.apiPort
            });
        });
        app.all('/login*', function(req, res){
            console.log('Proxying', req.url, 'to', options.apiHost +':' + options.apiPort + req.url);

            proxy.proxyRequest(req, res, {
                host: options.apiHost,
                port: options.apiPort
            });
        });
    }),
    express.favicon(),
    express['static'](path.join(__dirname, 'public')),
    express.bodyParser(),
    express.cookieParser(),
    //express.session({ secret: '4l1ttl3s3cr3749d4w',
    //                    store: sessionStore
    //                }),
    express.logger({format:':method :url :status'}),
    express.router(routing),
    express.responseTime()
);

/*
 * HTML is generated by [Mustache](http://mustache.github.com/mustache.5.html) via [hogan]()
**/
app.set('view engine','hogan.js');
app.set('view options',{layout: true});
app.set('views', __dirname+ '/views');
app.register('template', require('./lib/hogan').init(require('hogan.js')));

/*
 * We cater for three distinct environments, via the NODE_ENV environment variable. "development" is the default if this isn't specified
**/
app.configure('development', function(){
    console.log('Development mode');
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

// Unit tests run by the ./jasmine script run under "test" environment, which isn't any different to development atm
app.configure('test', function(){
    console.log('****** TEST MODE ******');
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
    console.log('****** PRODUCTION MODE ******');
    app.use(express.errorHandler());
});

/*
 * Some glue code to do special things if we're running via a require as opposed to just being run on the commandline
**/
if(!module.parent){
    app.listen(7000);
    console.log('Express started on port 7000');
}else{
    module.exports = app;
}