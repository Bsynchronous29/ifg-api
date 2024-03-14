const dbConn = require('../api');
const express = require('express');

const router = express.Router();

router.get('/search', async (req, resp) => {
    try {
        // const page = parseInt(req.query.page) || 1;
        // const limit = parseInt(req.query.limit) || 10;
        const searchString = req.query.q;
        const projects= await searchProject(searchString);
        resp.send(projects);

    } catch (err) {
        console.error('Error getting projects:', err);
        resp.status(500).send('Internal Server Error');
    }
});

router.get('/', async (req, resp) => {
    try {
        const projects = await getAllProjects();
        resp.send(projects);

    } catch (err) {
        console.error('Error getting projects:', err);
        resp.status(500).send('Internal Server Error');
    }

});

// router.get('/', async (req, resp) => {
//     try {
//         const page = parseInt(req.query.page) || 1;
//         const limit = parseInt(req.query.limit) || 10;
//         const searchString = req.query.q;

//         const machines = await searchProject(searchString, page, limit);
//         resp.send(machines);

//     } catch (err) {
//         console.error('Error getting projects:', err);
//         resp.status(500).send('Internal Server Error');
//     }

// });

router.get('/:id', async (req, resp) => {
    try {
        const projects = await getProjects();

        fetchid=req.params.id;
        projects.find(({id:fetchid}),function(err,val){
            resp.send(val);
        });
        // resp.send(projects);
    } catch (err) {
        console.error('Error getting projects:', err);
        resp.status(500).send('Internal Server Error');
    }
});

async function getAllProjects(){
    var sql = "SELECT * FROM Projects WHERE IsDeleted != 1;";
    const projects = await dbConn.retrieveData(sql);
    return projects;
}

async function searchProject(searchString) {
    if (searchString === undefined) {
        searchString = '';
    }

    var temp = `SELECT * 
        FROM Projects 
        WHERE isDeleted != 1 and 
            (ProjectNo like '%${searchString}%' or 
                Name like '%${searchString}%' or 
                WorkScope like '%${searchString}%' or 
                FileName like '%${searchString}%' or
                ClientName like '%${searchString}%' or
                ConsultantName like '%${searchString}%' or
                ProposedToName like '%${searchString}%' or
                ProjectManagerName like '%${searchString}%' or
                DocumentControllerName like '%${searchString}%') 
        ORDER BY ProjectId DESC`;

        console.log(temp);

    const projects = await dbConn.retrieveData(temp);

    return projects;
}

module.exports = router;
