
const API_URL = 'http://localhost:3000/api';

// Charger les employés dans le select et les tableaux
async function chargerEmployes() {
    const response = await fetch(`${API_URL}/employes`);
    const employes = await response.json();
    const select = document.getElementById('employeSelect');
    const tbodyEmployes = document.querySelector('#tableEmployes tbody');

    select.innerHTML = '';
    tbodyEmployes.innerHTML = '';

    // Remplir le select et le tableau
    employes.forEach(e => {
        // Ajouter au select
        const option = document.createElement('option');
        option.value = e.id;
        option.textContent = `${e.nom} ${e.prenom}`;
        select.appendChild(option);

        // Ajouter au tableau
        const row = document.createElement('tr');
        row.innerHTML = `
                    <td>${e.id}</td>
                    <td>${e.nom}</td>
                    <td>${e.prenom}</td>
                    <td>${e.adresse}</td>
                    <td>${e.poste}</td>
                    <td>${e.solde_conge}</td>
                    <td class="text-center">
                        <button class="btn btn-primary btn-sm btn-modifier" data-id="${e.id}">Modifier</button>
                        <button class="btn btn-danger btn-sm btn-supprimer" data-id="${e.id}">Supprimer</button>
                    </td>
                `;
        tbodyEmployes.appendChild(row);
    });

    document.querySelectorAll('.btn-modifier').forEach(button => {
        button.addEventListener('click', () => modifierEmploye(button.dataset.id));
    });

    document.querySelectorAll('.btn-supprimer').forEach(button => {
        button.addEventListener('click', () => supprimerEmploye(button.dataset.id));
    });
}

// Fonction pour modifier un employé
async function modifierEmploye(id) {
    const response = await fetch(`${API_URL}/employes/${id}`);
    const employe = await response.json();

    // Remplir le formulaire avec les données de l'employé
    document.getElementById('matricule').value = employe.matricule;
    document.getElementById('nom').value = employe.nom;
    document.getElementById('prenom').value = employe.prenom;
    document.getElementById('adresse').value = employe.adresse;
    document.getElementById('sexe').value = employe.sexe;
    document.getElementById('poste').value = employe.poste;
    document.getElementById('carteIdentite').value = employe.carte_identite;
    document.getElementById('dateEmbauche').value = employe.date_embauche;

    // Ajouter un attribut pour indiquer qu'on est en mode édition
    document.getElementById('formEmploye').dataset.editingId = id;
}

// Fonction pour supprimer un employé
async function supprimerEmploye(id) {
    if (confirm("Voulez-vous vraiment supprimer cet employé ?")) {
        const response = await fetch(`${API_URL}/employes/${id}`, { method: 'DELETE' });

        if (response.ok) {
            afficherNotification('Employé supprimé avec succès', 'success');
            chargerEmployes(); // Recharger la liste
        } else {
            const error = await response.json();
            afficherNotification(error.error, 'error');
        }
    }
}


// Gérer la soumission du formulaire pour ajouter ou modifier un employé
document.getElementById('formEmploye').addEventListener('submit', async (e) => {
    e.preventDefault();

    const employe = {
        matricule: document.getElementById('matricule').value,
        nom: document.getElementById('nom').value,
        prenom: document.getElementById('prenom').value,
        adresse: document.getElementById('adresse').value,
        sexe: document.getElementById('sexe').value,
        poste: document.getElementById('poste').value,
        carte_identite: document.getElementById('carteIdentite').value,
        date_embauche: document.getElementById('dateEmbauche').value
    };

    const editingId = document.getElementById('formEmploye').dataset.editingId;

    const url = editingId ? `${API_URL}/employes/${editingId}` : `${API_URL}/employes`;
    const method = editingId ? 'PUT' : 'POST';

    const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(employe)
    });

    if (response.ok) {
        afficherNotification(editingId ? 'Employé modifié avec succès' : 'Employé ajouté avec succès', 'success');
        refreshForm();
        delete document.getElementById('formEmploye').dataset.editingId; // Supprimer le mode édition
        chargerEmployes();
    } else {
        const error = await response.json();
        afficherNotification(error.error, 'error');
    }
});

