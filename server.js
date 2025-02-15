// Import
const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const nodemailer = require('nodemailer');
const app = express();

app.use(cors());
app.use(express.json());

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'gest_conge'
});


// 1. Créer un employé
app.post('/api/employes', async (req, res) => {
    try {
        const { matricule, nom, prenom, adresse, sexe, poste, carte_identite, date_embauche } = req.body;

        // Vérifier si l'employé existe déjà
        const [existing] = await pool.query(
            'SELECT * FROM employes WHERE matricule = ? OR carte_identite = ?',
            [matricule, carte_identite]
        );

        if (existing.length > 0) {
            return res.status(400).json({ error: 'Matricule ou carte d\'identité déjà utilisé(e)' });
        }

        // Insérer le nouvel employé
        const [result] = await pool.query('INSERT INTO employes SET ?', {
            matricule,
            nom,
            prenom,
            adresse,
            sexe,
            poste,
            carte_identite,
            date_embauche
        });

        res.status(201).json({ id: result.insertId, message: 'Employé créé avec succès' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 2. Lire tous les employés
app.get('/api/employes', async (req, res) => {
    try {
        const [employes] = await pool.query('SELECT * FROM employes');
        res.status(200).json(employes);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 3. Lire un employé par son ID
app.get('/api/employes/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const [employe] = await pool.query('SELECT * FROM employes WHERE id = ?', [id]);

        if (employe.length === 0) {
            return res.status(404).json({ error: 'Employé non trouvé' });
        }

        res.status(200).json(employe[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 4. Mettre à jour un employé
app.put('/api/employes/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { matricule, nom, prenom, adresse, sexe, poste, carte_identite, date_embauche } = req.body;

        // Vérifier si l'employé existe
        const [existing] = await pool.query('SELECT * FROM employes WHERE id = ?', [id]);

        if (existing.length === 0) {
            return res.status(404).json({ error: 'Employé non trouvé' });
        }

        // Mettre à jour l'employé
        await pool.query(
            'UPDATE employes SET matricule = ?, nom = ?, prenom = ?, adresse = ?, sexe = ?, poste = ?, carte_identite = ?, date_embauche = ? WHERE id = ?',
            [matricule, nom, prenom, adresse, sexe, poste, carte_identite, date_embauche, id]
        );

        res.status(200).json({ message: 'Employé mis à jour avec succès' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 5. Supprimer un employé
app.delete('/api/employes/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // Vérifier si l'employé existe
        const [existing] = await pool.query('SELECT * FROM employes WHERE id = ?', [id]);

        if (existing.length === 0) {
            return res.status(404).json({ error: 'Employé non trouvé' });
        }

        // Supprimer l'employé
        await pool.query('DELETE FROM employes WHERE id = ?', [id]);

        res.status(200).json({ message: 'Employé supprimé avec succès' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});



// Calculer les jours ouvrés
async function calculerJoursOuvrables(dateDebut, dateFin) {
    const [feries] = await pool.query('SELECT date FROM jours_feries');
    const joursFeries = feries.map(f => new Date(f.date));

    let count = 0;
    let current = new Date(dateDebut);
    const end = new Date(dateFin);

    while (current <= end) {
        const day = current.getDay(); // 0 (dimanche) à 6 (samedi)
        const estFerie = joursFeries.some(d => d.toDateString() === current.toDateString());

        if (day !== 0 && day !== 6 && !estFerie) {
            count++;
        }
        current.setDate(current.getDate() + 1); // Passer au jour suivant
    }
    return count;
}


// 1. Créer une demande de congé
app.post('/api/conges', async (req, res) => {
    try {
        const { id_employe, date_debut, date_fin, motif } = req.body;

        // Validation des dates
        if (new Date(date_debut) >= new Date(date_fin)) {
            return res.status(400).json({ error: 'La date de début doit être avant la date de fin' });
        }

        // Calculer les jours ouvrés
        const joursDemandes = await calculerJoursOuvrables(date_debut, date_fin);

        // Vérifier que la demande ne dépasse pas 10 jours
        if (joursDemandes > 10) {
            return res.status(400).json({ error: 'La demande ne peut pas dépasser 10 jours ouvrés' });
        }

        // Vérifier que l'employé existe
        const [employe] = await pool.query('SELECT * FROM employes WHERE id = ?', [id_employe]);
        if (employe.length === 0) {
            return res.status(404).json({ error: 'Employé non trouvé' });
        }

        // Vérifier que l'employé a suffisamment de jours de congé
        if (employe[0].nombre_conge < joursDemandes) {
            return res.status(400).json({ error: 'Solde de congé insuffisant' });
        }

        // Enregistrer la demande de congé
        const [result] = await pool.query('INSERT INTO conges SET ?', {
            id_employe,
            date_debut,
            date_fin,
            motif,
            jours_demandes: joursDemandes,
            statut: 'en attente'
        });

        res.status(201).json({ id: result.insertId, message: 'Demande de congé enregistrée' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 2.  Récupérer les demandes de congé avec filtres
app.get('/api/conges', async (req, res) => {
    try {
        const { statut, employe } = req.query;
        let query = 'SELECT * FROM conges';
        const params = [];

        if (statut) {
            query += ' WHERE statut = ?';
            params.push(statut);
        }

        if (employe) {
            query += (statut ? ' AND' : ' WHERE') + ' id_employe = ?';
            params.push(employe);
        }

        const [conges] = await pool.query(query, params);
        res.json(conges);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 3. Lire une demande de congé par son ID
app.get('/api/conges/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const [conge] = await pool.query('SELECT * FROM conges WHERE id = ?', [id]);

        if (conge.length === 0) {
            return res.status(404).json({ error: 'Demande de congé non trouvée' });
        }

        res.status(200).json(conge[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 4. Mettre à jour le statut d'une demande de congé
app.put('/api/conges/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { statut } = req.body;

        // Vérifier que la demande existe
        const [conge] = await pool.query('SELECT * FROM conges WHERE id = ?', [id]);
        if (conge.length === 0) {
            return res.status(404).json({ error: 'Demande de congé non trouvée' });
        }

        // Mettre à jour le statut
        await pool.query('UPDATE conges SET statut = ? WHERE id = ?', [statut, id]);

        // Si le congé est validé, déduire les jours de congé de l'employé
        if (statut === 'valide') {
            const { id_employe, jours_demandes } = conge[0];
            await pool.query(
                'UPDATE employes SET solde_conge = solde_conge - ? WHERE id = ?',
                [jours_demandes, id_employe]
            );
        }

        res.status(200).json({ message: 'Statut de la demande mis à jour' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 5. Supprimer une demande de congé
app.delete('/api/conges/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // Vérifier que la demande existe
        const [conge] = await pool.query('SELECT * FROM conges WHERE id = ?', [id]);
        if (conge.length === 0) {
            return res.status(404).json({ error: 'Demande de congé non trouvée' });
        }

        // Supprimer la demande
        await pool.query('DELETE FROM conges WHERE id = ?', [id]);

        res.status(200).json({ message: 'Demande de congé supprimée' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});



/*
// Email de validation
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'votre-email@gmail.com',
        pass: 'votre-mot-de-passe'
    }
});

async function envoyerEmail(destinataire, sujet, message) {
    const mailOptions = {
        from: 'votre-email@gmail.com',
        to: destinataire,
        subject: sujet,
        text: message
    };

    await transporter.sendMail(mailOptions);
}


await envoyerEmail(
    'employe@example.com',
    'Statut de votre demande de congé',
    'Votre demande de congé a été validée.'
);*/

// Démarrer le serveur
app.listen(3000, () => console.log('Serveur démarré sur le port 3000'));