const fs = require('fs');

var config = {
    environment: 'production',

    development: {
        url: 'empty',
        
        // mysql connection setting
        database: {
            host: 'app-treasure-hunt-database.mysql.database.azure.com',
            user: 'haowjern@app-treasure-hunt-database', 
            password: 'lG7cV95J',
            database: 'app_mysql_test',
            port: 3306,
            ssl:{ca: fs.readFileSync('./Certificates/BaltimoreCyberTrustRoot.crt.pem')},
            connectionLimit : 10
        },

        storage: {
            accountName: 'apptreasurehunt',
            accountKey: 'N6Kw8xToZ8JEhTrfil59Vtc/bVt7Fnu5Lh4Ha3d+kxJGwT9elb5euINQ8paQ6j9xokRVPEaO9Fek46PKzliR0g=='
        },

        azureSpatialAnchors: {
            accountId: '',
            resource: 'https://sts.mixedreality.azure.com',
            aadClientId: '', 
            aadClientKey: '',
            aadTenantId: '',
        }
    },

    production: {
        url: 'empty',
        
        // mysql connection setting
        database: {
            host: 'app-treasure-hunt-database.mysql.database.azure.com',
            user: 'haowjern@app-treasure-hunt-database', 
            password: 'lG7cV95J',
            database: 'app_mysql',
            port: 3306,
            ssl:{ca: fs.readFileSync('./Certificates/BaltimoreCyberTrustRoot.crt.pem')},
            connectionLimit : 10
        },

        storage: {
            accountName: 'apptreasurehunt',
            accountKey: 'N6Kw8xToZ8JEhTrfil59Vtc/bVt7Fnu5Lh4Ha3d+kxJGwT9elb5euINQ8paQ6j9xokRVPEaO9Fek46PKzliR0g=='
        },

        azureSpatialAnchors: {
            accountId: '',
            resource: 'https://sts.mixedreality.azure.com',
            aadClientId: '', 
            aadClientKey: '',
            aadTenantId: '',
        }
    }
}

module.exports = config