const fs = require('fs');

var config = {
    development: {
        url: 'empty',
        
        // mysql connection setting
        database: {
            host: 'app-treasure-hunt-database.mysql.database.azure.com',
            user: 'haowjern@app-treasure-hunt-database', 
            password: 'lG7cV95J',
            database: 'app_mysql',
            port: 3306,
            ssl:{ca: fs.readFileSync('C:/Users/haowjern/Certificates/BaltimoreCyberTrustRoot.crt.pem')},
            connectionLimit : 10
        },

        storage: {
            accountName: 'apptreasurehunt',
            accountKey: 'N6Kw8xToZ8JEhTrfil59Vtc/bVt7Fnu5Lh4Ha3d+kxJGwT9elb5euINQ8paQ6j9xokRVPEaO9Fek46PKzliR0g=='
        }
    }
}

module.exports = config;