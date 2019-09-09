const config = require('./config');
const environment = config.environment;
const Database = require('./database.js');
const database = new Database(config[environment].database); 
const STORAGE_ACCOUNT_NAME = config[environment].storage.accountName;
const blob_access = require('./blob_access'); 

var Readable = require('stream').Readable

const getBlobName = originalName => {
    // Use a random number to generate a unique file name, 
    // removing "0." from the start of the string.
    const identifier = Math.random().toString().replace(/0\./, ''); 
    return `${identifier}-${originalName}`;
};

const getStream = require('into-stream');


module.exports.getAllAssetsOfType = function(req, res) {
    let asset_type_name = req.query.asset_type_name; 

    let containerName = "assets";

    let sql = `SELECT assetID, asset_type_name, asset_name, blob_name, created_at, is_default_map
                FROM assets AS a1
                LEFT JOIN asset_types AS a2 
                ON a1.asset_typeID = a2.asset_typeID
                WHERE a1.asset_typeID = a2.asset_typeID 
                AND a2.asset_type_name = ?;`
            
    database.query(sql, [asset_type_name]).then(rows => {
        for (const row of rows) {
            const blobName = row.blob_name; 
            const getBlobUrl = 'https://' + STORAGE_ACCOUNT_NAME + '.blob.core.windows.net' + '/' + containerName + '/' + blobName;
            row.imgUrl = getBlobUrl;
        }
        console.log('sending rows');
        res.send(rows);
    }, err => {
        console.log("Error in getting non map assets, error: " + err); 
        throw new Error();
    }).catch( err => {
        console.log("Something went wrong ... " + err);
        res.status(400).send('Error in database operation - Get all non map assets');
    }); 
};

module.exports.getAssetWithId = function(req, res) {
    let assetId = req.params.assetId;
    let containerName = "assets";

    let sql = `SELECT * FROM assets AS a1, asset_types AS a2 
                WHERE a1.asset_typeID = a2.asset_typeID 
                AND a2.asset_type_name != "map"
                AND a1.assetID = ?;`
            
    database.query(sql, [assetId]).then(rows => {
        if (rows[0]) {
            const blobName = rows[0].blob_name; 
            const getBlobUrl = 'https://' + STORAGE_ACCOUNT_NAME + '.blob.core.windows.net' + '/' + containerName + '/' + blobName;
            rows[0].imgUrl = getBlobUrl; 
        }
        res.send(rows);
    }, err => {
        console.log("Error in getting a non map asset with ID, error: " + err); 
        throw new Error();
    }).catch( err => {
        console.log("Something went wrong ... " + err);
        res.status(400).send('Error in database operation - Get non map assetwith ID');
    }); 
}

module.exports.setNonMapAsset = async function(req, res) {
    /* Obtain form values */ 
    console.log("Setting non map asset...");

    let asset_name = req.body.file_name; 
    let asset_type_name = req.body.asset_type_name;

    console.log("asset_name: ", asset_name);
    console.log("asset_type_name: ", asset_type_name);
    console.log("BODY IS " + JSON.stringify(req.body));

    let stream;
    if (req.file) {
        console.log("Request file");
        stream = getStream(req.file.buffer);
    } else {
        console.log("No file available");
    }

    let blob_name = getBlobName(asset_name);


    /* Upload map to blob storage */
    let container_name = "assets"; 

    try {
        /* upload a file to blob storage */ 
        await blob_access.uploadStream(container_name, stream, blob_name);
        console.log("Added asset to blob storage successfully.")

    } catch {
        console.log('Error - Uploading asset to Blob Storage: ');
        console.log('---request body: ' + JSON.stringify(req.body));
        console.log('---container_name: ' + container_name);
        console.log('---asset_name: ' + asset_name);
        res.status(400).send('Error in uploading asset to Blob Storage: ');
        throw new Error();
    } 

    /* Upload map to database */ 

    let selected_asset_typeID; 

    let sql_addAsset = `INSERT INTO assets (asset_typeID, asset_name, blob_name, created_at, is_default_map) 
                        VALUES (?, ?, ?, CURRENT_TIMESTAMP, null);`
    let sql_getTypeID = `SELECT asset_typeID FROM asset_types WHERE asset_type_name = ?;`

    database.query(sql_getTypeID, [asset_type_name]).then(rows => {
        /* First retrieve asset_typeID to be used to for adding to database later */
        /* Once retrieved, add map to database with the asset_typeID */
        selected_asset_typeID = rows[0].asset_typeID;
        console.log('Success - Retrieved asset_typeID for adding asset to database: ' + selected_asset_typeID);
        return database.query(sql_addAsset, [selected_asset_typeID, asset_name, blob_name]); 
    }, err => { 
        console.log('Error in database operation - Retrieving asset_typeID for adding asset to database.');
        throw new Error(); 
    }).then(rows => {
        console.log("Added asset to database successfully.");
        res.status(200).send({
            text: 'Added asset to database successfully',
        });
    }, err => {
        /* If error occured in adding to database, delete blob that has been uploaded to keep things consistent */
        console.log('Error in adding map to database');
        console.log('map_name: ' + asset_name);
        console.log('blob_name: ' + blob_name);
        console.log('selected_asset_typeID: ' + selected_asset_typeID);
        console.log('if no errors then it is a sql problem');
        blob_access.deleteBlob(container_name, blob_name);
        throw new Error();
    }).catch( err => {
        res.status(400).send('Error in database operation - Add map.');
    })
}

module.exports.deleteAsset = function (req, res) {
    let assetId = req.params.assetId; 

    let sql_getAsset = `SELECT blob_name FROM assets WHERE assetID = ?`;
    let sql_deleteAsset = `DELETE FROM assets WHERE assetID = ?`;

    let container_name = "assets";
    let blob_name; 

    database.query(sql_getAsset, [assetId]).then(rows => {
        console.log('Got asset');
        blob_name = rows[0].blob_name;
        return database.query(sql_deleteAsset, [id]);
    }, err => {
        console.log("Failed in retrieving asset " + err);
    }).then(rows => {
        console.log('Deleted asset'); 
        return blob_access.deleteBlob(container_name, blob_name);
    }, err => {
        console.log('Cant delete asset from database');
        throw new Error(); 
    }).then(rows => {
        res.status(200).send({
            event: 'successful deletion of asset'
        })
        console.log("Deleted asset from blob storage successfully.")
    }, err => {
        console.log('Error - Deleting asset from Blob Storage: ');
        throw new Error(); 
    }).catch( err => {
        res.status(400).send('Error in database operation - Delete asset.'); 
    });
}

module.exports.updateAsset = function(req, res) {
    let assetId = req.params.assetId; 
}