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
-- Table structure for table `tenants`
--

DROP TABLE IF EXISTS `tenants`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tenants` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `domain` varchar(255) NOT NULL,
  `logo` varchar(255) DEFAULT NULL,
  `email` varchar(255) NOT NULL,
  `phone` varchar(255) DEFAULT NULL,
  `status` enum('active','suspended','pending') NOT NULL DEFAULT 'active',
  `plan_type` varchar(255) NOT NULL DEFAULT 'basic',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `modules` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`modules`)),
  `whatsapp_config` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`whatsapp_config`)),
  `subscription_expires_at` timestamp NULL DEFAULT NULL,
  `subscription_grace_days` int(11) NOT NULL DEFAULT 3,
  `is_first_subscription` tinyint(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`),
  UNIQUE KEY `tenants_domain_unique` (`domain`),
  UNIQUE KEY `tenants_email_unique` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tenants`
--

LOCK TABLES `tenants` WRITE;
/*!40000 ALTER TABLE `tenants` DISABLE KEYS */;
INSERT INTO `tenants` VALUES (1,'Soul and Spice','soulnspice',NULL,'soulnspice@gmail.com',NULL,'active','basic','2026-04-25 00:13:49','2026-05-06 15:21:05',NULL,NULL,'2026-07-05 05:36:42',3,0),(2,'Royal Spice India','royalspice',NULL,'contact@royalspice.com',NULL,'active','pro','2026-04-25 03:00:15','2026-04-25 03:00:15',NULL,NULL,'2026-06-05 05:36:42',3,1),(3,'Chennai Express','chennai',NULL,'contact@chennai.com',NULL,'active','premium','2026-04-25 03:01:04','2026-04-25 03:01:04',NULL,NULL,'2026-06-05 05:36:42',3,1),(4,'Mumbai Munchies','mumbai',NULL,'contact@mumbai.com',NULL,'active','basic','2026-04-25 03:01:04','2026-04-25 03:01:04',NULL,NULL,'2026-06-05 05:36:42',3,1),(5,'The Goa Grill','goagrill',NULL,'contact@goagrill.com',NULL,'active','premium','2026-04-25 03:01:05','2026-04-25 03:01:05',NULL,NULL,'2026-06-05 05:36:42',3,1),(6,'Gateway Spice','gateway',NULL,'contact@gateway.com',NULL,'active','pro','2026-04-25 03:01:05','2026-04-25 03:01:05',NULL,NULL,'2026-06-05 05:36:42',3,1),(7,'CAPITAL FOODS','CAPITAL',NULL,'saisatishdev88@gmail.com',NULL,'active','premium','2026-04-29 02:05:03','2026-05-05 07:29:09','{\"qr_menu\":true,\"inventory\":true,\"shift_management\":true,\"ai_assistant\":true,\"whatsapp_ordering\":true}','{\"business_number\":\"9948899374\",\"instance_id\":\"ins_4GxKXGBS7krm\",\"api_key\":\"sk_aYrhlr8hWU-D6uiE5MvNPQ\",\"subscription_id\":\"sub_1TTgWsI7yDGE3kxgZH6aqtlF\",\"welcome_message\":\"Hi \\ud83d\\udc4b Welcome to our restaurant!\\n\\nReply:\\n1 for Menu\\n2 to Track Order\",\"status\":\"partially_configured\"}','2026-06-05 05:36:42',3,1);
/*!40000 ALTER TABLE `tenants` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-05-07 15:21:21
