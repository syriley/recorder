define([],
	function(){
	"use strict";
	
	return Backbone.View.extend({

		className: 'container mainContent',
        recordImage: 'recordDisabled.png',
        playImage: 'play.png',
        globalControlsTemplate: '<div class="row">' +
								'<div class="well span5 offset4">' +
									'<img src="/assets/images/{{recordImage}}" class="btn record" type="button" value="Play" />' +
									'<img src="/assets/images/{{playImage}}" class="btn play" type="button" value="Play" />' +
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

			this.musicControl = options.musicControl;
			this.dispatcher = options.dispatcher;

			this.dispatcher.on('session:updated', this.render, this);

            this.dispatcher.on('trackView:updated', this.render, this);
			this.dispatcher.on('trackCollectionView:trackSelected', this.trackSelected, this);

			this.dispatcher.on('music:playbackStarted', this.onPlaybackStarted, this);
			this.dispatcher.on('music:playbackStopped', this.onPlaybackStopped, this);

			this.dispatcher.on('music:recordEnabled', this.onRecordEnabled, this);
			this.dispatcher.on('music:recordDisabled', this.onRecordDisabled, this);

			this.dispatcher.on('music:progress', this.updateTime, this);

			_(this).bindAll('onTogglePlay', 'onToggleRecord');

		},

		render: function(){

			var globalControlsView = Mustache.render(this.globalControlsTemplate, {
                recordImage: this.recordImage,
                playImage: this.playImage
            });

			this.$el.html(globalControlsView);

			if(this.selectedTrack) {
				var track = this.selectedTrack,
				muteClass = track.get('mute') ? 'label-important' : '',
                soloClass = track.get('solo') ? 'label-important' : '',
				trackControlsView = Mustache.render(this.trackControlsTemplate, {
					muteClass: muteClass, 
					soloClass: soloClass,
					name: track.get('name'),
					pan: track.get('pan'),
					gain: track.get('gain')
				});

				this.$el.append(trackControlsView);
			}
		},

		onToggleRecord: function(){
			this.dispatcher.trigger('music:toggleRecordEnabled')
		},

		onRecordEnabled: function(){
			this.recordImage = 'recordEnabled.png';
			this.render();
		},

		onRecordDisabled: function(){
			this.recordImage = 'recordDisabled.png';
			this.render();
		},
		
		onPlaybackStarted: function(musicControlStatus){
			console.log('playbackStarted');
			this.playImage = 'stop.png';
			this.render();
		},

		onPlaybackStopped: function(musicControlStatus){
			this.playImage = 'play.png';
			this.render();
			
			if(musicControlStatus && musicControlStatus.isRecordEnabled){
				var uploadView = new UploadView({dispatcher:this.dispatcher});
				uploadView.render();
			}
		},

		onTogglePlay: function(){
			this.dispatcher.trigger('music:togglePlayback');
		},
    
    	trackSelected: function(track){
			console.log('track selected', track);
			this.selectedTrack = track;
            this.render();
		},

		changeVolume: function(volume){
			this.selectedTrack.set({gain: volume});
		},

		changePan: function(pan){
			this.selectedTrack.set({pan: pan});
		},

		updateTime: function(time){
			if(_.isNumber(time)){
				//TODO: throttle this to every 2/10ths of a second
				var milliseconds = Math.floor(time % 100);
		        if ( milliseconds < 10 ) {
		            milliseconds = '0' + milliseconds;
		        }
		        var seconds = Math.floor((time/1000) % 60);
		        if ( seconds < 10 ) {
		            seconds = '0' + seconds;
		        }
		        var minutes = Math.floor((time/1000) / 60); 
		        if ( minutes < 10 ) {
		            minutes = '0' + minutes;
		        }
		        $('#time').html(minutes + ':' + seconds + ':' + milliseconds);
		    }
		}
	});
});
