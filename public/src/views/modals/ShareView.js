define([], function(){
    "use strict";
    
    return Backbone.View.extend({
        className: 'modal',

        events: function(){
            return {
                'click .share' : 'onShare'
            };
        },

        initialize: function(options){
            if(!options.dispatcher){
                throw new Error('options.dispatcher must be set!');
            }
            if(!options.friendIds){
                throw new Error('options.friendIds must be set!');
            }

            this.dispatcher = options.dispatcher;
            this.friendIds = options.friendIds;
            _(this).bindAll('onShare', 'render');
        },

        render: function(){
            var track = this.track;
            this.$el.html(
                        '<div class="modal-header">' +
                            '<button type="button" class="close" data-dismiss="modal">×</button>' +
                            '<h3>Share on Facebook</h3>' +
                          '</div>' +
                          '<div class="modal-body">' +
                            '<p>Enter a new session name:</p>' +
                            '<input class="messageTextbox" value="Untitled"/>' +
                          '</div>' +
                          '<div class="modal-footer">' +
                            '<a href="#" class="btn" data-dismiss="modal">Close</a>' +
                            '<a href="#" class="btn btn-primary share">Share</a>' +
                          '</div>' +
                        '</div>'
                        );


            this.$el.modal();
            this.$('.messageTextbox').focus();
        },

        onShare: function(e){
            var message = this.$('.messageTextbox').val(),
                friendIds = this.friendIds;
            console.log('sending with message', message);
            console.log("The following friends were selected: " + friendIds.join(", "));
            var userId = friendIds[0];
            var data = {
                name: "9dials recording",
                description: "description of post",
                message: message,
                source: 'http://www.looptvandfilm.com/blog/Radiohead%20-%20In%20Rainbows/01%20-%20Radiohead%20-%2015%20Step.MP3'
            };
            console.log(data);
            FB.api("/" + userId + "/feed", "post", data, this.postsSent);
            
            this.dispatcher.trigger('recorder:upload', name);
            this.$el.modal('hide');
            this.remove();
        }


    });
});
