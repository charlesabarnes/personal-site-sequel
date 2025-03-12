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
    const backdrop = document.querySelector('.menu-popup');
    backdrop.addEventListener('click', () => backdrop.classList.remove('show'));
  }
);

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
}

const getDefaultTheme = () => {
  const theme = localStorage.getItem('theme');
  if (theme) {
    setTheme(theme);
  } else {
    // get user's theme
    const userPrefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (userPrefersDark) {
      setTheme('dark');
    } else {
      setTheme('light');
    }
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