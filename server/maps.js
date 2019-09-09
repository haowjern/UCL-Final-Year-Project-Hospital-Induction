const getStream = require('into-stream');
const blob_access = require('./blob_access'); 

const config = require('./config');
const environment = config.environment;
const Database = require('./database.js');
const database = new Database(config[environment].database); 
const STORAGE_ACCOUNT_NAME = config[environment].storage.accountName;

const getBlobName = originalName => {
    // Use a random number to generate a unique file name, 
    // removing "0." from the start of the string.
    const identifier = Math.random().toString().replace(/0\./, ''); 
    return `${identifier}-${originalName}`;
};

module.exports.getAllMaps = function(req, res) {
    // connect_to_database(connection);
    console.log('Getting maps...');

    const containerName = "assets";

    if (Object.keys(req.query).length === 0) {
        let sql = `SELECT assetID, asset_type_name, asset_name, blob_name, created_at, is_default_map
                    FROM assets AS a1
                    LEFT JOIN asset_types AS a2 
                    ON a1.asset_typeID = a2.asset_typeID
                    WHERE a1.asset_typeID = a2.asset_typeID 
                    AND a2.asset_type_name = "map";`
            
        database.query(sql).then(rows => {
            for (const row of rows) {
                const blobName = row.blob_name; 
                const getBlobUrl = 'https://' + STORAGE_ACCOUNT_NAME + '.blob.core.windows.net' + '/' + containerName + '/' + blobName;
                row.imgUrl = getBlobUrl;
            }
            console.log('sending rows');
            res.send(rows);
        }, err => {
            console.log("Error in getting maps, error: " + err); 
            throw new Error();
        // }).then( () => {
        //     database.close_connection(); 
        }).catch( err => {
            console.log("Something went wrong ... " + err);
            res.status(400).send('Error in database operation - Get all maps');
        }); 

    } else {
        let name = req.query.name;
        if (name) {
            let sql = `SELECT * FROM assets AS a1, asset_types AS a2 
                    WHERE a1.asset_typeID = a2.asset_typeID 
                    AND a2.asset_type_name = "map"
                    AND a1.asset_name = ?;`

            database.query(sql, [name]).then(rows => {
                console.log('Retrieved map name successfully');
                res.send(rows);
            }, err => {
                console.log("Error in getting maps with query, error: " + err); 
                throw new Error();
            }).catch( err => {
                console.log("Something went wrong ... ");
                res.status(400).send('Error in database operation - Get all maps with query');
            }); 
        } else {
            let is_default_map = req.query.default; 
            let sql = `SELECT assetID, asset_type_name, asset_name, blob_name, created_at, is_default_map FROM assets AS a1
                        LEFT JOIN asset_types AS a2 
                        ON a1.asset_typeID = a2.asset_typeID
                        WHERE a1.asset_typeID = a2.asset_typeID 
                        AND a2.asset_type_name = "map"
                        AND a1.is_default_map = ?;`

            console.log('IS DEFAULT MAP: ' + is_default_map);

            if(is_default_map) {
                is_default_map = 1; 
            } else {
                is_default_map = 0; 
            }
            database.query(sql, [is_default_map]).then(rows => {
                for (const row of rows) {
                    const blobName = row.blob_name; 
                    const getBlobUrl = 'https://' + STORAGE_ACCOUNT_NAME + '.blob.core.windows.net' + '/' + containerName + '/' + blobName;
                    row.imgUrl = getBlobUrl;
                }
                console.log('Retrieved default successfully');
                res.send(rows);
            }, err => {
                console.log("Error in getting default map with query, error: " + err); 
                throw new Error();
            }).catch( err => {
                console.log("Something went wrong ... ");
                res.status(400).send('Error in database operation - Get maps with query');
            }); 
        }
    }
}

module.exports.getMap = function(req,res) {
    let mapId = req.params.mapId;
    let containerName = "assets";

    let sql = `SELECT * FROM assets AS a1, asset_types AS a2 
                WHERE a1.asset_typeID = a2.asset_typeID 
                AND a2.asset_type_name = "map"
                AND a1.assetID = ?;`
        
    database.query(sql, [mapId]).then(rows => {
        if (rows[0]) {
            const blobName = rows[0].blob_name; 
            const getBlobUrl = 'https://' + STORAGE_ACCOUNT_NAME + '.blob.core.windows.net' + '/' + containerName + '/' + blobName;
            rows[0].imgUrl = getBlobUrl; 
        }
        res.send(rows);
    }, err => {
        console.log("Error in getting a map with ID, error: " + err); 
        throw new Error();
    // }).then( () => {
    //     database.close_connection(); 
    }).catch( err => {
        console.log("Something went wrong ... " + err);
        res.status(400).send('Error in database operation - Get map with ID');
    }); 
}

