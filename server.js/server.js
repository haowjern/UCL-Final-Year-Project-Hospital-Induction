// require statements

const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const inMemoryStorage = multer.memoryStorage();
const uploadStrategy = multer({ storage: inMemoryStorage }).single('file_path');
const getStream = require('into-stream');

const config = require('./config')['development'];

const blob_access = require('./blob_access'); 

const Database = require('./database.js');
const database = new Database(config.database); 


// app 

const app = express();

app.use(bodyParser.json()); // support JSON encoded bodies
app.use(bodyParser.urlencoded({ extended: true }));

app.listen(8000, () => {
    console.log('Server started on port 8000')
})

// GET ALL MAPS AS A TABLE
app.get('/api/map-management/maps', (req, res) => {
    // connect_to_database(connection);

    let sql = `SELECT * FROM assets AS a1, asset_types AS a2 
                WHERE a1.asset_typeID = a2.asset_typeID 
                AND a2.asset_type_name = "map";`

    database.query(sql).then( rows => {
        res.send(rows);
    }, err => {
        console.log(err);
        res.status(400).send('Error in database operation - Get all maps');
        database.close_connection(); 
    }).then( () => {
        database.close_connection(); 
    }); 
});

const getBlobName = originalName => {
    // Use a random number to generate a unique file name, 
    // removing "0." from the start of the string.
    const identifier = Math.random().toString().replace(/0\./, ''); 
    return `${identifier}-${originalName}`;
  };


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

    // await connection.query() try?

    // 

    database.query(sql_getID).then( rows => {
        /* First retrieve asset_typeID to be used to for adding to database later */
        /* Once retrieved, add map to database with the asset_typeID */
        selected_asset_typeID = rows[0].asset_typeID;
        console.log('Success - Retrieved asset_typeID for adding map to database: ' + selected_asset_typeID);
        return database.query(sql_addMap, [selected_asset_typeID, map_name, blob_name]); 
    }, err => {
        console.log(error); 
        res.status(400).send('Error in database operation - Add map.');
        console.log('Error in database operation - Retrieving asset_typeID for adding map to database.');
        database.close_connection();
    }).then( rows => {
        res.status(200).send(req.body);
        console.log("Added map to database successfully.");
    }, err => {
        /* If error occured in adding to database, delete blob that has been uploaded to keep things consistent */
        console.log(error);
        res.status(400).send('Error in database operation - Add map.');
        database.close_connection();
        blob_access.deleteBlob(container_name, blob_name);
    }).then( () => {
        database.close_connection(); 
    })
});

// tests 

// 1. connection is closed when error occurs 