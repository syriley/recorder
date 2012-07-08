define([], function(){
    "use strict";

    return Backbone.View.extend({

        className: 'modal',

        initialize: function(options){
            if(!options || !options.dispatcher){
                throw new Error('options.dispatcher must be set!');
            }

            this.dispatcher = options.dispatcher;
            this.dispatcher.on('recorder:initialised', this.dismiss, this);
        },

        render: function(){
            this.$el.html('<div class="modal-header">' +
                                '<h3>Please Wait...</h3> ' +
                            '</div> ' +
                            '<div class="modal-body"> ' +
                                '<img class="offset2" src="/assets/images/loading.gif" />' +
                            '</div> ' +
                            '<div class="modal-footer"> ' +
                            '</div> ');
            this.$el.modal();
        },
        
        dismiss: function(){
            this.$el.modal('hide');
            this.remove();
        }
    });
});
