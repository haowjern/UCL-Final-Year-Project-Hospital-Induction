// require statements

const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const inMemoryStorage = multer.memoryStorage();
const uploadStrategy = multer({ storage: inMemoryStorage }).single('file_path');
const getStream = require('into-stream');
const cors = require('express'); 

const config = require('./config')['development'];

const blob_access = require('./blob_access'); 

const Database = require('./database.js');
const database = new Database(config.database); 


// app 

const app = express();

app.use(cors({
    origin: 'http://localhost:4200'
}));

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "http://localhost:4200"); // update to match the domain you will make the request from
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });

app.use(bodyParser.json()); // support JSON encoded bodies
app.use(bodyParser.urlencoded({ extended: true }));

app.listen(8000, () => {
    console.log('Server started on port 8000')
})

// GET ALL MAPS AS A TABLE
app.get('/api/map-management/maps', (req, res) => {
    // connect_to_database(connection);
    console.log('Getting maps...');

    let sql = `SELECT * FROM assets AS a1, asset_types AS a2 
                WHERE a1.asset_typeID = a2.asset_typeID 
                AND a2.asset_type_name = "map";`
        
    database.query(sql).then( rows => {
        res.send(rows);
    }, err => {
        console.log("Error in getting maps, error: " + err); 
        throw new Error();
    // }).then( () => {
    //     database.close_connection(); 
    }).catch( err => {
        console.log("Something went wrong ... ");
        res.status(400).send('Error in database operation - Get all maps');
    }); 
});

const getBlobName = originalName => {
    // Use a random number to generate a unique file name, 
    // removing "0." from the start of the string.
    const identifier = Math.random().toString().replace(/0\./, ''); 
    return `${identifier}-${originalName}`;
};

// GET A MAP WITH AN ID
app.get('/api/map-management/maps/:mapId', (req, res) => {
    let mapId = req.params.mapId;

    let sql = `SELECT * FROM assets AS a1, asset_types AS a2 
                WHERE a1.asset_typeID = a2.asset_typeID 
                AND a2.asset_type_name = "map"
                AND a1.assetID = ?;`
        
    database.query(sql, [mapId]).then(rows => {
        res.send(rows);
    }, err => {
        console.log("Error in getting a map with ID, error: " + err); 
        throw new Error();
    // }).then( () => {
    //     database.close_connection(); 
    }).catch( err => {
        console.log("Something went wrong ... ");
        res.status(400).send('Error in database operation - Get map with ID');
    }); 
});

// GET ALL LOCATIONS WITH OPTIONAL TYPE OF A MAP 
app.get('/api/map-management/maps/:mapId/locations', (req, res) => {
    let mapId = req.params.mapId;
    // test out if req.query is empty what happens, basically use a query string to indicate type 

    // if no query parameters 
    if (Object.keys(req.query).length === 0) {
        let sql = `SELECT * FROM locations AS l1
                    AND l1.location_currentmapID = ?;`

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
        let type = req.query.type

        let sql = `SELECT * FROM locations AS l1, location_types AS l2 
                    WHERE l1.location_typeID = l2.location_typeID 
                    AND l2.location_type_name = ?
                    AND l1.current_mapID = ?;`

        database.query(sql, [type, mapId]).then(rows => {
            res.send(rows);
        }, err => {
            console.log("Error in getting location types of a map, error: " + err); 
            throw new Error();
        // }).then( () => {
        //     database.close_connection(); 
        }).catch( err => {
            console.log("Something went wrong ... ");
            res.status(400).send('Error in database operation - Get location types of a map');
        }); 
    }
});

// GET A LOCATION WITH AN ID
app.get('/api/map-management/maps/:mapId/locations/:locationId', (req, res) => {
    let mapId = req.params.mapId;
    let locationId = req.params.locationId;

    let sql = `SELECT * FROM locations AS l1
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
});

// GET ALL FLOORS OF A BUILDING 
app.get('/api/map-management/maps/:mapId/locations/:buildingId/floors', (req, res) => {
    let mapId = req.params.mapId;
    let buildingId = req.params.buildingId;

    let sql = `SELECT * FROM location_floor_maps AS l1
                AND l1.selected_locationID = ?;`
        
    database.query(sql, [buildingId]).then(rows => {
        res.send(rows);
    }, err => {
        console.log("Error in getting floors of a building, error: " + err); 
        throw new Error();
    }).catch( err => {
        console.log("Something went wrong ... ");
        res.status(400).send('Error in database operation - Get all maps');
    }); 
});


// ADD A MAP 
app.post('/api/map-management/maps', uploadStrategy, async (req, res) => {

    /* Obtain form values */ 
    let map_name = req.body.file_name; 
    let stream = getStream(req.file.buffer);
    let blob_name = getBlobName(req.file.originalname);

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

    let sql_addMap = `INSERT INTO assets (asset_typeID, asset_name, blob_name) VALUES (?, ?, ?);`

    // database.open_connection(); 

    // await connection.query() try?

    // 

    database.query(sql_getID).then( rows => {
        /* First retrieve asset_typeID to be used to for adding to database later */
        /* Once retrieved, add map to database with the asset_typeID */
        selected_asset_typeID = rows[0].asset_typeID;
        console.log('Success - Retrieved asset_typeID for adding map to database: ' + selected_asset_typeID);
        return database.query(sql_addMap, [selected_asset_typeID, map_name, blob_name]); 
    }, err => { 
        console.log('Error in database operation - Retrieving asset_typeID for adding map to database.');
        throw new Error(); 
    }).then( rows => {
        res.status(200).send(req.body);
        console.log("Added map to database successfully.");
    }, err => {
        /* If error occured in adding to database, delete blob that has been uploaded to keep things consistent */
        blob_access.deleteBlob(container_name, blob_name);
        throw new Error();
    // }).then( () => {
    //     database.close_connection(); 
    }).catch( err => {
        res.status(400).send('Error in database operation - Add map.');
        // database.close_connection(); 
    })
});

// tests 

// 1. connection is closed when error occurs 