function showNotImplemented (e) {
  console.warn('Not implemented');
  alert('Coming Soon...');
}

function showMenu (e) {
  const menu = document.querySelector('.menu-popup');
  menu.classList.toggle('show');
}

document.addEventListener('DOMContentLoaded', function () {
  const backdrop = document.querySelector('.menu-popup');
  backdrop.addEventListener('click', ()=> backdrop.classList.remove('show'));
}
);