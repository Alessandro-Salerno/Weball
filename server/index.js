const express = require('express');
const path = require('path');
const cors = require('cors');
const mysql = require('mysql2');
const fs = require('fs');
const url = require('url');

// Ugly global variables
const service = express();
const frontend = express();

const databaseConnection = mysql.createConnection({
    user: 'weball',
    host: 'localhost',
    password: 'WebAll123!',
    database: 'weball'
});


// Express setup
service.use(express.json());
service.use(cors());
frontend.use(express.static(path.join(__dirname, './frontend')));


// Utility functions
const checkCustomer = (domain, callback) => {
    databaseConnection.query('SELECT * FROM customers WHERE domain = ?', domain, (err, result, fields) => {
        if (err) throw err;
        callback(result)
    });
}

const checkUser = (email, password, callback) => {
    databaseConnection.query('SELECT * FROM user_prefs WHERE email = ? AND password = ?', [email, password], (err, result, fields) => {
        if (err) throw err;
        callback(result)
    });
}

const getDomain = (url) => {
    try {
        return new URL(url).hostname;
    }

    catch (e) { }
}

const userLogin = (email, password, res, callback) => {
    checkUser(email, password, (users) => {
        if (users && users.length > 0)  {
            callback(users[0]);
            return;
        }
        
        res.send({
            status: 'Failed',
            message: 'No such user'
        });
    });
}

service.post('/user/settings/set', (req, res) => {
    const rr = req.body;

    if (!rr.email || !rr.password || !rr.settings) {
        res.send({
            status: 'Failed',
            message: 'Some fields are not filled'
        });

        return;
    }

    userLogin(rr.email, rr.password, res, (user) => {
        databaseConnection.query('UPDATE user_prefs SET prefs TO ? WHERE email = ?', [JSON.stringify(rr.settings), rr.email], (err, result) => {
            if (err) {
                res.send({
                    status: 'Failed',
                    message: err.message
                });
                
                throw err;
            }
            
            res.send({
                status: 'Success',
                message: 'Settings updated',
            });
        });
    });
})

service.post('/user/settings/get', (req, res) => {
    const rr = req.body;

    if (!rr.email || !rr.password) {
        res.send({
            status: 'Failed',
            message: 'Some fields are not filled'
        });

        return;
    }
    
    userLogin(rr.email, rr.password, res, (user) => {
        res.send({
            status: 'Success',
            message: 'Data retreived',
            settings: JSON.parse(user.prefs)
        });
    });
})

service.post('/user/register', (req, res) => {
    const rr = req.body;

    if (!rr.firstname || !rr.lastname || !rr.email || !rr.password) {
        res.send({
            status: 'Failed',
            message: 'Some fields are not filled'
        });

        return;
    }

    checkUser(rr.email, (result) => {
        if (result && result.length > 0) {
            res.send({
                status: 'Failed',
                message: 'User already registered'
            });

            return;
        }
        const values = [rr.firstname, rr.lastname, rr.email, rr.password, '{}'];
        databaseConnection.query('INSERT INTO customers (firstname, lastname, email, password, prefs) VALUES (?, ?, ?, ?, ?)', values, (err, result) => {
            if (err) throw err;

            res.send({
                status: 'Success',
                message: 'User registered successfully'
            });
        });
        
    });
});

// Request handlers
service.post('/customer/register', (req, res) => {
    const rr = req.body;
    
    if (!rr.url || !rr.password) {
        res.send({
            status: 'Failed',
            message: 'Some fields are not filled'
        });

        return;
    }

    const domain = getDomain(rr.url);
    if (!domain) {
        res.send({
            status: 'Failed',
            message: 'Invalid domain name'
        });
        
        return;
    }
    
    checkCustomer(domain, (result) => {
        if (result && result.length > 0) {
            res.send({
                status: 'Failed',
                message: 'Domain already registered'
            });

            return;
        }

        const values = [domain, rr.password, 0];
        databaseConnection.query('INSERT INTO customers (domain, pw, hits) VALUES (?, ?, ?)', values, (err, result) => {
            if (err) throw err;
            
            res.send({
                status: 'Success',
                message: 'Domain registered successfully'
            });
        });
    });
});


// Application init
service.listen(8081, () => {
    databaseConnection.connect((err) => {
        if (err) throw err;
        
        databaseConnection.query('CREATE TABLE IF NOT EXISTS customers(domain TEXT, pw TEXT, hits INT);', (e, r) => {
            if (e) throw err;
            // console.log('Created customers table');
        });

        database/Connection.query('CREATE TABLE IF NOT EXISTS user_prefs(firstname TEXT, lastname TEXT, email TEXT, password TEXT, prefs TEXT);', (e, r) => {
            if (e) throw err;
            // console.log('Created customers table');
        });
    });
});

service.get('*', (req, res) => {
    const referrer = req.get('Referrer');
    
    if (!referrer) {
        res.status(403).end();
        return;
    }

    const domain = getDomain(referrer)
    if (!domain) {
        res.status(400).end();
        return;
    }
    
    checkCustomer(domain, (user) => {
        if (!(user && user.length > 0)) {
            res.status(403).end();
            return;
        }
    
        // console.log(`Accepted connection from ${referrer}`);
        
        if (!fs.existsSync(path.join(__dirname, `./service${req.path}`))) {
            res.status(404).end();
            return;
        }
    
        res.sendFile(path.join(__dirname, `./service${req.path}`));
        
        databaseConnection.query('UPDATE customers SET hits TO hits + 1 WHERE domain = ?', user[0].domain, (err, result) => {
            if (err) throw err;
        });
    });
});

frontend.listen(8082, () => {
});
