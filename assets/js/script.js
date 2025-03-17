function showNotImplemented(e) {
  console.warn('Not implemented');
  alert('Coming Soon...');
}

function showMenu(e) {
  const menu = document.querySelector('.menu-popup');
  menu.classList.toggle('show');
}

document.addEventListener('DOMContentLoaded', () => {
    getDefaultTheme();
    updateThemeButton();
    
    // Handle menu popup clicks
    const backdrop = document.querySelector('.menu-popup');
    const menuContainer = document.querySelector('.menu-container');
    
    backdrop.addEventListener('click', (e) => {
      // Only close if clicking outside the menu container
      if (e.target === backdrop) {
        backdrop.classList.remove('show');
      }
    });
    
    // Portfolio filter functionality
    initPortfolioFilter();
  }
);

function initPortfolioFilter() {
  const filterTags = document.querySelectorAll('.filter-tag');
  const projectCards = document.querySelectorAll('.project-card');
  
  if (filterTags.length === 0 || projectCards.length === 0) return;
  
  filterTags.forEach(tag => {
    tag.addEventListener('click', () => {
      // Update active class
      filterTags.forEach(t => t.classList.remove('active'));
      tag.classList.add('active');
      
      const filterValue = tag.getAttribute('data-tag');
      
      // Filter projects
      projectCards.forEach(card => {
        if (filterValue === 'all') {
          card.style.display = '';
          setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = '';
          }, 50);
        } else {
          const cardTags = card.getAttribute('data-tags').split(',');
          if (cardTags.includes(filterValue)) {
            card.style.display = '';
            setTimeout(() => {
              card.style.opacity = '1';
              card.style.transform = '';
            }, 50);
          } else {
            card.style.opacity = '0';
            card.style.transform = 'scale(0.8)';
            setTimeout(() => {
              card.style.display = 'none';
            }, 300);
          }
        }
      });
    });
  });
}

function updateThemeButton() {
  const themeButton = document.querySelector('.theme-toggle-button i');
  const theme = localStorage.getItem('theme');
  if (themeButton) {
    if (theme === 'dark') {
      themeButton.className = 'fa-regular fa-moon';
    } else {
      themeButton.className = 'fa-regular fa-sun';
    }
  }
  
  // Also update mobile theme button
  updateMobileThemeButton();
}

function updateMobileThemeButton() {
  const mobileThemeButton = document.querySelector('.mobile-theme-toggle-button i');
  const mobileThemeText = document.querySelector('.theme-text');
  const theme = localStorage.getItem('theme');
  
  if (mobileThemeButton) {
    if (theme === 'dark') {
      mobileThemeButton.className = 'fa-regular fa-moon';
      if (mobileThemeText) {
        mobileThemeText.textContent = 'Toggle Light Mode';
      }
    } else {
      mobileThemeButton.className = 'fa-regular fa-sun';
      if (mobileThemeText) {
        mobileThemeText.textContent = 'Toggle Dark Mode';
      }
    }
  }
}

const setTheme = (theme) => {
  localStorage.setItem('theme', theme);
  const themeButton = document.querySelector('.theme-toggle-button i');
  
  if (theme === 'dark') {
    document.body.classList.add('dark');
    if (themeButton) {
      themeButton.className = 'fa-regular fa-moon';
    }
  } else {
    if(document.body.classList) {
      document.body.classList.remove('dark');
    }
    if (themeButton) {
      themeButton.className = 'fa-regular fa-sun';
    }
  }
  
  // Update mobile theme button
  updateMobileThemeButton();
}

const getDefaultTheme = () => {
  const theme = localStorage.getItem('theme');
  if (theme) {
    setTheme(theme);
  } else {
    // Always default to light theme
    setTheme('light');
  }
}

function toggleTheme() {
  const theme = localStorage.getItem('theme');
  if (theme === 'dark') {
    setTheme('light');
  } else {
    setTheme('dark');
  }
}