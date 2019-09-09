const mysql = require('mysql');

module.exports = class Database {
    constructor(config) {
        if(!!Database.instance){
            console.log('returning singleton');
            return Database.instance;
        }

        console.log('creating a singleton');
        Database.instance = this;

        try {
            this.pool = mysql.createPool(config); 
        } catch(err) {
            console.log("Error connecting to database pool: " + err);
        }
    }

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
}