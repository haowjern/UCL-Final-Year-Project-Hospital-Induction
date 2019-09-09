const config = require('./config');
const environment = config.environment;
const Database = require('./database.js');
const database = new Database(config[environment].database); 

module.exports.getAllLocationsByMapId = function(req, res) {
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

module.exports.getAllLocations = function(req, res) {
    let sql = `SELECT l1.locationID, l1.current_mapID, l1.location_typeID, lt.location_type_name, l1.location_name, l1.rel_position_on_map_x, l1.rel_position_on_map_y FROM locations AS l1
                JOIN location_types AS lt
                ON l1.location_typeID = lt.location_typeID`;
        
    database.query(sql).then(rows => {
        res.send(rows);
    }, err => {
        console.log("Error in getting all locations, error: " + err); 
        throw new Error();
    }).catch( err => {
        console.log("Something went wrong ... ");
        res.status(400).send('Error in database operation - Get all locations');
    }); 
}

module.exports.deleteAllLocations = function(req, res) {
    let mapId = req.params.mapId; 
    let sql_deleteAllLocations = `DELETE FROM locations WHERE current_mapID = ?`;

    database.query(sql_deleteAllLocations, [mapId]).then(rows => {
        console.log('deleted all locations');
        res.status(200).send({message: "Deleted all locations"});
    }, err => {
        console.log("Failed in deleting all locations: " + err);
        throw new Error();
    }).catch( err => {
        res.status(400).send('Error in database operation - Add locations and floors.'); 
    });
}

module.exports.getLocation = function(req, res) {
    let locationId = req.params.locationId;
   
    let sql = `SELECT l1.locationID, l1.current_mapID, l1.location_typeID, lt.location_type_name, l1.location_name, l1.rel_position_on_map_x, l1.rel_position_on_map_y FROM locations AS l1
                JOIN location_types AS lt
                ON l1.location_typeID = lt.location_typeID
                WHERE l1.locationID = ?;`
        
    database.query(sql, [locationId]).then(rows => {
        res.send(rows);
    }, err => {
        console.log("Error in getting a location with ID, error: " + err); 
        throw new Error();
    // }).then( () => {
    //     database.close_connection(); 
    }).catch( err => {
        console.log("Something went wrong ... ");
        res.status(400).send('Error in database operation - Get location with ID');
    }); 
}

module.exports.addLocation = function (req, res) {
    console.log('Getting locations request body: ');
    console.log(req.body); 
    
    let mapID = req.params.mapId;   
    let location = req.body;

    let sql_getLocationTypeID = `SELECT location_typeID FROM location_types WHERE location_type_name=?`
    let sql_addLocation = `INSERT INTO locations (current_mapID, location_typeID, location_name, rel_position_on_map_x, rel_position_on_map_y)
                            VALUES (?, ?, ?, ?, ?);` 

    let name = location.name; 
    let type = location.type;
    let relativePositionOnMapX = location.relativePositionOnMapX;
    let relativePositionOnMapY = location.relativePositionOnMapY;

    let selected_locationTypeID;


    database.query(sql_getLocationTypeID, [type]).then(rows => {
        /* First retrieve location_typeID to be used to for adding to database later */
        /* Once retrieved, add map to database with the asset_typeID */
        selected_locationTypeID = rows[0].location_typeID; 
        console.log('Success - Retrieved location_typeID for adding location to database: ' + selected_locationTypeID);
        return database.query(sql_addLocation, [mapID, selected_locationTypeID, name, relativePositionOnMapX, relativePositionOnMapY]); 
    }, err => { 
        console.log('Error in database operation - Retrieving location_typeID for adding location to database.');
        throw new Error(); 
    }).then(rows => {
        console.log("Added location to database successfully.");
        res.status(200).send({
            lastInsertedId: rows.insertId,
            successMessage: "Added locations successfully"
        });
    }, err => {
        console.log('Error in adding location: ' + err);
        throw new Error();
    }).catch( err => {
        res.status(400).send('Error in database operation - Add locations and floors: '); 
    })
}