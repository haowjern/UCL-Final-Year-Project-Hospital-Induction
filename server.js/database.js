const mysql = require('mysql');

module.exports = class Database {
    constructor(config) {
        try {
            this.pool = mysql.createPool(config); 
        } catch(err) {
            console.log("Error connecting to database pool: " + err);
        }
    }

    // open_pool() {
    //     this.pool.connect();
    // }

    query(sql, args) {
        return new Promise( (resolve, reject) => {
            this.pool.query(sql, args, (err, rows) => {
                if (err) {
                    return reject(err);
                } else {
                    resolve(rows); 
                };
            });
        });
    };

    // release_connection() {
    //     return new Promise ( (resolve, reject) => {
    //         this.pool.end( err => {
    //             if (err) {
    //                 return reject(err);
    //             } else {
    //                 resolve(); 
    //             };
    //         });
    //     });
    // };
}