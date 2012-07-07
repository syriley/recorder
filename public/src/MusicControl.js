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

        
        this.dispatcher.on('music:togglePlayback', this.togglePlayback, this);
        this.dispatcher.on('music:record', this.record, this);
    }

    _.extend(MusicControl.prototype, {

        record: function(){
            this.recorder.record();
        },
        stop: function(){
            var audioContext = this.audioContext;

            cancelAnimationFrame(this.updateTimeout);

            _(this.playingRegions).forEach(function(r){
                r.audio.noteOff(0);
                r.audio.disconnect();
            });
            this.playingRegions = [];
            this.audioContext = undefined;

            this.dispatcher.trigger('music:stop');
            if(this._recordEnabled){
                this.recorder.stopRecord();
                this.pos = this.playStartPosition;
                this.dispatcher.trigger('music:progress');
            }

            if(!this.isPlaying()){
                this.pos = 0;
                this.dispatcher.trigger('music:progress');
            }

            this._playing = false;
            this.dispatcher.trigger('music:playbackStopped', this.getStatusData());
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
