function showNotImplemented (e) {
  console.warn('Not implemented');
  alert('Coming Soon...');
}

function showMenu (e) {
  const menu = document.querySelector('.menu-popup');
  menu.classList.toggle('show');
}

document.addEventListener('DOMContentLoaded', () => {
    getDefaultTheme();
    const backdrop = document.querySelector('.menu-popup');
    backdrop.addEventListener('click', ()=> backdrop.classList.remove('show'));
  }
);

const setTheme = (theme) => {
  localStorage.setItem('theme', theme);
  if (theme === 'dark') {
    document.body.classList.add('dark');
  } else {
    if(document.body.classList) {
      document.body.classList.remove('dark');
    }

  }
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