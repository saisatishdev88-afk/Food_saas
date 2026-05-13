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
-- Table structure for table `orders`
--

DROP TABLE IF EXISTS `orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `orders` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `tenant_id` bigint(20) unsigned NOT NULL,
  `user_id` bigint(20) unsigned DEFAULT NULL,
  `customer_phone` varchar(255) DEFAULT NULL,
  `order_number` varchar(255) NOT NULL,
  `type` enum('offline','online','whatsapp') DEFAULT 'offline',
  `fulfillment_type` enum('dine_in','takeaway','delivery') NOT NULL DEFAULT 'takeaway',
  `total_amount` decimal(12,2) NOT NULL,
  `tax_amount` decimal(12,2) NOT NULL DEFAULT 0.00,
  `service_charge` decimal(12,2) NOT NULL DEFAULT 0.00,
  `status` enum('pending','accepted','preparing','ready','delivered','cancelled') NOT NULL DEFAULT 'pending',
  `payment_status` enum('pending','paid','failed') NOT NULL DEFAULT 'pending',
  `payment_method` varchar(255) DEFAULT NULL,
  `table_number` varchar(255) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `orders_order_number_unique` (`order_number`),
  KEY `orders_tenant_id_foreign` (`tenant_id`),
  KEY `orders_user_id_foreign` (`user_id`),
  CONSTRAINT `orders_tenant_id_foreign` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE,
  CONSTRAINT `orders_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=72 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orders`
--

LOCK TABLES `orders` WRITE;
/*!40000 ALTER TABLE `orders` DISABLE KEYS */;
INSERT INTO `orders` VALUES (1,1,2,NULL,'ORD-TOD88I6P','online','takeaway',51.96,0.00,0.00,'delivered','paid','QR','12','Method: DINING','2026-04-25 01:58:51','2026-04-25 02:02:21'),(2,3,1,NULL,'ORD-47DE56','offline','takeaway',1660.00,0.00,0.00,'delivered','paid',NULL,NULL,NULL,'2026-04-25 03:01:04','2026-04-25 03:01:04'),(3,3,1,NULL,'ORD-129441','offline','takeaway',2063.00,0.00,0.00,'delivered','paid',NULL,NULL,NULL,'2026-04-25 03:01:04','2026-04-25 03:01:04'),(4,3,1,NULL,'ORD-55C850','offline','takeaway',3687.00,0.00,0.00,'delivered','paid',NULL,NULL,NULL,'2026-04-25 03:01:04','2026-04-25 03:01:04'),(5,3,1,NULL,'ORD-2A6FEE','offline','takeaway',811.00,0.00,0.00,'delivered','paid',NULL,NULL,NULL,'2026-04-25 03:01:04','2026-04-25 03:01:04'),(6,3,1,NULL,'ORD-C5278F','offline','takeaway',3721.00,0.00,0.00,'delivered','paid',NULL,NULL,NULL,'2026-04-25 03:01:04','2026-04-25 03:01:04'),(7,3,1,NULL,'ORD-7A1774','offline','takeaway',3842.00,0.00,0.00,'delivered','paid',NULL,NULL,NULL,'2026-04-25 03:01:04','2026-04-25 03:01:04'),(8,3,1,NULL,'ORD-1BD978','offline','takeaway',3675.00,0.00,0.00,'delivered','paid',NULL,NULL,NULL,'2026-04-25 03:01:04','2026-04-25 03:01:04'),(9,3,1,NULL,'ORD-72D70A','offline','takeaway',3445.00,0.00,0.00,'delivered','paid',NULL,NULL,NULL,'2026-04-25 03:01:04','2026-04-25 03:01:04'),(10,3,1,NULL,'ORD-5732E6','offline','takeaway',2380.00,0.00,0.00,'delivered','paid',NULL,NULL,NULL,'2026-04-25 03:01:04','2026-04-25 03:01:04'),(11,3,1,NULL,'ORD-A93495','offline','takeaway',3405.00,0.00,0.00,'delivered','paid',NULL,NULL,NULL,'2026-04-25 03:01:04','2026-04-25 03:01:04'),(12,3,1,NULL,'ORD-736296','offline','takeaway',2231.00,0.00,0.00,'delivered','paid',NULL,NULL,NULL,'2026-04-25 03:01:04','2026-04-25 03:01:04'),(13,3,1,NULL,'ORD-65DBE9','offline','takeaway',4181.00,0.00,0.00,'delivered','paid',NULL,NULL,NULL,'2026-04-25 03:01:04','2026-04-25 03:01:04'),(14,3,1,NULL,'ORD-5507AC','offline','takeaway',1892.00,0.00,0.00,'delivered','paid',NULL,NULL,NULL,'2026-04-25 03:01:04','2026-04-25 03:01:04'),(15,3,1,NULL,'ORD-B60D29','offline','takeaway',3346.00,0.00,0.00,'delivered','paid',NULL,NULL,NULL,'2026-04-25 03:01:04','2026-04-25 03:01:04'),(16,3,1,NULL,'ORD-C470FB','offline','takeaway',2774.00,0.00,0.00,'delivered','paid',NULL,NULL,NULL,'2026-04-25 03:01:04','2026-04-25 03:01:04'),(17,3,1,NULL,'ORD-7F70E2','offline','takeaway',2935.00,0.00,0.00,'delivered','paid',NULL,NULL,NULL,'2026-04-25 03:01:04','2026-04-25 03:01:04'),(18,4,1,NULL,'ORD-FABEC8','offline','takeaway',980.00,0.00,0.00,'delivered','paid',NULL,NULL,NULL,'2026-04-25 03:01:05','2026-04-25 03:01:05'),(19,4,1,NULL,'ORD-D7F7FC','offline','takeaway',927.00,0.00,0.00,'delivered','paid',NULL,NULL,NULL,'2026-04-25 03:01:05','2026-04-25 03:01:05'),(20,4,1,NULL,'ORD-BF7E89','offline','takeaway',3200.00,0.00,0.00,'delivered','paid',NULL,NULL,NULL,'2026-04-25 03:01:05','2026-04-25 03:01:05'),(21,4,1,NULL,'ORD-2AFE29','offline','takeaway',4292.00,0.00,0.00,'delivered','paid',NULL,NULL,NULL,'2026-04-25 03:01:05','2026-04-25 03:01:05'),(22,4,1,NULL,'ORD-09C30E','offline','takeaway',826.00,0.00,0.00,'delivered','paid',NULL,NULL,NULL,'2026-04-25 03:01:05','2026-04-25 03:01:05'),(23,4,1,NULL,'ORD-6F4249','offline','takeaway',1282.00,0.00,0.00,'delivered','paid',NULL,NULL,NULL,'2026-04-25 03:01:05','2026-04-25 03:01:05'),(24,4,1,NULL,'ORD-7AD4F7','offline','takeaway',3212.00,0.00,0.00,'delivered','paid',NULL,NULL,NULL,'2026-04-25 03:01:05','2026-04-25 03:01:05'),(25,4,1,NULL,'ORD-9AF097','offline','takeaway',1043.00,0.00,0.00,'delivered','paid',NULL,NULL,NULL,'2026-04-25 03:01:05','2026-04-25 03:01:05'),(26,4,1,NULL,'ORD-DB3ECA','offline','takeaway',3482.00,0.00,0.00,'delivered','paid',NULL,NULL,NULL,'2026-04-25 03:01:05','2026-04-25 03:01:05'),(27,4,1,NULL,'ORD-1930A5','offline','takeaway',3556.00,0.00,0.00,'delivered','paid',NULL,NULL,NULL,'2026-04-25 03:01:05','2026-04-25 03:01:05'),(28,4,1,NULL,'ORD-367593','offline','takeaway',1262.00,0.00,0.00,'delivered','paid',NULL,NULL,NULL,'2026-04-25 03:01:05','2026-04-25 03:01:05'),(29,4,1,NULL,'ORD-E9D3B6','offline','takeaway',1479.00,0.00,0.00,'delivered','paid',NULL,NULL,NULL,'2026-04-25 03:01:05','2026-04-25 03:01:05'),(30,4,1,NULL,'ORD-3E13D4','offline','takeaway',1878.00,0.00,0.00,'delivered','paid',NULL,NULL,NULL,'2026-04-25 03:01:05','2026-04-25 03:01:05'),(31,5,1,NULL,'ORD-166D4E','offline','takeaway',2770.00,0.00,0.00,'delivered','paid',NULL,NULL,NULL,'2026-04-25 03:01:05','2026-04-25 03:01:05'),(32,5,1,NULL,'ORD-240FA4','offline','takeaway',4141.00,0.00,0.00,'delivered','paid',NULL,NULL,NULL,'2026-04-25 03:01:05','2026-04-25 03:01:05'),(33,5,1,NULL,'ORD-F6D945','offline','takeaway',3687.00,0.00,0.00,'delivered','paid',NULL,NULL,NULL,'2026-04-25 03:01:05','2026-04-25 03:01:05'),(34,5,1,NULL,'ORD-F21A9D','offline','takeaway',3571.00,0.00,0.00,'delivered','paid',NULL,NULL,NULL,'2026-04-25 03:01:05','2026-04-25 03:01:05'),(35,5,1,NULL,'ORD-F025BA','offline','takeaway',2334.00,0.00,0.00,'delivered','paid',NULL,NULL,NULL,'2026-04-25 03:01:05','2026-04-25 03:01:05'),(36,5,1,NULL,'ORD-88B7FA','offline','takeaway',1254.00,0.00,0.00,'delivered','paid',NULL,NULL,NULL,'2026-04-25 03:01:05','2026-04-25 03:01:05'),(37,5,1,NULL,'ORD-6ABA82','offline','takeaway',2011.00,0.00,0.00,'delivered','paid',NULL,NULL,NULL,'2026-04-25 03:01:05','2026-04-25 03:01:05'),(38,5,1,NULL,'ORD-93F9D0','offline','takeaway',2287.00,0.00,0.00,'delivered','paid',NULL,NULL,NULL,'2026-04-25 03:01:05','2026-04-25 03:01:05'),(39,5,1,NULL,'ORD-4A05E3','offline','takeaway',2597.00,0.00,0.00,'delivered','paid',NULL,NULL,NULL,'2026-04-25 03:01:05','2026-04-25 03:01:05'),(40,5,1,NULL,'ORD-940056','offline','takeaway',2567.00,0.00,0.00,'delivered','paid',NULL,NULL,NULL,'2026-04-25 03:01:05','2026-04-25 03:01:05'),(41,5,1,NULL,'ORD-6B0907','offline','takeaway',4168.00,0.00,0.00,'delivered','paid',NULL,NULL,NULL,'2026-04-25 03:01:05','2026-04-25 03:01:05'),(42,5,1,NULL,'ORD-D21157','offline','takeaway',1193.00,0.00,0.00,'delivered','paid',NULL,NULL,NULL,'2026-04-25 03:01:05','2026-04-25 03:01:05'),(43,5,1,NULL,'ORD-290CCA','offline','takeaway',1721.00,0.00,0.00,'delivered','paid',NULL,NULL,NULL,'2026-04-25 03:01:05','2026-04-25 03:01:05'),(44,6,1,NULL,'ORD-831A45','offline','takeaway',2074.00,0.00,0.00,'delivered','paid',NULL,NULL,NULL,'2026-04-25 03:01:05','2026-04-25 03:01:05'),(45,6,1,NULL,'ORD-996558','offline','takeaway',3396.00,0.00,0.00,'delivered','paid',NULL,NULL,NULL,'2026-04-25 03:01:05','2026-04-25 03:01:05'),(46,6,1,NULL,'ORD-EC5B41','offline','takeaway',3229.00,0.00,0.00,'delivered','paid',NULL,NULL,NULL,'2026-04-25 03:01:05','2026-04-25 03:01:05'),(47,6,1,NULL,'ORD-A1FAD1','offline','takeaway',2976.00,0.00,0.00,'delivered','paid',NULL,NULL,NULL,'2026-04-25 03:01:05','2026-04-25 03:01:05'),(48,6,1,NULL,'ORD-4C3C5E','offline','takeaway',3534.00,0.00,0.00,'delivered','paid',NULL,NULL,NULL,'2026-04-25 03:01:05','2026-04-25 03:01:05'),(49,6,1,NULL,'ORD-D4DE72','offline','takeaway',4432.00,0.00,0.00,'delivered','paid',NULL,NULL,NULL,'2026-04-25 03:01:05','2026-04-25 03:01:05'),(50,6,1,NULL,'ORD-B27F55','offline','takeaway',3864.00,0.00,0.00,'delivered','paid',NULL,NULL,NULL,'2026-04-25 03:01:05','2026-04-25 03:01:05'),(51,6,1,NULL,'ORD-31ED04','offline','takeaway',906.00,0.00,0.00,'delivered','paid',NULL,NULL,NULL,'2026-04-25 03:01:05','2026-04-25 03:01:05'),(52,6,1,NULL,'ORD-6643F2','offline','takeaway',2656.00,0.00,0.00,'delivered','paid',NULL,NULL,NULL,'2026-04-25 03:01:05','2026-04-25 03:01:05'),(53,6,1,NULL,'ORD-007924','offline','takeaway',3789.00,0.00,0.00,'delivered','paid',NULL,NULL,NULL,'2026-04-25 03:01:05','2026-04-25 03:01:05'),(54,6,1,NULL,'ORD-59927A','offline','takeaway',2736.00,0.00,0.00,'delivered','paid',NULL,NULL,NULL,'2026-04-25 03:01:05','2026-04-25 03:01:05'),(55,1,2,NULL,'FOO-LRZJX2','online','takeaway',200.00,0.00,0.00,'ready','paid','QR','12',NULL,'2026-04-25 06:29:26','2026-04-25 07:04:15'),(56,1,2,NULL,'FOO-R4HHS7','offline','takeaway',25.98,0.00,0.00,'cancelled','pending',NULL,'1','Order placed via Terminal. Method: dine_in','2026-04-25 06:38:38','2026-04-25 06:38:58'),(57,1,2,NULL,'FOO-LOKV7D','offline','takeaway',12.99,0.00,0.00,'ready','paid','Cash','6','Order placed via Terminal. Method: dine_in','2026-04-25 06:39:18','2026-04-25 07:04:26'),(58,1,2,NULL,'FOO-OLBUQL','online','takeaway',12.99,0.00,0.00,'ready','paid','QR','1','Order placed via Terminal. Method: dine_in','2026-04-25 06:57:50','2026-04-25 07:04:24'),(59,1,2,NULL,'FOO-DAKSGC','offline','takeaway',240.00,0.00,0.00,'ready','paid','Cash',NULL,'Order placed via Terminal. Method: takeaway','2026-04-25 06:59:06','2026-04-25 07:04:48'),(60,1,2,NULL,'FOO-SUGNSA','offline','dine_in',4.50,0.00,0.00,'ready','paid','Cash','1','Order placed via Terminal. Method: dine_in','2026-04-25 07:03:29','2026-04-25 07:04:49'),(61,1,2,NULL,'FOO-BRGJJC','offline','dine_in',12.99,0.00,0.00,'delivered','paid','Cash','1','Order placed via Terminal. Method: dine_in','2026-04-28 14:55:27','2026-05-01 04:40:31'),(62,7,NULL,NULL,'CAP-HUAQVK','online','dine_in',240.00,0.00,0.00,'ready','pending','cash','1',NULL,'2026-04-29 05:52:58','2026-04-29 05:53:46'),(63,7,NULL,NULL,'CAP-EANJNE','online','dine_in',80.00,0.00,0.00,'ready','pending','cash','3',NULL,'2026-04-29 06:13:05','2026-04-29 13:34:44'),(64,7,11,NULL,'CAP-GTK0CQ','offline','dine_in',600.00,0.00,0.00,'ready','paid','Cash','5','Order placed via Terminal. Method: dine_in','2026-04-29 14:01:48','2026-04-29 14:02:25'),(65,7,NULL,NULL,'CAP-NYEUEP','online','dine_in',120.00,0.00,0.00,'ready','pending','cash','1',NULL,'2026-05-01 04:43:44','2026-05-01 05:46:49'),(66,7,NULL,NULL,'CAP-WW3C40','online','dine_in',20.00,0.00,0.00,'ready','pending','cash','10',NULL,'2026-05-01 05:48:15','2026-05-01 05:53:50'),(67,1,NULL,'919876543210','WA-69F9E672A5C91','whatsapp','takeaway',12.99,0.00,0.00,'ready','pending',NULL,NULL,NULL,'2026-05-05 07:15:38','2026-05-06 06:09:56'),(68,7,NULL,'919876543210','WA-69F9ED79EF93C','whatsapp','takeaway',150.00,0.00,0.00,'ready','pending',NULL,NULL,NULL,'2026-05-05 07:45:37','2026-05-06 03:53:12'),(69,7,NULL,'919676807124','WA-69FA3B3DDCD03','whatsapp','takeaway',120.00,0.00,0.00,'ready','pending',NULL,NULL,NULL,'2026-05-05 13:17:25','2026-05-06 03:53:18'),(70,7,NULL,'917751005228','WA-69FAFDCB1BD8E','whatsapp','takeaway',200.00,0.00,0.00,'delivered','paid',NULL,NULL,NULL,'2026-05-06 03:07:31','2026-05-06 06:50:57'),(71,7,NULL,'919154964288','WA-69FB4217D1048','whatsapp','takeaway',160.00,0.00,0.00,'ready','pending',NULL,NULL,NULL,'2026-05-06 07:58:55','2026-05-06 08:00:50');
/*!40000 ALTER TABLE `orders` ENABLE KEYS */;
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
