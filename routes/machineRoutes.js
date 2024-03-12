const dbConn = require('../api');
const express = require('express');

const router = express.Router();

// Get all machines with pagination
router.get('/', async (req, resp) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const searchString = req.query.q;

        const machines = await getMachines(searchString, page, limit);
        resp.send(machines);

    } catch (err) {
        console.error('Error getting machines:', err);
        resp.status(500).send('Internal Server Error');
    }

});


router.get('/search', async (req, resp) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const searchString = req.query.q;

        const machines = await getMachines(searchString, page, limit);
        resp.json(machines);
    } catch (err) {
        console.error('Error getting machines:', err);
        resp.status(500).send('Internal Server Error');
    }
});

// Add a new machine
router.post('/', async (req, resp) => {
    try {
        const { RefNo, Name, CategoryId, ProjectNo, Manufacturer, Model, 
            PlateNo, EngineNo, BodyNo, Description, Remarks, isDeleted } = req.body;

        if (!RefNo || !Name || !CategoryId || !ProjectNo || !Manufacturer 
            || !Model || !PlateNo || !EngineNo || !BodyNo || !Description 
            || isDeleted === undefined) {
            resp.status(400).send('Bad Request');
            return;
        }

        const sql = `INSERT INTO FixedAssets (RefNo, Name, CategoryId, ProjectNo, 
            Manufacturer, Model, PlateNo, EngineNo, BodyNo, Description, 
            Remarks, isDeleted) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        const params = [RefNo, Name, CategoryId, ProjectNo, Manufacturer, Model, 
            PlateNo, EngineNo, BodyNo, Description, Remarks, isDeleted];

        const result = await dbConn.executeSqlQuery(sql, params);

        if (result.affectedRows === 1) {
            resp.status(201).send('Machine added successfully');
        } else {
            resp.status(500).send('Internal Server Error');
        }

    } catch (err) {
        console.error('Error adding machine:', err);
        resp.status(500).send('Internal Server Error');
    }
});

// Update an existing machine
router.put('/:refNo', async (req, resp) => {
    try {
        const refNo = req.params.refNo;
        const { Name, CategoryId, ProjectNo, Manufacturer, Model, 
            PlateNo, EngineNo, BodyNo, Description, Remarks, isDeleted } = req.body;

        if (!Name || !CategoryId || !ProjectNo || !Manufacturer || 
            !Model || !PlateNo || !EngineNo || !BodyNo || !Description 
            || isDeleted === undefined) {
            resp.status(400).send('Bad Request');
            return;
        }

        const sql = `UPDATE FixedAssets SET Name = ?, CategoryId = ?, 
            ProjectNo = ?, Manufacturer = ?, Model = ?, PlateNo = ?, EngineNo = ?, 
            BodyNo = ?, Description = ?, Remarks = ?, isDeleted = ? WHERE RefNo = ?`;
        const params = [Name, CategoryId, ProjectNo, Manufacturer, Model, 
            PlateNo, EngineNo, BodyNo, Description, Remarks, isDeleted, 
            refNo];
        const result = await dbConn.executeSqlQuery(sql, params);

        if (result.affectedRows === 1) {
            resp.status(200).send('Machine updated successfully');
        } else {
            resp.status(404).send('Machine not found');
        }

    } catch (err) {
        console.error('Error updating machine:', err);
        resp.status(500).send('Internal Server Error');
    }
});


router.get('/projectNo=:projectNo', async (req, resp) => {
    try {
        const projectNo = req.params.projectNo;
        const machines = await getMachinesByProject(projectNo);
        resp.send(machines);
    } catch (err) {
        console.error('Error getting machines:', err);
        resp.status(500).send('Internal Server Error');
    }
    
});

router.get('/machine-location-histories', async (req, resp) => {
    try {
        const machines = await getMachineLocationHistories();
        resp.send(machines);
    } catch (err) {
        console.error('Error getting machine location histories:', err);
        resp.status(500).send('Internal Server Error');
    }
});

async function updateMachine(fixedAsset){
    
}

const getMachines = async (searchString, page, limit) => {

    if (searchString === undefined) {
        searchString = '';
    }
    const offset = (page - 1) * limit;

    var sql = `SELECT * 
        FROM FixedAssets 
        WHERE CategoryId NOT IN (9,10,11,12) 
        AND (RefNo like '%${searchString}%' 
            OR Name like '%${searchString}%' 
            OR Description like '%${searchString}%' 
            OR Manufacturer like '%${searchString}%' 
            OR Model like '%${searchString}%' 
            OR PlateNo like '%${searchString}%' 
            OR EngineNo like '%${searchString}%' 
            OR BodyNo like '%${searchString}%') 
        AND isDeleted != 1 
        ORDER BY FixedAssetId desc 
        OFFSET ${offset} ROWS 
        FETCH NEXT ${limit} ROWS ONLY`;

    console.log(sql);

    return dbConn.retrieveData(sql);

};

async function getMachinesByProject(projectNo){
    return dbConn.retrieveData(`
        SELECT * 
        FROM FixedAssets 
        WHERE 
        ProjectNo like '%${projectNo}%'`);
}

async function getMachineLocationHistories(){
    return dbConn.retrieveData(`SELECT * FROM LocationHistories where isDeleted != 1`);
}

module.exports = router;
