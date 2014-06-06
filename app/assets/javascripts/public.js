//= require jquery_ujs
//= require jquery.placeholder
//= require jquery.easing
//= require jquery.mixitup
//= require jquery.imagesloaded

// make console.log safe to use
window.console || (console = {
  log: function() {}
});
var map;
jQuery(function($){
  'use strict';
  var THEME = window.THEME || {};

  /* ==================================================
  	Fix
  ================================================== */

  THEME.fix = function(){
    // fix for ie device_width bug 
    if (navigator.userAgent.match(/IEMobile\/10\.0/)) {
      var msViewportStyle = document.createElement("style");
      msViewportStyle.appendChild(
      document.createTextNode("@-ms-viewport{width:auto!important}"));
      document.getElementsByTagName("head")[0].
      appendChild(msViewportStyle);
    }
  };
  /* ==================================================
  	Placeholder
  ================================================== */

  THEME.placeholder = function(){
    // enable placeholder fix for old browsers
    $('input, textarea').placeholder();
  };
  /* ==================================================
  	Carousel
  ================================================== */

    THEME.carousel = function() {
      $('.carousel').each(function(index) {
        var that = $(this);
        
        // start the carousel if there is more than one image else hide controls
        if (that.find('.item').length > 1) {
          that.carousel({
            interval: 3000
          });
        } else {
          that.find('.carousel-control').each(function(index) {
            $(this).css({
              display: 'none'
            })
          })
          that.find('.carousel-indicators').each(function(index) {
            $(this).css({
              display: 'none'
            })
          })
        }
        
        that.on("slide.bs.carousel", function (event) {
          // Bootstrap carousel marks the current slide (the one we're exiting) with an 'active' class
          var $currentSlide = $(this).find(".active iframe");
          //alert($currentSlide.html())
          // exit if there's no iframe, i.e. if this is just an image and not a video player
          if (!$currentSlide.length) { return; }

          // pass that iframe into Froogaloop, and call api("pause") on it.
          var player = Froogaloop($currentSlide[0]);
          player.api("pause");

        });
      });

    };

    // SCROLLING ACTIONS
    // ==================================================

    THEME.scrolling = function(){
    	var didScroll = false,
          docElem = document.documentElement,
          //$navbar = $('#main-menu'),
          $arrow = $('#go-up-arrow'),
          $projects = $(".projects"),
          $categories = $("#categories-filter"),
          offset = 0;


    	$arrow.click(function(e) {
    		$('body, html').animate({ scrollTop: "0" }, 1500, 'easeOutExpo' );
    		e.preventDefault();
    	});

    	$(window).scroll(function() {
    		didScroll = true;
    	});

    	setInterval(function() {
    		if( didScroll ) {
    			didScroll = false;
          offset = window.pageYOffset || docElem.scrollTop;

    			if( offset > 1000 ) {
    				$arrow.css('display', 'block');
    			} else {
    				$arrow.css('display', 'none');
    			}
          
          $projects.css("min-height", $categories.outerHeight());
          
          if ( offset >= $projects.offset().top ) {
            $categories.addClass("fixed");
          }
          else {
            $categories.removeClass("fixed");
          }
    		}
    	}, 250);
    };
    
  /* ==================================================
    	Navigation
    ================================================== */
    THEME.navigation = function() {
      
      var navbarHeight = $('.navbar').height();
      $(window).bind('scroll', function () {
        var scrollTop = jQuery(window).scrollTop();
        scrollTop >= $(window).height() - navbarHeight ? $(".navbar").addClass("fixed") : $(".navbar").removeClass("fixed");
      });
      
      $('.navbar-nav li').on("click", function(e) {
        var target = $("#" + $(this).attr('id') + "_page"),
            navbarHeight = $('.navbar').height();
        console.log(target);
        $(this).parent().find('li').removeClass('active');
        $(this).addClass('active');

        if ($(window).width() <= 767) {
          $('html, body').stop().animate({
            scrollTop: target.offset().top - navbarHeight
          }, 1500, 'easeInOutExpo');
        } else {
          $('html, body').stop().animate({
            scrollTop: target.offset().top - navbarHeight
          }, 1500, 'easeInOutExpo');
        }

        e.preventDefault();
      })
      
      
    }
    
    // ON RESIZE
    // ==================================================

    THEME.resizing = function(){
      var navbarHeight = $(".navbar").height(),
          theHeight = $(window).outerHeight() - navbarHeight;
      //$('#wrapper').css({'margin-top': navbarHeight});
      $('#project-wrapper').css({'height': theHeight});
      //$('#project-carousel').css({'height': theHeight});

      //THEME.equalHeight();
    };


/*==================================================
  	Init
==================================================*/

  $(document).ready(function() {

    ///////////////////////////////////////////////////////
    // Creates the filter menu for mobile version
    $('.th-mixitup-control').addClass("hidden-xs").each(function() {
      var select = $(document.createElement('select')).insertBefore($(this).parent()).addClass('visible-xs');;
      $('> li', this).each(function() {
        $(document.createElement('option')).appendTo(select).val(this.href).html($(this).html()).addClass($(this).attr('data-filter'));
      });
    });
    
    ///////////////////////////////////////////////////////
    // Enable categories filter for select in mobile version
    $('select').on('change', function() {
      $('.th-thumbnails').mixItUp('filter', jQuery(this).find('option:selected').attr('class'));
    });
    
    $('.th-thumbnails').mixItUp({
      layout: {
        display: 'block'
      },
    	callbacks: {
    		onMixEnd: function(state){
    			console.log(state)
    		}	
    	}
    });
    
   $('#prev-project').on("click", function(e) {
     var $active = $('.thumbnail.active'),
         $prev;
     if (!$active.length) { return; }
     $prev = $active.parent().prevAll(':visible').first();
     if (!$prev.length) { 
       $prev = $('.th-thumbnails article:visible').last();
     }
     $prev.find("a").trigger("click");
     e.preventDefault();
   });
   
   $('#next-project').on("click", function(e) {
   
     var $active = $('.thumbnail.active'),
         $next;
     if (!$active.length) { return; }
     $next = $active.parent().nextAll(':visible').first();
     if (!$next.length) { 
       $next = $('.th-thumbnails article:visible').first();
     }
     $next.find("a").trigger("click");
     e.preventDefault();
   });
   
   ///////////////////////////////////////////////////////////////
   // Project Ajax
   
    $(".thumbnail").on("ajax:beforeSend", function(evt, xhr, settings) {
      console.log("remote");
      if($(this).hasClass("active")) { return };
      $('.thumbnail').removeClass("active");
      $(this).addClass("active");
      $("#project-container").hide();
      $(".throbber_page").show();
      $('body, html').animate({ scrollTop: "0" }, 1500, 'easeOutExpo' );
      
    })
    .on("ajax:success", function(evt, xhr, settings) {
      //console.log("Site.success xhr " + eval(xhr))
      var that = $(this), 
          url = that.attr('href');
      
      history.pushState(null, null, url);
      
      if (typeof(_gaq) != "undefined") {
        _gaq.push(['_trackPageview', url]);  
      } else {
        console.log("_gaq disabled for _trackPageview" + url)
      }

      $("#project-container").html(eval(xhr));
      THEME.placeholder();
      THEME.carousel();
      // Check image loaded to adjust thmbnails height
      $('#project-carousel').imagesLoaded()
      .always( function( instance ) {
        $(".throbber_page").hide();
      });
      
      
      $("#project-container").show();
      
      try {
        FB.XFBML.parse();
      } catch (e) {
        console.log("FB error");
      }
    })
    .on("ajax:error", function(evt, xhr, status, error) {
      var flash = $.parseJSON(xhr.getResponseHeader('X-Flash-Messages'));
      console.log("Site.error " + flash.error);
    });

    

    
    
  	$('.testimonial-title > span').each(function(){
  		var $object = $('> span', this);
  		var delay = Math.floor((Math.random()*450)) + ($(this).index() * 150); 

  		setTimeout(function(){
  			$object.width($object.parent().width());
  		}, delay);
  	});
    
    THEME.fix();
    THEME.scrolling();
    THEME.placeholder();
    THEME.carousel();

    ///////////////////////////////////////////////////////
    // Handle Window Resizing
    $(window).resize(function() {
      THEME.resizing();
    })
    $( window ).trigger('resize');
  });
}); 
