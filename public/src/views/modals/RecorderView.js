define([], function(){
    "use strict";

    return Backbone.View.extend({

        className: 'modal hidden',

        events: function(){
            return {
                'click .wakeupButton' : 'onWakeupClick',
                'click .dismiss' : 'dismiss'
            };
        },

        initialize: function(options){
            if(!options || !options.dispatcher){
                throw new Error('options.dispatcher must be set!');
            }

            this.dispatcher = options.dispatcher;

            this.dispatcher.on('recorder:disabled', this.show, this);
            _(this).bindAll('onWakeupClick');

        },

        render: function(){
            this.$el.html(
                                '<div class="modal-header">' +
                                    '<button type="button" class="close dismiss" data-dismiss="modal">×</button>' +
                                    '<h3>Enable the Microphone..</h3> ' +
                                '</div> ' +
                                '<div class="modal-body"> ' +
                                    '<p>To use this tuner, you will need to allow access to the microphone.</p>' +
                                    '<div style="text-align:center">' +
                                        '<object id="flexRecord1" classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000" codebase="http://fpdownload.macromedia.com/get/flashplayer/current/swflash.cab" height="160" width="250">' +
                                            '<param name="src" value="/assets/flash/recorder.swf"/>' +
                                            '<param name="flashVars" value="uploadUrl=/api/facebooksources"/>' +
                                            '<embed name="flexRecorder" src="/assets/flash/recorder.swf" pluginspage="http://www.adobe.com/go/getflashplayer" height="160" width="250" flashVars="uploadUrl=/api/facebooksources"/>' +
                                        '</object>' +
                                    '</div>' +
                                '</div> ' +
                                '<div class="modal-footer"> ' +
                                    '<a href="#" class="btn dismiss" data-dismiss="modal">Cancel</a> ' +
                                '</div>' 
                          );
            
            $('body').append(this.$el);
            //this.$el.modal('show');
        },

        show: function(){
            this.$el.css("visibility", "visible");
            this.$el.modal('show');
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
            //this.remove();
        }
    });
});