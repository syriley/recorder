define(['src/Recorder'], function(Recorder){
    'use strict';
    var AudioContext = window.AudioContext || window.webkitAudioContext,
        requestAnimationFrame = window.requestAnimationFrame ||
            window.mozRequestAnimationFrame || 
            window.webkitRequestAnimationFrame ||
            window.msRequestAnimationFrame,
        cancelAnimationFrame = window.cancelAnimationFrame ||
            window.mozCancelAnimationFrame || 
            window.webkitCancelAnimationFrame ||
            window.msCancelAnimationFrame;

    function MusicControl(options){
        if(!options || !options.dispatcher){
            throw new Error('options.dispatcher needs to be set');
        }
        
        this.dispatcher = options.dispatcher;
        this.recorder = new Recorder({
            dispatcher: this.dispatcher
        });

        this.dispatcher.on('playhead:moved', this.updatePosition, this);
        this.dispatcher.on('music:togglePlayback', this.togglePlayback, this);
        this.dispatcher.on('music:record', this.record, this);
        this.dispatcher.on('music:stop', this.stop, this);
        this.dispatcher.on('music:stopRecord', this.stopRecord, this);
        this.dispatcher.on('music:toggleRecordEnabled', this.toggleRecordEnabled, this);
        this.dispatcher.on('recorder:stop', this.playbackStopped, this);
    }

    _.extend(MusicControl.prototype, {

        getStatusData: function(){
            return {
                isRecordEnabled: this._recordEnabled || false
            };
        },

        record: function(){
            this._recordEnabled = true;
            this.recorder.record();
            this.dispatcher.trigger('music:recordStarted');
        },

         stopRecord: function(){
                this._recordEnabled = false;
                this.recorder.stopRecord();

                this.pos = this.playStartPosition;
                this.dispatcher.trigger('music:progress');
                this.dispatcher.trigger('music:recordStopped');
        },

        play: function(){
            this.recorder.play();
            this.dispatcher.trigger('music:playbackStarted');
            this._playing = true;
        },

        stopPlaying: function(){
            this._playing = false;
            this.recorder.stopPlaying();
			this.pos = 0;

            this.dispatcher.trigger('music:progress');
            this.dispatcher.trigger('music:playbackStopped', this.getStatusData());
        },

        playbackStopped: function() {
                this._playing = false;
                this.pos = this.playStartPosition;
                this.dispatcher.trigger('music:progress');
                this.dispatcher.trigger('music:playbackStopped', this.getStatusData());
        },

        stop: function(){
            
            if(this.isRecordEnabled()){
                this.stopRecord();
            }

            if(this.isPlaying()){
                this.stopPlaying();
            }
        },
        toggleRecordEnabled: function(){
            this._recordEnabled = !this._recordEnabled;
            if(this._recordEnabled){
                this.dispatcher.trigger('music:recordEnabled');
            } 
            else {
                this.dispatcher.trigger('music:recordDisabled');
            }
        },
        
        togglePlayback: function(){
            if(!this._playing){
                return this.play();
            }
            this.stop();
        },
        isPlaying: function(){
            return this._playing;
        },
        isRecordEnabled: function(){
            return this._recordEnabled;
        },
        updatePosition: function(e){
            this.pos = e.x;
        }
    });

    return MusicControl;
});
