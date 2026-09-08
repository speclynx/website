// Mobile menu toggle
function toggleMobileMenu() {
  const menu = document.getElementById('mobile-menu');
  menu.classList.toggle('open');
}

document.addEventListener('DOMContentLoaded', function() {
  // Lifecycle graphic tooltips
  document.querySelectorAll('.lifecycle-graphic [data-tooltip]').forEach(function(node) {
    const tooltipId = node.getAttribute('data-tooltip');
    const tooltip = document.querySelector('.tooltip-' + tooltipId);
    if (tooltip) {
      node.addEventListener('mouseenter', function() {
        tooltip.classList.add('active');
      });
      node.addEventListener('mouseleave', function() {
        tooltip.classList.remove('active');
      });
    }
  });

  // Lightbox for images
  const lightbox = document.createElement('div');
  lightbox.id = 'lightbox';
  lightbox.className = 'lightbox';
  lightbox.innerHTML = '<button class="lightbox-close">&times;</button><div class="lightbox-content"><img src="" alt=""></div>';
  document.body.appendChild(lightbox);

  const lightboxImg = lightbox.querySelector('img');
  const lightboxClose = lightbox.querySelector('.lightbox-close');

  // Make images with .lightbox-trigger clickable
  document.querySelectorAll('.lightbox-trigger').forEach(function(img) {
    img.style.cursor = 'pointer';
    img.addEventListener('click', function(e) {
      e.stopPropagation();
      lightboxImg.src = this.currentSrc || this.src;
      lightboxImg.alt = this.alt;
      lightbox.classList.add('active');
      document.body.style.overflow = 'hidden';
    });
  });

  // Close lightbox
  function closeLightbox() {
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
  }

  lightboxClose.addEventListener('click', closeLightbox);
  lightbox.querySelector('.lightbox-content').addEventListener('click', function(e) {
    e.stopPropagation();
  });
  document.addEventListener('click', function() {
    if (lightbox.classList.contains('active')) closeLightbox();
  });
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && lightbox.classList.contains('active')) {
      closeLightbox();
    }
  });

  // Add title to LaunchList widget iframes
  document.querySelectorAll('.launchlist-widget iframe').forEach(function(iframe) {
    iframe.setAttribute('title', 'Email signup form');
  });

  // Add anchor links to headings with IDs or first heading in sections with IDs
  document.querySelectorAll('main h1[id], main h2[id], main h3[id], main h4[id]').forEach(function(heading) {
    if (heading.querySelector('.heading-anchor')) return;
    addAnchor(heading, heading.id);
  });

  document.querySelectorAll('main section[id]').forEach(function(section) {
    const heading = section.querySelector(':scope > h1, :scope > h2, :scope > h3, :scope > h4, :scope > div > h1, :scope > div > h2');
    if (heading && !heading.querySelector('.heading-anchor')) {
      addAnchor(heading, section.id);
    }
  });

  function addAnchor(heading, id) {
    const anchor = document.createElement('a');
    anchor.href = '#' + id;
    anchor.className = 'heading-anchor';
    anchor.setAttribute('aria-label', 'Link to this section');
    anchor.textContent = '#';
    heading.appendChild(anchor);
  }

});

// Terminal tabs (hero demo switcher)
document.querySelectorAll('[data-terminal-tabs]').forEach(function (root) {
  var tabs = Array.prototype.slice.call(root.querySelectorAll('[role="tab"]'));
  var panels = tabs.map(function (tab) {
    return document.getElementById(tab.getAttribute('aria-controls'));
  });
  function select(index) {
    tabs.forEach(function (tab, i) {
      var active = i === index;
      tab.setAttribute('aria-selected', active ? 'true' : 'false');
      tab.tabIndex = active ? 0 : -1;
      panels[i].hidden = !active;
    });
    if (panels[index]._typewriter) panels[index]._typewriter.restart();
  }
  tabs.forEach(function (tab, i) {
    tab.addEventListener('click', function () { select(i); });
    tab.addEventListener('keydown', function (e) {
      var next = e.key === 'ArrowRight' ? i + 1 : e.key === 'ArrowLeft' ? i - 1 : null;
      if (next === null) return;
      e.preventDefault();
      next = (next + tabs.length) % tabs.length;
      select(next);
      tabs[next].focus();
    });
  });
});

