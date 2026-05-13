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
-- Table structure for table `order_items`
--

DROP TABLE IF EXISTS `order_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `order_items` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `order_id` bigint(20) unsigned NOT NULL,
  `menu_item_id` bigint(20) unsigned DEFAULT NULL,
  `item_name` varchar(255) NOT NULL,
  `quantity` int(11) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `subtotal` decimal(12,2) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `order_items_order_id_foreign` (`order_id`),
  KEY `order_items_menu_item_id_foreign` (`menu_item_id`),
  CONSTRAINT `order_items_menu_item_id_foreign` FOREIGN KEY (`menu_item_id`) REFERENCES `menu_items` (`id`) ON DELETE SET NULL,
  CONSTRAINT `order_items_order_id_foreign` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=27 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order_items`
--

LOCK TABLES `order_items` WRITE;
/*!40000 ALTER TABLE `order_items` DISABLE KEYS */;
INSERT INTO `order_items` VALUES (1,1,1,'Classic Cheeseburger',4,12.99,51.96,'2026-04-25 01:58:51','2026-04-25 01:58:51'),(2,55,4,'Noodles(Egg)',2,100.00,200.00,'2026-04-25 06:29:26','2026-04-25 06:29:26'),(3,56,1,'Classic Cheeseburger',2,12.99,25.98,'2026-04-25 06:38:38','2026-04-25 06:38:38'),(4,57,1,'Classic Cheeseburger',1,12.99,12.99,'2026-04-25 06:39:18','2026-04-25 06:39:18'),(5,58,1,'Classic Cheeseburger',1,12.99,12.99,'2026-04-25 06:57:50','2026-04-25 06:57:50'),(6,59,5,'Fried Rice(Chicken)',2,120.00,240.00,'2026-04-25 06:59:06','2026-04-25 06:59:06'),(7,60,3,'French Fries',1,4.50,4.50,'2026-04-25 07:03:29','2026-04-25 07:03:29'),(8,61,1,'Classic Cheeseburger',1,12.99,12.99,'2026-04-28 14:55:27','2026-04-28 14:55:27'),(9,62,6,'Veg Burger',2,120.00,240.00,'2026-04-29 05:52:58','2026-04-29 05:52:58'),(10,63,7,'Egg puff',2,40.00,80.00,'2026-04-29 06:13:05','2026-04-29 06:13:05'),(11,64,12,'Mixed veg pulao',2,300.00,600.00,'2026-04-29 14:01:48','2026-04-29 14:01:48'),(12,65,6,'Veg Burger',1,120.00,120.00,'2026-05-01 04:43:44','2026-05-01 04:43:44'),(13,66,10,'Samosa',2,10.00,20.00,'2026-05-01 05:48:15','2026-05-01 05:48:15'),(14,68,14,'Apricot Delight',1,150.00,150.00,'2026-05-05 07:45:37','2026-05-05 07:45:37'),(15,69,6,'Veg Burger',1,120.00,120.00,'2026-05-05 13:17:25','2026-05-05 13:17:25'),(16,70,11,'Mutton dum biryani',1,200.00,200.00,'2026-05-06 03:07:31','2026-05-06 03:07:31'),(17,71,10,'Samosa',1,10.00,10.00,'2026-05-06 07:58:55','2026-05-06 07:58:55'),(18,71,14,'Apricot Delight',1,150.00,150.00,'2026-05-06 07:58:55','2026-05-06 07:58:55'),(19,72,6,'Veg Burger (Added by Vijay)',1,120.00,120.00,'2026-05-07 12:01:00','2026-05-07 12:01:00'),(20,72,14,'Apricot Delight (Added by Vijay)',1,150.00,150.00,'2026-05-07 12:01:00','2026-05-07 12:01:00'),(21,72,12,'Mixed veg pulao (Added by Swamy)',1,300.00,300.00,'2026-05-07 12:01:00','2026-05-07 12:01:00'),(22,72,13,'Rasamalai (Added by Swamy)',1,100.00,100.00,'2026-05-07 12:01:00','2026-05-07 12:01:00'),(23,73,6,'Veg Burger (Added by Vijay)',1,120.00,120.00,'2026-05-07 14:13:43','2026-05-07 14:13:43'),(24,73,6,'Veg Burger (Added by Vijay)',1,120.00,120.00,'2026-05-07 14:13:43','2026-05-07 14:13:43'),(25,73,11,'Mutton dum biryani (Added by sai)',1,200.00,200.00,'2026-05-07 14:13:43','2026-05-07 14:13:43'),(26,74,6,'Veg Burger',1,120.00,120.00,'2026-05-12 13:36:58','2026-05-12 13:36:58');
/*!40000 ALTER TABLE `order_items` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-05-13 10:31:25
