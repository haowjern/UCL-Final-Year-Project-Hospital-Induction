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
            ssl:{ca: fs.readFileSync('C:/Users/haowjern/Certificates/BaltimoreCyberTrustRoot.crt.pem')}
        }
    }
}

module.exports = config;