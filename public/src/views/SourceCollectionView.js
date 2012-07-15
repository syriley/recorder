define([
        'src/models/SourceCollection',
        'src/views/SourceView'
    ],
    function(SourceCollection, SourceView){
    'use strict';
    
    return Backbone.View.extend({
        className: 'container',
        template: '<h1>it Works</h1>',

        initialize: function(options){
            if(!options.dispatcher){
                throw new Error('options.dispatcher must be set!');
            }

            var dispatcher = this.dispatcher = options.dispatcher,
                collection = this.collection = options.collection || new SourceCollection();
             
            _.bindAll(this, "render");
            dispatcher.on('login:successful', this.getSources, this);
        },

        render: function(){
            var self = this;
            this.collection.each(function(source){
                self.addOne(source);
            });
        },

        addOne: function(model){
             var sourceView = new SourceView({model: model})  
                sourceView.render()  
                this.$el.append(sourceView.el)  
        },

        getSources: function(){
            var self = this;
            this.collection.fetch({
                error: function(){
                    console.log('error');
                },
                success: function(){
                    self.render();
                }
            });
        }

    });
});
