const express = require('express');
const path = require('path');
const cors = require('cors');
const mysql = require('mysql2');
const fs = require('fs');


// Ugly global variables
const service = express();
const frontend = express();

const databaseConnection = mysql.createConnection({
    user: 'weball',
    host: '155.94.252.86',
    password: 'WebAll123!',
    database: 'weball'
});


// Express setup
service.use(express.json());
service.use(cors());
frontend.use(express.static(path.join(__dirname, './frontend')));


// Utility functions
const checkUser = (url, callback) => {
    databaseConnection.query('SELECT * FROM users WHERE url = ?', url, (err, result, fields) => {
        if (err) throw err;
        callback(result)
    });
}


// Request handlers
service.post('/register', (req, res) => {
    const rr = req.body;
    
    if (!rr.url || !rr.password) {
        res.send({
            status: 'Failed',
            message: 'Some fields are not filled'
        });

        return;
    }

    checkUser(rr.url, (result) => {
        if (result && result.length > 0) {
            res.send({
                status: 'Failed',
                message: 'URL already registered'
            });

            return;
        }

        const values = [rr.url, rr.password];
        databaseConnection.query('INSERT INTO users (url, pw) VALUES (?, ?)', values, (err, result) => {
            if (err) throw err;
            
            res.send({
                status: 'Success',
                message: 'URL registered successfully'
            });
        });
    });
});


// Application init
service.listen(8081, () => {
    databaseConnection.connect((err) => {
        if (err) throw err;
        databaseConnection.query('CREATE TABLE IF NOT EXISTS users(url TEXT, pw TEXT);', (e, r) => {
            if (err) throw err;
            // console.log('Created users table');
        });
    });
});

service.get('*', (req, res) => {
    const referrer = req.get('Referrer');
    
    if (!referrer) {
        res.status(403).end();
        return;
    }

    checkUser(referrer, (user) => {
        if (!(user && user.length > 0)) {
            // console.warn(`Refused connection from ${referrer}`);
            res.status(403).end();
            return;
        }
    
        // console.log(`Accepted connection from ${referrer}`);
        
        if (!fs.existsSync(path.join(__dirname, `./service${req.path}`))) {
            res.status(404).end();
            return;
        }
    
        res.sendFile(path.join(__dirname, `./service${req.path}`));
    });
});

frontend.listen(8082, () => {
});