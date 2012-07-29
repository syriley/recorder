define([], function(){
    "use strict";

    return Backbone.View.extend({

        className: 'modal',

        events: function(){
            return {
                'click .wakeupButton' : 'onWakeupClick',
            };
        },

        initialize: function(options){
            if(!options || !options.dispatcher){
                throw new Error('options.dispatcher must be set!');
            }

            this.dispatcher = options.dispatcher;

            _(this).bindAll('onWakeupClick');

        },

        render: function(){
            this.$el.html('<div class="modal-header">' +
                                    '<button type="button" class="close dismiss" data-dismiss="modal">×</button>' +
                                    '<h3>Wakeup!</h3> ' +
                                '</div> ' +
                                '<div class="modal-body"> ' +
                                    '<p>The tuner has gone to sleep to save processing power. ' + 
                                    'Click wakeup below to restart the tuner</p>' +
                                '</div> ' +
                                '<div class="modal-footer"> ' +
                                    '<a href="#" class="btn btn-primary wakeupButton">Wakeup</a>' +
                                '</div> ');
            this.$el.modal();
        },

        onWakeupClick: function(e){
            e.preventDefault();
            this.wakeupClick();
        },

        wakeupClick: function(){
            this.dispatcher.trigger('tuner:wakeup');
            this.dismiss();
        },

        dismiss: function(){
            this.$el.modal('hide');
            this.remove();
        }
    });
});
