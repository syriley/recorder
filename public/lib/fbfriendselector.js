/*jslint devel: true, bitwise: false, undef: false, browser: true, continue: false, debug: false, eqeq: false, es5: false, type: false, evil: false, vars: false, forin: false, white: true, newcap: false, nomen: true, plusplus: false, regexp: true, sloppy: true */
/*globals jQuery, FB */

/*!
 * Originated from These Days Friend Selector
 * Adapted by Craig Saunders
 * @authors: Bram Verdyck, Keegan Street, Craig Saunders
 */
var FBFriendSelector = (function(module, $) {

	// Public functions
	var init, setFriends, getFriends, getFriendById, newInstance,

	// Private variables
	settings, friends,
	$friends, $container, $friendsContainer, $searchField, $selectedCount, $selectedCountMax, $currentPageNumSpan, $totalPagesSpan, $previousPage, $nextPage, $buttonClose, $buttonOK,

	// Private functions
	$getFriendById, buildFriendSelector, sortFriends, log;

	/////////////////////////////////////////
	// PUBLIC FUNCTIONS FOR GLOBAL PLUGIN
	// They are public because they are added to module and returned
	/////////////////////////////////////////

	/**
	 * Initialise the plugin and define global options
	 */
	init = function(options) {

		// Default settings
		settings = {
			speed                    : 500,
			debug                    : false,
			textSelect               : 'select',
			disabledClass            : 'FBFriendSelector_disabled',
			friendSelectedClass      : 'friend_selected',
			friendDisabledClass      : 'FBFriendSelector_friendDisabled',
			friendFilteredClass      : 'FBFriendSelector_friendFiltered',
			containerSelector        : '#FBFriendSelector',
			friendsContainerSelector : '.FBFriendSelector_friendsContainer',
			searchFieldSelector      : '#FBFriendSelector_searchField',
			selectedCountSelector    : '.FBFriendSelector_selectedCount',
			selectedCountMaxSelector : '.FBFriendSelector_selectedCountMax',
			pageNumberSelector       : '#FBFriendSelector_pageNumber',
			pageNumberTotalSelector  : '#FBFriendSelector_pageNumberTotal',
			pagePrevSelector         : '#FBFriendSelector_pagePrev',
			pageNextSelector         : '#FBFriendSelector_pageNext',
			buttonCloseSelector      : '#FBFriendSelector_buttonClose',
			buttonOKSelector         : '#FBFriendSelector_buttonOK'
		};

		// Override defaults with arguments
		$.extend(settings, options);

		// Select DOM elements
		$container        = $(settings.containerSelector);

		
		$dialogDiv = $( document.createElement('div') );
        $formDiv = $( document.createElement('div') );
        
        // Header
        
        $dialogHeader = $('<div/>', {
            "class": "FBFriendSelector_header",
            html: "<p>Select your friends</p>"
        });
        
        $buttonClose = $('<a/>', {
            href: "#",
            text: "x"
        });
        
        // Content
        
        $dialogContent = $('<div/>', {
            "class": "FBFriendSelector_content"
        });
		
		$searchDiv = $('<div/>', {
		  "class": "FBFriendSelector_searchContainer FBFriendSelector_clearfix"
		});
		
		
		// -- Selected stats & Search container
		
		$selectedStatsContainer = $( document.createElement('span') );
		$selectedCount = $('<span/>', {
            "class": "FBFriendSelector_selectedCount",
            text: 0
        });
		
        $selectedCountMax = $('<span/>', {
            "class": "FBFriendSelector_selectedCountMax",
            text: 0,
        });
        
        $maxSelectionSpan = $('<span/>', {
            text: " / "
        });

        $maxSelectionSpan.append($selectedCountMax);
        
        $selectedStatsContainer.append($selectedCount);
        $selectedStatsContainer.append($maxSelectionSpan);
        $selectedStatsContainer.append(' friends selected');
        
        $searchFieldWrapper = $('<div/>', {}
        );
        
        $filterRemoveLabel = $('<label/>', {
            class: "FBFriendSelector_removeSearchFilter"
        });

        $searchField = $('<input type="text" placeholder="Search friends" id="FBFriendSelector_searchField" />');
        
        $searchFieldWrapper.append($filterRemoveLabel);
        $searchFieldWrapper.append($searchField);
        
        $searchDivTable = $('<table/>', {
            "class": "FBFriendSelector_topTable"
        });
        
        $searchDivTableTr = $('<tr/>');
        $searchDivTableTrTd1 = $('<td/>');
        $searchDivTableTrTd2 = $('<td/>');
        
        $searchDivTableTrTd1.append($selectedStatsContainer);
        $searchDivTableTrTd2.append($searchFieldWrapper);
        
        $searchDivTable.append($searchDivTableTr);
        $searchDivTableTr.append($searchDivTableTrTd1, $searchDivTableTrTd2);
        
        $searchDiv.append($searchDivTable);
        
        // -- Friends container
        
        $friendsContainerDiv = $('<div/>', {
            "class": "FBFriendSelector_friendsContainer FBFriendSelector_clearfix"
        });
        
        $friendsContainer = $('<ul />');
        
        $friendsContainerDiv.append($friendsContainer);
        
        // -- Append to content div 
                
        $dialogContent.append($searchDiv);
        $dialogContent.append($friendsContainerDiv);
        
        // Footer
        $dialogFooter = $('<div/>', {
            "class": "FBFriendSelector_footer FBFriendSelector_clearfix"
        }); 
        
        
		
/* 		$dialogFooter.append('<div class="FBFriendSelector_pageNumberContainer">'); */
/* 		$dialogFooter.append('Page <span id="">1</span> / <span id="">1</span>'); */

        $buttonOK = $('<a/>', {
            href: "#",
            text: "Done!",
            id: "FBFriendSelector_buttonOK"
        });
        

		$dialogFooter.append($buttonOK);
        
        $formDiv.append($dialogHeader);
        $formDiv.append($dialogContent);
        $formDiv.append($dialogFooter);

        $dialogDiv.append($buttonClose);
        $dialogDiv.append($formDiv);
        
		
		$container.append($dialogDiv);
		
	};

	/**
	 * If your website has already loaded the user's Facebook friends, pass them in here to avoid another API call.
	 */
	setFriends = function(input) {
		var i, len;
		if (!input || input.length === 0) {
			return;
		}
		input = Array.prototype.slice.call(input);
		for (i = 0, len = input.length; i < len; i += 1) {
			input[i].upperCaseName = input[i].name.toUpperCase();
		}
		input = input.sort(sortFriends);
		friends = input;
	};

	getFriends = function() {
		return friends;
	};

	/**
	 * Use this function if you have a friend ID and need to know their name
	 */
	getFriendById = function(id) {
		var i, len;
		id = id.toString();
		for (i = 0, len = friends.length; i < len; i += 1) {
			if (friends[i].id === id) {
				return friends[i];
			}
		}
		return null;
	};

	/**
	 * Create a new instance of the friend selector
	 * @param options An object containing settings that are relevant to this particular instance
	 */
	newInstance = function(options) {
		// Public functions
		var showFriendSelector, hideFriendSelector, getselectedFriendIds, setDisabledFriendIds, filterFriends, reset,

		// Private variables
		instanceSettings, selectedFriendIds = [], disabledFriendIds = [], numFilteredFriends = 0, loadCount = 1, batchImageSize = 33, cachedLoadCount = 0,

		// Private functions
		bindEvents, unbindEvents, updateFriendsContainer, selectFriend;

		if (!settings) {
			log('Cannot create a new instance of FBFriendSelector because the plugin not initialised.');
			return false;
		}

		// Default settings
		instanceSettings = {
			maxSelection             : false,
			friendsPerPage           : 10,
			autoDeselection          : false, // Allow the user to keep on selecting once they reach maxSelection, and just deselect the first selected friend
			filterCharacters         : 2, // Set to 3 if you would like the filter to only run after the user has typed 3 or more chars
			callbackFriendSelected   : null,
			callbackFriendUnselected : null,
			callbackMaxSelection     : null,
			callbackSubmit           : null
		};

		// Override defaults with arguments
		$.extend(instanceSettings, options);


		/////////////////////////////////////////
		// PUBLIC FUNCTIONS FOR AN INSTANCE
		/////////////////////////////////////////

		/**
		 * Call this function to show the interface
		 */
		showFriendSelector = function(callback) {
			var i, len;
			log('FBFriendSelector - newInstance - showFriendSelector');
			if (!$friends) {
				return buildFriendSelector(batchImageSize, function() {
					showFriendSelector(callback);
				});
			} else {
				bindEvents();
				// Update classnames to represent the selections for this instance
				$("a", $friends).removeClass(settings.friendSelectedClass + ' ' + settings.friendDisabledClass + ' ' + settings.friendFilteredClass);
				$("a div input", $friends).removeAttr('checked');
				for (i = 0, len = friends.length; i < len; i += 1) {
					if ($.inArray(friends[i].id, selectedFriendIds) !== -1) {
						$("#friend" + friends[i].id).addClass(settings.friendSelectedClass);
						$("#friend" + friends[i].id + " div input").attr('checked', true);
					}
					if ($.inArray(friends[i].id, disabledFriendIds) !== -1) {
						$("#friend" + friends[i].id).addClass(settings.friendDisabledClass);
					}
				}
				// Reset filtering
				numFilteredFriends = 0;
				$searchField.val("");
				// Update paging
				$selectedCount.html(selectedFriendIds.length);
				
			     
				
				if (instanceSettings.maxSelection !== false) {
				    $maxSelectionSpan.show();
				} else {
				    $maxSelectionSpan.hide();				
				}
				
				$selectedCountMax.html(instanceSettings.maxSelection);
				updateFriendsContainer();
				
				$container.fadeIn(500);
				if (typeof callback === 'function') {
					callback();
				}
			}
		};

		hideFriendSelector = function() {
			unbindEvents();
			$container.fadeOut(500);
		};

		getselectedFriendIds = function() {
			return selectedFriendIds;
		};

		/**
		 * Disabled friends are greyed out in the interface and are not selectable.
		 */
		setDisabledFriendIds = function(input) {
			disabledFriendIds = input;
		};

		/**
		 * Hides friends whose names do not match the filter
		 */
		filterFriends = function(filter) {
		
			var i, len;
			numFilteredFriends = 0;
			$friends.removeClass(settings.friendFilteredClass);
					
			if (filter.length >= instanceSettings.filterCharacters) {
			 
                if (loadCount != 1) {
                    cachedLoadCount = loadCount;
                    loadCount = 0;
                }
			
				filter = filter.toUpperCase();
				for (i = 0, len = friends.length; i < len; i += 1) {
					if (friends[i].upperCaseName.indexOf(filter) === -1) {
						$($friends[i]).addClass(settings.friendFilteredClass);
						numFilteredFriends += 1;
					}
				}
			}
			
			if (filter == '' & cachedLoadCount != 0) {
                $friendsContainerDiv.animate({
                    scrollTop:0
                }, 800);
                loadCount = 1;
            }
            
			updateFriendsContainer();
/* 			updatePaginationButtons(1); */
			loadFriendImages(loadCount, batchImageSize);
			
		
		};

		/**
		 * Remove selections, clear disabled list, go to page 1, etc
		 */
		reset = function() {
			if (!friends || friends.length === 0) {
				return;
			}
			$friendsContainer.empty();
			selectedFriendIds = [];
			$selectedCount.html("");
			disabledFriendIds = [];
			numFilteredFriends = 0;
			$searchField.val("");
/* 			updatePaginationButtons(1); */
		};

		/////////////////////////////////////////
		// PRIVATE FUNCTIONS FOR AN INSTANCE
		/////////////////////////////////////////

		// Add event listeners
		bindEvents = function() {
		
			$buttonClose.bind('click', function(e) {
				e.preventDefault();
				hideFriendSelector();
			});

			$buttonOK.bind('click', function(e) {
				e.preventDefault();
				hideFriendSelector();
				if (typeof instanceSettings.callbackSubmit === "function") { instanceSettings.callbackSubmit(selectedFriendIds); }
			});

			$searchField.bind('keyup', function(e) {
				filterFriends($(this).val());
			});

			// The enter key shouldnt do anything in the search field
			$searchField.bind('keydown', function(e) {
				if (e.which === 13) {
					e.preventDefault();
					e.stopPropagation();
				}
			});

			$(window).bind('keydown', function(e) {
				if (e.which === 13) {
					// The enter key has the same effect as the OK button
					e.preventDefault();
					e.stopPropagation();
					hideFriendSelector();
					if (typeof instanceSettings.callbackSubmit === "function") { instanceSettings.callbackSubmit(selectedFriendIds); }
				} else if (e.which === 27) {
					// The escape key has the same effect as the close button
					e.preventDefault();
					e.stopPropagation();
					hideFriendSelector();
				}
			});
			
			$filterRemoveLabel.bind('click', function(e) {
                if ($searchField.val() != '') { 
                    $searchField.val('');
                    filterFriends('');
                }
			});
			
			$friendsContainerDiv.scroll(function() {             
                if ($(this).scrollTop() > 320 * loadCount) {
                    start = loadCount * batchImageSize;
                    loadCount++;
                    end = loadCount * batchImageSize;
                                        
                    if (start < friends.length) {
                        loadFriendImages(start, end);
                    }
                }
			});
		};

		// Remove event listeners
		unbindEvents = function() {
			$buttonClose.unbind('click');
			$buttonOK.unbind('click');
			$friendsContainer.children().unbind('click');
			$filterRemoveLabel.unbind('click');
			$searchField.unbind('keyup');
			$searchField.unbind('keydown');
			$(window).unbind('keydown');
		};

		// Set the contents of the friends container
		updateFriendsContainer = function() {
			$friendsContainer.html($friends.not("." + settings.friendFilteredClass));
			$("li a", $friendsContainer).bind('click', function(e) {
				e.stopPropagation();
				selectFriend($(this));
			});
			
		};

		selectFriend = function($friend) {
		           
			var friendId, i, len, removedId;
			$checkbox = $("div input", $friend) 
			friendId = $checkbox.val();//.attr('data-id');        
               
    		// If the friend is disabled, ignore this
			if ($friend.hasClass(settings.friendDisabledClass)) {
				return;
			}

			if (!$friend.hasClass(settings.friendSelectedClass)) {
				// If autoDeselection is enabled and they have already selected the max number of friends, deselect the first friend
				if (instanceSettings.autoDeselection && selectedFriendIds.length === instanceSettings.maxSelection) {
				    				    
					removedId = selectedFriendIds.splice(0, 1);
					$deselectedFriend = $getFriendById(removedId);
					$deselectedFriend.removeClass(settings.friendSelectedClass);
					$("div input", $deselectedFriend).removeAttr('checked');
					$selectedCount.html(selectedFriendIds.length);
				}
				
				if (!instanceSettings.maxSelection || selectedFriendIds.length < instanceSettings.maxSelection) {
					// Add friend to selectedFriendIds
					if ($.inArray(friendId, selectedFriendIds) === -1) {
						selectedFriendIds.push(friendId);
						$friend.addClass(settings.friendSelectedClass);
                        $checkbox.attr('checked', true);
						$selectedCount.html(selectedFriendIds.length);
						log('FBFriendSelector - newInstance - selectFriend - selected IDs: ', selectedFriendIds);
						if (typeof instanceSettings.callbackFriendSelected === "function") { instanceSettings.callbackFriendSelected(friendId); }
					} else {
						log('FBFriendSelector - newInstance - selectFriend - ID already stored');
					}
				}

			} else {
				// Remove friend from selectedFriendIds
				for (i = 0, len = selectedFriendIds.length; i < len; i += 1) {
					if (selectedFriendIds[i] === friendId) {
						selectedFriendIds.splice(i, 1);
						$friend.removeClass(settings.friendSelectedClass);
						$checkbox.removeAttr('checked');
						$selectedCount.html(selectedFriendIds.length);
						if (typeof instanceSettings.callbackFriendUnselected === "function") { instanceSettings.callbackFriendUnselected(friendId); }
						return false;
					}
				}
			}

			if (instanceSettings.maxSelection && selectedFriendIds.length === instanceSettings.maxSelection) {
				if (typeof instanceSettings.callbackMaxSelection === "function") { instanceSettings.callbackMaxSelection(); }
			}
			
			

		};

		// Return an object with access to the public members
		return {
			showFriendSelector   : showFriendSelector,
			hideFriendSelector   : hideFriendSelector,
			getselectedFriendIds : getselectedFriendIds,
			setDisabledFriendIds : setDisabledFriendIds,
			filterFriends        : filterFriends,
			reset                : reset
		};
	};

	/////////////////////////////////////////
	// PRIVATE FUNCTIONS FOR GLOBAL PLUGIN
	/////////////////////////////////////////

	$getFriendById = function(id) {
		var i, len;
		id = id.toString();
		
/* 		console.log(friends); */
		
		for (i = 0, len = friends.length; i < len; i += 1) {
			if (friends[i].id === id) {
				return $("#friend" + id);
			}
		}
		return $("");
	};

	/**
	 * Load the Facebook friends and build the markup
	 */
	buildFriendSelector = function(batchImageSize, callback) {
		var buildMarkup, buildFriendMarkup;
		log("buildFriendSelector");

		if (!FB) {
			log('The Facebook SDK must be initialised before showing the friend selector');
			return false;
		}

		// Check that the user is logged in to Facebook
		FB.getLoginStatus(function(response) {
            
            log("Login status" + response.status);
		
			if (response.status === 'connected') {
				// Load Facebook friends
				FB.api('/me/friends?fields=id,name', function(response) {
					if (response.data) {
						setFriends(response.data);
						// Build the markup
						buildMarkup();
						// Call the callback
						if (typeof callback === 'function') { callback(); }
					} else {
						log('FBFriendSelector - buildFriendSelector - No friends returned');
						return false;
					}
				});
			} else {
				log('FBFriendSelector - buildFriendSelector - User is not logged in to Facebook');
				return false;
			}
		});

		// Build the markup of the friend selector
		buildMarkup = function() {
			var i, len, html = '', loadImage = true;
			for (i = 0, len = friends.length; i < len; i += 1) {
                
                (i > batchImageSize) ? loadImage = false : loadImage = true;
				html += buildFriendMarkup(friends[i], loadImage);
			}
			$friends = $(html);
		};

		// Return the markup for a single friend
		buildFriendMarkup = function(friend, loadImage) {
/*
			return '<a href="#" class="FBFriendSelector_friend FBFriendSelector_clearfix" data-id="' + friend.id + '">' +
					'<img src="//graph.facebook.com/' + friend.id + '/picture?type=square" width="50" height="50" alt="' + friend.name + '" class="FBFriendSelector_friendAvatar" />' +
					'<div class="FBFriendSelector_friendName">' + 
						'<span>' + friend.name + '</span>' +
						'<span class="FBFriendSelector_friendSelect">' + settings.textSelect + '</span>' +
					'</div>' +
				'</a>';
				
*/
            
            if (loadImage == true) {
                imgSrc = '//graph.facebook.com/' + friend.id + '/picture?type=square';
                classText = ' class="img_loaded"';
            } else {
                imgSrc = '/images/no-face.png';
                classText = '';
            }
            
            return '<li ' + classText + '><a href="#" class="clearfix" id="friend' + friend.id + '"><div><img src="' + imgSrc + '" width="30" height="30" alt="' + friend.name + '" class="FBFriendSelector_friendAvatar" /><input type="checkbox" name="friends[' + friend.id + ']" value="' + friend.id + '" /><div>' + friend.name + '</div></div></a></li>';
            
		};
	};
	
	loadFriendImages = function(start, end) {
	
        $(".FBFriendSelector_friendsContainer ul li").slice(start, end).each(function(index) {
        
            if (!$(this).hasClass("img_loaded")) {
            
                $user_div = $("a div", this);
                $("img", $user_div).attr("src", '//graph.facebook.com/' + $("input", $user_div).val() + '/picture?type=square');
                $(this).addClass("img_loaded");            
            }
            
        });
	
	}

	sortFriends = function(friend1, friend2) {
		if (friend1.upperCaseName === friend2.upperCaseName) { return 0; }
		if (friend1.upperCaseName > friend2.upperCaseName) { return 1; }
		if (friend1.upperCaseName < friend2.upperCaseName) { return -1; }
	};

	log = function() {
		if (settings && settings.debug && window.console) {
			console.log(Array.prototype.slice.call(arguments));
		}
	};

	module = {
		init          : init,
		setFriends    : setFriends,
		getFriends    : getFriends,
		getFriendById : getFriendById,
		newInstance   : newInstance
	};
	return module;

}(FBFriendSelector || {}, jQuery));
