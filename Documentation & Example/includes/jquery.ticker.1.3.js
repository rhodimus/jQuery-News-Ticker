(function($){  
	$.fn.ticker = function(options) { 
		// Extend our default options with those provided.
		// Note that the first arg to extend is an empty object -
		// this is to keep from overriding our "defaults" object.
		var opts = $.extend({}, $.fn.ticker.defaults, options); 		
		
		/* Get the id of the UL to get our news content from */
		var newsID = '#' + $(this).attr('id');

		/* Get the tag type - we will check this later to makde sure it is a UL tag */
		var tagType = $(this).attr('tagName'); 	
		
		return this.each(function() { 
			/* Internal vars */
			var settings = {				
				position: 0,
				time: 0,
				distance: 0,
				newsArr: {},
				play: true,
				paused: false,
				contentLoaded: false,
				dom: {
					contentID: '#ticker-content',
					titleID: '#ticker-title',
					titleElem: '#ticker-title SPAN',
					tickerID : '#ticker',
					wrapperID: '#ticker-wrapper',
					revealID: '#ticker-swipe',
					revealElem: '#ticker-swipe SPAN',
					controlsID: '#ticker-controls',
					prevID: '#prev',
					nextID: '#next',
					playPauseID: '#play-pause'
				}
			};
			
			// if we are not using a UL, display an error message and stop any further execution
			if (tagType != 'UL' && opts.htmlFeed === true) {
				debugError('Cannot use <' + tagType.toLowerCase() + '> type of element for this plugin - must of type <ul>');
				return false;
			}

			// lets go...
			initialisePage();
			/* Function to get the size of an Object*/
			function countSize(obj) {
			    var size = 0, key;
			    for (key in obj) {
			        if (obj.hasOwnProperty(key)) size++;
			    }
			    return size;
			};
			/* Function for handling debug and error messages */ 
			function debugError(obj) {
				if (opts.debugMode) {
					if (window.console && window.console.log) {
						window.console.log(obj);
					}
					else {
						alert(obj);			
					}
				}
			}
			/* Function to setup the page */
			function initialisePage() {
				// add our HTML structure for the ticker to the DOM
				$(settings.dom.wrapperID).append('<div id="' + settings.dom.tickerID.replace('#', '') + '"><div id="' + settings.dom.titleID.replace('#', '') + '"><span style="display: none;"><!-- --></span></div><p id="' + settings.dom.contentID.replace('#', '') + '"></p><div id="' + settings.dom.revealID.replace('#', '') + '"><span style="display: none;"><!-- --></span></div></div>');
				$(settings.dom.wrapperID).removeClass('no-js').addClass('has-js');
				// hide the ticker
				$(settings.dom.tickerElem + ',' + settings.dom.titleElem + ',' + settings.dom.contentID).hide();
				// add the controls to the DOM if required
				if (opts.controls) {
					// add related events - set functions to run on given event
					$(settings.dom.controlsID)
						.live('click', function (e) {
							var button = e.target.id;
							switch (button) {
							case settings.dom.prevID.replace('#', ''):
								// show previous item
								settings.paused = true;
								$(settings.dom.playPauseID).addClass('paused');
								changeContent(button);
								break;
							case settings.dom.nextID.replace('#', ''):
								// show next item
								settings.paused = true;
								$(settings.dom.playPauseID).addClass('paused');
								changeContent(button);
								break;
							case settings.dom.playPauseID.replace('#', ''):
								// play or pause the ticker
								if (settings.play == true) {
									settings.paused = true;
									$(settings.dom.playPauseID).addClass('paused');
									pauseTicker();
								}
								else {
									settings.paused = false;
									$(settings.dom.playPauseID).removeClass('paused');
									restartTicker();
								}
								break;
							}	
						})
						.live('mouseover', function (e) {
							var button = e.target.id;
							if ($('#' + button).hasClass('controls')) {
								$('#' + button).addClass('over');								
							}
						})
						.live('mousedown', function (e) {
							var button = e.target.id;
							if ($('#' + button).hasClass('controls')) {
								$('#' + button).addClass('down');						
							}
						})
						.live('mouseout', function (e) {
							var button = e.target.id;			
							if ($('#' + button).hasClass('controls')) {
								$('#' + button).removeClass('over');							
							}
						})
						.live('mouseup', function (e) {
							var button = e.target.id;		
							if ($('#' + button).hasClass('controls')) {
								$('#' + button).removeClass('down');							
							}
						});
					// add controls HTML to DOM
					$(settings.dom.wrapperID).append('<ul id="' + settings.dom.controlsID.replace('#', '') + '"><li id="' + settings.dom.playPauseID.replace('#', '') + '" class="controls"></li><li id="' + settings.dom.prevID.replace('#', '') + '" class="controls"></li><li id="' + settings.dom.nextID.replace('#', '') + '" class="controls"></li></ul>');
				}
				// add mouse over on the content
				$(settings.dom.contentID).mouseover(function () {
					if (settings.paused == false) {
						pauseTicker();
					}
				}).mouseout(function () {
					if (settings.paused == false) {
						restartTicker();
					}
				});
				// start the first ticker item
				updateTicker();
			}
			/* Start the ticker */
			function updateTicker() {	
				// check to see if we need to load content
				if (settings.contentLoaded == false) {
					// construct content
					if (opts.ajaxFeed) {
						// to do - add ajax options (json, remote url)
						debugError('Code Me!');
					}
					else if (opts.htmlFeed) { 
						if($(newsID + ' LI').length > 0) {
							$(newsID + ' LI').each(function (i) {	
								// maybe this could be one whole object and not an array of objects?
								settings.newsArr['item-' + i] = { type: opts.titleText, content: $(this).html()};
							});							
						}	
						else {
							debugError('Couldn\'t find any content for the ticker to use!');
							return false;
						}
					}
					else {
						debugError('Couldn\'t find any content for the ticker to use!');
						return false;
					}
					settings.contentLoaded = true;
				}
				
				// insert news content into DOM
				$(settings.dom.titleElem).html(settings.newsArr['item-' + settings.position].type);
				$(settings.dom.contentID).html(settings.newsArr['item-' + settings.position].content);
				
				// set the next content item to be used - loop round if we are at the end of the content
				if (settings.position == (countSize(settings.newsArr) -1)) {
					settings.position = 0;
				}
				else {		
					settings.position++;
				}
							
				// get the values of content and set the time of the reveal (so all reveals have the same speed regardless of content size)
				distance = $(settings.dom.contentID).width();
				time = distance / opts.speed;
				
				// start the ticker	 - have to fade both element here because of IE strangeness - needs further investigation
				$(settings.dom.wrapperID)
					.find(settings.dom.titleID).fadeIn()
						.end().find(settings.dom.titleElem).fadeIn('slow', revealContent);
			}

			//slide back cover	
			function revealContent() {
				if(settings.play) {	
					// get the width of the title element to offset the content and reveal
					var offset = $(settings.dom.titleElem).width() + 20;
					$(settings.dom.revealID).css('left', offset + 'px');
					// show the reveal element and start  the animation
					$(settings.dom.revealElem).show(1, function () {
						$(settings.dom.contentID).css('left', offset + 'px').show();
						$(settings.dom.revealID).css('margin-left', '0px').animate({ zoom: 1 }, 20).animate({
							marginLeft: distance + 'px'
						}, time, 'linear', postReveal);
					});		
				}
				else {
					return false;					
				}
			};
			
			function postReveal() {
				// here we hide the current content and reset the ticker elements to a default state ready for the next ticker item
				if(settings.play) {		
					// we have to separately fade the content out here to get around an IE bug - needs further investigation
					$(settings.dom.contentID).animate({ zoom: 1 }, opts.pauseOnItems).fadeOut('slow');
					// deal with the rest of the content, prepare the DOM and trigger the next ticker
					$(settings.dom.revealID).hide(1, function () {
						$(settings.dom.tickerID).animate({ zoom: 1 }, opts.pauseOnItems).fadeOut(opts.fadeOutSpeed, function () {
							$(settings.dom.wrapperID)
								.find(settings.dom.titleElem +',' + settings.dom.revealElem + ',' + settings.dom.contentID)
									.hide()
								.end().find(settings.dom.tickerID + ',' + settings.dom.revealID + ',' + settings.dom.titleID)
									.show()
								.end().find(settings.dom.tickerID + ',' + settings.dom.revealID + ',' + settings.dom.titleID)
									.removeAttr('style');								
							updateTicker();						
						});
					});
				}
				else {
					$(settings.dom.revealElem).hide();
				}
			}
			
			function pauseTicker() {
				// pause ticker
				settings.play = false;
				// stop animation and show content - must pass true, true to the stop function, or we can get some funky behaviour
				$(settings.dom.tickerID + ',' + settings.dom.revealID + ',' + settings.dom.titleID + ',' + settings.dom.titleElem + ',' + settings.dom.revealElem + ',' + settings.dom.contentID).stop(true, true);
				$(settings.dom.revealID + ',' + settings.dom.revealElem).hide();
				$(settings.dom.wrapperID)
					.find(settings.dom.titleID + ',' + settings.dom.titleElem).show()
						.end().find(settings.dom.contentID).show();
			}
			
			function restartTicker() {
				// play ticker
				settings.play = true;
				settings.paused = false;
				// start the ticker again
				postReveal();	
			}
			
			function changeContent(direction) {
				pauseTicker();
				switch (direction) {
					case 'prev':
						if (settings.position == 0) {
							settings.position = countSize(settings.newsArr) -2;
						}
						else if (settings.position == 1) {
							settings.position = countSize(settings.newsArr) -1;
						}
						else {
							settings.position = settings.position - 2;
						}
						//console.log(settings.position);
						$(settings.dom.titleElem).html(settings.newsArr['item-' + settings.position].type);
						$(settings.dom.contentID).html(settings.newsArr['item-' + settings.position].content);						
						break;
					case 'next':
						$(settings.dom.titleElem).html(settings.newsArr['item-' + settings.position].type);
						$(settings.dom.contentID).html(settings.newsArr['item-' + settings.position].content);
						break;
				}
				// set the next content item to be used - loop round if we are at the end of the content
				if (settings.position == (countSize(settings.newsArr) -1)) {
					settings.position = 0;
				}
				else {		
					settings.position++;
				}	
			}
		});  
	};  
	// plugin defaults - added as a property on our plugin function
	$.fn.ticker.defaults = {
		speed: 0.10,			
		ajaxFeed: false,
		htmlFeed: true,
		debugMode: true,
		controls: true,
		titleText: 'Latest',		
		pauseOnItems: 2000,
		fadeInSpeed: 300,
		fadeOutSpeed: 300
	};	
})(jQuery);

// get html from ajax call or json object

// make whole thing events based

// background customisation (a la bbc)

// truncate long strings?