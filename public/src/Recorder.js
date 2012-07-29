define([
        'src/views/modals/RecorderView'
    ], function(RecorderView){
    'use strict';
    
    function Recorder(options){
        this.initialize(options);
    }

    _.extend(Recorder.prototype, {
        initialize: function(options){
            if(!options || !options.dispatcher){
                throw new Error('options.dispatcher must be defined!');
            }

            var self = this,
                dispatcher = this.dispatcher = options.dispatcher;
            this.samplingEnabled = true;

            

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

            this.recorderView = new RecorderView({
                dispatcher: dispatcher
            });
            this.recorderView.render();
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

        upload: function(name){
            console.log('uploading', name);
            if(!this.initialised){
                return this.trigger('recorderNotLoaded');
            }
            document.flexRecorder.triggerFlexUpload(name);
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
            this.dispatcher.trigger('recorder:disabled');
            //$('#recorderModal').css("visibility", "visible");
            //$('#recorderModal').modal('show');
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