// Fonction pour vider les champs du formulaire
function refreshForm() {
    document.getElementById('formEmploye').reset();
}


// Charger les demandes de congé
async function chargerConges() {
    // Récupérer toutes les demandes de congé
    const responseConges = await fetch(`${API_URL}/conges`);
    const conges = await responseConges.json();

    // Récupérer tous les employés
    const responseEmployes = await fetch(`${API_URL}/employes`);
    const employes = await responseEmployes.json();

    // Créer un objet pour mapper les employés par leur ID
    const employesMap = {};
    employes.forEach(e => {
        employesMap[e.id] = e;
    });

    const tbodyConges = document.querySelector('#tableConges tbody');
    tbodyConges.innerHTML = '';

    function formatDate(dateString) {
        const date = new Date(dateString);
        const options = { day: '2-digit', month: 'short', year: 'numeric' };
        return date.toLocaleDateString('fr-FR', options);
    }

    // Remplir le tableau
    conges.forEach(c => {
        const employe = employesMap[c.id_employe]; // Récupérer l'employé correspondant
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${c.id}</td>
            <td>${employe.nom} ${employe.prenom}</td>
            <td>${formatDate(c.date_debut)}</td>
            <td>${formatDate(c.date_fin)}</td>
            <td>${c.motif}</td>
            <td>${c.statut}</td>
        `;
        tbodyConges.appendChild(row);
    });
}


// Ajouter un employé
document.getElementById('formEmploye').addEventListener('submit', async (e) => {
    e.preventDefault();

    const employe = {
        matricule: document.getElementById('matricule').value,
        nom: document.getElementById('nom').value,
        prenom: document.getElementById('prenom').value,
        adresse: document.getElementById('adresse').value,
        sexe: document.getElementById('sexe').value,
        poste: document.getElementById('poste').value,
        carte_identite: document.getElementById('carteIdentite').value,
        date_embauche: document.getElementById('dateEmbauche').value
    };

    const response = await fetch(`${API_URL}/employes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(employe)
    });

    if (response.ok) {
        afficherNotification('Employé ajouté avec succès', 'success');

        // refresh form
        document.getElementById('formEmploye').reset();

        chargerEmployes();
    } else {
        const error = await response.json();
        afficherNotification(error.error, 'error');
    }
});

// Envoyer une demande de congé
document.getElementById('formConge').addEventListener('submit', async (e) => {
    e.preventDefault();

    const demande = {
        id_employe: document.getElementById('employeSelect').value,
        date_debut: document.getElementById('dateDebut').value,
        date_fin: document.getElementById('dateFin').value,
        motif: document.getElementById('motif').value
    };

    const response = await fetch(`${API_URL}/conges`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(demande)
    });

    if (response.ok) {
        afficherNotification('Demande de congé envoyée avec succès', 'success');
        // Refresh form
        document.getElementById('formConge').reset();

        chargerEmployes();
        chargerConges();
    } else {
        const error = await response.json();
        afficherNotification(error.error, 'error');
    }
});


