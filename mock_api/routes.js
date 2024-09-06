const fs = require('fs');
// const { readFile } = require('fs/promises');
// const path = require('path');
const express = require('express');
const cors = require('cors');
const apiData = require('./testApiData.json');

// const configPath = path.resolve(__dirname, 'config.json');

// // Initial load of JSON file, which doesn't cache the file (so it 
// // can be reloaded). Adapted from: https://stackoverflow.com/a/65605311 
// let config = readFile(configPath)
//                 .then(json => JSON.parse(json))
//                 .catch(() => null);

// // let config = require('./config.json');

// // Watch for changes in config file and reload file
// // if changed. Credit: AI response
// fs.watch(configPath, async (eventType) => {
//   if (eventType === 'change') {
//     // Clear the module from cache
//     delete require.cache[require.resolve('./config.json')];

//     // Re-import the module
//     // config = require('./config.json');
//     config = await readFile(configPath)
//                 .then(json => JSON.parse(json))
//                 .catch(() => null);

//     console.log('Updated value:', config);
//   }
// });

const router = express.Router();

// Donation route
router.get('/donations', (req, res) => {
    if (req.cookies?.key) {
        return res.json(apiData.donations);
    } else {
        return res.status(403)
                  .json({ message: 'Cannot access authenticated route'});
    }
});

// Login route
router.post('/accounting_login', async (req, res) => {
    // Get server_error flag set by unit test - if present, 
    // return error response
    // const configResult = await config;
    res.cookie('token', apiData.accounting_login.key);
    // if (configResult.server_error === true) {
    if (req.body.username === 'invalidCredentials') {
        console.log('Invalid user credentials');
        return res.status(403).json({
            message: 'Invalid user credentials'
        })
    } else if (req.body.username === 'serverFailure') {
        console.log('Server error')
        return res.status(500).json({ message: 'Internal server error' });
    } else {
        console.log('No server error');
        return res.json({token: apiData.accounting_login.key});
    }
});

router.post('/accounting_register', (req, res) => {
    res.cookie('token', apiData.accounting_register.key);
    return res.json({token: apiData.accounting_register.key});
});

router.get('/appeals', (req, res) => {
    console.log('Appeals route called');
    return res.json(apiData.appeals);
})

module.exports = router;