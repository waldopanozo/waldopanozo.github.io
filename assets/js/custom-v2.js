/**
 * Waldo Panozo - Portfolio V2
 * Custom JavaScript for interactive features
 */

(function($) {
  'use strict';

  $(document).ready(function() {
    // ============================================
    // Resume API Integration
    // ============================================
    (function integrateResumeApi() {
      if (!window.fetch) {
        console.warn('Resume API integration skipped: fetch not supported.');
        return;
      }

      var defaultBaseUrl = 'https://api.waldo.panozo.info';
      var apiBase = (window.__RESUME_API_BASE_URL__ || defaultBaseUrl).replace(/\/$/, '');
      var fallbackUrl = (window.__RESUME_FALLBACK_URL__ || 'assets/data/resume-fallback.json').replace(/^\//, '');

      var SKILL_CARD_META = {
        programming_languages: { title: 'Programming Languages', icon: 'fa fa-code' },
        frameworks: { title: 'Frameworks & Tools', icon: 'fa fa-cogs' },
        databases: { title: 'Databases', icon: 'fa fa-database' },
        project_management: { title: 'Project Management', icon: 'fa fa-tasks' },
        languages: { title: 'Languages', icon: 'fa fa-language' },
      };

      var SOCIAL_ICONS = {
        linkedin: 'fa fa-linkedin',
        github: 'fa fa-github',
        blog: 'fa fa-globe',
        facebook: 'fa fa-facebook',
        twitter: 'fa fa-twitter',
        x: 'fa fa-twitter',
      };

      function setNodeText(node, value, transform) {
        if (!node || typeof value === 'undefined' || value === null) {
          return;
        }

        if (Array.isArray(value)) {
          value = value.join(' · ');
        }

        var finalValue = value;
        var nodeTransform = transform || node.dataset.profileTransform;
        if (nodeTransform === 'uppercase' && typeof finalValue === 'string') {
          finalValue = finalValue.toUpperCase();
        }

        node.textContent = finalValue;
      }

      function renderStats(stats) {
        var container = document.querySelector('[data-profile-stats]');
        if (!container || !Array.isArray(stats) || !stats.length) {
          return;
        }

        container.innerHTML = stats.map(function(stat) {
          if (!stat || !stat.value || !stat.label) {
            return '';
          }

          return (
            '<div class="stat-item">' +
              '<div class="stat-number">' + stat.value + '</div>' +
              '<div class="stat-label">' + stat.label + '</div>' +
            '</div>'
          );
        }).join('');
      }

      function hydrateProfile(profile) {
        if (!profile || typeof profile !== 'object') {
          return;
        }

        document.querySelectorAll('[data-profile-field]').forEach(function(node) {
          var field = node.dataset.profileField;
          if (!field) return;
          setNodeText(node, profile[field]);
        });

        renderStats(profile.stats);
      }

      function hydrateAbout(about) {
        if (!about || typeof about !== 'object') {
          return;
        }

        var bioNode = document.querySelector('[data-about-bio]');
        if (bioNode && about.bio) {
          setNodeText(bioNode, about.bio);
        }

        // Render full bio in the about section
        var bioFullNode = document.querySelector('[data-about-bio-full]');
        if (bioFullNode && about.bio_full) {
          // Split bio_full by newlines to create paragraphs
          var paragraphs = about.bio_full.split('\n\n').filter(function(p) { return p.trim(); });
          bioFullNode.innerHTML = paragraphs.map(function(para) {
            return '<p>' + para.trim() + '</p>';
          }).join('');
        } else if (bioFullNode && about.bio) {
          // Fallback to bio if bio_full is not available
          bioFullNode.innerHTML = '<p>' + about.bio + '</p>';
        }

        var rolesList = document.querySelector('[data-about-roles]');
        if (rolesList && Array.isArray(about.roles)) {
          rolesList.innerHTML = about.roles.map(function(role) {
            return '<li><i class="fa fa-check-circle"></i> <strong>' + role + '</strong></li>';
          }).join('');
        }

        var highlightsWrapper = document.querySelector('[data-about-achievements]');
        if (highlightsWrapper && Array.isArray(about.achievements)) {
          highlightsWrapper.innerHTML = about.achievements.map(function(item) {
            if (!item || !item.title || !item.description) {
              return '';
            }

            return (
              '<div class="highlight-item">' +
                '<div class="highlight-icon"><i class="fa fa-star"></i></div>' +
                '<div class="highlight-content">' +
                  '<h4>' + item.title + '</h4>' +
                  '<p>' + item.description + '</p>' +
                '</div>' +
              '</div>'
            );
          }).join('');
        }
      }

      function renderExperience(experience) {
        var timeline = document.querySelector('[data-experience-list]');
        if (!timeline || !Array.isArray(experience)) {
          return;
        }

        timeline.innerHTML = experience.map(function(job) {
          if (!job) return '';

          var rolesHtml = (job.roles || []).map(function(role) {
            if (!role || !role.title) return '';

            var highlights = Array.isArray(role.highlights)
              ? '<ul>' + role.highlights.map(function(point) {
                  return '<li>' + point + '</li>';
                }).join('') + '</ul>'
              : '';

            return (
              '<div class="role-block">' +
                '<h5>' + role.title + (role.period ? ' · ' + role.period : '') + '</h5>' +
                highlights +
              '</div>'
            );
          }).join('');

          var techStack = Array.isArray(job.tech_stack) && job.tech_stack.length
            ? '<div class="tech-stack-badge"><strong>Tech Stack:</strong> ' + job.tech_stack.join(', ') + '</div>'
            : '';

          return (
            '<div class="timeline-item">' +
              '<div class="timeline-year">' + (job.timeline_label || job.period || '') + '</div>' +
              '<div class="timeline-content">' +
                '<h3>' + (job.company || '') + '</h3>' +
                (job.location || job.period ? '<h4>' + [job.location, job.period].filter(Boolean).join(' | ') + '</h4>' : '') +
                rolesHtml +
                techStack +
              '</div>' +
            '</div>'
          );
        }).join('');
      }

      function capitalize(text) {
        if (typeof text !== 'string') return text;
        return text.charAt(0).toUpperCase() + text.slice(1);
      }

      function buildSkillLines(skillGroup) {
        if (!skillGroup || typeof skillGroup !== 'object') return '';

        return Object.keys(skillGroup).map(function(level) {
          var entries = skillGroup[level];
          if (!Array.isArray(entries) || !entries.length) {
            return '';
          }

          var label = capitalize(level.replace(/_/g, ' '));
          return '<li><strong>' + label + ':</strong> ' + entries.join(', ') + '</li>';
        }).join('');
      }

      function renderSkillColumns(keys, skills, columnClass) {
        return keys.map(function(key) {
          var data = skills[key];
          if (!data) return '';

          var meta = SKILL_CARD_META[key] || { title: capitalize(key.replace(/_/g, ' ')), icon: 'fa fa-cogs' };
          var listItems = buildSkillLines(data);
          if (!listItems) return '';

          return (
            '<div class="' + columnClass + '">' +
              '<div class="skill-category">' +
                '<div class="skill-icon"><i class="' + meta.icon + '"></i></div>' +
                '<h3>' + meta.title + '</h3>' +
                '<ul class="skill-list">' + listItems + '</ul>' +
              '</div>' +
            '</div>'
          );
        }).join('');
      }

      function renderSkills(skills) {
        if (!skills || typeof skills !== 'object') {
          return;
        }

        var primaryRow = document.querySelector('[data-skills-primary]');
        if (primaryRow) {
          primaryRow.innerHTML = renderSkillColumns(
            ['programming_languages', 'frameworks', 'databases'],
            skills,
            'col-lg-4 col-md-6'
          );
        }

        var secondaryRow = document.querySelector('[data-skills-secondary]');
        if (secondaryRow) {
          secondaryRow.innerHTML = renderSkillColumns(
            ['project_management', 'languages'],
            skills,
            'col-lg-6 col-md-6'
          );
        }

        var additionalWrapper = document.querySelector('[data-skills-additional]');
        if (additionalWrapper && skills.additional) {
          var additionalHtml = Object.keys(skills.additional).map(function(name) {
            var items = skills.additional[name];
            if (!Array.isArray(items) || !items.length) return '';

            return (
              '<div class="col-lg-3 col-md-6">' +
                '<div class="tech-item">' +
                  '<i class="fa fa-check-square-o"></i>' +
                  '<h4>' + name + '</h4>' +
                  '<p>' + items.join(', ') + '</p>' +
                '</div>' +
              '</div>'
            );
          }).join('');

          additionalWrapper.innerHTML = '<h3 class="text-center mb-40">Additional Technologies</h3><div class="row">' + additionalHtml + '</div>';
        }
      }

      function renderEducation(education) {
        var timeline = document.querySelector('[data-education-list]');
        if (!timeline || !Array.isArray(education)) {
          return;
        }

        timeline.innerHTML = education.map(function(entry) {
          if (!entry) return '';

          return (
            '<div class="education-item">' +
              '<div class="education-year">' + (entry.status || '') + '</div>' +
              '<div class="education-content">' +
                '<h3>' + (entry.title || '') + '</h3>' +
                '<h4>' + (entry.institution || '') + '</h4>' +
                (entry.notes ? '<p>' + entry.notes + '</p>' : '') +
              '</div>' +
            '</div>'
          );
        }).join('');
      }

      function renderPortfolio(portfolio) {
        var track = document.querySelector('[data-portfolio-track]');
        if (!track || !Array.isArray(portfolio)) {
          return;
        }

        track.innerHTML = portfolio.map(function(item) {
          if (!item) return '';

          var tags = Array.isArray(item.tags)
            ? item.tags.map(function(tag) {
                return '<span class="tag">' + tag + '</span>';
              }).join('')
            : '';

          var links = [];
          // Add search icon for lightbox if image exists
          if (item.image) {
            links.push('<a href="' + item.image + '" class="portfolio-link portfolio-lightbox-link" data-lightbox-src="' + item.image + '"><i class="fa fa-search"></i></a>');
          }
          // Add external link icon if link exists
          if (item.link) {
            links.push('<a href="' + item.link + '" target="_blank" class="portfolio-link" onclick="event.stopPropagation();"><i class="fa fa-external-link"></i></a>');
          }

          return (
            '<div class="portfolio-slide">' +
              '<div class="portfolio-card">' +
                '<div class="portfolio-image">' +
                  (item.image ? '<img src="' + item.image + '" alt="' + (item.title || 'Portfolio item') + '">' : '') +
                  (links.length ? '<div class="portfolio-overlay"><div class="portfolio-links">' + links.join('') + '</div></div>' : '') +
                '</div>' +
                '<div class="portfolio-content">' +
                  '<h3>' + (item.title || '') + '</h3>' +
                  '<p>' + (item.description || '') + '</p>' +
                  '<div class="portfolio-tags">' + tags + '</div>' +
                '</div>' +
              '</div>' +
            '</div>'
          );
        }).join('');

        // Add click handlers for lightbox links after rendering
        track.querySelectorAll('.portfolio-lightbox-link').forEach(function(link) {
          link.addEventListener('click', function(e) {
            e.preventDefault();
            var imgSrc = this.getAttribute('data-lightbox-src');
            openLightbox(imgSrc);
          });
        });
      }

      function openLightbox(imgSrc) {
        // Create lightbox overlay
        var lightbox = document.createElement('div');
        lightbox.className = 'lightbox-overlay';
        lightbox.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.9); z-index: 10000; display: flex; align-items: center; justify-content: center; cursor: pointer;';
        
        var lightboxImg = document.createElement('img');
        lightboxImg.src = imgSrc;
        lightboxImg.className = 'lightbox-image';
        lightboxImg.style.cssText = 'max-width: 90%; max-height: 90%; object-fit: contain; border-radius: 8px; box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);';
        
        var lightboxClose = document.createElement('span');
        lightboxClose.className = 'lightbox-close';
        lightboxClose.innerHTML = '&times;';
        lightboxClose.style.cssText = 'position: absolute; top: 20px; right: 30px; color: white; font-size: 40px; font-weight: bold; cursor: pointer; z-index: 10001; line-height: 1;';
        
        lightbox.appendChild(lightboxImg);
        lightbox.appendChild(lightboxClose);
        document.body.appendChild(lightbox);
        document.body.style.overflow = 'hidden';
        
        // Close on click (overlay or close button)
        function closeLightbox() {
          lightbox.style.opacity = '0';
          setTimeout(function() {
            lightbox.remove();
            document.body.style.overflow = 'auto';
          }, 300);
        }
        
        lightboxClose.addEventListener('click', function(e) {
          e.stopPropagation();
          closeLightbox();
        });
        
        lightbox.addEventListener('click', function(e) {
          if (e.target === lightbox) {
            closeLightbox();
          }
        });
        
        // Close on ESC key
        function handleEsc(e) {
          if (e.key === 'Escape') {
            closeLightbox();
            document.removeEventListener('keydown', handleEsc);
          }
        }
        document.addEventListener('keydown', handleEsc);
        
        // Fade in
        setTimeout(function() {
          lightbox.style.opacity = '1';
          lightbox.style.transition = 'opacity 0.3s ease';
        }, 10);
      }

      function sanitizeWhatsapp(number) {
        if (typeof number !== 'string') return null;
        return number.replace(/[^\d]/g, '');
      }

      function renderContact(contact, profile) {
        var grid = document.querySelector('[data-contact-grid]');
        if (!grid || !contact) {
          return;
        }

        var cards = [];
        if (contact.email) {
          cards.push({
            icon: 'fa fa-envelope',
            title: 'Email',
            content: '<a href="mailto:' + contact.email + '">' + contact.email + '</a>',
          });
        }

        if (contact.whatsapp_bolivia) {
          var boliviaNumber = sanitizeWhatsapp(contact.whatsapp_bolivia);
          var boliviaContent = boliviaNumber
            ? '<a href="https://wa.me/' + boliviaNumber + '" target="_blank">' + contact.whatsapp_bolivia + '</a>'
            : contact.whatsapp_bolivia;
          cards.push({
            icon: 'fa fa-whatsapp',
            title: 'WhatsApp Bolivia',
            content: boliviaContent,
          });
        }

        if (contact.whatsapp_paraguay) {
          var paraguayNumber = sanitizeWhatsapp(contact.whatsapp_paraguay);
          var paraguayContent = paraguayNumber
            ? '<a href="https://wa.me/' + paraguayNumber + '" target="_blank">' + contact.whatsapp_paraguay + '</a>'
            : contact.whatsapp_paraguay;
          cards.push({
            icon: 'fa fa-whatsapp',
            title: 'WhatsApp Paraguay',
            content: paraguayContent,
          });
        }

        if (contact.location || contact.timezone) {
          cards.push({
            icon: 'fa fa-map-marker',
            title: 'Location',
            content: (contact.location || '') + (contact.timezone ? '<br>(' + contact.timezone + ')' : ''),
          });
        }

        if (profile && Array.isArray(profile.availability) && profile.availability.length) {
          cards.push({
            icon: 'fa fa-globe',
            title: 'Availability',
            content: profile.availability.join('<br>'),
          });
        }

        grid.innerHTML = cards.map(function(card) {
          if (!card.content) return '';

          return (
            '<div class="contact-card' + (card.icon === 'fa fa-envelope' ? ' contact-card--accent' : '') + '">' +
              '<div class="contact-icon"><i class="' + card.icon + '"></i></div>' +
              '<h3>' + card.title + '</h3>' +
              '<p>' + card.content + '</p>' +
            '</div>'
          );
        }).join('');
      }

      function renderSocial(social) {
        var container = document.querySelector('[data-social-links]');
        if (!container || !Array.isArray(social)) {
          return;
        }

        container.innerHTML = social.map(function(item) {
          if (!item || !item.url) return '';

          var iconKey = item.platform ? item.platform.toLowerCase() : '';
          var icon = SOCIAL_ICONS[iconKey] || 'fa fa-globe';

          return (
            '<a href="' + item.url + '" target="_blank" class="social-icon" title="' + (item.platform || 'Social') + '">' +
              '<i class="' + icon + '"></i>' +
            '</a>'
          );
        }).join('');
      }

      function requestJson(url, options) {
        return fetch(url, options).then(function(response) {
          if (!response.ok) {
            throw new Error('Request to ' + url + ' failed with status ' + response.status);
          }
          return response.json();
        });
      }

      function fetchResume() {
        return requestJson(apiBase + '/resume', {
          headers: { 'Accept': 'application/json' },
          cache: 'no-store',
        }).catch(function(error) {
          console.warn('Resume API unavailable, falling back to local JSON.', error);
          return requestJson('/' + fallbackUrl, { cache: 'no-store' });
        });
      }

      fetchResume()
        .then(function(data) {
          data = data || {};
          hydrateProfile(data.profile || {});
          hydrateAbout(data.about || {});
          renderExperience(data.experience || []);
          renderSkills(data.skills || {});
          renderEducation(data.education || []);
          renderPortfolio(data.portfolio || []);
          renderContact(data.contact || {}, data.profile || {});
          renderSocial(data.social || []);
          animateOnScroll();
        })
        .catch(function(error) {
          console.warn('Unable to load resume data from API:', error);
        });
    })();
    
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
    // Portfolio Carousel Controls
    // ============================================
    (function() {
      var track = document.getElementById('portfolio-track');
      if (!track) return;

      var prevBtn = document.querySelector('.carousel-control.prev');
      var nextBtn = document.querySelector('.carousel-control.next');

      function getGap() {
        var styles = window.getComputedStyle(track);
        var gap = styles.columnGap || styles.gap || '0';
        return parseFloat(gap) || 0;
      }

      function getScrollAmount() {
        var slide = track.querySelector('.portfolio-slide');
        if (!slide) return track.clientWidth;
        return slide.getBoundingClientRect().width + getGap();
      }

      function updateControls() {
        if (!prevBtn || !nextBtn) return;
        var maxScroll = track.scrollWidth - track.clientWidth;
        prevBtn.disabled = track.scrollLeft <= 5;
        nextBtn.disabled = track.scrollLeft >= maxScroll - 5;
      }

      function scrollTrack(direction) {
        track.scrollBy({
          left: direction * getScrollAmount(),
          behavior: 'smooth'
        });
      }

      if (prevBtn) {
        prevBtn.addEventListener('click', function() {
          scrollTrack(-1);
        });
      }

      if (nextBtn) {
        nextBtn.addEventListener('click', function() {
          scrollTrack(1);
        });
      }

      track.addEventListener('scroll', updateControls);
      window.addEventListener('resize', updateControls);
      updateControls();
    })();

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
