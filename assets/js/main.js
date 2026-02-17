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

});
