define(['src/views/modals/RemoveView'
    ],
    function(RemoveView){
    'use strict';
    
    return Backbone.View.extend({
        tagName: 'tr',
        template:   '<td>' +
                                    '<h2 class="span2">{{name}}</h2>' +
                                '</td>' +
                                '<td>' +
                                    '<div class="btn-toolbar">' +
                                        '<div class="btn-group">' +
                                            '<a href="http://sources.9dials.com/{{fileName}}" class="btn inline-playable">Play</a>' +
                                            '<a class="btn dropdown-toggle" data-toggle="dropdown" href="#">' + 
                                                'Share' +
                                                '<span class="caret"></span>' +
                                            '</a>' +
                                            '<ul class="dropdown-menu">' +
                                                '<li><a>Post to your wall</a></li>' +
                                                '<li><a>Post to someone else\'s wall</a></li>' +
                                                '<li><a>Send as a message</a></li>' +
                                            '</ul>' +
                                        '</div>' +
                                        '<button type="button" class="close remove" data-dismiss="modal">×</button>' +
                                    '</div>' +
                                '</td>',

        events: function(){
            return  {
                        'click .remove' : 'removeSource' 
                    }
        },

        initialize: function(options){
            if(!options.dispatcher){
                throw new Error('options.dispatcher must be set!');
            }
            

            this.dispatcher = options.dispatcher;
            
        },


        render: function(){
            var view = Mustache.render(this.template, this.model.attributes);
            this.$el.html(view);
        },

        removeSource: function(){
            new RemoveView({
                dispatcher: this.dispatcher,
                sourceId: this.model.get('id')
            }).render();
        }
    });
});
