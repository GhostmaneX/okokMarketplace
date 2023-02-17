Hi, thank you for buying okokMarketplace, I'm very grateful!

If you need help contact me on discord: okok#3488
Discord server: https://discord.gg/okok/

1. Go to your database and execute the following SQL command:

CREATE TABLE `okokmarketplace_vehicles`  (
  `id` int(255) NOT NULL AUTO_INCREMENT,
  `item_id` varchar(255) NOT NULL,
  `plate` varchar(255) NOT NULL,
  `label` varchar(255) NOT NULL,
  `author_identifier` varchar(255) NOT NULL,
  `author_name` varchar(255) NULL DEFAULT NULL,
  `phone_number` varchar(255) NULL DEFAULT NULL,
  `description` varchar(255) NULL DEFAULT NULL,
  `price` varchar(255) NOT NULL,
  `sold` tinyint(1) NOT NULL DEFAULT 0,
  `start_date` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
);

CREATE TABLE `okokmarketplace_items`  (
  `id` int(255) NOT NULL AUTO_INCREMENT,
  `item_id` varchar(255) NOT NULL,
  `label` varchar(255) NOT NULL,
  `amount` varchar(255) NULL DEFAULT NULL,
  `author_identifier` varchar(255) NOT NULL,
  `author_name` varchar(255) NULL DEFAULT NULL,
  `phone_number` varchar(255) NULL DEFAULT NULL,
  `description` varchar(255) NULL DEFAULT NULL,
  `price` varchar(255) NOT NULL,
  `sold` tinyint(1) NOT NULL DEFAULT 0,
  `start_date` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
);

CREATE TABLE `okokmarketplace_blackmarket`  (
  `id` int(255) NOT NULL AUTO_INCREMENT,
  `item_id` varchar(255) NOT NULL,
  `label` varchar(255) NOT NULL,
  `type` varchar(255) NOT NULL,
  `amount` varchar(255) NOT NULL,
  `author_identifier` varchar(255) NOT NULL,
  `author_name` varchar(255) NULL DEFAULT NULL,
  `phone_number` varchar(255) NULL DEFAULT NULL,
  `description` varchar(255) NULL DEFAULT NULL,
  `price` varchar(255) NOT NULL,
  `sold` tinyint(1) NOT NULL DEFAULT 0,
  `start_date` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
);

2. How to add the images:

Items/Weapons:
To add the images simply put them inside the icons folder with the same name as the items/weapons ids.

Example (Item: id of image): 
Bread: bread.png
Water: water.png
Assault rifle: WEAPON_ASSAULTRIFLE.png

Note: You can simply copy from your inventory folder and paste them on the icons folder.

Vehicles:
For the vehicles images is the same as for items but the id is the <gameName>, you can find it on the file vehicles.meta inside the vehicle folder.
If the game name has spaces like <gameName>La Voiture</gameName> you simply remove them.

Example (game name: id of image):
<gameName>DS3</gameName>: DS3.png
<gameName>La Voiture</gameName>: LaVoiture.png