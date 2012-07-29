define([],
function(){
    "use strict";
    
    return Backbone.View.extend({

        className: 'navbar navbar-fixed-top',
        beginTemplate: '<div class="navbar navbar-fixed-top">' +
                      '<div class="navbar-inner">' +
                        '<div class="container">' +
                          '<button type="button" class="btn btn-navbar" data-toggle="collapse" data-target=".nav-collapse">' +
                            '<span class="icon-bar"></span>' +
                            '<span class="icon-bar"></span>' +
                            '<span class="icon-bar"></span>' +
                          '</button>' +
                          '<a class="brand" href="./index.html">Über Recorder</a>',
        
        loggedInTemplate: '<div class="btn-group pull-right">' +
                            '<a class="btn dropdown-toggle" data-toggle="dropdown" href="#">' +
                              '<i class="icon-user"></i> {{name}}' +
                              '<span class="caret"></span>' +
                            '</a>' +
                            '<ul class="dropdown-menu">' +
                              '<li><a href="/auth/logout">Sign Out</a></li>' +
                            '</ul>' +
                          '</div>',

        loggedOutTemplate: '<div class="btn-group pull-right">' +
                              '<a class="btn login">Sign In</a>' +
                          '</div>',

        endTemplate:      '<div class="nav-collapse collapse">' +
                            '<ul class="nav">' +
                              '<li class="">' +
                                '<a href="http://tuner.9dials.com" target="_blank">Tuner</a>' +
                              '</li>' +
                              '<li class="">' +
                                '<a href="http://recorder.9dials.com" target="_blank">Recorder</a>' +
                              '</li>' +
                              '</ul>' +
                          '</div>' +
                        '</div>' +
                      '</div>' +
                    '</div>',

        events: function(){
            return {
                'click .login' : 'onLoginClick'
            };
        },

        initialize: function(options){
            if(!options || !options.dispatcher){
                throw new Error('options.dispatcher must be set!');
            }

            var dispatcher = this.dispatcher = options.dispatcher;

            dispatcher.on('login:successful', this.onLoginSucessful, this);
            dispatcher.on('login:logout', this.onLogout, this);
            _(this).bindAll('onLoginClick');
            
        },

        render: function(){
            console.log('rendering', this.username);
            var begin = Mustache.render(this.beginTemplate),
                loggedIn = Mustache.render(this.loggedInTemplate, { name: this.username }),
                loggedOut = Mustache.render(this.loggedOutTemplate),
                end = Mustache.render(this.endTemplate),
                profile = (this.isLoggedIn) ? loggedIn : loggedOut;
             


             return this.$el.html(begin + profile + end)
            
        },

        onLoginClick: function(e){
            e.preventDefault();
            this.loginClick();
        },

        loginClick: function(){
            this.dispatcher.trigger('login:open');
        },

        onLoginSucessful: function(){
            this.isLoggedIn = true;
            var playSession = this.readCookie('PLAY_SESSION'),
                keyValues = playSession.split('%00'),
                username;
            _.each(keyValues, function(keyValue){
                if(keyValue.indexOf('username') != -1) {
                    username = unescape(keyValue);
                    username = username.replace('username:', '');
                    console.log(username);
                }
            });
            this.username = username;
            this.render();
        },

        readCookie: function (name) {
            var nameEQ = name + "=";
            var ca = document.cookie.split(';');
            for(var i=0;i < ca.length;i++) {
                var c = ca[i];
                while (c.charAt(0)==' ') c = c.substring(1,c.length);
                if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
            }
            return null;
        }

    });
});