const dbConn = require('../api');
const express = require('express');

const router = express.Router();



router.get('/', async (req, resp) => {
    try {
        console.log('users home');
        const users = await getAllUsers();
        resp.send(users);
    } catch (err) {
        console.error('Error getting users:', err);
        resp.status(500).send('Internal Server Error');
    }
});

router.get('/user', async (req, resp) => {
    try {
        console.log('user and password');
        const users = await getAllUsers();
        const username = req.query.username;
        const password = req.query.password;
        const user = users.find(u => u.Username === username && u.Password === password);

        if (resp.status == 200) {
            resp.send(user);
            resp.status(404).send('User not found');
        } else {
            resp.send(user);
        }
    } catch (err) {
        console.error('Error getting user by username and password:', err);
        resp.status(500).send('Internal Server Error');
    }
});

router.get('/id=:id', async (req, resp) => {
    try {
        const users = await getAllUsers();
        const id = req.params.id;
        const user = users.find(c => c.UserId === id);

        if (!user) {
            resp.status(404).send('User not found');
        } else {
            resp.send(user);
        }
    } catch (err) {
        console.error('Error getting user by ID:', err);
        resp.status(500).send('Internal Server Error');
    }
});

router.get('/username=:username', async (req, resp) => {
    try {
        console.log('username');
        const users = await getAllUsers();
        const userName = req.params.username;
        const user = users.find(u => u.Username === userName);

        if (!user) {
            resp.status(404).send('User not found');
        } else {
            resp.send(user);
        }
    } catch (err) {
        console.error('Error getting user by username:', err);
        resp.status(500).send('Internal Server Error');
    }
});

async function getAllUsers(){
    return dbConn.retrieveData(`Select * from Users WHERE isDeleted != 1`);
}

module.exports = router;