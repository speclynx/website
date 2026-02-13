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
});
