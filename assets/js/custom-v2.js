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
      var currentPid = resolvePostulationPid();
      var hasActiveVariant = false;

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

      function escapeHtml(value) {
        return String(value)
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#39;');
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

        timeline.innerHTML = experience.filter(function(job) {
          return job && (job.show_in_site ?? true) !== false;
        }).map(function(job) {
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

      function parseYoutubeId(url) {
        if (!url || typeof url !== 'string') {
          return '';
        }
        var match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([A-Za-z0-9_-]{11})/);
        return match ? match[1] : '';
      }

      function resolveMediaUrl(url) {
        if (!url || typeof url !== 'string') {
          return '';
        }
        if (/^https?:\/\//i.test(url)) {
          return url;
        }
        var apiBase = (window.__RESUME_API_BASE_URL__ || 'https://api.waldo.panozo.info').replace(/\/$/, '');
        return url.charAt(0) === '/' ? apiBase + url : apiBase + '/' + url;
      }

      function renderAwardMedia(media) {
        if (!media || typeof media !== 'object') {
          return '';
        }

        var type = (media.type || '').toLowerCase();
        var url = resolveMediaUrl(media.url || '');
        if (!url) {
          return '';
        }

        if (type === 'youtube') {
          var videoId = parseYoutubeId(url);
          if (!videoId) {
            return (
              '<div class="award-media">' +
                '<a href="' + url + '" target="_blank" rel="noopener" class="award-media-link">Watch on YouTube</a>' +
              '</div>'
            );
          }
          return (
            '<div class="award-media award-media-video">' +
              '<iframe src="https://www.youtube.com/embed/' + videoId + '" title="Award video" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>' +
            '</div>'
          );
        }

        if (type === 'image') {
          return (
            '<div class="award-media award-media-image">' +
              '<img src="' + url + '" alt="Award media" loading="lazy" />' +
            '</div>'
          );
        }

        if (type === 'pdf' || type === 'file') {
          return (
            '<div class="award-media">' +
              '<a href="' + url + '" target="_blank" rel="noopener" class="award-media-link"><i class="fa fa-file-pdf-o"></i> View certificate / document</a>' +
            '</div>'
          );
        }

        return (
          '<div class="award-media">' +
            '<a href="' + url + '" target="_blank" rel="noopener" class="award-media-link">View media</a>' +
          '</div>'
        );
      }

      function awardKindLabel(kind) {
        var labels = {
          hackathon: 'Hackathon',
          recognition: 'Recognition',
          award: 'Award',
        };
        return labels[(kind || '').toLowerCase()] || 'Recognition';
      }

      function renderAwards(awards) {
        var container = document.querySelector('[data-awards-list]');
        if (!container || !Array.isArray(awards)) {
          return;
        }

        var items = awards.filter(function(item) {
          return item && item.title && (item.show_in_site ?? true) !== false;
        });
        if (!items.length) {
          container.innerHTML = '';
          var emptySection = container.closest('.section');
          if (emptySection) {
            emptySection.classList.add('is-hidden');
          }
          return;
        }

        var awardsSection = container.closest('.section');
        if (awardsSection) {
          awardsSection.classList.remove('is-hidden');
        }
        container.innerHTML = items.map(function(award) {
          var metaParts = [
            awardKindLabel(award.kind),
            award.organization || '',
            award.year || '',
          ].filter(Boolean);

          var recognition = award.recognition_from
            ? '<p class="award-recognition"><i class="fa fa-certificate"></i> ' + award.recognition_from + '</p>'
            : '';

          var description = award.description
            ? '<p class="award-description">' + award.description + '</p>'
            : '';

          var externalLink = award.link
            ? '<a href="' + award.link + '" target="_blank" rel="noopener" class="award-external-link">Learn more</a>'
            : '';

          return (
            '<article class="award-card">' +
              '<div class="award-card-header">' +
                '<span class="award-kind">' + awardKindLabel(award.kind) + '</span>' +
                '<h3 class="award-title">' + award.title + '</h3>' +
                (metaParts.length > 1 ? '<p class="award-meta">' + metaParts.slice(1).join(' · ') + '</p>' : '') +
                recognition +
              '</div>' +
              '<div class="award-card-body">' +
                description +
                renderAwardMedia(award.media) +
                externalLink +
              '</div>' +
            '</article>'
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
            links.push('<a href="' + item.image + '" class="portfolio-link portfolio-lightbox-link" data-lightbox-src="' + item.image + '" aria-label="Open preview image for ' + escapeHtml(item.title || 'portfolio item') + '"><i class="fa fa-search"></i></a>');
          }
          // Add external link icon if link exists
          if (item.link) {
            links.push('<a href="' + item.link + '" target="_blank" rel="noopener" class="portfolio-link" aria-label="Open external link for ' + escapeHtml(item.title || 'portfolio item') + '" onclick="event.stopPropagation();"><i class="fa fa-external-link"></i></a>');
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
            '<a href="' + item.url + '" target="_blank" rel="noopener" class="social-icon" title="' + (item.platform || 'Social') + '" aria-label="' + escapeHtml(item.platform || 'Social profile') + '">' +
              '<i class="' + icon + '"></i>' +
            '</a>'
          );
        }).join('');
      }

      function renderDevStats(stats) {
        var cardsContainer = document.querySelector('[data-dev-stats-cards]');
        var metaContainer = document.querySelector('[data-dev-stats-meta]');
        var languagesContainer = document.querySelector('[data-dev-stats-languages]');
        var usersContainer = document.querySelector('[data-dev-stats-users]');
        var topReposContainer = document.querySelector('[data-dev-stats-top-repos]');
        var commitsChartContainer = document.querySelector('[data-dev-stats-commits-chart]');

        if (!cardsContainer || !metaContainer || !languagesContainer || !usersContainer || !topReposContainer || !commitsChartContainer) {
          return;
        }

        if (!stats || stats.status === 'unavailable') {
          metaContainer.innerHTML = '<span class="dev-stats-badge dev-stats-badge--warn">Stats unavailable</span>';
          languagesContainer.innerHTML = '<p class="devstats-empty">No language data available yet.</p>';
          usersContainer.innerHTML = '<p class="devstats-empty">No user status available yet.</p>';
          topReposContainer.innerHTML = '<p class="devstats-empty">No anonymized repo references available yet.</p>';
          commitsChartContainer.innerHTML = '<p class="devstats-empty">No commits timeline available yet.</p>';
          return;
        }

        var metrics = stats.metrics || {};
        var totalCommits = Number(metrics.commits_last_window || 0);
        var totalMergedPrs = Number(metrics.merged_prs_last_window || 0);
        var reposScanned = Number(stats.repos_scanned || 0);
        var generatedAt = stats.generated_at ? new Date(stats.generated_at) : null;
        var generatedAtText = generatedAt && !isNaN(generatedAt.getTime())
          ? generatedAt.toLocaleString()
          : 'Unknown';
        var globalStatus = stats.metrics_status || 'ok';
        var statusClass = globalStatus === 'ok' ? 'dev-stats-badge--ok' : 'dev-stats-badge--warn';

        metaContainer.innerHTML =
          '<span class="dev-stats-badge ' + statusClass + '">Status: ' + escapeHtml(globalStatus.toUpperCase()) + '</span>' +
          '<span class="dev-stats-updated">Updated: ' + escapeHtml(generatedAtText) + '</span>';

        cardsContainer.innerHTML =
          '<div class="col-lg-4 col-md-6"><div class="devstats-card"><h3>Recent commits</h3><p class="devstats-value">' + totalCommits + '</p></div></div>' +
          '<div class="col-lg-4 col-md-6"><div class="devstats-card"><h3>Recent merged PRs</h3><p class="devstats-value">' + totalMergedPrs + '</p></div></div>' +
          '<div class="col-lg-4 col-md-6"><div class="devstats-card"><h3>Repos Scanned</h3><p class="devstats-value">' + reposScanned + '</p></div></div>';

        var languages = metrics.languages_by_bytes || {};
        var languageEntries = Object.keys(languages).map(function(name) {
          return { name: name, bytes: Number(languages[name] || 0) };
        }).sort(function(a, b) {
          return b.bytes - a.bytes;
        }).slice(0, 8);

        var totalBytes = languageEntries.reduce(function(sum, item) {
          return sum + item.bytes;
        }, 0);

        if (!languageEntries.length || totalBytes === 0) {
          languagesContainer.innerHTML = '<p class="devstats-empty">No language data available.</p>';
        } else {
          var palette = ['#1d4ed8', '#0ea5e9', '#14b8a6', '#6366f1', '#f59e0b', '#ef4444', '#8b5cf6', '#22c55e'];
          var cumulative = 0;
          var segments = languageEntries.map(function(item, idx) {
            var pct = Math.max(1, Math.round((item.bytes / totalBytes) * 100));
            var start = cumulative;
            cumulative += pct;
            var end = cumulative;
            var color = palette[idx % palette.length];
            return {
              name: item.name,
              pct: pct,
              color: color,
              start: start,
              end: end,
            };
          });

          var gradient = segments.map(function(seg) {
            return seg.color + ' ' + seg.start + '% ' + seg.end + '%';
          }).join(', ');

          var legend = segments.map(function(seg) {
            var pctHtml = hasActiveVariant
              ? ''
              : '<strong class="devstats-lang-legend-pct">' + seg.pct + '%</strong>';
            return (
              '<div class="devstats-lang-legend-item">' +
                '<span class="devstats-lang-legend-dot" style="background:' + seg.color + ';"></span>' +
                '<span class="devstats-lang-legend-name">' + escapeHtml(seg.name) + '</span>' +
                pctHtml +
              '</div>'
            );
          }).join('');

          languagesContainer.innerHTML =
            '<div class="devstats-lang-pie-wrap">' +
              '<div class="devstats-lang-pie" role="img" style="background:conic-gradient(' + gradient + ');" aria-label="Language distribution pie chart"></div>' +
              '<div class="devstats-lang-legend">' + legend + '</div>' +
            '</div>';
        }

        var userStatuses = stats.metrics_status_by_user || {};
        var usernames = Object.keys(userStatuses);
        if (!usernames.length) {
          usersContainer.innerHTML = '<p class="devstats-empty">No user statuses available.</p>';
        } else {
          usersContainer.innerHTML = usernames.map(function(username) {
            var statusInfo = userStatuses[username] || {};
            var userStatus = statusInfo.status || 'ok';
            var userErrors = Number(statusInfo.error_count || 0);
            var userStatusClass = userStatus === 'ok' ? 'devstats-user--ok' : (userStatus === 'error' ? 'devstats-user--error' : 'devstats-user--partial');
            return (
              '<div class="devstats-user ' + userStatusClass + '">' +
                '<span class="devstats-user-name">@' + escapeHtml(username) + '</span>' +
                '<span class="devstats-user-state">' + escapeHtml(userStatus) + (userErrors ? ' (' + userErrors + ' errors)' : '') + '</span>' +
              '</div>'
            );
          }).join('');
        }

        var topRepos = Array.isArray(metrics.top_repos_recent) ? metrics.top_repos_recent : [];
        if (!topRepos.length) {
          topReposContainer.innerHTML = '<p class="devstats-empty">No anonymized repo references available.</p>';
        } else {
          var maxTopRepoCommits = topRepos.reduce(function(max, repoItem) {
            var commits = Number((repoItem || {}).commits_last_window || 0);
            return commits > max ? commits : max;
          }, 0);

          topReposContainer.innerHTML = topRepos.map(function(repoItem, index) {
            var rawRepoRef = String(repoItem.repo_ref || ('Repo ' + (index + 1)));
            var cleanedRepoRef = rawRepoRef;
            var match = rawRepoRef.match(/^Repo\s+\d+\s+\((.*)\)$/i);
            if (match && match[1]) {
              cleanedRepoRef = match[1];
            }
            cleanedRepoRef = cleanedRepoRef.replace(/^Repo\s+\d+\s*-\s*/i, '').trim();
            var repoRef = escapeHtml(cleanedRepoRef || rawRepoRef);
            var repoCommits = Number(repoItem.commits_last_window || 0);
            var pct = maxTopRepoCommits > 0 ? Math.max(4, Math.round((repoCommits / maxTopRepoCommits) * 100)) : 0;
            return (
              '<div class="devstats-top-repo">' +
                '<div class="devstats-top-repo-head">' +
                  '<span class="devstats-top-repo-ref">' + repoRef + '</span>' +
                  '<strong class="devstats-top-repo-value">' + repoCommits + ' commits</strong>' +
                '</div>' +
                '<div class="devstats-top-repo-bar"><span style="width:' + pct + '%;"></span></div>' +
              '</div>'
            );
          }).join('');
        }

        var commitsByDay = metrics.commits_by_day || {};
        var weeklyBuckets = {};
        Object.keys(commitsByDay).forEach(function(dayKey) {
          var date = new Date(dayKey + 'T00:00:00');
          if (isNaN(date.getTime())) {
            return;
          }

          var dayOfWeek = date.getDay();
          var mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
          date.setDate(date.getDate() + mondayOffset);

          var y = date.getFullYear();
          var m = String(date.getMonth() + 1).padStart(2, '0');
          var d = String(date.getDate()).padStart(2, '0');
          var weekKey = y + '-' + m + '-' + d;
          weeklyBuckets[weekKey] = (weeklyBuckets[weekKey] || 0) + Number(commitsByDay[dayKey] || 0);
        });

        var labelsAndValues = Object.keys(weeklyBuckets).sort().map(function(weekKey) {
          var labelDate = new Date(weekKey + 'T00:00:00');
          var shortLabel = String(labelDate.getMonth() + 1).padStart(2, '0') + '/' + String(labelDate.getDate()).padStart(2, '0');
          return {
            key: weekKey,
            shortLabel: shortLabel,
            value: Number(weeklyBuckets[weekKey] || 0),
          };
        }).slice(-12);

        var maxCommits = labelsAndValues.reduce(function(max, item) {
          return item.value > max ? item.value : max;
        }, 0);

        if (maxCommits === 0) {
          commitsChartContainer.innerHTML = '<p class="devstats-empty">No commits registered in recent periods.</p>';
        } else {
          var yTicks = [1, 0.75, 0.5, 0.25].map(function(ratio) {
            return Math.ceil(maxCommits * ratio);
          });
          yTicks = Array.from(new Set(yTicks)).sort(function(a, b) { return b - a; });

          commitsChartContainer.innerHTML =
            '<div class="devstats-commits-chart-wrap">' +
              '<div class="devstats-commits-axis">' + yTicks.map(function(tick) {
                return '<span>' + tick + '</span>';
              }).join('') + '</div>' +
              '<div class="devstats-commits-chart">' +
                labelsAndValues.map(function(item) {
                  var normalized = Math.sqrt(item.value / maxCommits);
                  var barPx = Math.max(12, Math.round(normalized * 180));
                  return (
                    '<div class="devstats-commits-bar-wrap">' +
                      '<div class="devstats-commits-bar" style="height:' + barPx + 'px;" title="' + escapeHtml('Week of ' + item.key + ': ' + item.value + ' commits') + '"></div>' +
                      '<div class="devstats-commits-count">' + item.value + '</div>' +
                      '<div class="devstats-commits-label">' + item.shortLabel + '</div>' +
                    '</div>'
                  );
                }).join('') +
              '</div>' +
            '</div>';
        }
      }

      function requestJson(url, options) {
        return fetch(url, options).then(function(response) {
          if (!response.ok) {
            throw new Error('Request to ' + url + ' failed with status ' + response.status);
          }
          return response.json();
        });
      }

      function sanitizePid(value) {
        var normalized = String(value || '').trim().toLowerCase();
        if (!normalized) {
          return '';
        }
        return /^[a-f0-9]{16,64}$/.test(normalized) ? normalized : '';
      }

      function applyVariantTheme(variant) {
        if (!variant || typeof variant !== 'object') {
          return;
        }
        if ((variant.name || '').toLowerCase() === 'full') {
          hasActiveVariant = false;
          return;
        }
        hasActiveVariant = !!variant.pid;

        var root = document.documentElement;
        var theme = variant.theme || {};
        if (theme.primary) {
          root.style.setProperty('--variant-primary', theme.primary);
        }
        if (theme.secondary) {
          root.style.setProperty('--variant-secondary', theme.secondary);
        }

        document.body.classList.add('variant-active');
      }

      function updateCanonicalUrl() {
        try {
          var canonicalNode = document.querySelector('link[rel="canonical"]');
          if (!canonicalNode) {
            return;
          }
          var canonicalUrl = window.location.origin + window.location.pathname + window.location.search;
          canonicalNode.setAttribute('href', canonicalUrl);
        } catch (error) {
          // ignore URL handling errors
        }
      }

      function resolvePostulationPid() {
        var storageKey = 'resume_pid';
        var pidFromStorage = '';
        var pidFromQuery = '';

        try {
          pidFromStorage = sanitizePid(sessionStorage.getItem(storageKey) || '');
        } catch (error) {
          pidFromStorage = '';
        }

        try {
          var url = new URL(window.location.href);
          pidFromQuery = sanitizePid(url.searchParams.get('pid') || '');

          if (url.searchParams.has('pid')) {
            if (pidFromQuery !== '') {
              try {
                sessionStorage.setItem(storageKey, pidFromQuery);
              } catch (error) {
                // ignore storage errors and continue with query pid only
              }
            }

            if (pidFromQuery === '') {
              try {
                sessionStorage.removeItem(storageKey);
              } catch (error) {
                // ignore storage errors
              }
            }

            url.searchParams.delete('pid');
            var cleanUrl = url.pathname + (url.search || '') + (url.hash || '');
            window.history.replaceState({}, '', cleanUrl);
          }
        } catch (error) {
          // ignore URL parsing errors
        }

        return pidFromQuery || pidFromStorage || '';
      }

      function withPid(path) {
        if (!currentPid) {
          return path;
        }

        var separator = path.indexOf('?') === -1 ? '?' : '&';
        return path + separator + 'pid=' + encodeURIComponent(currentPid);
      }

      function fetchResume() {
        return requestJson(apiBase + withPid('/resume'), {
          headers: { 'Accept': 'application/json' },
          cache: 'no-store',
        }).catch(function(error) {
          console.warn('Resume API unavailable, falling back to local JSON.', error);
          return requestJson('/' + fallbackUrl, { cache: 'no-store' });
        });
      }

      function fetchDevStats() {
        return requestJson(apiBase + withPid('/resume/dev-stats'), {
          headers: { 'Accept': 'application/json' },
          cache: 'no-store',
        }).catch(function(error) {
          console.warn('Dev stats endpoint unavailable.', error);
          return null;
        });
      }

      function updateResumeDownloadLinks() {
        var downloadUrl = apiBase + withPid('/resume/pdf');
        document.querySelectorAll('[data-resume-download]').forEach(function(link) {
          link.setAttribute('href', downloadUrl);
        });
      }

      updateResumeDownloadLinks();

      Promise.all([fetchResume(), fetchDevStats()])
        .then(function(results) {
          var data = results[0] || {};
          var devStats = results[1];
          updateCanonicalUrl();
          applyVariantTheme(data._variant || null);
          hydrateProfile(data.profile || {});
          hydrateAbout(data.about || {});
          renderExperience(data.experience || []);
          renderAwards(data.awards || []);
          renderSkills(data.skills || {});
          renderEducation(data.education || []);
          renderPortfolio(data.portfolio || []);
          renderContact(data.contact || {}, data.profile || {});
          renderSocial(data.social || []);
          renderDevStats(devStats);
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
      $('.timeline-item, .skill-category, .portfolio-card, .highlight-item, .contact-card, .devstats-card, .devstats-panel').each(function() {
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
  .contact-card,
  .devstats-card,
  .devstats-panel {
    opacity: 0;
    transform: translateY(30px);
    transition: opacity 0.6s ease, transform 0.6s ease;
  }
  
  .timeline-item.animate-in,
  .skill-category.animate-in,
  .portfolio-card.animate-in,
  .highlight-item.animate-in,
  .contact-card.animate-in,
  .devstats-card.animate-in,
  .devstats-panel.animate-in {
    opacity: 1;
    transform: translateY(0);
  }
`;
document.head.appendChild(animationStyle);
