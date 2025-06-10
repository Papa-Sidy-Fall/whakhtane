import { connection_utilisateur } from "./route.js";
function connection(){
    document.getElementById('form-connexion').addEventListener('submit', async (e) => {
  e.preventDefault();

  const prenom = document.getElementById('prenom').value;
  const nom = document.getElementById('nom').value;
  const telephone = document.getElementById('telephone').value;

  const url = `${connection_utilisateur}?prenom=${encodeURIComponent(prenom)}&nom=${encodeURIComponent(nom)}&telephone=${encodeURIComponent(telephone)}`;

  const res = await fetch(url);
  const data = await res.json();

  if (data.length > 0) {
    window.location.href = "accueil.html";
  } else {
    alert("Identifiants incorrects !");
  }
});
}
connection();
