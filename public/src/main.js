require([
            'src/views/MainContainerView'
        ],
        function(MainContainerView, Tuna, TunaView) {
    "use strict";
   
    var daww = window.daww,
        dispatcher = _.clone(Backbone.Events),
        mainContainerView = new MainContainerView({dispatcher: dispatcher});
       
    $('#main').append(mainContainerView.el);

    mainContainerView.render();
});
