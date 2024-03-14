const { DateTime } = require('mssql');
const dbConn = require('../api');
const express = require('express');

const router = express.Router();

// Get all machines with pagination
router.get('/', async (req, resp) => {
    try {
        const searchString = req.query.q;
        const machines = await getAllMachine(searchString);
        resp.send(machines);

    } catch (err) {
        console.error('Error getting machines:', err);
        resp.status(500).send('Internal Server Error');
    }

});

// router.get('/search', async (req, resp) => {
//     try {
//         const page = parseInt(req.query.page) || 1;
//         const limit = parseInt(req.query.limit) || 10;
//         const searchString = req.query.q;

//         const machines = await getMachine(searchString, page, limit);
//         resp.json(machines);
//     } catch (err) {
//         console.error('Error getting machines:', err);
//         resp.status(500).send('Internal Server Error');
//     }
// });

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
router.put('/:machineId', async (req, resp) => {
    try {
        const machineId = req.params.machineId;
        const jsonBody = req.body;

        // Create the machineData object with relevant fields
        const machineData = {
            refNo: jsonBody.RefNo || "",
            name: jsonBody.Name || "",
            description: jsonBody.Description || "",
            category: jsonBody.Category || "",
            subCategory: jsonBody.SubCategory || "",
            projectNo: jsonBody.ProjectNo || "",
            manufacturer: jsonBody.Manufacturer || "",
            model: jsonBody.Model || "",
            transferredDate: jsonBody.TransferredDate || "",
            purchasePrice: jsonBody.PurchasedPrice || 0,
            otherRemarks: jsonBody.OtherRemarks || "",
            isDeleted: jsonBody.IsDeleted || 0
        };

        console.log(machineId);
        console.log(machineData);

        // Validate required fields
        // if (!isValidMachineData(machineData)) {
        //     resp.status(400).send('Bad Request');
        //     return;
        // }

        // Execute the SQL update query
        const result = await updateMachine(machineId, machineData);
        console.log(`Result: ${result}`);
        // Check if the machine was updated successfully
        if (result == 1) {
            resp.status(200).send('Machine updated successfully');
        } else {
            resp.status(404).send('Machine not found');
        }
    } catch (err) {
        console.error('Error updating machine:', err);
        resp.status(500).send('Internal Server Error');
    }
});



// Get machine by project
router.get('/projectNo=:projectNo', async (req, resp) => {
    try {
        const projectNo = req.params.projectNo;
        const machines = await getMachineByProject(projectNo);
        resp.send(machines);
    } catch (err) {
        console.error('Error getting machines:', err);
        resp.status(500).send('Internal Server Error');
    }
    
});

// Get machine location history
router.get('/machine-location-histories', async (req, resp) => {
    try {
        const machines = await getMachineLocationHistories();
        resp.send(machines);
    } catch (err) {
        console.error('Error getting machine location histories:', err);
        resp.status(500).send('Internal Server Error');
    }
});


// Function to validate machine data
function isValidMachineData(machineData) {
    const requiredFields = ['refNo', 'name', 'description', 'category', 
    'subCategory', 'projectNo', 'manufacturer', 'model', 'transferredDate', 
    'purchasePrice', 'isDeleted'];

    return requiredFields.every(field => machineData.hasOwnProperty(field));
}

// Function to execute the SQL update query
async function updateMachine(machineId, machineData) {
    const {
        refNo, name, description, category, subCategory, projectNo, 
        manufacturer, model, transferredDate, purchasePrice,otherRemarks, isDeleted 
    } = machineData;

    console.log(machineData.transferredDate);

    // Construct the SQL update query with named parameters
    const sql = `UPDATE FixedAssets SET 
        RefNo = '${machineData.refNo}', 
        Name = '${machineData.name}', 
        Description = '${machineData.description}', 
        Category = '${machineData.category}', 
        SubCategory = '${machineData.subCategory}', 
        ProjectNo = '${machineData.projectNo}', 
        Manufacturer = '${machineData.manufacturer}', 
        Model = '${machineData.model}', 
        TransferredDate = '${machineData.transferredDate}', 
        PurchasedPrice = ${machineData.purchasePrice}, 
        OtherRemarks = '${machineData.otherRemarks}',
        IsDeleted = ${machineData.isDeleted} 
        WHERE FixedAssetId = ${machineId}`;

        console.log(sql);
    const params = {
        refNo, 
        name, 
        description, 
        category, 
        subCategory, 
        projectNo, 
        manufacturer, 
        model, 
        transferredDate, 
        purchasePrice, 
        otherRemarks,
        isDeleted, 
        machineId
    };

    // Execute the SQL query and return the result
    return dbConn.executeSqlQuery(sql);
}

async function getAllMachine(searchString){
    if (searchString === undefined) {
        searchString = '';
    }

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
    ORDER BY PurchasedDate desc `;
    console.log(sql);
    return dbConn.retrieveData(sql);
}

const getMachine = async (searchString, page, limit) => {

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

async function getMachineByProject(projectNo){
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
