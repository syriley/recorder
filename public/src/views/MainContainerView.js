define([
    'src/views/ControlsView',
    'src/views/HeaderView',
    'src/views/modals/HelpView',
    'src/MusicControl'
],
function(controlsView, HeaderView, HelpView, MusicControl){
    "use strict";
    return Backbone.View.extend({
        className: 'container',
        headerTemplate: '<a href="#" class="btn help span1 pull-right">Help</a>' 
                            
                        ,
        bookmarkingTemplate:
                    '<div class="row">' +
                        '<div class="span4 offset4">' +
                            '<div class="fb-like" data-href="http://recorder.9dials.com" data-send="true" data-width="450" data-show-faces="false" data-font="trebuchet ms"></div>' +
                        '</div>' +
                      '</div>' +
                      '<div class="row">' +
                        '<div class="span4 offset4">' +
                            '<!-- AddThis Button BEGIN -->' +
                            '<div class="addthis_toolbox addthis_default_style ">' +
                                '<a class="addthis_button_tweet"></a>' +
                                '<a class="addthis_button_pinterest_pinit"></a>' +
                                '<a class="addthis_counter addthis_pill_style"></a>' +
                            '</div>' +
                            '<script type="text/javascript" src="http://s7.addthis.com/js/250/addthis_widget.js#pubid=xa-4ff69ce207cc50a9"></script>' +
                            '<!-- AddThis Button END -->' +
                        '</div>' +
                    '</div>',

        events: {
            'click .help' : 'onHelpClick'
        },

        initialize: function(options){
            if(!options.dispatcher){
                throw new Error('options.dispatcher must be set!');
            }
            var dispatcher = this.dispatcher = options.dispatcher;
            this.lastActivated = new Date();

            this.headerView = new HeaderView({
                dispatcher:dispatcher
            });

            this.controlsView = new controlsView({
                dispatcher: dispatcher,
                musicControl: new MusicControl({
                    dispatcher: dispatcher
                })
            });   

            this.dispatcher.on('tuner:wakeup', this.tunerWakeup, this);
        },

        render: function(){
            var $el = this.$el,
                controlsView = this.controlsView,
                headerView = this.headerView,
                bookmarkingEl = Mustache.render(this.bookmarkingTemplate, {}),
                headerEl = Mustache.render(this.headerTemplate, {});
            
            headerView.render();
            controlsView.render();

            $el.append(headerView.$el)
            $el.append(headerEl);
            $el.append(controlsView.$el);
            $el.append(bookmarkingEl);
        },

        onHelpClick: function(){
            new HelpView({dispatcher: this.dispatcher})
                .render();
        },
    });
});