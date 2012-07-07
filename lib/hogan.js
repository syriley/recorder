module.exports = {
    init: function(hogan) {
        'use strict';
        return {
            compile: function(source){
                var compiled = hogan.compile(source);
                return function(options) {
                    if(options.body){
                        options['yield'] = options.body;
                    }
                    return compiled.render(options);
                };
            }
        };
    }
};