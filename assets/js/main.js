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
  lightbox.innerHTML = '<div class="lightbox-content"><img src="" alt=""><button class="lightbox-close">&times;</button></div>';
  document.body.appendChild(lightbox);

  const lightboxImg = lightbox.querySelector('img');
  const lightboxClose = lightbox.querySelector('.lightbox-close');

  // Make images with .lightbox-trigger clickable
  document.querySelectorAll('.lightbox-trigger').forEach(function(img) {
    img.style.cursor = 'pointer';
    img.addEventListener('click', function() {
      lightboxImg.src = this.src;
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
  lightbox.addEventListener('click', function(e) {
    if (e.target === lightbox) {
      closeLightbox();
    }
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
