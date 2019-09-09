// REQUIRE STATEMENTS

const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const inMemoryStorage = multer.memoryStorage();
const uploadStrategy = multer({ storage: inMemoryStorage }).single('file_path'); // when uploading files, have to set field name as file_name
const uploadFile = multer({ storage: inMemoryStorage }).single('file');
const anchors = require('./anchors');
const assets = require('./assets');
const anchoredAssets = require('./anchoredassets');
const maps = require('./maps');
const locations = require('./locations');
const floors = require('./floors');

// APP START

const app = express();

const whitelist = ['http://localhost:4200', 'https://hospital-induction-website.azurewebsites.net'];

app.use(function(req, res, next) {
    let selectedOrigin = null;
    let origin = req.get('origin');
    console.log('origin: ', origin)
    if (whitelist.indexOf(origin) >= 0 || !origin) { // if origin is in whitelisted origins
        selectedOrigin = origin
    }
    res.header("Access-Control-Allow-Origin", selectedOrigin); // update to match the domain you will make the request from
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE");
    next();
});

app.use(bodyParser.json()); // support JSON encoded bodies
app.use(bodyParser.urlencoded({ extended: true }));

app.listen((process.env.PORT || 8000), () => {
    console.log('Server started on port 8000')
})

// --- MAPS --- // 

// GET ALL MAPS AS A TABLE OR QUERY WITH NAME / DEFAULT 
app.get('/api/map-management/maps', maps.getAllMaps);

// GET A MAP WITH AN ID AND ITS BLOB
app.get('/api/map-management/maps/:mapId', maps.getMap);

// ADD A MAP
app.post('/api/map-management/maps', uploadStrategy, maps.addMap);

// UPDATE A MAP 
app.put('/api/map-management/maps/:id', uploadStrategy, maps.updateMap);

// DELETE MAP
app.delete('/api/map-management/maps/:id', uploadStrategy, maps.deleteMap);

// --- LOCATIONS --- //

// GET ALL LOCATIONS WITH OPTIONAL TYPE OF A MAP OR QUERY IT 
app.get('/api/map-management/maps/:mapId/locations', locations.getAllLocationsByMapId);

// GET ALL LOCATIONS
app.get('/api/location-management/locations', locations.getAllLocations)

// GET A LOCATION WITH AN ID
app.get('/api/location-management/locations/:locationId', locations.getLocation);

// Add a location 
app.post('/api/map-management/maps/:mapId/locations', locations.addLocation);

// DELETE ALL LOCATIONS
app.delete('/api/map-management/maps/:mapId/locations', uploadStrategy, locations.deleteAllLocations);

// --- FLOORS --- //

// GET ALL FLOORS WITH OPTIONAL TYPE OF A BUILDING 
app.get('/api/map-management/maps/:mapId/locations/:buildingId/floors', floors.getAllFloors);

// GET FLOOR FROM MAPID AS QUERY
app.get('/api/floor-management/floors', floors.getFloor);   

// add a floor for a building
app.post('/api/map-management/maps/:mapId/locations/:buildingId/floors', floors.addFloor);

// update a floor for a building
app.put('/api/map-management/maps/:mapId/locations/:buildingId/floors/:floorId', floors.updateFloor);


// --- ANCHORS --- //
app.get('/api/anchors', anchors.getAllAnchorKeysAsync);
app.get('/api/anchors/last', anchors.getLastAnchorKeyAsync);
app.get('/api/anchors/:anchorNumber', anchors.getAnchorKeyAsync);
app.post('/api/anchors', anchors.setAnchorKeyAsync);
app.delete('/api/anchors', anchors.deleteAnchorKeyAsync);

// ---- ASSETS --- //
app.get('/api/asset-management/assets', assets.getAllAssetsOfType);
app.get('/api/asset-management/assets/:assetId', assets.getAssetWithId)
app.post('/api/asset-management/assets', uploadFile, assets.setNonMapAsset);

app.delete('/api/asset-management/assets/:assetId', uploadStrategy, assets.deleteAsset);


// ---- ANCHORED ASSETS ---//
app.get('/api/asset-management/anchoredassets', anchoredAssets.getAnchoredAssetsAsync);
app.post('/api/asset-management/anchoredassets', anchoredAssets.setAnchoredAssetAsync);
app.delete('/api/asset-management/anchoredassets', anchoredAssets.deleteAnchoredAssetAsync);

// For testing
module.exports = app;

// Error detection 
app.use(function (err, req, res, next) {
    console.log('This is the invalid field ->' + err.field);
    next(err)
})