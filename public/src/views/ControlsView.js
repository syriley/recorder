define(['src/views/modals/LoginView'],
    function(LoginView){
    "use strict";
    
    return Backbone.View.extend({

        className: 'container mainContent',
        recordImage: '/assets/images/recordDisabled.png',
        playImage: '/assets/images/play.png',
        recordUsed: false,
        globalControlsTemplate: '<div class="row">' +
                                '<div class="well span5 offset3">' +
                                    '<img src="{{recordImage}}" class="btn record" type="button" value="Play" />' +
                                    '<img src="{{playImage}}" class="btn play" type="button" value="Play" />' +
                                    '<span class="time">00:00:00</span>' +
                                    '<a class="btn btn-primary btn-large save pull-right disabled">Save</a>' +
                                '</div>' +
                            '</div>',

        events: function(){
            return {
                'click .record' : 'onToggleRecord',
                'click .play' : 'onTogglePlay',
                'click .save' : 'onSaveClick'
            };
        },

        initialize: function(options){
            if(!options.dispatcher){
                throw new Error('options.dispatcher must be set!');
            }

            if(!options.musicControl){
                throw new Error('options.musicControl must be set!');
            }

            this.musicControl = options.musicControl;
            this.dispatcher = options.dispatcher;

            this.dispatcher.on('music:playbackStarted', this.onPlaybackStarted, this);
            this.dispatcher.on('music:playbackStopped', this.onPlaybackStopped, this);

            this.dispatcher.on('music:recordEnabled', this.onRecordEnabled, this);
            this.dispatcher.on('music:recordDisabled', this.onRecordDisabled, this);
            this.dispatcher.on('login:successful', this.loginSuccessful, this);

            this.dispatcher.on('music:stop', this.onPlaybackStopped, this);

            _(this).bindAll('onTogglePlay', 'onToggleRecord', 'onSaveClick');

        },

        render: function(){

            var globalControlsView = Mustache.render(this.globalControlsTemplate, {
                recordImage: this.recordImage,
                playImage: this.playImage
            });

            this.$el.html(globalControlsView);
        },

        onToggleRecord: function(){
            this.dispatcher.trigger('music:toggleRecordEnabled');
        },


        onTogglePlay: function(){
            this.dispatcher.trigger('music:togglePlayback');
        },

        onRecordEnabled: function(){
            var self = this;
            this.recordUsed = true;
            this.recordImage = '/assets/images/recordEnabled.png';
            this.$('.record').attr('src', this.recordImage);
            this.setSaveEnable(false);
            this.startTimer();
            this.dispatcher.trigger('music:record');
        },

        onRecordDisabled: function(){
            this.recordImage = '/assets/images/recordDisabled.png';
            this.$('.record').attr('src', this.recordImage);
            this.setSaveEnable(true);
            this.stopTimer();
            this.dispatcher.trigger('music:stopRecord');
        },
        
        onPlaybackStarted: function(musicControlStatus){
            if(this.recordUsed) { 
                this.playImage = '/assets/images/stop.png';
                this.$('.play').attr('src', this.playImage);
                this.setSaveEnable(false);
                this.startTimer();
            }
        },

        onPlaybackStopped: function(musicControlStatus){
            var self = this;
            _.delay(function(){
                self.setSaveEnable(true);
                self.playImage = '/assets/images/play.png';
                self.$('.play').attr('src', self.playImage);
                self.stopTimer();
            }, 400);
        },

        setSaveEnable: function(enable){
            if(enable){
                this.$('.save').removeClass('disabled');
            }
            else{
                this.$('.save').addClass('disabled');   
            }
        },

        onSaveClick: function(e){
            if(document.cookie.search('securesocial.user') !== -1){
                this.saveClick();
                this.dispatcher.trigger('login:successful');
            }
            else {
                this.saveClicked = true;
                new LoginView({
                    dispatcher: this.dispatcher
                }).render();
            }
            
        },

        saveClick: function(){
            this.dispatcher.trigger('recorder:upload');
        },

        startTimer: function(){
            var self = this,
                time = 0,
                interval = 100;
        
            this.timerId = setInterval(function(){
                time+=interval;
                self.updateTime(time);
            }, interval);
        },

        stopTimer: function(){
            var self = this;
            _.delay(function(){
                clearInterval(self.timerId);
            }, 80);
        },

        updateTime: function(time){
            if(_.isNumber(time)){
                //TODO: throttle this to every 2/10ths of a second
                var milliseconds = Math.floor((time / 100) % 10);
                if ( milliseconds < 10 ) {
                    milliseconds = milliseconds + '0';
                }
                var seconds = Math.floor((time/1000) % 60);
                if ( seconds < 10 ) {
                    seconds = '0' + seconds;
                }
                var minutes = Math.floor((time/1000) / 60); 
                if ( minutes < 10 ) {
                    minutes = '0' + minutes;
                }
                this.$('.time').html(minutes + ':' + seconds + ':' + milliseconds);
            }
        },

        loginSuccessful: function(){
            if (this.saveClicked){
                this.saveClicked = false;
                this.saveClick();
            }
        }
    });
});
