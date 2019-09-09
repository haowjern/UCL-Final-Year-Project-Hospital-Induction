const config = require('./config');
const environment = config.environment;
const Database = require('./database.js');
const database = new Database(config[environment].database); 

module.exports.getAllAnchorKeysAsync = function(req, res) {
    console.log("Getting all anchor key async");

    if (req.query.anchorID) {
        let sql = `SELECT * FROM anchors
                    WHERE anchorID = ?;`

        database.query(sql, [req.query.anchorID]).then(rows => {
            res.send(rows);
        }, err => {
            console.log("Error in getting anchor with anchorID, error: " + err); 
            throw new Error();
        }).catch( err => {
            console.log("Something went wrong ... " + err);
            res.status(400).send('Error in database operation - Get anchor with anchorID');
        }); 
    }
    
    else {
        let sql = `SELECT * FROM anchors;`

        database.query(sql).then(rows => {
            res.send(rows);
        }, err => {
            console.log("Error in getting all anchors, error: " + err); 
            throw new Error();
        }).catch( err => {
            console.log("Something went wrong ... " + err);
            res.status(400).send('Error in database operation - Get all anchors');
        }); 
    }

    
}

module.exports.getAnchorKeyAsync = function(req, res) {
    console.log('Getting anchor key async...');

    let sql = `SELECT *
                FROM anchors
                WHERE anchorNumber = ?;`


    let anchorNumber = req.params.anchorNumber; 
        
    database.query(sql, [anchorNumber]).then(rows => {
        res.send(rows);
    }, err => {
        console.log("Error in getting anchor from anchor id, error: " + err); 
        throw new Error();
    }).catch( err => {
        console.log("Something went wrong ... " + err);
        res.status(400).send('Error in database operation - Get anchor from anchor id');
    }); 
};

module.exports.getLastAnchorKeyAsync = function(req, res) {
    console.log('Getting last anchor key async...');

    let sql = `SELECT * FROM anchors 
                ORDER BY anchorNumber DESC
                LIMIT 1;`

    database.query(sql).then(rows => {
        res.send(rows);
    }, err => {
        console.log("Error in getting last anchor, error: " + err); 
        throw new Error();
    }).catch( err => {
        console.log("Something went wrong ... " + err);
        res.status(400).send('Error in database operation - Get last anchor');
    }); 
};

module.exports.setAnchorKeyAsync = function(req, res) {
    console.log('Setting last anchor key async...');
 
    let sql = `INSERT INTO anchors (anchorID, locationID, anchor_name) 
                VALUES (?, ?, ?);`

    let anchorId = req.body.anchorID;
    let locationId = req.body.locationID;
    let anchorName = req.body.anchor_name;

    if (!locationId) {
        locationId = null; 
    }

    if (!anchorName) {
        anchorName = null;
    }
    
    database.query(sql, [anchorId, locationId, anchorName]).then(rows => {
        res.send(rows);
    }, err => {
        console.log("Error in setting anchor, error: " + err); 
        throw new Error();
    }).catch( err => {
        console.log("Something went wrong ... " + err);
        res.status(400).send('Error in database operation - Post anchor');
    }); 

};

module.exports.deleteAnchorKeyAsync = function(req, res) {
    console.log('Deleting anchor key async...');

    if (req.query.anchorNumber) {
        let sql = `DELETE FROM anchors
                    WHERE anchorNumber = ?;`
    
        database.query(sql, [req.query.anchorNumber]).then(rows => {
            res.send(rows);
        }, err => {
            console.log("Error in deleting anchor, error: " + err); 
            throw new Error();
        }).catch( err => {
            console.log("Something went wrong ... " + err);
            res.status(400).send('Error in database operation - Delete anchor');
        }); 
    } else {
        res.status(400).send('Did not pass in correct parameters- Delete anchor');
    }
};