// Hero terminal panels: type each command, reveal its output, hold, then move to
// the next run (looping when a panel has several). Tab switches restart the panel
// from its first run. Falls back to the static markup under reduced motion.
document.querySelectorAll('[data-terminal-typewriter]').forEach(function (panel) {
  if (panel._typewriter) return;
  var runs = Array.prototype.slice.call(panel.querySelectorAll('.terminal-run'));
  if (!runs.length) return;
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  // Keep the real runs for assistive tech; animate a mirrored, aria-hidden copy.
  var source = document.createElement('span');
  source.className = 'sr-only';
  runs.forEach(function (run) { source.appendChild(run); });
  var live = document.createElement('span');
  live.setAttribute('aria-hidden', 'true');
  panel.appendChild(source);
  panel.appendChild(live);

  var TYPE_MS = 25, LINE_MS = 40, AFTER_TYPE_MS = 300, HOLD_MS = 4000, BETWEEN_MS = 600;
  var generation = 0; // bumped on restart so stale timers stop themselves

  function wait(ms, gen, cb) {
    setTimeout(function () {
      if (gen !== generation) return;
      if (panel.hidden || document.hidden) { wait(400, gen, cb); return; }
      cb();
    }, ms);
  }

  // Clone `el` keeping only its first `n` characters of text, so coloured
  // tokens inside the prompt survive the character-by-character reveal.
  function clipClone(el, n) {
    var clone = el.cloneNode(true);
    var walker = document.createTreeWalker(clone, NodeFilter.SHOW_TEXT);
    var remaining = n, node, doomed = [];
    while ((node = walker.nextNode())) {
      if (remaining <= 0) { doomed.push(node); continue; }
      if (node.data.length > remaining) node.data = node.data.slice(0, remaining);
      remaining -= node.data.length;
    }
    doomed.forEach(function (d) { d.parentNode.removeChild(d); });
    return clone;
  }

  function showRun(index, gen) {
    var run = runs[index];
    var promptEl = run.querySelector('.terminal-prompt');
    var command = promptEl.textContent;
    var lines = run.innerHTML.split('\n').slice(1); // everything after the prompt line

    live.innerHTML = '';
    var typed = clipClone(promptEl, 0);
    var cursor = document.createElement('span');
    cursor.className = 'terminal-cursor';
    live.appendChild(typed);
    live.appendChild(cursor);

    var pos = 0;
    function typeNext() {
      if (pos < command.length) {
        var next = clipClone(promptEl, ++pos);
        live.replaceChild(next, typed);
        typed = next;
        wait(TYPE_MS, gen, typeNext);
        return;
      }
      wait(AFTER_TYPE_MS, gen, function () {
        cursor.remove();
        var i = 0;
        function revealNext() {
          if (i < lines.length) {
            live.insertAdjacentHTML('beforeend', '\n' + lines[i++]);
            wait(LINE_MS, gen, revealNext);
            return;
          }
          // Idle at a fresh prompt, like a real shell.
          var idle = document.createElement('span');
          idle.className = 'terminal-prompt';
          idle.innerHTML = '<span class="t-dollar">$</span> ';
          live.appendChild(document.createTextNode('\n'));
          live.appendChild(idle);
          live.appendChild(cursor);
          if (runs.length < 2) return; // single run: stay at the prompt
          wait(HOLD_MS, gen, function () {
            wait(BETWEEN_MS, gen, function () { showRun((index + 1) % runs.length, gen); });
          });
        }
        revealNext();
      });
    }
    typeNext();
  }

  panel._typewriter = {
    restart: function () { generation += 1; showRun(0, generation); }
  };
  panel._typewriter.restart();
});
