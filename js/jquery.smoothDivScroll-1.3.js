/*
 * jQuery SmoothDivScroll 1.3
 *
 * Copyright (c) 2012 Thomas Kahn
 * Licensed under the GPL license.
 *
 * http://www.smoothdivscroll.com/
 *
 * Depends:
 * jquery-1.8.x.min.js
   Please use https://ajax.googleapis.com/ajax/libs/jquery/1.8.1/jquery.min.js
   ...or later

 * jquery.ui.widget.js
 * jquery.ui.effects.min.js
   Make your own custom download at http://jqueryui.com/download.
   First deselect all components. Then check just "Widget" and "Effects Core".
   Download the file and put it in your javascript folder.

 * jquery.mousewheel.min.js
   Used for mousewheel functionality.
   Download the latest version at http://brandonaaron.net/code/mousewheel/demos
 *

 * jquery.kinetic.js
   Used for scrolling by dragging, mainly used on touch devices.
   Download the latest version at https://github.com/davetayls/jquery.kinetic
 *
 */
(function ($) {
	var scrollWrapper = 				"scrollWrapper",
		scrollingHotSpotPositive = 		"scrollingHotSpotPositive",
		scrollingHotSpotNegative = 		"scrollingHotSpotNegative",
		scrollingHotSpotPositiveVisible = "scrollingHotSpotPositiveVisible",
		scrollingHotSpotNegativeVisible = "scrollingHotSpotNegativeVisible",
		scrollableArea = 				"scrollableArea",
		divClass = 						"<div class='",
		divClassClose = 				"'>",
		speedBooster = 					"speedBooster",
		scrollPosition = 				"scrollPosition",
		startingPosition = 				"startingPosition", 
		positiveScrollingInterval = 	"positiveScrollingInterval",
		negativeScrollingInterval = 	"negativeScrollingInterval",
		autoScrollingInterval = 		"autoScrollingInterval", 
		hideHotSpotBackgroundsInterval = "hideHotSpotBackgroundsInterval", 
		previousScroll = 				"previousScroll", 
		pingPongDirection = 			"pingPongDirection",
		getNextElementOffsetSize = 		"getNextElementOffsetSize", 
		swapAt = 						"swapAt",
		startAtElementHasNotPassed = 	"startAtElementHasNotPassed",
		swappedElement = 				"swappedElement",
		originalElements = 				"originalElements",
		visible = 						"visible",
		enabled = 						"enabled", 
		scrollerOffset = 				"scrollerOffset",
		scrollableAreaWidth = 			"scrollableAreaWidth",
		scrollableAreaHeight = 			"scrollableAreaHeight",
		hotSpotSize = 					"hotSpotSize",
		vertical =						"vertical";
		
	$.widget("thomaskahn.smoothDivScroll", {
		
		// Default options
		options: {
			// Classes for elements added by Smooth Div Scroll
			scrollingHotSpotNegativeClass: scrollingHotSpotNegative, // String
			scrollingHotSpotPositiveClass: scrollingHotSpotPositive, // String
			scrollableAreaClass: scrollableArea, // String
			scrollWrapperClass: scrollWrapper, // String

			// Misc settings
			hiddenOnStart: false, // Boolean
			getContentOnLoad: {}, // Object
			countOnlyClass: "", // String
			startAtElementId: "", // String

			// Hotspot scrolling
			hotSpotScrolling: true, // Boolean
			hotSpotScrollingStep: 15, // Pixels
			hotSpotScrollingInterval: 10, // Milliseconds
			hotSpotMouseDownSpeedBooster: 3, // Integer
			visibleHotSpotBackgrounds: "hover", // always, onStart, hover or empty (no visible hotspots)
			hotSpotsVisibleTime: 5000, // Milliseconds
			easingAfterHotSpotScrolling: true, // Boolean
			easingAfterHotSpotScrollingDistance: 10, // Pixels
			easingAfterHotSpotScrollingDuration: 300, // Milliseconds
			easingAfterHotSpotScrollingFunction: "easeOutQuart", // String

			// Mousewheel scrolling
			mousewheelScrolling: "", // vertical, horizontal, allDirections or empty (no mousewheel scrolling) String
			mousewheelScrollingStep: 70, // Pixels
			easingAfterMouseWheelScrolling: true, // Boolean
			easingAfterMouseWheelScrollingDuration: 300, // Milliseconds
			easingAfterMouseWheelScrollingFunction: "easeOutQuart", // String

			// Manual scrolling (hotspot and/or mousewheel scrolling)
			manualContinuousScrolling: false, // Boolean

			// Autoscrolling
			autoScrollingMode: "", // always, onStart or empty (no auto scrolling) String
			autoScrollingDirection: "endlessLoopRight", // right, left, backAndForth, endlessLoopRight, endlessLoopLeft String
			autoScrollingStep: 1, // Pixels
			autoScrollingInterval: 10, // Milliseconds

			// Touch scrolling
			touchScrolling: false,

			// Easing for when the scrollToElement method is used
			scrollToAnimationDuration: 1000, // Milliseconds
			scrollToEasingFunction: "easeOutQuart", // String
			
			//scroll Orientation support
			scrollOrientation: ""
		},
		_create: function () {
			var self = this, o = this.options, el = this.element;

			// Create variables for any existing or not existing 
			// scroller elements on the page.
			el.data(scrollWrapper, el.find("." + o.scrollWrapperClass));
			el.data(scrollingHotSpotPositive, el.find("." + o.scrollingHotSpotPositiveClass));
			el.data(scrollingHotSpotNegative, el.find("." + o.scrollingHotSpotNegativeClass));
			el.data(scrollableArea, el.find("." + o.scrollableAreaClass));

			// Check which elements are already present on the page. 
			// Create any elements needed by the plugin if
			// the user hasn't already created them.

			// First detach any present hot spots
			if (el.data(scrollingHotSpotPositive).length > 0) {

				el.data(scrollingHotSpotPositive).detach();
			}
			if (el.data(scrollingHotSpotNegative).length > 0) {

				el.data(scrollingHotSpotNegative).detach();
			}

			// Both the scrollable area and the wrapper are missing
			if (el.data(scrollableArea).length === 0 && el.data(scrollWrapper).length === 0) {
				el.wrapInner(divClass + o.scrollableAreaClass + divClassClose).wrapInner(divClass + o.scrollWrapperClass + divClassClose);

				el.data(scrollWrapper, el.find("." + o.scrollWrapperClass));
				el.data(scrollableArea, el.find("." + o.scrollableAreaClass));
			}
			// Only the wrapper is missing
			else if (el.data(scrollWrapper).length === 0) {
				el.wrapInner(divClass + o.scrollWrapperClass + divClassClose);
				el.data(scrollWrapper, el.find("." + o.scrollWrapperClass));
			}
			// Only the scrollable area is missing
			else if (el.data(scrollableArea).length === 0) {
				el.data(scrollWrapper).wrapInner(divClass + o.scrollableAreaClass + divClassClose);
				el.data(scrollableArea, el.find("." + o.scrollableAreaClass));
			}

			// Put the right and left hot spot back into the scroller again
			// or create them if they where not present from the beginning.
			if (el.data(scrollingHotSpotPositive).length === 0) {
				el.prepend(divClass + o.scrollingHotSpotPositiveClass + "'></div>");
				el.data(scrollingHotSpotPositive, el.find("." + o.scrollingHotSpotPositiveClass));
			} else {
				el.prepend(el.data(scrollingHotSpotPositive));
			}

			if (el.data(scrollingHotSpotNegative).length === 0) {
				el.prepend(divClass + o.scrollingHotSpotNegativeClass + "'></div>");
				el.data(scrollingHotSpotNegative, el.find("." + o.scrollingHotSpotNegativeClass));
			} else {
				el.prepend(el.data(scrollingHotSpotNegative));
			}


			// Create variables in the element data storage
			el.data(speedBooster, 1);
			el.data(scrollPosition, 0);;
			el.data(startingPosition, 0);
			el.data(positiveScrollingInterval, null);
			el.data(negativeScrollingInterval, null);
			el.data(autoScrollingInterval, null);
			el.data(hideHotSpotBackgroundsInterval, null);
			el.data(previousScroll, 0);
			el.data(pingPongDirection, "right");
			el.data(getNextElementOffsetSize, true);
			el.data(swapAt, null);
			el.data(startAtElementHasNotPassed, true);
			el.data(swappedElement, null);
			el.data(originalElements, el.data(scrollableArea).children(o.countOnlyClass));
			el.data(visible, true);
			el.data(enabled, true);
			el.data(scrollerOffset, el.offset());
			
			
			if (o.scrollOrientation === vertical){
				el.data(scrollableAreaWidth, el.data(scrollableArea).width());
				el.data(scrollableAreaHeight, 0);
				el.data(hotSpotSize, el.data(scrollingHotSpotNegative).innerHeight());
			} else {
				el.data(scrollableAreaWidth, 0);
				el.data(scrollableAreaHeight, el.data(scrollableArea).height());
				el.data(hotSpotSize, el.data(scrollingHotSpotNegative).innerWidth());
			}
			
			/*****************************************
			SET UP EVENTS FOR TOUCH SCROLLING
			*****************************************/
			if (o.touchScrolling && el.data(enabled)) {
				// Use jquery.kinetic.js for touch scrolling
				// Vertical scrolling disabled
				var isVertical = (o.scrollOrientation === vertical)
				el.data(scrollWrapper).kinetic({
					y: isVertical,
					x: !isVertical,
					moved: function (settings) {
						if (o.manualContinuousScrolling) {
							if (self.getScrollerOffset() <= 0) {
								self._checkContinuousSwapNegitive();
							} else {
								self._checkContinuousSwapPositive();
							}
						}
					},
					stopped: function (settings) {
						// Stop any ongoing animations
						el.data(scrollWrapper).stop(true, false);

						// Stop any ongoing auto scrolling
						self.stopAutoScrolling();
					}
				});
			}

			/*****************************************
			SET UP EVENTS FOR SCROLLING POSITITVE
			*****************************************/
			// Check the mouse X position and calculate 
			// the relative X position inside the right hotspot
			el.data(scrollingHotSpotPositive).bind("mousemove", function (e) {
				if (o.hotSpotScrolling) {
					var moveUnit
					if (o.scrollOrientation === vertical){
						moveUnit = e.pageY - (this.offsetTop + el.data(scrollerOffset).top);
					} else {
						moveUnit = e.pageX - (this.offsetLeft + el.data(scrollerOffset).left);
					}
					el.data(scrollPosition, Math.round((moveUnit / el.data(hotSpotSize)) * o.hotSpotScrollingStep));

					// If the position is less then 1, it's set to 1
					if (el.data(scrollPosition) === Infinity || el.data(scrollPosition) < 1) {
						el.data(scrollPosition, 1);
					}
				}
			});

			// Mouseover right hotspot - scrolling
			el.data(scrollingHotSpotPositive).bind("mouseover", function () {
				if (o.hotSpotScrolling) {
					// Stop any ongoing animations
					el.data(scrollWrapper).stop(true, false);

					// Stop any ongoing auto scrolling
					self.stopAutoScrolling();

					// Start the scrolling interval
					el.data(positiveScrollingInterval, setInterval(function () {
						if (el.data(scrollPosition) > 0 && el.data(enabled)) {
							self.move(el.data(scrollPosition) * el.data(speedBooster), false, o.manualContinuousScrolling)
						}
					}, o.hotSpotScrollingInterval));

					// Callback
					self._trigger("mouseOverRightHotSpot");
				}
			});

			// Mouseout right hotspot - stop scrolling
			el.data(scrollingHotSpotPositive).bind("mouseout", function () {
				if (o.hotSpotScrolling) {
					clearInterval(el.data(positiveScrollingInterval));
					el.data(scrollPosition, 0);

					// Easing out after scrolling
					if (o.easingAfterHotSpotScrolling && el.data(enabled)) {
						self.move(o.easingAfterHotSpotScrollingDistance, o.easingAfterHotSpotScrolling, o.manualContinuousScrolling)
					}
				}
			});


			// mousedown right hotspot (add scrolling speed booster)
			el.data(scrollingHotSpotPositive).bind("mousedown", function () {
				el.data(speedBooster, o.hotSpotMouseDownSpeedBooster);
			});

			// mouseup anywhere (stop boosting the scrolling speed)
			$("body").bind("mouseup", function () {
				el.data(speedBooster, 1);
			});

			/*****************************************
			SET UP EVENTS FOR SCROLLING LEFT
			*****************************************/
			// Check the mouse X position and calculate
			// the relative X position inside the left hotspot
			el.data(scrollingHotSpotNegative).bind("mousemove", function (e) {
				if (o.hotSpotScrolling) {
					var moveUnit
					if (o.scrollOrientation === vertical){
						 moveUnit = ((this.offsetTop + el.data(scrollerOffset).top + el.data(hotSpotSize)) - e.pageY);
					} else {
						 moveUnit = ((this.offsetLeft + el.data(scrollerOffset).left + el.data(hotSpotSize)) - e.pageX);
					}
					
					el.data(scrollPosition, Math.round((moveUnit / el.data(hotSpotSize)) * o.hotSpotScrollingStep));

					// If the position is less then 1, it's set to 1
					if (el.data(scrollPosition) === Infinity || el.data(scrollPosition) < 1) {
						el.data(scrollPosition, 1);
					}
				}
			});

			// Mouseover left hotspot
			el.data(scrollingHotSpotNegative).bind("mouseover", function () {
				if (o.hotSpotScrolling) {
					// Stop any ongoing animations
					el.data(scrollWrapper).stop(true, false);

					// Stop any ongoing auto scrolling
					self.stopAutoScrolling();

					el.data(negativeScrollingInterval, setInterval(function () {
						if (el.data(scrollPosition) > 0 && el.data(enabled)) {
							self.move(-1 * (el.data(scrollPosition) * el.data(speedBooster)), false, o.manualContinuousScrolling);
						}
					}, o.hotSpotScrollingInterval));

					// Callback
					self._trigger("mouseOverLeftHotSpot");
				}
			});

			// mouseout left hotspot
			el.data(scrollingHotSpotNegative).bind("mouseout", function () {
				if (o.hotSpotScrolling) {
					clearInterval(el.data(negativeScrollingInterval));
					el.data(scrollPosition, 0);

					// Easing out after scrolling
					if (o.easingAfterHotSpotScrolling && el.data(enabled)) {
						self.move(-1 * o.easingAfterHotSpotScrollingDistance, o.easingAfterHotSpotScrolling, o.manualContinuousScrolling)
					}
				}
			});

			// mousedown left hotspot (add scrolling speed booster)
			el.data(scrollingHotSpotNegative).bind("mousedown", function () {
				el.data(speedBooster, o.hotSpotMouseDownSpeedBooster);
			});

			/*****************************************
			SET UP EVENT FOR MOUSEWHEEL SCROLLING
			*****************************************/
			el.data(scrollableArea).mousewheel(function (event, delta, deltaX, deltaY) {

				if (el.data(enabled) && o.mousewheelScrolling.length > 0) {
					var pixels;

					// Can be either positive or negative
					// Is multiplied/inverted by minus one since you want it to scroll 
					// left when moving the wheel down/right and right when moving the wheel up/left
					if (o.mousewheelScrolling === vertical && deltaY !== 0) {
						// Stop any ongoing auto scrolling if it's running
						self.stopAutoScrolling();
						event.preventDefault();
						pixels = Math.round((o.mousewheelScrollingStep * deltaY) * -1);
						self.move(pixels, o.easingAfterMouseWheelScrolling, o.manualContinuousScrolling);
					} else if (o.mousewheelScrolling === "horizontal" && deltaX !== 0) {
						// Stop any ongoing auto scrolling if it's running
						self.stopAutoScrolling();
						event.preventDefault();
						pixels = Math.round((o.mousewheelScrollingStep * deltaX) * -1);
						self.move(pixels, o.easingAfterMouseWheelScrolling, o.manualContinuousScrolling);
					} else if (o.mousewheelScrolling === "allDirections") {
						// Stop any ongoing auto scrolling if it's running
						self.stopAutoScrolling();
						event.preventDefault();
						pixels = Math.round((o.mousewheelScrollingStep * delta) * -1);
						self.move(pixels, o.easingAfterMouseWheelScrolling, o.manualContinuousScrolling);
					}


				}
			});

			// Capture and disable mousewheel events when the pointer
			// is over any of the hotspots
			if (o.mousewheelScrolling) {
				el.data(scrollingHotSpotNegative).add(el.data(scrollingHotSpotPositive)).mousewheel(function (event) {
					event.preventDefault();
				});
			}

			/*****************************************
			SET UP EVENT FOR RESIZING THE BROWSER WINDOW
			*****************************************/
			$(window).bind("resize", function () {
				self._showHideHotSpots();
				self._trigger("windowResized");
			});

			/*****************************************
			FETCHING CONTENT ON INITIALIZATION
			*****************************************/
			// If getContentOnLoad is present in the options, 
			// sort out the method and parameters and get the content

			if (!(jQuery.isEmptyObject(o.getContentOnLoad))) {
				self[o.getContentOnLoad.method](o.getContentOnLoad.content, o.getContentOnLoad.manipulationMethod, o.getContentOnLoad.addWhere, o.getContentOnLoad.filterTag);
			}

			// Should it be hidden on start?
			if (o.hiddenOnStart) {
				self.hide();
			}

			/*****************************************
			AUTOSCROLLING
			*****************************************/
			// The $(window).load event handler is used because the width of the elements are not calculated
			// properly until then, at least not in Google Chrome. The start of the auto scrolling and the
			// setting of the hotspot backgrounds is started here as well for the same reason. 
			// If the auto scrolling is not started in $(window).load, it won't start because it 
			// will interpret the scrollable areas as too short.
			$(window).load(function () {

				// If scroller is not hidden, recalculate the scrollable area
				if (!(o.hiddenOnStart)) {
					self.recalculateScrollableArea();
				}

				// Autoscrolling is active
				if ((o.autoScrollingMode.length > 0) && !(o.hiddenOnStart)) {
					self.startAutoScrolling();
				}

				// If the user wants to have visible hotspot backgrounds, 
				// here is where it's taken care of
				if (o.autoScrollingMode !== "always") {

					switch (o.visibleHotSpotBackgrounds) {
						case "always":
							self.showHotSpotBackgrounds();
							break;
						case "onStart":
							self.showHotSpotBackgrounds();
							el.data(hideHotSpotBackgroundsInterval, setTimeout(function () {
								self.hideHotSpotBackgrounds(250);
							}, o.hotSpotsVisibleTime));
							break;
						case "hover":
							el.mouseenter(function (event) {
								if (o.hotSpotScrolling) {
									event.stopPropagation();
									self.showHotSpotBackgrounds(250);
								}
							}).mouseleave(function (event) {
								if (o.hotSpotScrolling) {
									event.stopPropagation();
									self.hideHotSpotBackgrounds(250);
								}
							});
							break;
						default:
							break;
					}
				}

				self._showHideHotSpots();

				self._trigger("setupComplete");

			});

		},
		/**********************************************************
		Override _setOption and handle altered options
		**********************************************************/
		_setOption: function (key, value) {
			var self = this, o = this.options, el = this.element;

			// Update option
			o[key] = value;

			if (key === "hotSpotScrolling") {
				// Handler if the option hotSpotScrolling is altered
				if (value === true) {
					self._showHideHotSpots();
				} else {
					el.data(scrollingHotSpotNegative).hide();
					el.data(scrollingHotSpotPositive).hide();
				}
			} else if (key === "autoScrollingStep" ||
			// Make sure that certain values are integers, otherwise
			// they will summon bad spirits in the plugin
				key === "easingAfterHotSpotScrollingDistance" ||
				key === "easingAfterHotSpotScrollingDuration" ||
				key === "easingAfterMouseWheelScrollingDuration") {
				o[key] = parseInt(value, 10);
			} else if (key === autoScrollingInterval) {
				// Handler if the autoScrollingInterval is altered
				o[key] = parseInt(value, 10);
				self.startAutoScrolling();
			}

		},
		/**********************************************************
		Hotspot functions
		**********************************************************/
		showHotSpotBackgrounds: function (fadeSpeed) {

			// Alter the CSS (SmoothDivScroll.css) if you want to customize
			// the look'n'feel of the visible hotspots
			var self = this, el = this.element, o = this.option;


			// Fade in the hotspot backgrounds
			if (fadeSpeed !== undefined) {
				// Before the fade-in starts, we need to make sure the opacity is zero
				//el.data(scrollingHotSpotNegative).add(el.data(scrollingHotSpotPositive)).css("opacity", "0.0");

				el.data(scrollingHotSpotNegative).addClass(scrollingHotSpotNegativeVisible);
				el.data(scrollingHotSpotPositive).addClass(scrollingHotSpotPositiveVisible);

				// Fade in the hotspots
				el.data(scrollingHotSpotNegative).add(el.data(scrollingHotSpotPositive)).fadeTo(fadeSpeed, 0.35);
			}
			// Don't fade, just show them
			else {

				// The left hotspot
				el.data(scrollingHotSpotNegative).addClass(scrollingHotSpotNegativeVisible);
				el.data(scrollingHotSpotNegative).removeAttr("style");

				// The right hotspot
				el.data(scrollingHotSpotPositive).addClass(scrollingHotSpotPositiveVisible);
				el.data(scrollingHotSpotPositive).removeAttr("style");
			}

			self._showHideHotSpots();

		},
		hideHotSpotBackgrounds: function (fadeSpeed) {
			var el = this.element, o = this.option;

			// Fade out the hotspot backgrounds
			if (fadeSpeed !== undefined) {

				// Fade out the left hotspot
				el.data(scrollingHotSpotNegative).fadeTo(fadeSpeed, 0.0, function () {
					el.data(scrollingHotSpotNegative).removeClass(scrollingHotSpotNegativeVisible);
				});

				// Fade out the right hotspot
				el.data(scrollingHotSpotPositive).fadeTo(fadeSpeed, 0.0, function () {
					el.data(scrollingHotSpotPositive).removeClass(scrollingHotSpotPositiveVisible);
				});

			}
			// Don't fade, just hide them
			else {
				el.data(scrollingHotSpotNegative).removeClass(scrollingHotSpotNegativeVisible).removeAttr("style");
				el.data(scrollingHotSpotPositive).removeClass(scrollingHotSpotPositiveVisible).removeAttr("style");
			}

		},
		// Function for showing and hiding hotspots depending on the
		// offset of the scrolling
		_showHideHotSpots: function () {
			var self = this, el = this.element, o = this.options;

			// Hot spot scrolling is not enabled so show no hot spots
			if (!(o.hotSpotScrolling)) {
				el.data(scrollingHotSpotNegative).hide();
				el.data(scrollingHotSpotPositive).hide();
			} else {

				// If the manual continuous scrolling option is set show both
				if (o.manualContinuousScrolling && o.hotSpotScrolling && o.autoScrollingMode !== "always") {
					el.data(scrollingHotSpotNegative).show();
					el.data(scrollingHotSpotPositive).show();
				}
				// Autoscrolling not set to always and hotspot scrolling enabled.
				// Regular hot spot scrolling.
				else if (o.autoScrollingMode !== "always" && o.hotSpotScrolling) {
					var currentScroll = self.getScrollerOffset(),
						scrollAreaSize,
						scrollerSize;
					if (o.scrollOrientation === vertical){
						scrollAreaSize = el.data(scrollableAreaHeight)
						scrollerSize =  el.data(scrollWrapper).innerHeight()
					} else {
						scrollAreaSize = el.data(scrollableAreaWidth)
						scrollerSize = el.data(scrollWrapper).innerWidth()
					}
					// If the scrollable area is shorter than the scroll wrapper, both hotspots
					// should be hidden
					if (scrollAreaSize <= scrollerSize) {
						el.data(scrollingHotSpotNegative).hide();
						el.data(scrollingHotSpotPositive).hide();
					}
					// When you can't scroll further left the left scroll hotspot should be hidden
					// and the right hotspot visible.
					else if (currentScroll === 0) {
						el.data(scrollingHotSpotNegative).hide();
						el.data(scrollingHotSpotPositive).show();
						// Callback
						self._trigger("scrollerLeftLimitReached");
						// Clear interval
						clearInterval(el.data(negativeScrollingInterval));
						el.data(negativeScrollingInterval, null);
					}
					// When you can't scroll further right
					// the right scroll hotspot should be hidden
					// and the left hotspot visible
					else if (scrollAreaSize <= scrollerSize + currentScroll) {
						el.data(scrollingHotSpotNegative).show();
						el.data(scrollingHotSpotPositive).hide();
						// Callback
						self._trigger("scrollerRightLimitReached");
						// Clear interval
						clearInterval(el.data(positiveScrollingInterval));
						el.data(positiveScrollingInterval, null);
					}
					// If you are somewhere in the middle of your
					// scrolling, both hotspots should be visible
					else {
						el.data(scrollingHotSpotNegative).show();
						el.data(scrollingHotSpotPositive).show();
					}
				}
				// If auto scrolling is set to always, there should be no hotspots
				else {
					el.data(scrollingHotSpotNegative).hide();
					el.data(scrollingHotSpotPositive).hide();
				}
			}



		},
		// Function for calculating the scroll position of a certain element
		_setElementScrollPosition: function (method, element) {
			var el = this.element, o = this.options, tempScrollPosition = 0;

			switch (method) {
				case "first":
					el.data(scrollPosition, 0);
					return true;
				case "start":
					// Check to see if there is a specified start element in the options 
					// and that the element exists in the DOM
					if (o.startAtElementId !== "") {
						if (el.data(scrollableArea).has("#" + o.startAtElementId)) {
							tempScrollPosition = $("#" + o.startAtElementId).position().left;
							el.data(scrollPosition, tempScrollPosition);
							return true;
						}
					}
					return false;
				case "last":
				//TODO
								el.data(scrollPosition, (el.data(scrollableAreaWidth) - el.data(scrollWrapper).innerWidth()));
					return true;
				case "number":
					// Check to see that an element number is passed
					if (!(isNaN(element))) {
						tempScrollPosition = el.data(scrollableArea).children(o.countOnlyClass).eq(element - 1).position().left;
						el.data(scrollPosition, tempScrollPosition);
						return true;
					}
					return false;
				case "id":
					// Check that an element id is passed and that the element exists in the DOM
					if (element.length > 0) {
						if (el.data(scrollableArea).has("#" + element)) {
							tempScrollPosition = $("#" + element).position().left;
							el.data(scrollPosition, tempScrollPosition);
							return true;
						}
					}
					return false;
				default:
					return false;
			}


		},
		/**********************************************************
		Jumping to a certain element
		**********************************************************/
		jumpToElement: function (jumpTo, element) {
			var self = this, el = this.element;

			// Check to see that the scroller is enabled
			if (el.data(enabled)) {
				// Get the position of the element to scroll to
				if (self._setElementScrollPosition(jumpTo, element)) {
					// Jump to the element
					move(el.data(scrollPosition));
					// Check the hotspots
					self._showHideHotSpots();
					// Trigger the right callback
					switch (jumpTo) {
						case "first":
							self._trigger("jumpedToFirstElement");
							break;
						case "start":
							self._trigger("jumpedToStartElement");
							break;
						case "last":
							self._trigger("jumpedToLastElement");
							break;
						case "number":
							self._trigger("jumpedToElementNumber", null, { "elementNumber": element });
							break;
						case "id":
							self._trigger("jumpedToElementId", null, { "elementId": element });
							break;
						default:
							break;
					}

				}
			}
		},
		/**********************************************************
		Scrolling to a certain element
		**********************************************************/
		scrollToElement: function (scrollTo, element) {
			var self = this, el = this.element, o = this.options, autoscrollingWasRunning = false;

			if (el.data(enabled)) {
				// Get the position of the element to scroll to
				if (self._setElementScrollPosition(scrollTo, element)) {
					// Stop any ongoing auto scrolling
					if (el.data(autoScrollingInterval) !== null) {
						self.stopAutoScrolling();
						autoscrollingWasRunning = true;
					}

					// Stop any other running animations
					// (clear queue but don't jump to the end)
					el.data(scrollWrapper).stop(true, false);

					// Do the scolling animation
					el.data(scrollWrapper).animate({
						ScrollNegative: el.data(scrollPosition)
					}, { duration: o.scrollToAnimationDuration, easing: o.scrollToEasingFunction, complete: function () {
						// If auto scrolling was running before, start it again
						if (autoscrollingWasRunning) {
							self.startAutoScrolling();
						}

						self._showHideHotSpots();

						// Trigger the right callback
						switch (scrollTo) {
							case "first":
								self._trigger("scrolledToFirstElement");
								break;
							case "start":
								self._trigger("scrolledToStartElement");
								break;
							case "last":
								self._trigger("scrolledToLastElement");
								break;
							case "number":
								self._trigger("scrolledToElementNumber", null, { "elementNumber": element });
								break;
							case "id":
								self._trigger("scrolledToElementId", null, { "elementId": element });
								break;
							default:
								break;
						}
					}
					});
				}
			}

		},
		move: function (pixels, animate, doContinous) {
			var self = this, el = this.element, o = this.options,
				currentScroll = self.getScrollerOffset(),
				scrollAreaSize,
				scrollerSize;
			// clear queue, move to end
			el.data(scrollWrapper).stop(true, true);

			if (o.scrollOrientation === vertical){
				scrollAreaSize = el.data(scrollableAreaHeight)
				scrollerSize = el.data(scrollWrapper).innerHeight()
			} else { 
				scrollAreaSize = el.data(scrollableAreaWidth)
				scrollerSize = el.data(scrollWrapper).innerWidth()
			}
			
			// Only run this code if it's possible to scroll left or right,
			if ((pixels < 0 && currentScroll > 0) || (pixels > 0 && scrollAreaSize > (scrollerSize + currentScroll))) {
				var scrollEnd, 
					functionName;
				if (o.scrollOrientation === vertical){
					scrollEnd = el.data(scrollWrapper).scrollTop() + pixels
					functionName = "scrollTop"
				} else {
					scrollEnd = el.data(scrollWrapper).scrollLeft() + pixels 
					functionName = "scrollLeft"
				}
				if (animate) {
					var opts = {}
					opts[functionName] = scrollEnd
					el.data(scrollWrapper).animate(opts, { duration: o.easingAfterMouseWheelScrollingDuration, easing: o.easingAfterMouseWheelFunction, complete: function () {
						self.afterMove(pixels,doContinous)
					}
					});
				} else {
					el.data(scrollWrapper)[functionName](scrollEnd);
					self.afterMove(pixels,doContinous)
				}
			}


		},
		afterMove: function(pixels,doContinous){
			var self = this, o = this.options;
			self._showHideHotSpots();

			if (doContinous) {
				if (pixels > 0) {
					self._checkContinuousSwapPositive();
				} else {
					self._checkContinuousSwapNegitive();
				}
			}
		},
		/**********************************************************
		Adding or replacing content
		**********************************************************/
		/*  Arguments are:
		content - a valid URL to a Flickr feed - string
		manipulationMethod - addFirst, addLast or replace (default) - string
		*/
		getFlickrContent: function (content, manipulationMethod) {
			var self = this, el = this.element;

			$.getJSON(content, function (data) {
				// small square - size is 75x75
				// thumbnail -> large - size is the longest side
				var flickrImageSizes = [{ size: "small square", pixels: 75, letter: "_s" },
										{ size: "thumbnail", pixels: 100, letter: "_t" },
										{ size: "small", pixels: 240, letter: "_m" },
										{ size: "medium", pixels: 500, letter: "" },
										{ size: "medium 640", pixels: 640, letter: "_z" },
										{ size: "large", pixels: 1024, letter: "_b"}];
				var loadedFlickrImages = [];
				var imageIdStringBuffer = [];
				var startingIndex;
				var numberOfFlickrItems = data.items.length;
				var loadedFlickrImagesCounter = 0;

				// Determine a plausible starting value for the
				// image height
				if (el.data(scrollableAreaHeight) <= 75) {
					startingIndex = 0;
				} else if (el.data(scrollableAreaHeight) <= 100) {
					startingIndex = 1;
				} else if (el.data(scrollableAreaHeight) <= 240) {
					startingIndex = 2;
				} else if (el.data(scrollableAreaHeight) <= 500) {
					startingIndex = 3;
				} else if (el.data(scrollableAreaHeight) <= 640) {
					startingIndex = 4;
				} else {
					startingIndex = 5;
				}

				// Put all items from the feed in an array.
				// This is necessary
				$.each(data.items, function (index, item) {
					loadFlickrImage(item, startingIndex);
				});

				function loadFlickrImage(item, sizeIndex) {
					var path = item.media.m;
					var imgSrc = path.replace("_m", flickrImageSizes[sizeIndex].letter);
					var tempImg = $("<img />").attr("src", imgSrc);

					tempImg.load(function () {
						// Is it still smaller? Load next size
						if (this.height < el.data(scrollableAreaHeight)) {
							// Load a bigger image, if possible
							if ((sizeIndex + 1) < flickrImageSizes.length) {
								loadFlickrImage(item, sizeIndex + 1);
							} else {
								addImageToLoadedImages(this);
							}
						}
						else {
							addImageToLoadedImages(this);
						}

						// Finishing stuff to do when all images have been loaded
						if (loadedFlickrImagesCounter === numberOfFlickrItems) {
							switch (manipulationMethod) {
								case "addFirst":
									// Add the loaded content first in the scrollable area
									el.data(scrollableArea).children(":first").before(loadedFlickrImages);
									break;
								case "addLast":
									// Add the loaded content last in the scrollable area
									el.data(scrollableArea).children(":last").after(loadedFlickrImages);
									break;
								default:
									// Replace the content in the scrollable area
									el.data(scrollableArea).html(loadedFlickrImages);
									break;
							}

							// Recalculate the total width of the elements inside the scrollable area
							self.recalculateScrollableArea();

							// Determine which hotspots to show
							self._showHideHotSpots();

							// Trigger callback
							self._trigger("addedFlickrContent", null, { "addedElementIds": imageIdStringBuffer });
						}

					});
				}

				// Add the loaded content first or last in the scrollable area
				function addImageToLoadedImages(imageObj) {
					// Calculate the scaled width
					var widthScalingFactor = el.data(scrollableAreaHeight) / imageObj.height;
					var tempWidth = Math.round(imageObj.width * widthScalingFactor);
					// Set an id for the image - the filename is used as an id
					var tempIdArr = $(imageObj).attr("src").split("/");
					var lastElemIndex = (tempIdArr.length - 1);
					tempIdArr = tempIdArr[lastElemIndex].split(".");
					$(imageObj).attr("id", tempIdArr[0]);
					// Set the height of the image to the height of the scrollable area and add the width
					$(imageObj).css({ "height": el.data(scrollableAreaHeight), "width": tempWidth });
					// Add the id of the image to the array of id's - this
					// is used as a parameter when the callback is triggered
					imageIdStringBuffer.push(tempIdArr[0]);
					// Add the image to the array of loaded images
					loadedFlickrImages.push(imageObj);

					// Increment counter for loaded images
					loadedFlickrImagesCounter++;
				}

			});
		},
		/*  Arguments are:
		content - a valid URL to an AJAX content source - string
		manipulationMethod - addFirst, addLast or replace (default) - string
		filterTag - a jQuery selector that matches the elements from the AJAX content
		source that you want, for example ".myClass" or "#thisDiv" or "div" - string
		*/
		getAjaxContent: function (content, manipulationMethod, filterTag) {
			var self = this, el = this.element;
			$.ajaxSetup({ cache: false });

			$.get(content, function (data) {
				var filteredContent;

				if (filterTag !== undefined) {
					if (filterTag.length > 0) {
						// A bit of a hack since I can't know if the element
						// that the user wants is a direct child of body (= use filter)
						// or other types of elements (= use find)
						filteredContent = $("<div>").html(data).find(filterTag);
					} else {
						filteredContent = content;
					}
				} else {
					filteredContent = data;
				}

				switch (manipulationMethod) {
					case "addFirst":
						// Add the loaded content first in the scrollable area
						el.data(scrollableArea).children(":first").before(filteredContent);
						break;
					case "addLast":
						// Add the loaded content last in the scrollable area
						el.data(scrollableArea).children(":last").after(filteredContent);
						break;
					default:
						// Replace the content in the scrollable area
						el.data(scrollableArea).html(filteredContent);
						break;
				}

				// Recalculate the total width of the elements inside the scrollable area
				self.recalculateScrollableArea();

				// Determine which hotspots to show
				self._showHideHotSpots();

				// Trigger callback
				self._trigger("addedAjaxContent");

			});
		},
		getHtmlContent: function (content, manipulationMethod, filterTag) {
			var self = this, el = this.element;

			// No AJAX involved at all - just add raw HTML-content
			/* Arguments are:
			content - any raw HTML that you want - string
			manipulationMethod - addFirst, addLast or replace (default) - string
			filterTag - a jQuery selector that matches the elements from the AJAX content
			source that you want, for example ".myClass" or "#thisDiv" or "div" - string
			*/
			var filteredContent;
			if (filterTag !== undefined) {
				if (filterTag.length > 0) {
					// A bit of a hack since I can't know if the element
					// that the user wants is a direct child of body (= use filter)
					// or other types of elements (= use find)
					filteredContent = $("<div>").html(content).find(filterTag);
				} else {
					filteredContent = content;
				}
			} else {
				filteredContent = content;
			}

			switch (manipulationMethod) {
				case "addFirst":
					// Add the loaded content first in the scrollable area
					el.data(scrollableArea).children(":first").before(filteredContent);
					break;
				case "addLast":
					// Add the loaded content last in the scrollable area
					el.data(scrollableArea).children(":last").after(filteredContent);
					break;
				default:
					// Replace the content in the scrollable area
					el.data(scrollableArea).html(filteredContent);
					break;
			}

			// Recalculate the total width of the elements inside the scrollable area
			self.recalculateScrollableArea();
	
			// Determine which hotspots to show
			self._showHideHotSpots();

			// Trigger callback
			self._trigger("addedHtmlContent");

		},
		/**********************************************************
		Recalculate the scrollable area
		**********************************************************/
		recalculateScrollableArea: function () {

			var tempScrollableAreaSize = 0, foundStartAtElement = false, o = this.options, el = this.element, self = this;

			// Add up the total width of all the items inside the scrollable area
			el.data(scrollableArea).children(o.countOnlyClass).each(function () {
				// Check to see if the current element in the loop is the one where the scrolling should start
				if ((o.startAtElementId.length > 0) && (($(this).attr("id")) === o.startAtElementId)) {
					el.data(startingPosition, tempScrollableAreaSize);
					foundStartAtElement = true;
				}
				if (o.scrollOrientation === vertical){
					tempScrollableAreaSize = tempScrollableAreaSize + $(this).outerHeight(true);
				} else {
					tempScrollableAreaSize = tempScrollableAreaSize + $(this).outerWidth(true);
				}

			});

			// If the element with the ID specified by startAtElementId
			// is not found, reset it
			if (!(foundStartAtElement)) {
				el.data("startAtElementId", "");
			}

			// Set the width of the scrollable area
			if (o.scrollOrientation === vertical){
				el.data(scrollableAreaHeight, tempScrollableAreaSize);
				el.data(scrollableArea).height(scrollableAreaHeight);
			} else { 
				el.data(scrollableAreaWidth, tempScrollableAreaSize);
				el.data(scrollableArea).width(el.data(scrollableAreaWidth));
			}	
			// Move to the starting position
			el.data(scrollWrapper).scrollLeft(el.data(startingPosition));
			el.data(scrollPosition, el.data(startingPosition));
		},
		/**********************************************************
		Get current scrolling left offset
		**********************************************************/
		getScrollerOffset: function () {
			var el = this.element, self = this, o = this.options;

			// Returns the current left offset
			// Please remember that if the scroller is in continuous
			// mode, the offset is not that relevant anymore since
			// the plugin will swap the elements inside the scroller
			// around and manipulate the offset in this process.
			if (o.scrollOrientation === vertical){
				return el.data(scrollWrapper).scrollTop();
			} else {
				return el.data(scrollWrapper).scrollLeft();
			}
		},
		/**********************************************************
		Stopping, starting and doing the auto scrolling
		**********************************************************/
		stopAutoScrolling: function () {
			var self = this, el = this.element;

			if (el.data(autoScrollingInterval) !== null) {
				clearInterval(el.data(autoScrollingInterval));
				el.data(autoScrollingInterval, null);

				// Check to see which hotspots should be active
				// in the position where the scroller has stopped
				self._showHideHotSpots();

				self._trigger("autoScrollingStopped");
			}
		},
		/**********************************************************
		Start Autoscrolling
		**********************************************************/
		startAutoScrolling: function () {
			var self = this, el = this.element, o = this.options;

			if (el.data(enabled)) {
				self._showHideHotSpots();

				// Stop any running interval
				clearInterval(el.data(autoScrollingInterval));
				el.data(autoScrollingInterval, null);

				// Callback
				self._trigger("autoScrollingStarted");

				// Start interval
				el.data(autoScrollingInterval, setInterval(function () {

						// Store the old Scroll value to see if the scrolling has reached the end
						el.data(previousScroll, self.getScrollerOffset());
						
						switch (o.autoScrollingDirection) {
							case "right":
							case "down":
								self.move(o.autoScrollingStep);
								if (el.data(previousScroll) > self.getScrollerOffset()) {
									self._trigger("autoScrollingRightLimitReached");
									clearInterval(el.data(autoScrollingInterval));
									el.data(autoScrollingInterval, null);
									self._trigger("autoScrollingIntervalStopped");
								}
								break;

							case "left":
							case "up":
								self.move(-1 * o.autoScrollingStep);
								if ( el.data(previousScroll) < self.getScrollerOffset()) {
									self._trigger("autoScrollingLeftLimitReached");
									clearInterval(el.data(autoScrollingInterval));
									el.data(autoScrollingInterval, null);
									self._trigger("autoScrollingIntervalStopped");
								}
								break;

							case "endlessLoopRight":
							case "endlessLoopDown":
								// Do the auto scrolling
								self.move(o.autoScrollingStep);
								self._checkContinuousSwapPositive();
								break;
								
							case "endlessLoopLeft":
							case "endlessLoopUp":
								// Do the auto scrolling
								self.move(-1 * o.autoScrollingStep);
								self._checkContinuousSwapNegitive();
								break;
								
							case "backAndForth":
								if (el.data(pingPongDirection) === "right") {
									self.move(o.autoScrollingStep);
								}
								else {
									self.move(-1 * o.autoScrollingStep);
								}

								// If the currentScroll hasn't changed it means that the scrolling has reached
								// the end and the direction should be switched
								if (el.data(previousScroll) === self.getScrollerOffset()) {
									if (el.data(pingPongDirection) === "right") {
										el.data(pingPongDirection, "left");
										self._trigger("autoScrollingRightLimitReached");
									}
									else {
										el.data(pingPongDirection, "right");
										self._trigger("autoScrollingLeftLimitReached");
									}
								}
								break;

							default:
								break;

						}
				}, o.autoScrollingInterval));
			}
		},
		/**********************************************************
		Check Continuos Swap Right
		**********************************************************/
		_checkContinuousSwapPositive: function () {
			var el = this.element, o = this.options, self = this;

			// Get the width of the first element. When it has scrolled out of view,
			// the element swapping should be executed. A true/false variable is used
			// as a flag variable so the swapAt value doesn't have to be recalculated
			// in each loop.
			if (el.data(getNextElementOffsetSize)) {

				if ((o.startAtElementId.length > 0) && (el.data(startAtElementHasNotPassed))) {
					// If the user has set a certain element to start at, set swapAt 
					// to that element width. This happens once.
					
					if (o.scrollOrientation === vertical){
						el.data(swapAt, $("#" + o.startAtElementId).outerHeight(true));
					} else {
						el.data(swapAt, $("#" + o.startAtElementId).outerWidth(true));
					}
					el.data(startAtElementHasNotPassed, false);
				}
				else {
					// Set swapAt to the first element in the scroller
					if (o.scrollOrientation === vertical){
						el.data(swapAt, el.data(scrollableArea).children(":first").outerHeight(true));
					} else {
						el.data(swapAt, el.data(scrollableArea).children(":first").outerWidth(true));
					}
				}
				el.data(getNextElementOffsetSize, false);
			}

			var currentScroll = self.getScrollerOffset();
			
			// Check to see if the swap should be done
			if (el.data(swapAt) <= currentScroll) {
				el.data(swappedElement, el.data(scrollableArea).children(":first").detach());
				el.data(scrollableArea).append(el.data(swappedElement));				
				if (o.scrollOrientation === vertical){
					el.data(scrollWrapper).scrollTop(currentScroll - el.data(swappedElement).outerHeight(true));
				} else {
					el.data(scrollWrapper).scrollLeft(currentScroll - el.data(swappedElement).outerWidth(true));
				}
				el.data(getNextElementOffsetSize, true);
			}
		},
		/**********************************************************
		Check Continuos Swap Left
		**********************************************************/
		_checkContinuousSwapNegitive: function () {
			var el = this.element, o = this.options, self = this;

			// Get the width of the first element. When it has scrolled out of view,
			// the element swapping should be executed. A true/false variable is used
			// as a flag variable so the swapAt value doesn't have to be recalculated
			// in each loop.

			if (el.data(getNextElementOffsetSize)) {
				if ((o.startAtElementId.length > 0) && (el.data(startAtElementHasNotPassed))) {
					if (o.scrollOrientation === vertical){
						el.data(swapAt, $("#" + o.startAtElementId).outerHeight(true));
					} else {
						el.data(swapAt, $("#" + o.startAtElementId).outerWidth(true));
					}
					el.data(startAtElementHasNotPassed, false);
				}
				else {
					if (o.scrollOrientation === vertical){
						el.data(swapAt, el.data(scrollableArea).children(":first").outerHeight(true));
					} else { 
						el.data(swapAt, el.data(scrollableArea).children(":first").outerWidth(true));
					}
				}

				el.data(getNextElementOffsetSize, false);
			}

			var currentScroll = self.getScrollerOffset();
			
			// Check to see if the swap should be done
			if (currentScroll === 0) {
				el.data(swappedElement, el.data(scrollableArea).children(":last").detach());
				el.data(scrollableArea).prepend(el.data(swappedElement));				
				if (o.scrollOrientation === vertical){
					el.data(scrollWrapper).scrollTop(currentScroll + el.data(swappedElement).outerHeight(true));
				} else {
					el.data(scrollWrapper).scrollLeft(currentScroll + el.data(swappedElement).outerWidth(true));
				}
				el.data(getNextElementOffsetSize, true);
			}

		},
		restoreOriginalElements: function () {
			var self = this, el = this.element;

			// Restore the original content of the scrollable area
			el.data(scrollableArea).html(el.data(originalElements));
			self.recalculateScrollableArea();
			self.jumpToElement("first");
		},
		show: function () {
			var el = this.element;
			el.data(visible, true);
			el.show();
		},
		hide: function () {
			var el = this.element;
			el.data(visible, false);
			el.hide();
		},
		enable: function () {
			var el = this.element;

			// Set enabled to true
			el.data(enabled, true);
		},
		disable: function () {
			var self = this, el = this.element;

			// Clear all running intervals
			self.stopAutoScrolling();
			clearInterval(el.data(positiveScrollingInterval));
			clearInterval(el.data(negativeScrollingInterval));
			clearInterval(el.data(hideHotSpotBackgroundsInterval));

			// Set enabled to false
			el.data(enabled, false);
		},
		destroy: function () {
			var self = this, el = this.element;

			// Clear all running intervals
			self.stopAutoScrolling();
			clearInterval(el.data(positiveScrollingInterval));
			clearInterval(el.data(negativeScrollingInterval));
			clearInterval(el.data(hideHotSpotBackgroundsInterval));

			// Remove all element specific events
			el.data(scrollingHotSpotPositive).unbind("mouseover");
			el.data(scrollingHotSpotPositive).unbind("mouseout");
			el.data(scrollingHotSpotPositive).unbind("mousedown");

			el.data(scrollingHotSpotNegative).unbind("mouseover");
			el.data(scrollingHotSpotNegative).unbind("mouseout");
			el.data(scrollingHotSpotNegative).unbind("mousedown");

			el.unbind("mousenter");
			el.unbind("mouseleave");

			// Remove all elements created by the plugin
			el.data(scrollingHotSpotPositive).remove();
			el.data(scrollingHotSpotNegative).remove();
			el.data(scrollableArea).remove();
			el.data(scrollWrapper).remove();

			// Restore the original content of the scrollable area
			el.html(el.data(originalElements));

			// Call the base destroy function
			$.Widget.prototype.destroy.apply(this, arguments);

		}


	});
})(jQuery);
