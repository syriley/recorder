define([], function(){
    "use strict";

    return Backbone.View.extend({

        className: 'modal',

        events: function(){
            return {
                'click .dismiss' : 'dismiss'
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
                                    '<h3>How It works</h3> ' +
                                '</div> ' +
                                '<div class="modal-body"> ' +
                                    '<p>While we\'ve called it a guitar tuner you could really use this ' +
                                        'tool to tune any instrument you like.</p>' + 
                                    '<p>Simply play your guitar near the microphone or even plug in your jack and the ' +
                                    'tuner will automatically detect the note and show you if the pitch is sharp or flat.</p>' +
                                '</div> ' +
                                '<div class="modal-footer"> ' +
                                    '<a href="#" class="btn dismiss" data-dismiss="modal">Close</a> ' +
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
