define([], function(){
    'use strict';
    
    $('body').append(
        '<div id="recorderModal" class="modal" style="visibility:hidden">' +
            '<div class="modal-header">' +
                '<button type="button" class="close" data-dismiss="modal">×</button>' +
                '<h3>Enable the Microphone</h3>' +
            '</div>' +
            '<div class="modal-body">' +
                '<p>To use this tuner, you will need to allow access to the microphone.</p>' +
                '<div style="text-align:center">' +
                    '<object id="flexRecord1" classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000" codebase="http://fpdownload.macromedia.com/get/flashplayer/current/swflash.cab" height="140" width="270">' +
                        '<param name="src" value="/assets/flash/recorder.swf"/>' +
                        '<param name="flashVars" value="uploadUrl=/api/sources"/>' +
                        '<embed name="flexRecorder" src="/assets/flash/recorder.swf" pluginspage="http://www.adobe.com/go/getflashplayer" height="140" width="270" flashVars="uploadUrl=/api/sources"/>' +
                    '</object>' +
                '</div>' +
            '</div>' +
            '<div class="modal-footer">' +
                '<a href="#" class="btn" data-dismiss="modal">Close</a>' +
            '</div>' +
        '</div>');

    function Recorder(options){
        this.initialize(options);
    }

    _.extend(Recorder.prototype, {
        initialize: function(options){
            if(!options || !options.dispatcher){
                throw new Error('options.dispatcher must be defined!');
            }

            this.dispatcher = options.dispatcher;
            this.samplingEnabled = true;

            var self = this;
            window.flexSampleData = function(data){
                self.flexSampleData(data);
            };

            window.micMuted = function(){
                console.log('micMuted called', status);
                self.micMuted();
            };

            window.flexRecorderInitialised = function(){
                console.log('flexRecorderInitialised called');
                self.flexRecorderInitialised();
            };

            this.dispatcher.bind('music:upload', this.upload, this);
            this.dispatcher.bind('recorder:enableSampling', this.enableSampling, this);
        },
        record: function(){
            if(!this.initialised){
                return this.trigger('recorderNotLoaded');
            }
            document.flexRecorder.triggerFlexRecord();
        },

        enableSampling: function(enable){
            this.samplingEnabled = enable;
        },

        flexSampleData: function(data){
            var volumeThreshold = 0.008;
            if(this.samplingEnabled && _.max(data) > volumeThreshold) {
               // this.dispatcher.trigger('recorder:sampleData', data);
            }
        },

        micMuted: function(){
            $('#recorderModal').css("visibility", "visible");
            $('#recorderModal').modal('show');
        },

        flexRecorderInitialised: function(){
            this.initialised = true;
            this.dispatcher.trigger('recorder:initialised');
        }

    }, Backbone.Events);

    return Recorder;
});
