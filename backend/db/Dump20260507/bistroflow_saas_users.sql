-- MySQL dump 10.13  Distrib 8.0.41, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: bistroflow_saas
-- ------------------------------------------------------
-- Server version	5.5.5-10.4.32-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `tenant_id` bigint(20) unsigned DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('superadmin','admin','manager','chef','waiter','delivery','customer') NOT NULL DEFAULT 'customer',
  `remember_token` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_unique` (`email`),
  KEY `users_tenant_id_foreign` (`tenant_id`),
  CONSTRAINT `users_tenant_id_foreign` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,NULL,'Root Superadmin','root@bistroflow.io',NULL,'$2y$12$twVZgnTEISFwhqidumhKl.KJ/SFyM.XAKA6Xfk3y58DU0.9tAtOVG','superadmin',NULL,'2026-04-25 00:09:08','2026-04-25 00:09:08'),(2,1,'Soulnspice','soulnspice@gmail.com',NULL,'$2y$12$Vsq6VDimaFhvZBexoVThKuzeYvfJDqGjYH2PyZOF27bxDTfw9mrdG','admin',NULL,'2026-04-25 00:13:50','2026-04-25 00:13:50'),(3,1,'Brevis','brevis@soulnspice.com',NULL,'$2y$12$NJfqyHh1Zzg4MhzvYDKgCuj46vtl7TisMPR3jw8R3GZwS60uDIjwi','chef',NULL,'2026-04-25 00:17:17','2026-04-25 00:17:17'),(4,1,'Scott','scott@soulnspice.com',NULL,'$2y$12$oVFqeRUxHdK0hRfxv5Lio.j2du342a268ZRFfmYn6vFyLW9X1v/2q','manager',NULL,'2026-04-25 00:18:27','2026-04-25 00:18:27'),(5,1,'Bieber','bieber@soulnspice.com',NULL,'$2y$12$0JSZFg0KhVljFSrV5y5YT.s9HbpLPobCngRMdnSyKPHoDzRIcd5Ei','delivery',NULL,'2026-04-25 01:23:25','2026-04-25 01:23:25'),(6,2,'Royal Spice India Admin','admin@royalspice.com',NULL,'$2y$12$d10tGa4p83OYd3Hs54EdXOzdhlU625tz6XX/xdftwops2IogtvQBC','admin',NULL,'2026-04-25 03:00:15','2026-04-25 03:00:15'),(7,3,'Chennai Express Admin','admin@chennai.com',NULL,'$2y$12$Nst1MhEcwlW.c79/gCilSObEoouX0Chzu9BrHLP6mMZGgvpguiIaO','admin',NULL,'2026-04-25 03:01:04','2026-04-25 03:01:04'),(8,4,'Mumbai Munchies Admin','admin@mumbai.com',NULL,'$2y$12$4I5.M56eqy14m2.0wVLCdu3xgUGkXPBJncRtwt71BvIWYL5rPwN96','admin',NULL,'2026-04-25 03:01:05','2026-04-25 03:01:05'),(9,5,'The Goa Grill Admin','admin@goagrill.com',NULL,'$2y$12$f4aqIVDxrOw3kBGul0AU6.rQhGDgAEK3/sP4nOFvFuXCo8ok9wI8y','admin',NULL,'2026-04-25 03:01:05','2026-04-25 03:01:05'),(10,6,'Gateway Spice Admin','admin@gateway.com',NULL,'$2y$12$fQHzScxZR6PF.naTIz.vUOLZ3a75EorAQ/YTlDxHMF6QsDCShubVi','admin',NULL,'2026-04-25 03:01:05','2026-04-25 03:01:05'),(11,7,'Capital Foods','saisatishdev88@gmail.com',NULL,'$2y$12$OkRuVu8lreR.ijRLySZL6.U.uHiNyrKyJ2l8gg6PM0.SYbpzKnPSG','admin',NULL,'2026-04-29 02:05:03','2026-04-29 02:05:03'),(12,7,'Ishan','ishan@capitalfoods.com',NULL,'$2y$12$libmGNrEH4jGO6S/wFUAgu748cFIop/ppZ0SfOmPnrxbV5dfiqKIK','waiter',NULL,'2026-04-29 04:33:17','2026-04-29 04:33:17'),(13,7,'Karthik','manager@capitalfoods.com',NULL,'$2y$12$civhnuVywTP15uLklW9HiOqoyG3gqjYASCWylAEL/FHxg2LDqV/D2','manager',NULL,'2026-04-29 04:38:28','2026-04-29 04:38:28'),(14,7,'Kumar','kumar@capitalfoods.com',NULL,'$2y$12$int2334XQontq4XFJZEJGOadRglFBWbbKylnAUSzgxmQX5j4cgeQa','chef',NULL,'2026-04-29 04:40:52','2026-04-29 04:40:52');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-05-07 15:21:22
