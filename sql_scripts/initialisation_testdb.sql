DROP DATABASE IF EXISTS app_mysql_test; 

CREATE DATABASE IF NOT EXISTS app_mysql_test; 

USE app_mysql_test; 

/*
Replace the below code every time a new initialisation script is used. This DB is used for testing only
*/

CREATE TABLE IF NOT EXISTS asset_types (
	asset_typeID INT AUTO_INCREMENT,
    asset_type_name VARCHAR(100) NOT NULL,
    PRIMARY KEY (asset_typeID)
) ENGINE=INNODB; 

INSERT INTO asset_types (asset_type_name) VALUES ('task');
INSERT INTO asset_types (asset_type_name) VALUES ('augmented_reality');
INSERT INTO asset_types (asset_type_name) VALUES ('map');

CREATE TABLE IF NOT EXISTS assets (
	assetID INT AUTO_INCREMENT, 
    asset_typeID INT,
    asset_name VARCHAR(100) NOT NULL,
    blob_name VARCHAR(100),
    created_at DATETIME NOT NULL,
    is_default_map BOOL DEFAULT FALSE,
    PRIMARY KEY (assetID),
    FOREIGN KEY (asset_typeID) REFERENCES asset_types(asset_typeID) ON DELETE SET NULL ON UPDATE CASCADE
)  ENGINE=INNODB;

CREATE TABLE IF NOT EXISTS scenarios (
	scenarioID INT AUTO_INCREMENT, 
	scenario_name VARCHAR(100) NOT NULL,
    PRIMARY KEY (scenarioID)
) ENGINE=INNODB; 

CREATE TABLE IF NOT EXISTS tasks (
	taskID INT AUTO_INCREMENT, 
	scenarioID INT NOT NULL, 
    background_photoID INT,
    task_number INT NOT NULL,
    PRIMARY KEY (taskID),
    FOREIGN KEY (scenarioID) REFERENCES scenarios(scenarioID) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (background_photoID) REFERENCES assets(assetID) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=INNODB; 

CREATE TABLE IF NOT EXISTS task_display_photos (
	task_display_photoID INT AUTO_INCREMENT, 
    taskID INT NOT NULL,
    display_photoID INT,
    PRIMARY KEY (task_display_photoID),
    FOREIGN KEY (taskID) REFERENCES tasks(taskID) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (display_photoID) REFERENCES assets(assetID) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=INNODB; 

CREATE TABLE IF NOT EXISTS location_types (
	location_typeID INT AUTO_INCREMENT, 
    location_type_name VARCHAR(100) NOT NULL,
    PRIMARY KEY (location_typeID)
) ENGINE=INNODB; 

INSERT INTO location_types (location_type_name) VALUES ('building');
INSERT INTO location_types (location_type_name) VALUES ('room');
INSERT INTO location_types (location_type_name) VALUES ('location_connection');

CREATE TABLE IF NOT EXISTS locations (
	locationID INT AUTO_INCREMENT,
    current_mapID INT NOT NULL,
    location_typeID INT NOT NULL, 
    location_name VARCHAR (100) NOT NULL,
    rel_position_on_map_x DECIMAL(10,5),
    rel_position_on_map_y DECIMAL(10,5),
    PRIMARY KEY (locationID), 
    FOREIGN KEY (current_mapID) REFERENCES assets(assetID) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (location_typeID) REFERENCES location_types(location_typeID) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=INNODB; 

CREATE TABLE IF NOT EXISTS anchors (
	anchorNumber INT AUTO_INCREMENT, 
	anchorID VARCHAR(100), 
    locationID INT,
    anchor_name VARCHAR(100),
    PRIMARY KEY (anchorNumber),
    FOREIGN KEY (locationID) REFERENCES locations(locationID) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=INNODB; 


CREATE TABLE IF NOT EXISTS anchored_assets (
	anchored_assetID INT AUTO_INCREMENT,
    anchorNumber INT NOT NULL, 
    assetID INT NOT NULL, 
    PRIMARY KEY (anchored_assetID), 
    FOREIGN KEY (anchorNumber) REFERENCES anchors(anchorNumber) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=INNODB; 

CREATE TABLE IF NOT EXISTS anchored_assets_tasks (
	anchored_assets_taskID INT AUTO_INCREMENT,
    taskID INT NOT NULL,
    anchored_assetID INT NOT NULL,
    PRIMARY KEY (anchored_assets_taskID),
    FOREIGN KEY (taskID) REFERENCES tasks(taskID) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (anchored_assetID) REFERENCES anchored_assets(anchored_assetID) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=INNODB; 

CREATE TABLE IF NOT EXISTS location_floor_maps (
	location_floor_mapID INT AUTO_INCREMENT,
    selected_locationID INT NOT NULL,
    floor_mapID INT,
    floor_number INT NOT NULL,
    PRIMARY KEY (location_floor_mapID), 
    FOREIGN KEY (selected_locationID) REFERENCES locations(locationID) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (floor_mapID) REFERENCES assets(assetID) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=INNODB;

CREATE TABLE IF NOT EXISTS location_connection_maps (
	location_connection_mapID INT AUTO_INCREMENT, 
    selected_locationID INT NOT NULL, 
    connection_mapID INT, 
    PRIMARY KEY (location_connection_mapID),
    FOREIGN KEY (selected_locationID) REFERENCES locations(locationID) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (connection_mapID) REFERENCES assets(assetID) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=INNODB; 

CREATE TABLE IF NOT EXISTS user_types (
	user_typeID INT AUTO_INCREMENT, 
    user_type_name VARCHAR(100),
    PRIMARY KEY (user_typeID)
) ENGINE=INNODB;

INSERT INTO user_types (user_type_name) VALUES ('admin'); 
INSERT INTO user_types (user_type_name) VALUES ('content_creator'); 
INSERT INTO user_types (user_type_name) VALUES ('public'); 

CREATE TABLE IF NOT EXISTS users (
	userID INT AUTO_INCREMENT,
    user_typeID INT NOT NULL,
    user_username VARCHAR(100) NOT NULL,
    user_password VARCHAR(100) NOT NULL,
    PRIMARY KEY (userID), 
    FOREIGN KEY (user_typeID) REFERENCES user_types(user_typeID) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=INNODB;

CREATE TABLE IF NOT EXISTS user_collected_assets (
	user_collected_assetID INT AUTO_INCREMENT,
    userID INT NOT NULL,
    collected_assetID INT NOT NULL,
    collected_at_anchorNumber INT NOT NULL,
    PRIMARY KEY (user_collected_assetID), 
    FOREIGN KEY (userID) REFERENCES users(userID) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (collected_assetID) REFERENCES assets(assetID) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (collected_at_anchorNumber) REFERENCES anchors(anchorNumber) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=INNODB;
