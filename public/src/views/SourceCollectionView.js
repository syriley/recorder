define([
        'src/models/SourceCollection',
        'src/views/SourceView'
    ],
    function(SourceCollection, SourceView){
    'use strict';
    
    return Backbone.View.extend({
        tagName: 'table',
        className: 'table span8',
        template: '<h1>it Works</h1>',

        initialize: function(options){
            if(!options.dispatcher){
                throw new Error('options.dispatcher must be set!');
            }

            var dispatcher = this.dispatcher = options.dispatcher,
                collection = this.collection = options.collection || new SourceCollection();
             
            _.bindAll(this, "render");
            dispatcher.on('login:successful', this.getSources, this);
            dispatcher.on('source:remove', this.destroySource, this);
            
        },

        render: function(){
            var self = this;
            this.$el.empty();
            this.collection.each(function(source){
                self.addOne(source);
            });
            soundManager.onready(function() {
                inlinePlayer = new InlinePlayer();
            });

        },

        addOne: function(model){
             var sourceView = new SourceView({dispatcher: this.dispatcher, model: model})  
                sourceView.render()  
                this.$el.append(sourceView.el)  
        },

        getSources: function(){
            var self = this;
            this.collection.fetch({
                error: function(e){
                    console.log('error', e);
                },
                success: function(){
                    self.render();
                }
            });
        },

        destroySource: function(sourceId){
            _.each(this.collection.models, function(model){
                if(model.get('id') == sourceId) {
                    console.log('removing', model);
                    model.destroy();
                }
            });
            this.render();
        }

    });
});
