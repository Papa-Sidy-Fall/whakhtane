import { inscription_utilisateur } from './route.js'
function inscription(){
    document.getElementById('form-inscription').addEventListener('submit', async (e) => {
  e.preventDefault();

  const prenom = document.getElementById('prenom').value;
  const nom = document.getElementById('nom').value;
  const telephone = document.getElementById('telephone').value;

  const utilisateur = { prenom, nom, telephone };

  await fetch(inscription_utilisateur, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(utilisateur)
  });

  alert('Inscription réussie !');
});
}
inscription()
