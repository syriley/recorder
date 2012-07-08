define([], function(){
    "use strict";

    return Backbone.View.extend({

        className: 'modal',

        events: function() {
            return {
                'click .googleLogin' : 'onGoogleClick',
                'click .facebookLogin' : 'onFacebookClick'
            }
        },

        initialize: function(options){
            if(!options || !options.dispatcher){
                throw new Error('options.dispatcher must be set!');
            }
            this.dispatcher = options.dispatcher;
            _(this).bindAll('onGoogleClick', 'onFacebookClick');

        },

        render: function(){
            this.$el.html('<div class="modal-header">' +
                                '<button type="button" class="close dismiss" data-dismiss="modal">×</button>' +
                                '<h3>Sign In</h3>' +
                            '</div>' +
                            '<div class="modal-body">' +
                                '<p>Please log in with Google or Facebook so that we can save your track.</p>' +
                                '<div class="loginContainer">' +
                                 '<a class="btn btn-large loginButton googleLogin">' +
                                    '<img class="pull-left googleLogin" src="/assets/images/googleIcon.png"/>' +
                                    '<span class="loginButtonText pull-left">Sign in with Google</span>' +
                                '</a>' +
                                '<br />' +
                                '<a class="btn btn-large loginButton facebookLogin">' +
                                    '<img class="pull-left" src="/assets/images/facebookIcon.png"/>' +
                                    '<span class="loginButtonText pull-left">Sign in with Facebook</span>' +
                                '</a>' +
                                '</div>' +
                            '</div>' +
                            '<div class="modal-footer">' +
                            '</div> ');
            this.$el.modal();
        },
        
        dismiss: function(){
            this.$el.modal('hide');
            this.remove();
        },

        onGoogleClick: function(e){
            e.preventDefault();
            this.openOauth('/auth/googleopenid');
        },

        onFacebookClick: function(e){
            e.preventDefault();
            this.openOauth('/auth/facebook');
        },

        openOauth: function(url){
             var width = 1000,
                 height = 500,
                 left = (screen.width/2)-(width/2),
                 title = '9dials OAuth Login',
                 top = (screen.height/2)-(height/2),
                 options = 'toolbar=no, location=no, directories=no, status=no,' + 
                    ' menubar=no, scrollbars=no, resizable=no, ' +
                    'copyhistory=no, width=' + width + ', height='+ height + ', top=' + top + ', left=' + left; 
            this.openOauthWindow = window.open(url,title,options);
        }

    });
});
