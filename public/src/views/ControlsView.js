define([],
	function(){
	"use strict";
	
	return Backbone.View.extend({

		className: 'container mainContent',
        recordImage: '/assets/images/recordDisabled.png',
        playImage: '/assets/images/play.png',
        globalControlsTemplate: '<div class="row">' +
								'<div class="well span5 offset4">' +
									'<img src="{{recordImage}}" class="btn record" type="button" value="Play" />' +
									'<img src="{{playImage}}" class="btn play" type="button" value="Play" />' +
									'<span class="time">00:00:00</span>' +
									'<a href="#" class="btn btn-primary btn-large save pull-right">Save</a>' +
								'</div>' +
							'</div>',

		events: function(){
			return {
                'click .record' : 'onToggleRecord',
				'click .play' : 'onTogglePlay'
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

			this.dispatcher.on('music:stop', this.onPlaybackStopped, this);

			_(this).bindAll('onTogglePlay', 'onToggleRecord');

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

		onRecordEnabled: function(){
			var self = this;
			this.recordImage = '/assets/images/recordEnabled.png';
			this.$('.record').attr('src', this.recordImage);
			this.startTimer();
		},

		onRecordDisabled: function(){
			this.recordImage = '/assets/images/recordDisabled.png';
			this.$('.record').attr('src', this.recordImage);
			this.stopTimer();
		},
		
		onPlaybackStarted: function(musicControlStatus){
			this.playImage = '/assets/images/stop.png';
			this.$('.play').attr('src', this.playImage);
			this.startTimer();
		},

		onPlaybackStopped: function(musicControlStatus){

			this.playImage = '/assets/images/play.png';
			this.$('.play').attr('src', this.playImage);
			this.stopTimer();
		},

		onTogglePlay: function(){
			this.dispatcher.trigger('music:togglePlayback');
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
		}
	});
});
