// jQuery MultiSlider Plugin for Suzuki
// by Rhodri George
(function($) {
    // here we go!
    $.multiSlider = function(element, options) {

        // plugin's default options
        // this is private property and is  accessible only from inside the plugin
        var defaults = {
            xSpeed: 1000,
            ySpeed: 500,
            controlsHTML: '<div class="controls"><span class="button_next button_controls"><!-- --></span><span class="button_prev button_controls"><!-- --></span></div>',
            currentClass: 'current',
            wrapperClass: 'box_inner_wrapper',
            contentClass: 'box_content',
            subContentClass: 'box_content_sub',
            linkClass: 'box_link',
            beforeSlide: function(destination) {
				$images = $(destination).find('.lazy');
				if ($images.length > 0) {
					$images.each(function(index) {
	            		$(this).on('load', function() {
	            			$(this).delay(500).delay(200 * index).animate({ opacity: 1 }, 200).removeClass('lazy');
	            		});
	            		$(this).css('opacity', '0').attr('src', $(this).data('original'));
	            	});
				}
            },
            afterSlide: function () {}
        }

        // to avoid confusions, use "plugin" to reference the 
        // current instance of the object
        var plugin = this;

        // this will hold the merged default, and user-provided options
        // plugin's properties will be available through this object like:
        // plugin.settings.propertyName from inside the plugin or
        // element.data('multiSlider').settings.propertyName from outside the plugin, 
        // where "element" is the element the plugin is attached to;
        plugin.settings = {}

        var $element = $(element), // reference to the jQuery version of DOM element
             element = element;    // reference to the actual DOM element

        var timer;

        // the "constructor" method that gets called when the object is created
        var init = function() {
            // the plugin's final properties are the merged default and 
            // user-provided options (if any)
            plugin.settings = $.extend({}, defaults, options);
            addControls();
            addLinkEvents();
            //mouseStop(element);
        }

        // public methods
        // these methods can be called like:
        // plugin.methodName(arg1, arg2, ... argn) from inside the plugin or
        // element.data('multiSlider').publicMethod(arg1, arg2, ... argn) from outside 
        // the plugin, where "element" is the element the plugin is attached to;
        plugin.track = function(trackSlide) {
        	trackID = $(trackSlide).data('nielsen');
			try { trac.pageEvent(trackID) } catch(e) {}
		}

		plugin.showNext = function() {
			var destination = getNextSlide();
			
			plugin.settings.beforeSlide(destination);
			
			var moveTo = getSlideWidth();
			moveTo = '-=' + moveTo;
			// animate
			$($element).find('.' + plugin.settings.wrapperClass).animate({
				marginLeft: moveTo
			}, plugin.settings.xSpeed, function() {
				plugin.newSlideHideSub();
			});
			setCurrent(destination);
			checkControls();
			plugin.track(destination);

			plugin.settings.afterSlide();
		}

		plugin.showPrev = function() {
			var destination = getPrevSlide();
			
			plugin.settings.beforeSlide(destination);
			
			
			var moveTo = getSlideWidth();
			moveTo = '+=' + moveTo;
			// animate
			$($element).find('.' + plugin.settings.wrapperClass).animate({
				marginLeft: moveTo
			}, plugin.settings.xSpeed, function() {
				plugin.newSlideHideSub();
			});
			setCurrent(destination);
			checkControls();
			plugin.track(destination);
			
			plugin.settings.afterSlide();
		}

		plugin.showSlideNo = function(slideNumber) {
			var destination = getSlideByIndex(slideNumber);
			
			plugin.settings.beforeSlide(destination);
			
			var moveTo = getSlideWidth();
			moveTo = moveTo * slideNumber;
			moveTo = '-' + moveTo + 'px';
			$($element).find('.' + plugin.settings.wrapperClass).animate({
				marginLeft: moveTo
			}, plugin.settings.xSpeed);
			setCurrent(destination);
			checkControls();
			plugin.track(destination);

			plugin.settings.afterSlide();
		}

		plugin.showSub = function() {
			var current = getCurrentSlide();
			var sub = $(current).find('.' + plugin.settings.subContentClass);

			plugin.settings.beforeSlide(sub);

			// get the total height of the sub content
			var height = '-' + $(sub).height();
			sub.stop(false, false).animate({
				marginTop: height
			}, plugin.settings.ySpeed);
			plugin.track(current);

			plugin.settings.afterSlide();
		}

		plugin.hideSub = function() {
			plugin.settings.beforeSlide();

			var current = getCurrentSlide();
			var sub = $($element).find('.' + plugin.settings.subContentClass);
			var height = '0';
			sub.stop(false, false).animate({
				marginTop: height
			}, plugin.settings.ySpeed);
			plugin.track(current);

			plugin.settings.afterSlide();
		}

		plugin.newSlideHideSub = function() {
			if ($($element).find('.' + plugin.settings.subContentClass).length > 0) {
				var height = '0';
				$($element).find('.' + plugin.settings.subContentClass).each(function () {
					$(this).stop(false, false).animate({
						marginTop: height
					}, 0);
				});
			}
		}

        // private methods
        // these methods can be called only from inside the plugin like:
        // methodName(arg1, arg2, ... argn)
		
		var checkControls = function() {
			var current = getCurrentSlide();
			// set to default class
			$($element).find('.controls').attr('class', 'controls');
			// add the correct class
			if ($(current).next('.box_content').length > 0 && $(current).prev('.box_content').length > 0) {
				$($element).find('.controls').addClass('controls_both');
			}
			else if ($(current).next('.box_content').length > 0) {
				$($element).find('.controls').addClass('controls_next');
			}
			else if ($(current).prev('.box_content').length > 0) {
				$($element).find('.controls').addClass('controls_prev');
			}
		}

		var addControls = function() {
			// add the HTML to the DOM
			$($element).append(plugin.settings.controlsHTML);
			// add the controls events - NEXT
			$($element).find('.button_next').on('click', function() {
				plugin.showNext();
			});
			$($element).find('.button_prev').on('click', function() {
				plugin.showPrev();
			});
			addHover();
		}

		var hideControls = function() {
			$('.controls').attr('class', 'controls');
		}

		var addHover = function() {
			$($element).hover( function() {
				addMousemove();
				// is there anymore to show?
				$current = getCurrentSlide();
				checkControls($current, $element);
			}, function () {
				$(this).find('.controls').attr('class', 'controls');
			});
		}

		var addMousemove = function() {
			var overControls = false;

			stopped = function (e) {
				if (!overControls) {
					hideControls();
				}
			}

			$($element).find('.controls').hover(function() {
				overControls = true;
			}, function() {
				overControls = false;
			});

			$($element).on('mousemove', function(e) {
				checkControls($current, $element);
				if (timer) {
					window.clearTimeout(timer);
					time = 0;
				}
				timer = window.setTimeout(function() {
					stopped(e);
				}, 1500);
			});
		}

		var addLinkEvents = function() {
			$($element).find('.' + plugin.settings.linkClass).click(function() {
				// find the position to slide
				try { slide = $(this).data('slide'); } catch(e) {}

				if (slide !== undefined) {
					plugin.showSlideNo(slide);
				}
				else {
					// check to see if there is sub content
					if ($($element).find('.' + plugin.settings.subContentClass).length > 0) {
						plugin.showSub();
					}
				}
			});

			$($element).find('.' + plugin.settings.subContentClass).click(function() {
				plugin.hideSub();
			});
		}

		var getCurrentSlide = function() {
			return $($element).find('.' + plugin.settings.currentClass);
		}

		var getNextSlide = function() {
			return $(getCurrentSlide()).next('.' + plugin.settings.contentClass);
		}

		var getPrevSlide = function() {
			return $(getCurrentSlide()).prev('.' + plugin.settings.contentClass);
		}

		var getSlideByIndex = function(index) {
			return $($element).find('.' + plugin.settings.contentClass + ':eq(' + index + ')');
		}

		var setCurrent = function(newCurrent) {
			$($element).find('.' + plugin.settings.currentClass).removeClass(plugin.settings.currentClass);
			$(newCurrent).addClass(plugin.settings.currentClass);
		}

		var getSlideWidth = function() {
			var current = getCurrentSlide();
			// get the width
			var width = $(current).width();
			// get the margin to the right - minor assumption?
			var margin = $(current).css('margin-right');
			if (margin !== undefined) {
				margin = parseInt(margin.replace('px', ''));
			}
			else {
				margin = 0;
			}
			// total slide width
			var slideWidth = (width + margin);
			return slideWidth;
		}
        // fire up the plugin!
        // call the "constructor" method
        init();
    }

    // add the plugin to the jQuery.fn object
    $.fn.multiSlider = function(options) {
        // iterate through the DOM elements we are attaching the plugin to
        return this.each(function() {
            // if plugin has not already been attached to the element
            if (undefined == $(this).data('multiSlider')) {
                // create a new instance of the plugin
                // pass the DOM element and the user-provided options as arguments
                var plugin = new $.multiSlider(this, options);
                // in the jQuery version of the element
                // store a reference to the plugin object
                // you can later access the plugin and its methods and properties like
                // element.data('multiSlider').publicMethod(arg1, arg2, ... argn) or
                // element.data('multiSlider').settings.propertyName
                $(this).data('multiSlider', plugin);
            }
        });
    }
})(jQuery);