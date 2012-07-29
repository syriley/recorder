define([], function(){
    "use strict";
    
    return Backbone.View.extend({
        className: 'modal',

        events: function(){
            return {
                'click .renameTrack' : 'onRenameTrack'
            };
        },

        initialize: function(options){
            if(!options.dispatcher){
                throw new Error('options.dispatcher must be set!');
            }

            this.dispatcher = options.dispatcher;

            _(this).bindAll('onRenameTrack', 'render');
        },

        render: function(){
            var track = this.track;
            this.$el.html(
                        '<div class="modal-header">' +
                            '<button type="button" class="close" data-dismiss="modal">×</button>' +
                            '<h3>Rename Session</h3>' +
                          '</div>' +
                          '<div class="modal-body">' +
                            '<p>Enter a new session name:</p>' +
                            '<input class="renameTrackTextbox" value="Untitled"/>' +
                          '</div>' +
                          '<div class="modal-footer">' +
                            '<a href="#" class="btn" data-dismiss="modal">Close</a>' +
                            '<a href="#" class="btn btn-primary renameTrack">Save changes</a>' +
                          '</div>' +
                        '</div>'
                        );


            this.$el.modal();
            this.$('.renameTrackTextbox').focus();
        },

        onRenameTrack: function(e){
            var name = this.$('.renameTrackTextbox').val();
            console.log('renaming track to', name);
            this.dispatcher.trigger('recorder:upload', name);
            this.$el.modal('hide');
            this.remove();
        }
    });
});
