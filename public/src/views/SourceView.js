define([
    ],
    function(){
    'use strict';
    
    return Backbone.View.extend({
        className: 'row',
        template:   '<h2 class="span2 offset2"><a href="/{{id}}" target="_blank">{{name}}</a></h2>' +
                    '<a class="btn">Play</a>' +
                    '<a class="btn">Post to your wall</a>' +
                    '<a class="btn">Post to someone else\'s wall</a>' +
                    '<a class="btn">Send as a message</a>',

        render: function(){
            var view = Mustache.render(this.template, this.model.attributes);
            this.$el.html(view);
        }
    });
});
