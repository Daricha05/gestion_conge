-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Feb 07, 2025 at 01:49 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `gest_conge`
--

-- --------------------------------------------------------

--
-- Table structure for table `conges`
--

CREATE TABLE `conges` (
  `id` int(11) NOT NULL,
  `id_employe` int(11) NOT NULL,
  `date_debut` date NOT NULL,
  `date_fin` date NOT NULL,
  `motif` text NOT NULL,
  `date_demande` datetime DEFAULT current_timestamp(),
  `statut` enum('en attente','refuse','valide') DEFAULT 'en attente',
  `jours_demandes` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `conges`
--

INSERT INTO `conges` (`id`, `id_employe`, `date_debut`, `date_fin`, `motif`, `date_demande`, `statut`, `jours_demandes`) VALUES
(1, 1, '2025-02-10', '2025-02-14', 'Repos médicale', '2025-02-07 09:43:48', 'valide', 5),
(2, 1, '2025-03-27', '2025-04-02', 'reraka', '2025-02-07 09:49:50', 'refuse', 3),
(3, 1, '2025-02-07', '2025-02-10', 'test', '2025-02-07 13:53:51', 'en attente', 2),
(4, 2, '2025-02-07', '2025-02-10', 'test', '2025-02-07 14:00:14', 'en attente', 2),
(5, 2, '2025-02-07', '2025-02-10', 'test', '2025-02-07 14:00:19', 'refuse', 2);

-- --------------------------------------------------------

--
-- Table structure for table `employes`
--

CREATE TABLE `employes` (
  `id` int(11) NOT NULL,
  `matricule` varchar(20) NOT NULL,
  `nom` varchar(50) NOT NULL,
  `prenom` varchar(50) NOT NULL,
  `adresse` varchar(50) DEFAULT NULL,
  `sexe` enum('Masculin','Feminin') NOT NULL,
  `poste` varchar(50) NOT NULL,
  `carte_identite` varchar(50) NOT NULL,
  `date_embauche` date DEFAULT NULL,
  `solde_conge` int(11) DEFAULT 30
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `employes`
--

INSERT INTO `employes` (`id`, `matricule`, `nom`, `prenom`, `adresse`, `sexe`, `poste`, `carte_identite`, `date_embauche`, `solde_conge`) VALUES
(1, 'EMP001', 'Johnny', 'Richard', '67 ha', 'Masculin', 'Chef de projet', '123456789', '2025-01-01', 25),
(2, 'EMP002', 'test', 'test', 'test', '', 'test', '626 266 662 626', '2025-02-02', 28);

-- --------------------------------------------------------

--
-- Table structure for table `jours_feries`
--

CREATE TABLE `jours_feries` (
  `id` int(11) NOT NULL,
  `date` date NOT NULL,
  `description` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `jours_feries`
--

INSERT INTO `jours_feries` (`id`, `date`, `description`) VALUES
(1, '2025-01-01', 'Nouvel An'),
(2, '2025-03-08', 'Journée internationale de la Femme'),
(3, '2025-03-29', 'Journée commémorative des morts des évènements de 1947'),
(4, '2025-03-31', 'Pâques'),
(5, '2025-04-01', 'Lundi de Pâques'),
(6, '2025-04-10', 'Eïd Al-Fitr'),
(7, '2025-05-01', 'Fête du Travail'),
(8, '2025-05-09', 'Ascension'),
(9, '2025-05-19', 'Pentecôte'),
(10, '2025-05-20', 'Lundi de Pentecôte'),
(11, '2025-06-16', 'Aïd al-Adha'),
(12, '2025-06-26', 'Fête Nationale de l\'indépendance'),
(13, '2025-08-15', 'Assomption'),
(14, '2025-11-01', 'Toussaint'),
(15, '2025-12-25', 'Noël');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `conges`
--
ALTER TABLE `conges`
  ADD PRIMARY KEY (`id`),
  ADD KEY `id_employe` (`id_employe`);

--
-- Indexes for table `employes`
--
ALTER TABLE `employes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `matricule` (`matricule`),
  ADD UNIQUE KEY `carte_identite` (`carte_identite`);

--
-- Indexes for table `jours_feries`
--
ALTER TABLE `jours_feries`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `date` (`date`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `conges`
--
ALTER TABLE `conges`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `employes`
--
ALTER TABLE `employes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `jours_feries`
--
ALTER TABLE `jours_feries`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `conges`
--
ALTER TABLE `conges`
  ADD CONSTRAINT `conges_ibfk_1` FOREIGN KEY (`id_employe`) REFERENCES `employes` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
