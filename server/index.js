const express = require('express');
const path = require('path');
const cors = require('cors');
const mysql = require('mysql2');
const fs = require('fs');
const weballDatabase = require('./service/node/database.js');


// Ugly global variables
const service = express();
const frontend = express();

const database = weballDatabase({
    user: 'weball',
    host: 'localhost',
    password: 'WebAll123!',
    database: 'weball'
});

// Express setup
service.use(express.json());
service.use(cors());
frontend.use(express.static(path.join(__dirname, './frontend')));


// Request handlers
service.post('/register-customer', (req, res) => {
    const rr = req.body;
    
    if (!rr.orgname || !rr.password) {
        res.send({
            status: 'Failed',
            message: 'Some fields are not filled'
        });

        return;
    }

    database.addCustomer({
        orgname: rr.orgname,
        password: rr.password,
        callback: (err, result, response) => {
            if (err) throw err;
            res.send(response);
        }
    })
});


// Application init
service.listen(8081, () => {
    database.connect((err) => {
        if (err) throw err;
    });
});

service.get('*', (req, res) => {
    const referrer = req.get('Referrer');
    
    if (!referrer) {
        res.status(403).end();
        return;
    }

//    checkUser(referrer, (user) => {
//        if (!(user && user.length > 0)) {
//            // console.warn(`Refused connection from ${referrer}`);
//            res.status(403).end();
//            return;
//        }
//
//        // console.log(`Accepted connection from ${referrer}`);
//
//        if (!fs.existsSync(path.join(__dirname, `./service${req.path}`))) {
//            res.status(404).end();
//            return;
//        }
//
//        res.sendFile(path.join(__dirname, `./service${req.path}`));
//    });
});

frontend.listen(8082, () => {
});