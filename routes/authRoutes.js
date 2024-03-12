// routes/authRoutes.js
const dbConn = require('../api');
const express = require('express');
const router = express.Router();
const userRoute = require('../routes/userRoutes');

// Define authentication routes

const userList = [];

router.post('/login', async (req, res) => {
  // Handle login/authentication logic
  try{
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);
    console.log(salt);
    console.log(hashedPassword);

    const user = { username: req.body.username, password: hashedPassword };
    users.push(user);
    res.status(201).send()
    hash(password);
    
    res.send('POST /login');
    
    }
    catch(err){
        
    }
});

router.post('/user/login', async (req, res) => {
    try {
        // Access users array from userRoutes
        console.log(userList);
        const user = userList.find(user => user.Username == req.body.Username);
        console.log(`User: ${user}`);
        if (!user) {
            return res.status(400).send('User not found.');
        } else {
           return res.send(res.statusCode);
        }
    } catch (err) {
        console.error('Error:', err);
        res.status(500).send('Internal Server Error');
    }
});

router.get('/users', async (req, resp) => {
    try {
        const users = await getAllUsers();
        userList.push(users);
        return resp.send(users);
    } catch (err) {
        console.error('Error getting users:', err);
        resp.status(500).send('Internal Server Error');
    }
});

router.get('/login/', async (req, res) => {
    try {
        const username = req.query.username;
        const password = req.query.password;
        console.log(username);
        console.log(password);
        
        // Perform authentication logic here
        var user = await getUserByUsername(username);

        console.log(`User: ${user}`);
        console.log(`Username: ${user[0].Username}`);
        console.log(`Password: ${user[0].Password}`);
        console.log(`${username} === ${user[0].Username}`);

        // Sample authentication logic
        if (username.toString() === user[0].Username && password.toString() === user[0].Password) {
            // If authentication succeeds, send success response
            res.status(200).send('Authentication successful');
        } else {
            // If authentication fails, send error response
            res.status(401).send('Invalid username or password');
        }
    } catch (err) {
        console.error('Error during authentication:', err);
        res.status(500).send('Internal Server Error');
    }
});


async function getAllUsers(){
    return dbConn.retrieveData(`Select * from Users WHERE isDeleted != 1`);
}
async function getUserByUsername(username){
    return dbConn.retrieveData(`Select * from Users WHERE isDeleted != 1 and username = '${username}'`);
}

router.post('/register', async (req, res) => {
  // Handle user registration logic
  res.send('POST /register');
});

// Export the router
module.exports = router;