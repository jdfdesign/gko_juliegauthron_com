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
    filterState: "all"
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

  THEME.resizing = function() {
    navbarHeight = $(".navbar").height();
    winHeight = $(window).outerHeight();
    var theHeight = winHeight - navbarHeight;

    console.log(winHeight);
    if ($(window).width() > 768) {
      $('#project-wrapper').css({
        'height': theHeight
      });
    } else {
      $('#project-wrapper').css({
        'height': 'auto'
      });
    }
  };

  // ON RESIZE
  // ==================================================

  THEME.update = function() {
    $('#previous-project, #next-project').on("click", function(e) {
      var myElement = $("a.thumbnail[href='" + $(this).attr("href") + "']");
      if (myElement.length) {
        myElement.trigger("click");
      }
      e.preventDefault();
    });
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
        onMixEnd: function(state) {
          console.log(state.activeFilter);
          if(state.activeFilter == $projects.mixItUp('getOption', 'selectors.target')) {
            $("#category-title").html($('a[data-filter]:first').text());
            $("#category-description").html("");
          } else {
            var target = $('a[data-filter="' + state.activeFilter  + '"]');
            $("#category-title").html(target.text());
            $("#category-description").html(target.data("text"));
          }
          $('body, html').animate({
            scrollTop: Math.round($("#projects-wrapper").offset().top) - 200
          }, 1500, 'easeOutExpo');
        }
      }
    });
    
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
        return
      };
      $('.thumbnail').removeClass("active");
      $(this).addClass("active");
      $("#project-container").hide();
      $(".throbber_page").show();
      $('body, html').animate({
        scrollTop: "0"
      }, 1500, 'easeOutExpo');
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
        THEME.update();
        THEME.placeholder();
        THEME.carousel();
        
        // Check image loaded to adjust thmbnails height
        $('#project-carousel').imagesLoaded()
          .always(function(instance) {
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

    $(window).trigger('resize');

  });
});

$(function() {
  var state;
  var iframe = $('#player')[0];
  var player = $f(iframe);
  console.log(player);
  player.addEvent('ready', function() {
    //status.text('ready');
    console.log('ready');
    player.addEvent('ready', onPause);
    player.addEvent('finish', onFinish);
    player.addEvent('playProgress', onPlayProgress);
  });

  function onPause(id) {
    console.log('paused');
  }

  function onFinish(id) {
    console.log('finished');
  }

  function onPlayProgress(data, id) {
    console.log(data.seconds + 's played');
  }
});
