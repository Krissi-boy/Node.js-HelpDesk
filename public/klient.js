
// Henter body-elementet
const body = document.querySelector('body');

// Sjekker brukerens valgte modus fra f.eks. en innstilling eller en lagret verdi
const preferredMode = localStorage.getItem('preferredMode');

// Sjekker om jeg har valgt mørk modus
if (preferredMode === 'dark') {
  body.classList.add('dark_mode');
}

// Lytter etter en hendelse som bytter mellom mørk og lys modus
var themeToggle = document.querySelector('#theme_toogle');

console.log(themeToggle)
themeToggle.addEventListener('change', () => {
  if (body.classList.contains('dark_mode')) {
    body.classList.remove('dark_mode');
    localStorage.setItem('preferredMode', 'light');
  } else {
    body.classList.add('dark_mode');
    localStorage.setItem('preferredMode', 'dark');
  }
});
