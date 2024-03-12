const dbConn = require('../api');
const express = require('express');

const router = express.Router();

// router.get('/', async (req, resp) => {
//     try {
//         console.log('All Projects');
//         const projects = await searchProject();
//         resp.json(projects);
//     } catch (err) {
//         console.error('Error getting projects:', err);
//         resp.status(500).send('Internal Server Error');
//     }
// });

router.get('/search', async (req, resp) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const searchString = req.query.q;

        const { projects, totalCount } = await searchProject(searchString, page, limit);
        resp.send({ projects, totalCount });

    } catch (err) {
        console.error('Error getting projects:', err);
        resp.status(500).send('Internal Server Error');
    }

});

router.get('/', async (req, resp) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const searchString = req.query.q;

        const machines = await searchProject(searchString, page, limit);
        resp.send(machines);

    } catch (err) {
        console.error('Error getting machines:', err);
        resp.status(500).send('Internal Server Error');
    }

});

router.get('/', async (req, resp) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const searchString = req.query.q;

        const machines = await searchProject(searchString, page, limit);
        resp.send(machines);

    } catch (err) {
        console.error('Error getting machines:', err);
        resp.status(500).send('Internal Server Error');
    }

});

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

async function searchProject(searchString, page, limit) {
    if (searchString === undefined) {
        searchString = '';
    }
    const offset = (page - 1) * limit;

    var temp = `SELECT * 
        FROM Projects 
        WHERE isDeleted != 1 and 
            (ProjectNo like '%${searchString}%' or 
            Name like '%${searchString}%' or 
            WorkScope like '%${searchString}%' or 
            FileName like '%${searchString}%')
        ORDER BY ProjectId DESC
        OFFSET ${offset} ROWS 
        FETCH NEXT ${limit} ROWS ONLY`;

    const projects = await dbConn.retrieveData(temp);

    // Count total number of projects matching the search criteria
    const countQuery = `SELECT COUNT(*) AS total FROM Projects WHERE isDeleted != 1 and 
        (ProjectNo like '%${searchString}%' or 
        Name like '%${searchString}%' or 
        WorkScope like '%${searchString}%' or 
        FileName like '%${searchString}%')`;
    const [{ total }] = await dbConn.retrieveData(countQuery);

    return { projects, totalCount: Math.ceil(total / limit) };
}

module.exports = router;