// Charger les demandes en attente
async function chargerCongesEnAttente() {
    const response = await fetch(`${API_URL}/conges?statut=en attente`);
    const conges = await response.json();
    const tbody = document.querySelector('#tableValidationConges tbody');
    const employes = await (await fetch(`${API_URL}/employes`)).json();

    // Créer un map des employés par ID
    const employesMap = employes.reduce((acc, e) => {
        acc[e.id] = e;
        return acc;
    }, {});

    tbody.innerHTML = '';

    function formatDate(dateString) {
        const date = new Date(dateString);
        const options = { day: '2-digit', month: 'short', year: 'numeric' };
        return date.toLocaleDateString('fr-FR', options);
    }

    conges.forEach(c => {
        const employe = employesMap[c.id_employe];
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${employe.nom} ${employe.prenom}</td>
            <td>${formatDate(c.date_debut)}</td>
            <td>${formatDate(c.date_fin)}</td>
            <td>${c.jours_demandes}</td>
            <td>
                <button class="btn-valider" data-id="${c.id}">Valider</button>
                <button class="btn-refuser" data-id="${c.id}">Refuser</button>
            </td>
        `;
        tbody.appendChild(row);
    });

    // Gérer les clics sur les boutons
    document.querySelectorAll('.btn-valider').forEach(btn => {
        btn.addEventListener('click', async () => {
            await mettreAJourStatutConge(btn.dataset.id, 'valide');
        });
    });

    document.querySelectorAll('.btn-refuser').forEach(btn => {
        btn.addEventListener('click', async () => {
            await mettreAJourStatutConge(btn.dataset.id, 'refuse');
        });
    });
}

// Charger tous les demandes
async function chargerToutesConges() {
    const statut = document.getElementById('filtreStatut').value;
    const employe = document.getElementById('filtreEmploye').value;

    const response = await fetch(`${API_URL}/conges?statut=${statut}&employe=${employe}`);
    const conges = await response.json();
    const tbody = document.querySelector('#tableToutesConges tbody');
    const employes = await (await fetch(`${API_URL}/employes`)).json();

    // Créer un map des employés par ID
    const employesMap = employes.reduce((acc, e) => {
        acc[e.id] = e;
        return acc;
    }, {});

    tbody.innerHTML = '';

    function formatDate(dateString) {
        const date = new Date(dateString);
        const options = { day: '2-digit', month: 'short', year: 'numeric' };
        return date.toLocaleDateString('fr-FR', options);
    }


    conges.forEach(c => {
        const employe = employesMap[c.id_employe];
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${employe.nom} ${employe.prenom}</td>
            <td>${formatDate(c.date_debut)}</td>
            <td>${formatDate(c.date_fin)}</td>
            <td>${c.jours_demandes}</td>
            <td>${c.statut}</td>
        `;
        tbody.appendChild(row);
    });
}

// Appliquer les filtres
document.getElementById('appliquerFiltres').addEventListener('click', chargerToutesConges);


// Fonction pour mettre à jour le statut
async function mettreAJourStatutConge(id, statut) {
    const response = await fetch(`${API_URL}/conges/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ statut })
    });

    if (response.ok) {
        afficherNotification(`Demande ${statut} avec succès`, 'success');
        chargerCongesEnAttente();
        chargerConges();
        chargerEmployes();
    } else {
        const error = await response.json();
        afficherNotification(error.error, 'error');
    }
}


// Afficher une notification
function afficherNotification(message, type) {
    const notifications = document.getElementById('notifications');
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    notifications.appendChild(notification);

    // Supprimer la notification après 5 secondes
    setTimeout(() => {
        notification.remove();
    }, 5000);
}

// Navigation entre les sections
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        document.querySelectorAll('.section').forEach(section => {
            section.classList.remove('active');
        });
        document.querySelector(link.getAttribute('href')).classList.add('active');

        // Charger les données appropriées
        if (link.getAttribute('href') === '#validation-conges') {
            chargerCongesEnAttente();
        } else if (link.getAttribute('href') === '#conges') {
            chargerToutesConges();
        }
    });
});


// Charger les données au démarrage
chargerEmployes();
chargerConges();


// Validation champs CIN
document.getElementById('carteIdentite').addEventListener('input', function (e) {
    let value = e.target.value.replace(/\D/g, ''); // Supprime tout caractère non numérique
    if (value.length > 12) {
        value = value.slice(0, 12);
    }
    // Ajout des espaces après chaque 3 chiffres
    let formattedValue = value.replace(/(\d{3})(?=\d)/g, '$1 ');
    e.target.value = formattedValue;
});

async function chargerFiltreEmployes() {
    const response = await fetch(`${API_URL}/employes`);
    const employes = await response.json();
    const select = document.getElementById('filtreEmploye');

    employes.forEach(e => {
        const option = document.createElement('option');
        option.value = e.id;
        option.textContent = `${e.nom} ${e.prenom}`;
        select.appendChild(option);
    });
}