// remember to change config.js file to set environment to production / development

//Require the dev-dependencies
let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../server');
let should = chai.should();

chai.use(chaiHttp);

describe('Maps', () => {    
    // Test Get ALL Maps
    describe('/GET maps', () => {
        it('it should GET all maps and return 0 maps', (done) => {
            chai.request(server)
                .get('/api/map-management/maps')
                .end((err, res) => {
                        res.should.have.status(200);
                        res.body.should.be.a('array');
                        res.body.length.should.be.eql(0);
                    done();
                });
        });
    });

    // Test Post a map
    describe('/POST a map', () => {
        it('it should POST a map', (done) => {
            chai.request(server)
                .post('/api/map-management/maps')
                .field('file_name',  'map1')
                .field('is_default_map', 1)
                .attach('file_path', './test/assets/map1.png', 'map1.png')
                .end((err, res) => {
                        res.should.have.status(200);
                        res.body.should.be.a('object');
                    done();
                });
        });
    });

    // Test Get the map
    describe('/GET map with id', () => {
        it('it should GET a map of id 1 and return 1', (done) => {
            chai.request(server)
                .get('/api/map-management/maps/1')
                .end((err, res) => {
                        res.should.have.status(200);
                        res.body.should.be.a('array');
                        res.body.length.should.be.eql(1);
                    done();
                });
        });
    });
});