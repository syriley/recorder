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
                        '<param name="flashVars" value="uploadUrl=/api/facebooksources"/>' +
                        '<embed name="flexRecorder" src="/assets/flash/recorder.swf" pluginspage="http://www.adobe.com/go/getflashplayer" height="140" width="270" flashVars="uploadUrl=/api/facebooksources"/>' +
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

            window.updateFlexProgress = function(status){
                //console.log('flex progres update called', status);
                self.uploadProgress(status);
            };

            window.sourceUploadComplete = function(data){
                self.uploadComplete();
                console.log('flex uploadComplete');
            };

            window.flexSampleData = function(data){
                self.flexSampleData(data);
            };

            window.micMuted = function(){
                console.log('micMuted called', status);
                self.micMuted();
            };

            window.playbackComplete = function(){
                self.playbackComplete();
            };


            window.flexRecorderInitialised = function(){
                self.flexRecorderInitialised();
            };

            this.dispatcher.bind('recorder:upload', this.upload, this);
            this.dispatcher.bind('recorder:enableSampling', this.enableSampling, this);
        },
        record: function(){
            if(!this.initialised){
                return this.trigger('recorder:notLoaded');
            }
            document.flexRecorder.triggerFlexRecord();
        },

        stopRecord: function(){
          if(!this.initialised){
                return this.trigger('recorder:notLoaded');
            }
            document.flexRecorder.triggerFlexStopRecord();  
        },

        play: function(){
          if(!this.initialised){
                return this.trigger('recorder:notLoaded');
            }
            document.flexRecorder.triggerFlexPlay();  
        },

        stopPlaying: function(){
          if(!this.initialised){
                return this.trigger('recorder:notLoaded');
            }
            document.flexRecorder.triggerFlexStopPlaying();  
        },

        upload: function(){
            if(!this.initialised){
                return this.trigger('recorderNotLoaded');
            }
            document.flexRecorder.triggerFlexUpload();
        },

        uploadProgress: function(status){
            this.dispatcher.trigger('recorder:uploadProgress', status);
        },

        uploadComplete: function(data){
            console.log('triggering recorder:uploadComplete');
            return this.dispatcher.trigger('recorder:uploadComplete', data);
        },


        enableSampling: function(enable){
            this.samplingEnabled = enable;
        },

        flexSampleData: function(data){
            var volumeThreshold = 0.008;
            if(this.samplingEnabled && _.max(data) > volumeThreshold) {
                this.dispatcher.trigger('recorder:sampleData', data);
            }
        },

        micMuted: function(){
            $('#recorderModal').css("visibility", "visible");
            $('#recorderModal').modal('show');
        },

        playbackComplete: function(){
            console.log('stoppping');
              this.dispatcher.trigger('recorder:stop');
        },

        flexRecorderInitialised: function(){
            this.initialised = true;
            this.dispatcher.trigger('recorder:initialised');
        }

    }, Backbone.Events);

    return Recorder;
});
