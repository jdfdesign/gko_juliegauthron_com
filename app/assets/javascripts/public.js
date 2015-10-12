//= require jquery_ujs
//= require jquery.placeholder
//= require jquery.easing
//= require jquery.mixitup
//= require jquery.imagesloaded
//= require bootstrap-hover-dropdown.js

// make console.log safe to use
window.console || (console = {
  log: function() {}
});
var map;

jQuery(function($) {
  'use strict';
  var THEME = window.THEME || {
    filterState: "all",
    mode: "video"
  };
  var winHeight = 0;
  var navbarHeight = 0;


  /* ==================================================
  	Fix
  ================================================== */

  THEME.fix = function() {
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

  THEME.placeholder = function() {
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

      } else {
        that.find('.carousel-control').each(function(index) {
          $(this).css({ display: 'none' })
        })
        that.find('.carousel-indicators').each(function(index) {
          $(this).css({ display: 'none' })
        })
      }

      that.on("slide.bs.carousel", function(event) {
        // Bootstrap carousel marks the current slide (the one we're exiting) with an 'active' class
        var $currentSlide = $(this).find(".active iframe");
        //alert($currentSlide.html())
        // exit if there's no iframe, i.e. if this is just an image and not a video player
        if (!$currentSlide.length) {
          return;
        }

        // pass that iframe into Froogaloop, and call api("pause") on it.
        var player = Froogaloop($currentSlide[0]);
        player.api("pause");

      });
    });

  };

  // ON RESIZE
  // ==================================================

  THEME.getScreenHeight = function() {
    var navbarHeight = $(".navbar").height();
    var winHeight = $(window).outerHeight();
    return Math.round(winHeight - navbarHeight);
  }
  
  // ON RESIZE
  // ==================================================

  THEME.resizing = function() {
    var navbarHeight = $(".navbar").height(),
        winHeight = $(window).outerHeight(),
        $carousel = $("#project-carousel"),
        $project = $('#project-wrapper');
    
    $project.css({ 'top': navbarHeight });
    
    if( $(window).outerWidth() > 768 ) {
      $carousel.css("max-height", Math.round(THEME.getScreenHeight() * 0.8) );
    }
    
    $('#projects-wrapper').css("min-height", THEME.getScreenHeight());
    
    if(THEME.mode == "video") {
      var bottomProject = Math.round( $("#player").height() + navbarHeight );
      $('#projects-wrapper').css({ 'margin-top': bottomProject });
    }
    else {
      var bottomProject = Math.round( $('#project-wrapper').outerHeight(true) + navbarHeight );
      $('#projects-wrapper').css({ 'margin-top': bottomProject });
    }
  };

  // ON RESIZE
  // ==================================================

  THEME.update = function() {
    /* $('#previous-project, #next-project').on("click", function(e) {
      var myElement = $("a.thumbnail[href='" + $(this).attr("href") + "']");
      if (myElement.length) {
        myElement.trigger("click");
      }
      e.preventDefault();
    }); */
  };
  
  /*==================================================
  	Init
==================================================*/

  $(document).ready(function() {

    var isHome = true;
    var $projects = $(".projects");
    var $projectsWrapper = $("#projects-wrapper");

    // Enable categories filter
    $projects.mixItUp({
      targetDisplayGrid: 'block', // required to fix bug in Chrome with images height
      callbacks: {
        onMixLoad: function(state) {
          console.log("onMixLoad " + state.activeFilter);
          $('body, html').animate({ scrollTop: 0 }, 1500, 'easeOutExpo');
        },
        
        onMixEnd: function(state) {
          console.log("onMixEnd " + state.activeFilter);
          if(state.activeFilter == $projects.mixItUp('getOption', 'selectors.target')) {
            $("#category-title").html($('a[data-filter]:first').text());
            $("#category-description").html("");
          } else {
            var target = $('a[data-filter="' + state.activeFilter  + '"]');
            $("#category-title").html(target.text());
            $("#category-description").html(target.data("text"));
            
          }
          
          var t = 0;
          
          if((THEME.getScreenHeight() + $("#projects-wrapper").position().top) > 0) {
            t = 80;
          } else {
            t = THEME.getScreenHeight() - 100;
          }
          
          //console.log(t)
          
          $('body, html').animate({ scrollTop: t }, 1500, 'easeOutExpo', function() {
            $("#close-btn").show();
          });
        }
      }
    });
    
    $("#close-btn").on("click", function(e){
      $("#projects-wrapper").animate({ scrollTop: 0 }, 1500, 'easeOutExpo', function() {
        $("#close-btn").hide();
      });
    })
    
    $('a[data-filter]').on("click", function(e){
      if($("body").hasClass('off-canvas-open')) {
        $("body").removeClass('off-canvas-open');
      }
    })
    
    $("#btn-categories").on("click", function(e) {
      $("body").toggleClass('off-canvas-open');
    })

    THEME.update();

    $(".thumbnail").on("ajax:beforeSend", function(evt, xhr, settings) {
      if ($(this).hasClass("active")) {
        return;
      };
      $('.thumbnail').removeClass("active");
      $(this).addClass("active");
      $("#project-container").hide();
      $(".throbber_page").show();
      $('body, html').stop().animate({ scrollTop: 0 }, 1500, 'easeOutExpo', function(){
        console.log("Finish");
      });
    })
      .on("ajax:success", function(evt, xhr, settings) {
        var that = $(this),
          url = that.attr('href'),
          $container = $("#project-container");

        history.pushState(null, null, url);

        if (typeof(_gaq) != "undefined") {
          _gaq.push(['_trackPageview', url]);
        } else {
          console.log("_gaq disabled for _trackPageview" + url)
        }
        
        $container.html(eval(xhr));
        THEME.mode = "project";
        THEME.update();
        THEME.placeholder();
        THEME.carousel();
        
        
        // Check image loaded to adjust thmbnails height
        $('#project-carousel').imagesLoaded()
          .always(function(instance) {
            THEME.resizing();
            $(".throbber_page").hide();
          });
        
        var category = that.parent().data('category');
        
        console.log("category: " + category);

        $container.show();

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


    $('.testimonial-title > span').each(function() {
      var $object = $('> span', this);
      var delay = Math.floor((Math.random() * 450)) + ($(this).index() * 150);

      setTimeout(function() {
        $object.width($object.parent().width());
      }, delay);
    });

    THEME.fix();
    THEME.placeholder();
    THEME.carousel();

    ///////////////////////////////////////////////////////
    // Handle Window Resizing
    
    $(window).resize(function() {
      THEME.resizing();
    })
    
    $('#projects-wrapper').imagesLoaded()
      .always(function(instance) {
        console.log("ok")
        THEME.resizing();
    });

    //$(window).trigger('resize');

  });
});