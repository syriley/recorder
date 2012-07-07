define([],
function(){
	"use strict";
	
	return Backbone.View.extend({

		className: 'navbar navbar-fixed-top',
		template: '<div class="navbar navbar-fixed-top">' +
				      '<div class="navbar-inner">' +
				        '<div class="container">' +
				          '<button type="button" class="btn btn-navbar" data-toggle="collapse" data-target=".nav-collapse">' +
				            '<span class="icon-bar"></span>' +
				            '<span class="icon-bar"></span>' +
				            '<span class="icon-bar"></span>' +
				          '</button>' +
				          '<a class="brand" href="./index.html">Recorder</a>' +
				          '<div class="nav-collapse collapse">' +
				            '<ul class="nav">' +
				              '<li class="">' +
				                '<a href="http://tuner.9dials.com" target="_blank">Tuner</a>' +
				              '</li>' +
				              '<li class="">' +
				                '<a href="http://studio.9dials.com" target="_blank">Studio</a>' +
				              '</li>' +
				              '</ul>' +
				          '</div>' +
				        '</div>' +
				      '</div>' +
				    '</div>',

		events: function(){
			return {
                
			};
		},

		initialize: function(options){
			if(!options || !options.dispatcher){
				throw new Error('options.dispatcher must be set!');
			}

			this.dispatcher = options.dispatcher;
			
		},

		render: function(){
			var view = Mustache.render(this.template);
			return this.$el.html(view);
		}
	});
});