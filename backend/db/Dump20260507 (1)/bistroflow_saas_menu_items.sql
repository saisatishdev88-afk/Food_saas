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
-- Table structure for table `menu_items`
--

DROP TABLE IF EXISTS `menu_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `menu_items` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `tenant_id` bigint(20) unsigned NOT NULL,
  `category_id` bigint(20) unsigned NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `price` decimal(10,2) NOT NULL,
  `discount_price` decimal(10,2) DEFAULT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  `is_available` tinyint(1) NOT NULL DEFAULT 1,
  `is_veg` tinyint(1) NOT NULL DEFAULT 0,
  `prep_time` int(11) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `is_whatsapp_visible` tinyint(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `menu_items_tenant_id_foreign` (`tenant_id`),
  KEY `menu_items_category_id_foreign` (`category_id`),
  CONSTRAINT `menu_items_category_id_foreign` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE,
  CONSTRAINT `menu_items_tenant_id_foreign` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `menu_items`
--

LOCK TABLES `menu_items` WRITE;
/*!40000 ALTER TABLE `menu_items` DISABLE KEYS */;
INSERT INTO `menu_items` VALUES (1,1,1,'Classic Cheeseburger','Juicy beef patty with cheddar cheese, lettuce, and tomato.',12.99,NULL,'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=300&h=200&auto=format&fit=crop',1,0,NULL,'2026-04-25 00:45:04','2026-04-25 00:45:04',0),(2,1,1,'Spicy Zinger','Crispy chicken with spicy mayo and jalapenos.',10.50,NULL,'https://images.unsplash.com/photo-1550547660-d9450f859349?q=80&w=300&h=200&auto=format&fit=crop',0,0,NULL,'2026-04-25 00:45:04','2026-04-25 00:57:42',0),(3,1,2,'French Fries','Golden crispy fries with sea salt.',4.50,NULL,'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?q=80&w=300&h=200&auto=format&fit=crop',1,1,NULL,'2026-04-25 00:45:04','2026-04-25 00:45:04',0),(4,1,3,'Noodles(Egg)','Egg noodles with great taste and spice and added chilli ,sauce',100.00,NULL,NULL,1,1,NULL,'2026-04-25 06:06:33','2026-04-29 04:28:57',0),(5,1,3,'Fried Rice(Chicken)',NULL,120.00,NULL,NULL,1,1,NULL,'2026-04-25 06:06:59','2026-04-29 04:29:08',0),(6,7,4,'Veg Burger','veg burger with vegetable loaded sauce',120.00,NULL,'https://images.unsplash.com/photo-1571091718767-18b5b1457add?q=80&w=1172&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',1,1,NULL,'2026-04-29 05:50:15','2026-05-06 06:36:45',1),(7,7,4,'Egg puff',NULL,40.00,NULL,'https://images.unsplash.com/photo-1682263167429-0dbcf2c1e127?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',1,0,NULL,'2026-04-29 05:50:56','2026-05-06 05:25:13',0),(8,7,5,'Chicken biryani dum','dum with two pieces and egg',300.00,NULL,'https://images.unsplash.com/photo-1631515243349-e0cb75fb8d3a?q=80&w=1188&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',1,0,NULL,'2026-04-29 06:17:20','2026-05-03 09:28:36',1),(9,7,4,'Curry puff',NULL,30.00,NULL,'https://images.unsplash.com/photo-1682263167429-0dbcf2c1e127?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',1,1,NULL,'2026-04-29 13:43:39','2026-05-03 09:28:36',1),(10,7,4,'Samosa',NULL,10.00,NULL,'https://images.unsplash.com/photo-1601050690597-df0568f70950?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',1,1,NULL,'2026-04-29 13:44:13','2026-05-03 09:28:36',1),(11,7,5,'Mutton dum biryani',NULL,200.00,NULL,'https://images.unsplash.com/photo-1633945274405-b6c8069047b0?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',1,0,NULL,'2026-04-29 13:45:05','2026-05-03 09:28:36',1),(12,7,5,'Mixed veg pulao',NULL,300.00,NULL,'https://images.unsplash.com/photo-1630409346824-4f0e7b080087?q=80&w=1246&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',1,1,NULL,'2026-04-29 13:45:54','2026-05-03 09:28:36',1),(13,7,6,'Rasamalai',NULL,100.00,NULL,NULL,1,1,NULL,'2026-04-29 13:46:45','2026-05-06 04:54:49',0),(14,7,6,'Apricot Delight',NULL,150.00,NULL,'https://plus.unsplash.com/premium_photo-1661436384708-7bb61f7b6a60?q=80&w=764&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',1,1,NULL,'2026-04-29 13:47:25','2026-05-03 09:28:36',1),(15,8,7,'Munchuria chicken',NULL,250.00,NULL,NULL,1,0,NULL,'2026-05-07 04:56:29','2026-05-07 04:56:29',0);
/*!40000 ALTER TABLE `menu_items` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-05-13 10:31:24
