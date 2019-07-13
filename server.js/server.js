const express = require('express');
const bodyParser = require('body-parser');

const mysql = require('mysql');

const config = require('./config')['development'];

// Create connection 
const connection = mysql.createConnection({
    host: config.database.host,
    user: config.database.user,
    password: config.database.password,
    database: config.database.database,
    port: config.database.port,
    ssl: config.database.ssl
})

function connect_to_database(connection) {
    // Connect to database
    connection.connect((err) => {
        if(err){
            console.error('error connecting: ' + err.stack);
            return;
        }
        console.log('connected as id ' + connection.threadID);
    })  
}

const app = express()

app.listen(8000, () => {
    console.log('Server started on port 8000')
})

// GET ALL MAPS
app.route('/api/maps').get((request, response) => {
    connect_to_database(connection);

    let sql = `SELECT * FROM assets AS a1, asset_types AS a2 
                WHERE a1.asset_typeID = a2.asset_typeID 
                AND a2.asset_type_name = "map";`

    connection.query(sql, (error, results, fields) => {
        if (error) {
            console.log(error);
            response.status(400).send('Error in database operation');
        } else {
            response.send(results); 
        }
    }); 
    
    connection.end();
});


// GET SELECTED MAP 
app.route('/api/maps/:name').get((request, response) => {
    const requestedMapName = request.params['name']
    connect_to_database(connection);

    let sql = `SELECT * FROM assets AS a1, asset_types AS a2 
                WHERE a1.asset_typeID = a2.asset_typeID 
                AND a1.asset_name = ? FOR JSON`;

    connection.query(sql, [requestedMapName], (error, results, fields) => {
        if (error) {
            response.status(400).send('Error in database operation');
        } else {
            response.send(results); 
        }
    }); 
    
    connection.end();
});

// GET ALL LOCATIONS OF ONE MAP 
app.route('/api/maps/:name/getlocations').get((request, response) => {
    const requestedMapName = request.params['name']
    connect_to_database(connection);

    let sql = `SELECT * FROM locations
                WHERE current_mapID = (
                    SELECT assetID FROM assets 
                    WHERE map_name = ? 
                ) FOR JSON`; 
    
    connection.query(sql, [requestedMapName], (error, results, fields) => {
        if (error) {
            response.status(400).send('Error in database operation');
        } else {
            response.send(results);
        }
    });

    connection.end(); 
});


// GET SINGLE LOCATION OF A MAP
// returns 
app.route('/api/maps/:map_name/:location_name/').get((request, response) => {
    const requestedMapName = request.params['map_name'];
    const requestedLocationName = request.params['location_name'];

    let sql = `SELECT * FROM locations
                WHERE current_mapID = (
                    SELECT assetID FROM assets 
                    WHERE map_name = ? 
                )
                AND location_name = ?
                FOR JSON` 

    let filtered_result;
    connection.query(sql, [requestedMapName, requestedLocationName], (error, results, fields) => {
        if (error) {
            response.status(400).send('Error in database operation');
        } else {
            filtered_result = results;
            // get type and write it down for json 
            // get location floor map / location connection map details - e.g. how many floors, what map is it connected to
        }
    });

    filtered_result.current_mapID = JSON.stringify()

    connection.end(); 
});


// GET
app.route('/api/maps/:name').get((req, res) => {
    const requestedCatName = req.params['name']

    // get data from database 
    data = { name: requestedCatName }; 

    // send response
    res.send(data);

})

// POST
app.use(bodyParser.json())
app.route('/api/cats').post((req, res) => {
    res.send(201, req.body)
  })