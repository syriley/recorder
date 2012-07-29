define([], function(){
    "use strict";
    
    return Backbone.View.extend({
        className: 'modal',

        events: function(){
            return {
                'click .remove' : 'onRemove'
            };
        },

        initialize: function(options){
            if(!options.dispatcher){
                throw new Error('options.dispatcher must be set!');
            }
            if(!options.sourceId){
                throw new Error('options.sourceId must be set!');
            }

            this.dispatcher = options.dispatcher;
            this.sourceId = options.sourceId;
            _(this).bindAll('onRemove', 'render');
        },

        render: function(){
            var track = this.track;
            this.$el.html(
                        '<div class="modal-header">' +
                            '<button type="button" class="close" data-dismiss="modal">×</button>' +
                            '<h3>Delete this recording?</h3>' +
                          '</div>' +
                          '<div class="modal-body">' +
                            '<p>Are you sure you want to delete this recording</p>' +
                          '</div>' +
                          '<div class="modal-footer">' +
                            '<a href="#" class="btn" data-dismiss="modal">No</a>' +
                            '<a href="#" class="btn btn-primary remove">Yes</a>' +
                          '</div>' +
                        '</div>'
                        );


            this.$el.modal();
            this.$('.renameTrackTextbox').focus();
        },

        onRemove: function(e){
            console.log('removing source', this.sourceId);
            this.dispatcher.trigger('source:remove', this.sourceId);
            this.$el.modal('hide');
            this.remove();
        }
    });
});
