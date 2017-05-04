-- --------------------------------------------------------
-- Host:                         127.0.0.1
-- Server version:               5.7.17-log - MySQL Community Server (GPL)
-- Server OS:                    Win64
-- HeidiSQL Version:             9.3.0.4984
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8mb4 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;

-- Dumping database structure for pace
CREATE DATABASE IF NOT EXISTS `pace` /*!40100 DEFAULT CHARACTER SET utf8 */;
USE `pace`;


-- Dumping structure for table pace.claim
CREATE TABLE IF NOT EXISTS `claim` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `type` char(1) NOT NULL,
  `workflow_id` int(11) NOT NULL,
  `workflow_version` int(11) NOT NULL,
  `status_code` char(1) NOT NULL,
  `info_data1` varchar(20) DEFAULT NULL,
  `info_data2` varchar(20) DEFAULT NULL,
  `info_data3` varchar(20) DEFAULT NULL,
  `can_check` char(1) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_workflow` (`workflow_id`,`workflow_version`),
  CONSTRAINT `fk_workflow` FOREIGN KEY (`workflow_id`, `workflow_version`) REFERENCES `workflow` (`id`, `version`)
) ENGINE=InnoDB AUTO_INCREMENT=50 DEFAULT CHARSET=utf8;

-- Dumping data for table pace.claim: ~2 rows (approximately)
/*!40000 ALTER TABLE `claim` DISABLE KEYS */;
INSERT INTO `claim` (`id`, `type`, `workflow_id`, `workflow_version`, `status_code`, `info_data1`, `info_data2`, `info_data3`, `can_check`) VALUES
	(48, 'D', 1, 1, 'D', NULL, NULL, NULL, NULL),
	(49, 'P', 2, 1, 'D', NULL, NULL, NULL, NULL);
/*!40000 ALTER TABLE `claim` ENABLE KEYS */;


-- Dumping structure for table pace.workflow
CREATE TABLE IF NOT EXISTS `workflow` (
  `id` int(11) NOT NULL,
  `version` int(11) NOT NULL,
  `active` char(1) NOT NULL DEFAULT 'N',
  `steps` json NOT NULL,
  PRIMARY KEY (`id`,`version`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- Dumping data for table pace.workflow: ~2 rows (approximately)
/*!40000 ALTER TABLE `workflow` DISABLE KEYS */;
INSERT INTO `workflow` (`id`, `version`, `active`, `steps`) VALUES
	(1, 1, 'Y', {"steps": [{"id": 10, "name": "5010d-claim-info", "route": "5010d-claim-info", "start": true, "nextStep": 20}, {"id": 20, "name": "5010d-serviceline", "route": "5010d-serviceline", "nextStep": 30}, {"id": 30, "name": "5010d-review", "route": "5010d-review", "nextStep": null}]}),
	(2, 1, 'Y', {"steps": [{"id": 10, "name": "5010d-claim-info", "route": "5010d-claim-info", "start": true, "nextStep": 20}, {"id": 20, "name": "5010d-review", "route": "5010d-review", "nextStep": null}]});
/*!40000 ALTER TABLE `workflow` ENABLE KEYS */;


-- Dumping structure for table pace.workflow_classification
CREATE TABLE IF NOT EXISTS `workflow_classification` (
  `classification` varchar(15) NOT NULL,
  `path` varchar(30) NOT NULL,
  `label` varchar(45) NOT NULL,
  PRIMARY KEY (`classification`,`path`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- Dumping data for table pace.workflow_classification: ~5 rows (approximately)
/*!40000 ALTER TABLE `workflow_classification` DISABLE KEYS */;
INSERT INTO `workflow_classification` (`classification`, `path`, `label`) VALUES
	('claim', 'claim-info', 'Claim Info'),
	('claim', 'ordering-provider-info', 'ordering Provider'),
	('claim', 'provider-info', 'Provider Info'),
	('claim', 'review', 'Review'),
	('claim', 'serviceline', 'Service Lines');
/*!40000 ALTER TABLE `workflow_classification` ENABLE KEYS */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IF(@OLD_FOREIGN_KEY_CHECKS IS NULL, 1, @OLD_FOREIGN_KEY_CHECKS) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
