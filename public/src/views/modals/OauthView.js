define([], function(){
    "use strict";

    return Backbone.View.extend({

        className: 'modal',

        initialize: function(options){
            if(!options || !options.dispatcher){
                throw new Error('options.dispatcher must be set!');
            }
            this.dispatcher = options.dispatcher;
        },

        render: function(){
            this.$el.html('<div class="modal-header">' +
                                '<h3>Sign In</h3>' +
                            '</div>' +
                            '<div class="modal-body">' +
                                '<p>Please log in with Google or Facebook so that we can save your track.</p>' +
                                '<div class="loginContainer">' +
                                 '<iframe src="/auth/googleopenid">' +
                                 '</iframe>' +
                            '</div>' +
                            '<div class="modal-footer">' +
                            '</div> ');
            this.$el.modal();
        },
        
        dismiss: function(){
            this.$el.modal('hide');
            this.remove();
        }
    });
});
