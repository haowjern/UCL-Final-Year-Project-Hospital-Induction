const mysql = require('mysql');

module.exports = class Database {
    constructor(config) {
        this.connection = mysql.createConnection(config); 
    }

    query(sql, args) {
        return new Promise( (resolve, reject) => {
            this.connection.query(sql, args, (err, rows) => {
                return reject(err);
                if (err) {
                    return reject(err);
                } else {
                    resolve(rows); 
                };
            });
        });
    };

    close_connection() {
        return new Promise ( (resolve, reject) => {
            this.connection.end( err => {
                if (err) {
                    return reject(err);
                } else {
                    resolve(); 
                };
            });
        });
    };
}