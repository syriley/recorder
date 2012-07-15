define(['src/models/Source'], function(Source){
    "use strict";

	return Backbone.Collection.extend({
		url: 'api/sources',
        model: Source		
	});
});