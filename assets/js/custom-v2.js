/**
 * Waldo Panozo - Portfolio V2
 * Custom JavaScript for interactive features
 */

(function($) {
  'use strict';

  $(document).ready(function() {
    
    // ============================================
    // Smooth Scrolling for Navigation Links
    // ============================================
    $('a[href^="#"]').on('click', function(e) {
      var target = $(this.getAttribute('href'));
      if (target.length) {
        e.preventDefault();
        $('html, body').stop().animate({
          scrollTop: target.offset().top - 80
        }, 1000, 'easeInOutExpo');
        
        // Update active nav item
        $('.navbar-nav li').removeClass('active');
        $(this).parent().addClass('active');
      }
    });

    // ============================================
    // Navbar Scroll Effect
    // ============================================
    $(window).on('scroll', function() {
      if ($(window).scrollTop() > 50) {
        $('#main-nav').addClass('scrolled');
      } else {
        $('#main-nav').removeClass('scrolled');
      }
    });

    // ============================================
    // Active Navigation Item on Scroll
    // ============================================
    $(window).on('scroll', function() {
      var scrollPos = $(window).scrollTop() + 100;
      
      $('.navbar-nav a[href^="#"]').each(function() {
        var currLink = $(this);
        var refElement = $(currLink.attr('href'));
        
        if (refElement.length && 
            refElement.position().top <= scrollPos && 
            refElement.position().top + refElement.height() > scrollPos) {
          $('.navbar-nav li').removeClass('active');
          currLink.parent().addClass('active');
        }
      });
    });

    // ============================================
    // Portfolio Lightbox (Simple Implementation)
    // ============================================
    $('.portfolio-link[data-lightbox]').on('click', function(e) {
      e.preventDefault();
      var imgSrc = $(this).attr('href');
      
      // Create lightbox overlay
      var lightbox = $('<div class="lightbox-overlay"></div>');
      var lightboxImg = $('<img src="' + imgSrc + '" class="lightbox-image">');
      var lightboxClose = $('<span class="lightbox-close">&times;</span>');
      
      lightbox.append(lightboxImg).append(lightboxClose);
      $('body').append(lightbox);
      $('body').css('overflow', 'hidden');
      
      // Close on click
      lightboxClose.on('click', function() {
        lightbox.fadeOut(300, function() {
          $(this).remove();
          $('body').css('overflow', 'auto');
        });
      });
      
      lightbox.on('click', function(e) {
        if (e.target === this) {
          lightboxClose.click();
        }
      });
      
      // Close on ESC key
      $(document).on('keyup.lightbox', function(e) {
        if (e.keyCode === 27) {
          lightboxClose.click();
          $(document).off('keyup.lightbox');
        }
      });
      
      lightbox.fadeIn(300);
    });

    // ============================================
    // Animate on Scroll
    // ============================================
    function animateOnScroll() {
      $('.timeline-item, .skill-category, .portfolio-card, .highlight-item, .contact-card').each(function() {
        var elementTop = $(this).offset().top;
        var elementBottom = elementTop + $(this).outerHeight();
        var viewportTop = $(window).scrollTop();
        var viewportBottom = viewportTop + $(window).height();
        
        if (elementBottom > viewportTop && elementTop < viewportBottom) {
          $(this).addClass('animate-in');
        }
      });
    }

    $(window).on('scroll', animateOnScroll);
    animateOnScroll(); // Run on page load

    // ============================================
    // Counter Animation for Stats
    // ============================================
    function animateCounter() {
      $('.stat-number').each(function() {
        var $this = $(this);
        var countTo = $this.text();
        
        if (countTo.includes('+')) {
          var num = parseInt(countTo.replace('+', ''));
          $({ countNum: 0 }).animate({
            countNum: num
          }, {
            duration: 2000,
            easing: 'swing',
            step: function() {
              $this.text(Math.floor(this.countNum) + '+');
            },
            complete: function() {
              $this.text(countTo);
            }
          });
        } else if (countTo.includes('%')) {
          $this.text(countTo); // Keep 100% as is
        }
      });
    }

    // Trigger counter animation when hero section is in view
    $(window).on('scroll', function() {
      var heroBottom = $('.hero-section').offset().top + $('.hero-section').outerHeight();
      var scrollTop = $(window).scrollTop() + $(window).height();
      
      if (scrollTop > heroBottom && !$('.stat-number').hasClass('counted')) {
        $('.stat-number').addClass('counted');
        animateCounter();
      }
    });

    // ============================================
    // Mobile Menu Close on Link Click
    // ============================================
    $('.navbar-nav a').on('click', function() {
      if ($(window).width() < 768) {
        $('.navbar-collapse').collapse('hide');
      }
    });

    // ============================================
    // Form Validation (if forms are added later)
    // ============================================
    // Placeholder for future form handling

    // ============================================
    // Loading Animation
    // ============================================
    $(window).on('load', function() {
      $('body').addClass('loaded');
    });

  });

  // ============================================
  // Easing function for smooth scrolling
  // ============================================
  $.easing.easeInOutExpo = function(x, t, b, c, d) {
    if (t === 0) return b;
    if (t === d) return b + c;
    if ((t /= d / 2) < 1) return c / 2 * Math.pow(2, 10 * (t - 1)) + b;
    return c / 2 * (-Math.pow(2, -10 * --t) + 2) + b;
  };

})(jQuery);

// ============================================
// Lightbox CSS (injected via JS)
// ============================================
var lightboxStyle = document.createElement('style');
lightboxStyle.textContent = `
  .lightbox-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.95);
    z-index: 9999;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem;
  }
  
  .lightbox-image {
    max-width: 90%;
    max-height: 90%;
    object-fit: contain;
    border-radius: 8px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  }
  
  .lightbox-close {
    position: absolute;
    top: 2rem;
    right: 2rem;
    color: white;
    font-size: 3rem;
    cursor: pointer;
    width: 50px;
    height: 50px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 50%;
    transition: all 0.3s ease;
  }
  
  .lightbox-close:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: scale(1.1);
  }
  
  @media (max-width: 768px) {
    .lightbox-image {
      max-width: 95%;
      max-height: 95%;
    }
    
    .lightbox-close {
      top: 1rem;
      right: 1rem;
      font-size: 2rem;
      width: 40px;
      height: 40px;
    }
  }
`;
document.head.appendChild(lightboxStyle);

// ============================================
// Animation CSS (injected via JS)
// ============================================
var animationStyle = document.createElement('style');
animationStyle.textContent = `
  .timeline-item,
  .skill-category,
  .portfolio-card,
  .highlight-item,
  .contact-card {
    opacity: 0;
    transform: translateY(30px);
    transition: opacity 0.6s ease, transform 0.6s ease;
  }
  
  .timeline-item.animate-in,
  .skill-category.animate-in,
  .portfolio-card.animate-in,
  .highlight-item.animate-in,
  .contact-card.animate-in {
    opacity: 1;
    transform: translateY(0);
  }
`;
document.head.appendChild(animationStyle);