module.exports.getAllLocations = function(req, res) {
    let mapId = req.params.mapId;
    // test out if req.query is empty what happens, basically use a query string to indicate type 

    // if no query parameters 
    if (Object.keys(req.query).length === 0) {
        let sql = `SELECT l1.locationID, l1.current_mapID, l1.location_typeID, l1.location_name, l1.rel_position_on_map_x, l1.rel_position_on_map_y, lt.location_type_name, lfm.location_floor_mapID, lfm.floor_mapID, lfm.floor_number
                    FROM locations AS l1 
                    JOIN location_types AS lt
                    ON l1.location_typeID = lt.location_typeID
                    AND l1.current_mapID = ?
                    LEFT JOIN location_floor_maps as lfm
                    ON l1.locationID = lfm.selected_locationID
                    ORDER BY l1.locationID, lfm.floor_number;`

        database.query(sql, [mapId]).then(rows => {
            res.send(rows);
        }, err => {
            console.log("Error in getting all locations of a map, error: " + err); 
            throw new Error();
        }).catch( err => {
            console.log("Something went wrong ... ");
            res.status(400).send('Error in database operation - Get all locations of a map');
        }); 

    } else {
        let name = req.query.name; 
        let type = req.query.type;

        if (name) {
            console.log('getting location with name...');
            let sql = `SELECT * FROM locations AS l1, location_types AS l2 
                        WHERE l1.location_typeID = l2.location_typeID 
                        AND l2.location_type_name = ?
                        AND l1.current_mapID = ?
                        AND l1.location_name = ?;`
            database.query(sql, [type, mapId, name]).then(rows => {
                res.send(rows); 
            }, err => {
                console.log('Error in getting location name of a map, error: ' + err); 
                throw new Error();
            }).catch(err => {
                console.log("Something went wrong ... ");
                res.status(400).send('Error in database operation - Get location of a map with name');
            })

        } else {
            let sql = `SELECT * FROM locations AS l1, location_types AS l2 
                        WHERE l1.location_typeID = l2.location_typeID 
                        AND l2.location_type_name = ?
                        AND l1.current_mapID = ?;`

            database.query(sql, [type, mapId]).then(rows => {
                res.send(rows);
            }, err => {
                console.log("Error in getting location types of a map, error: " + err); 
                throw new Error();
            }).catch( err => {
                console.log("Something went wrong ... ");
                res.status(400).send('Error in database operation - Get location types of a map');
            }); 
        }
    }
}

module.exports.addMap = async function (req, res) {
    /* Obtain form values */ 

    let map_name = req.body.file_name; 
    let is_default_map = req.body.is_default_map; 
    console.log('IS DEFAULT MAP = ' + is_default_map);
    if(is_default_map == "true") {
        is_default_map = 1; 
    } else {
        is_default_map = 0; 
    }

    let stream = getStream(req.file.buffer);
    let blob_name = getBlobName(map_name);
    let location_floor_mapId = req.body.location_floor_mapID; // to connect the map id to the floor

    /* Upload map to blob storage */
    let container_name = "assets"; 

    try {
        /* upload a file to blob storage */ 
        await blob_access.uploadStream(container_name, stream, blob_name);
        console.log("Added map to blob storage successfully.")

    } catch {
        console.log('Error - Uploading asset to Blob Storage: ');
        console.log('---request body: ' + JSON.stringify(req.body));
        console.log('---container_name: ' + container_name);
        console.log('---map_name: ' + map_name);
        res.status(400).send('Error in uploading asset to Blob Storage: ');
    } 

    /* Upload map to database */ 

    let sql_getID = `SELECT asset_typeID FROM asset_types WHERE asset_type_name = "map";`
    let selected_asset_typeID; 

    let sql_addMap = `INSERT INTO assets (asset_typeID, asset_name, blob_name, created_at, is_default_map) 
                        VALUES (?, ?, ?, CURRENT_TIMESTAMP, ?);`
    let sql_updateFloorWithMap = `UPDATE location_floor_maps 
                                    SET floor_mapID = ? 
                                    WHERE location_floor_mapID = ?;`

    database.query(sql_getID).then(rows => {
        /* First retrieve asset_typeID to be used to for adding to database later */
        /* Once retrieved, add map to database with the asset_typeID */
        selected_asset_typeID = rows[0].asset_typeID;
        console.log('Success - Retrieved asset_typeID for adding map to database: ' + selected_asset_typeID);
        return database.query(sql_addMap, [selected_asset_typeID, map_name, blob_name, is_default_map]); 
    }, err => { 
        console.log('Error in database operation - Retrieving asset_typeID for adding map to database.');
        throw new Error(); 
    }).then(rows => {
        console.log("Added map to database successfully.");
        let attached_mapId = rows.insertId;

        if (location_floor_mapId) {
            database.query(sql_updateFloorWithMap, [attached_mapId, location_floor_mapId]).then(rows => {
                console.log('Success - updated floor with map');
                res.status(200).send({text: 'Added map to database and floor successfully'});
            }, err => {
                console.log('Failed - add map to floor: ' + err);
                throw new Error();
            });
        } else {
            res.status(200).send({text: 'Added map to database successfully'});
        }
    }, err => {
        /* If error occured in adding to database, delete blob that has been uploaded to keep things consistent */
        console.log('Error in adding map to database');
        console.log('map_name: ' + map_name);
        console.log('blob_name: ' + blob_name);
        console.log('selected_asset_typeID: ' + selected_asset_typeID);
        console.log('if no errors then it is a sql problem');
        blob_access.deleteBlob(container_name, blob_name);
        throw new Error();
    }).catch( err => {
        res.status(400).send('Error in database operation - Add map.');
    })
}

