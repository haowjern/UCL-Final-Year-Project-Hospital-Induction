const config = require('./config');
const environment = config.environment;
const Database = require('./database.js');
const database = new Database(config[environment].database); 

module.exports.getAnchoredAssetsAsync = function(req, res) {
    console.log("Getting anchored asset async");

    if (req.query.anchorNumber) {
        let sql = `SELECT * FROM anchored_assets
                    WHERE anchorNumber = ?;`
        database.query(sql, [req.query.anchorNumber]).then(rows => {
            res.send(rows);
        }, err => {
            console.log("Error in getting anchored asset with anchornumber error: " + err); 
            throw new Error();
        }).catch( err => {
            console.log("Something went wrong ... " + err);
            res.status(400).send('Error in database operation - Get anchored assets');
        }); 
    } else {
        res.status(400).send('Did not pass in correct parameters- get anchoredassets');
    }
}


module.exports.setAnchoredAssetAsync= function(req, res) {
    console.log("Setting anchored asset async");

    let anchorNumber = req.body.anchorNumber;
    let assetID = req.body.assetID;
                 
    let sql = `INSERT INTO anchored_assets (anchorNumber, assetID) 
                VALUES (?, ?);`
    database.query(sql, [anchorNumber, assetID]).then(rows => {
        res.send(rows);
    }, err => {
        console.log("Error in setting anchored asset, error: " + err); 
        throw new Error();
    }).catch( err => {
        console.log("Something went wrong ... " + err);
        res.status(400).send('Error in database operation - Setting anchored asset');
    }); 
}

module.exports.deleteAnchoredAssetAsync= function(req, res) {
    console.log("Getting anchored asset async");

    if (req.query.anchored_assetID) {
        let sql = `DELETE FROM anchored_assets
                    WHERE anchored_assetID = ?;`
        database.query(sql, [req.query.anchored_assetID]).then(rows => {
            res.send(rows);
        }, err => {
            console.log("Error in deleting anchoredasset, error: " + err); 
            throw new Error();
        }).catch( err => {
            console.log("Something went wrong ... " + err);
            res.status(400).send('Error in database operation -  delete anchoredasset');
        }); 
    } else {
        res.status(400).send('Did not pass in correct parameters- Delete anchoredassets');
    }
}