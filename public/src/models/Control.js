define(['src/MusicControl'],
function(MusicControl){
    "use strict";

	return Backbone.Model.extend({

		initialize: function(options){
			if(!options || !options.dispatcher){
				throw new Error('options.dispatcher must be set!');
			}
			var dispatcher = this.dispatcher = options.dispatcher,
				
		}
	});
});