module.exports.updateMap = async function(req, res) {
    let mapId = req.params.id; 
    let container_name = "assets"; 
   
    console.log('updating a map req body: ' + JSON.stringify(req.body));
    console.log('updating a map req file body: ' + JSON.stringify(req.file));

    let name = req.body.name;
    let map_name = req.body.file_name; 
    let blob_name = req.body.blob_name;
    let location_floor_mapId = req.body.location_floor_mapID
    let prev_location_floor_mapId = req.body.prev_location_floor_mapID

    // if changed selected floor 
    if (prev_location_floor_mapId !== location_floor_mapId) {
        // set previous floor mapID to be null 
        let sql_prev_floor = `UPDATE location_floor_maps SET floor_mapID = null
                                WHERE location_floor_mapID = ?;`

        // set new floor map ID to be this map's ID
        let sql_new_floor = `UPDATE location_floor_maps SET floor_mapID = ?
                                WHERE location_floor_mapID = ?;`

        database.query(sql_prev_floor, [prev_location_floor_mapId]).then(res => {
            return database.query(sql_new_floor, [mapId, location_floor_mapId])
        }, err => {
            console.log('Error - cannot set previous floor map id to be null: ' + err);
            throw new Error();
        }).then(res => {
            console.log('Success - Updated new floor map ID');
        }, err => {
            console.log('Error - cannot update new floor map Id'); 
            throw new Error(); 
        }).catch( err => {
            res.status(400).send('Error in database operation - update map.'); 
            return;
        });
    }; 

    // if uploaded file 
    if (req.file) {
        let stream = getStream(req.file.buffer);
        let new_blob_name = getBlobName(map_name);
        blob_access.deleteBlob(container_name, blob_name); // delete old blob

        try {
            /* upload a file to blob storage */ 
            await blob_access.uploadStream(container_name, stream, blob_name);
            console.log("Added map to blob storage successfully.")
    
        } catch {
            console.log('Error - Uploading asset to Blob Storage: ');
            console.log('---request body: ' + JSON.stringify(req.body));
            console.log('---container_name: ' + container_name);
            console.log('---map_name: ' + map_name);
            res.status(400).send('Error in uploading asset to Blob Storage: ');
            return;
        } 

        /* Upload map to database */ 
        
        let sql_updateMap = `UPDATE assets SET asset_name = ?, SET blob_name = ? 
                                WHERE assetID = ?;`
                        

        database.query(sql_updateMap, [name, new_blob_name, mapId]).then(rows => {
            // first update map details 
            console.log('Success - Updated map for database: ');
            res.status(200).send({text: 'Added map to database successfully'});
        }, err => { 
            console.log('Error in updating map: ' + err);
        }).catch( err => {
            res.status(400).send('Error in database operation - Add map.');
            return;
        })

    } else {
        let sql = 'UPDATE assets SET asset_name = ? WHERE assetID = ?;'
        database.query(sql, [name, mapId]).then(rows => {
            res.json({ message: 'Map updated!' });
        }).catch( err => {
            res.status(400).send('Error in database operation - update map.'); 
            return;
        });
    }
}

module.exports.deleteMap = async function(req, res) {
    let id = req.params.id; 

    let sql_deleteMap = `DELETE FROM assets WHERE assetID = ?`;
    let sql_getMap = `SELECT blob_name FROM assets WHERE assetID = ?`;

    let container_name = "assets";

    let blob_name; 

    database.query(sql_getMap, [id]).then(rows => {
        console.log('Got map');
        blob_name = rows[0].blob_name;
        return database.query(sql_deleteMap, [id]);
    }, err => {
        console.log("Failed in retrieving map" + err);
    }).then(rows => {
        console.log('Deleted map'); 
        return blob_access.deleteBlob(container_name, blob_name);
    }, err => {
        console.log('Cant delete map from database');
        throw new Error(); 
    }).then(rows => {
        res.status(200).send({
            event: 'successful deletion of map'
        })
        console.log("Deleted map from blob storage successfully.")
    }, err => {
        console.log('Error - Deleting asset from Blob Storage: ');
        throw new Error(); 
    }).catch( err => {
        res.status(400).send('Error in database operation - Add locations and floors.'); 
    });
}