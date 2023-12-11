function showNotImplemented (e) {
  console.warn('Not implemented');
  alert('Coming Soon...');
}

function showMenu (e) {
  const menu = document.querySelector('.menu-popup');
  menu.classList.toggle('show');
}

document.addEventListener('DOMContentLoaded', () => {
    const backdrop = document.querySelector('.menu-popup');
    backdrop.addEventListener('click', ()=> backdrop.classList.remove('show'));
  }
);

const setTheme = (theme) => {
  localStorage.setItem('theme', theme);
  if (theme === 'dark') {
    document.body.classList.add('dark');
    // set css variables
    document.documentElement.style.setProperty('--color-primary', '#FFFAF3');
    document.documentElement.style.setProperty('--color-secondary', '#333333');
    document.documentElement.style.setProperty('--black', '#000000');
    document.documentElement.style.setProperty('--background', 'var(--color-secondary)');
    document.documentElement.style.setProperty('--icon-background', 'var(--color-primary)');
    document.documentElement.style.setProperty('--shadow-color', 'var(--black)');
    document.documentElement.style.setProperty('--border-color', 'var(--black)');
    document.documentElement.style.setProperty('--text-color', 'var(--color-primary)');

  } else {
    if(document.body.classList) {
      document.body.classList.remove('dark');
    }
    // set css variables
    document.documentElement.style.setProperty('--color-primary', '#333333');
    document.documentElement.style.setProperty('--color-secondary', '#FFFAF3');
    document.documentElement.style.setProperty('--black', '#000000');
    document.documentElement.style.setProperty('--background', 'var(--color-secondary)');
    document.documentElement.style.setProperty('--icon-background', 'var(--color-secondary)');
    document.documentElement.style.setProperty('--shadow-color', 'var(--color-primary)');
    document.documentElement.style.setProperty('--border-color', 'var(--color-primary)');
    document.documentElement.style.setProperty('--text-color', 'var(--color-primary)');

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

getDefaultTheme();

function toggleTheme() {
  const theme = localStorage.getItem('theme');
  if (theme === 'dark') {
    setTheme('light');
  } else {
    setTheme('dark');
  }
}