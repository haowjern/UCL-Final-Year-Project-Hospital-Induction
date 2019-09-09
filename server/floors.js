const config = require('./config');
const environment = config.environment;
const Database = require('./database.js');
const database = new Database(config[environment].database); 

module.exports.getAllFloors = function (req, res) {
    let mapId = req.params.mapId;
    let buildingId = req.params.buildingId;

    if (Object.keys(req.query).length === 0) {
        let sql = `SELECT * FROM location_floor_maps AS l1
                    WHERE l1.selected_locationID = ?;`

        database.query(sql, [buildingId]).then(rows => {
            res.send(rows);
        }, err => {
            console.log("Error in getting floors of a building, error: " + err); 
            throw new Error();
        }).catch( err => {
            console.log("Something went wrong ... ");
            res.status(400).send('Error in database operation - Get all maps');
        }); 

    } else {
        let sql = `SELECT * FROM location_floor_maps AS l1
                    WHERE l1.selected_locationID = ?
                    AND l1.floor_mapID is null;`

        database.query(sql, [buildingId]).then(rows => {
            res.send(rows);
        }, err => {
            console.log("Error in getting floors of a building, error: " + err); 
            throw new Error();
        }).catch( err => {
            console.log("Something went wrong ... ");
            res.status(400).send('Error in database operation - Get all floors of a building');
        }); 
    }
}

module.exports.getFloor = function (req, res) {
    if (Object.keys(req.query).length === 0) {
        res.status(400).send('Error: need to have query keys!');
    } else {
        let mapId = req.query.mapId;

        let sql = `SELECT * FROM location_floor_maps AS l1
                    WHERE l1.floor_mapID = ?`

        database.query(sql, [mapId]).then(rows => {
            res.send(rows);
        }, err => {
            console.log("Error in getting floors with a map ID, error: " + err); 
            throw new Error();
        }).catch( err => {
            console.log("Something went wrong ... ");
            res.status(400).send('Error in database operation - Get floors');
        }); 
    }
}

module.exports.addFloor = function (req, res) {
    let mapID = req.params.mapId;
    let buildingId = req.params.buildingId;
    let floorNumber = req.query.number; 
    let floorMapId = req.body.mapId; 

    // check buildingId is of type building 
    // then only add floors for this building

    let sql_getLocationType = `SELECT lt.location_type_name FROM location_types AS lt
                                WHERE lt.location_typeID = (
                                    SELECT l1.location_typeID FROM locations AS l1 WHERE l1.locationID = ?
                                );`
    let sql_addLocationFloor; 
    let params;
    if (floorMapId) {
        sql_addLocationFloor = `INSERT INTO location_floor_maps (selected_locationID, floor_number) 
                                VALUES (?, ?);`
        params = [buildingId, floorNumber];

    } else {
        sql_addLocationFloor = `INSERT INTO location_floor_maps (selected_locationID, floor_mapID, floor_number) 
                                VALUES (?, ?, ?);`
        params = [buildingId, floorMapId, floorNumber];
    }


    database.query(sql_getLocationType, [buildingId]).then(rows => {
        console.log('Retrieved building from buildingId'); 
        
        if(rows[0].location_type_name !== 'building') {
            console.log('LocationID is not of type building');
            throw new Error(); 
        } else {
            return database.query(sql_addLocationFloor, params);
        }
    }, err => {
        console.log('Error in database operation - getting building: ' + err);
        throw new Error(); 
    }).then(rows => {
        res.status(200).send({text: "Added floors successfully"});
    }, err => {
        console.log('Error in adding floors: ' + err);
        throw new Error();
    }).catch( err => {
        res.status(400).send('Error in database operation - Add locations and floors.'); 
    });
}

module.exports.updateFloor = function (req, res) {
    let mapID = req.params.mapId; 
    let buildingID = req.params.buildingId; 
    let location_floor_mapId = req.params.floorId; 
    let attachedMapID = req.query.mapId; 

    let sql_updateFloorWithMap = `UPDATE location_floor_maps 
                                    SET floor_mapID = ? 
                                    WHERE location_floor_mapID = ?;`

    database.query(sql_updateFloorWithMap, [location_floor_mapId, attachedMapID]).then(rows => {
        console.log('Updated floor with map'); 
        res.status(200).send({text: "Updated floor succesfully"});
    }, err => {
        console.log('Error in database operation - updating floor: ' + err);
        throw new Error(); 
    }).catch(err => {
        res.status(400).send('Error in database operation - Update floor.'); 
    });
}