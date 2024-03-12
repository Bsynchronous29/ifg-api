const sql = require('mssql');

const config = {
    user: 'sa',
    password: 'asksrf@7528',
    server: '94.201.146.218',
    database: 'IFGDBTest',
    options: {
        encrypt: false, // For Azure databases, set this to true
        trustedConnection: true
    }
};

async function retrieveData(query){
    try {
        // `SELECT * FROM FixedAssets where isDeleted != 1`
        await connectToDatabase();
        const res = await queryDatabase(query);
        return res;
    }
    catch(err) {
        console.error('Error executing query:', err);
        throw err;
    } finally{
        await closeConnection();
    }
}

async function connectToDatabase() {
    try {
        await sql.connect(config);
        console.log('Connected to the database');
    } catch (err) {
        console.error('Error connecting to the database:', err);
    }
}
async function executeSqlQuery(query, params) {
    try {
        await connectToDatabase();
        const result = await sql.query(query, params);
        return result.recordset;
    } catch (err) {
        console.error('Error executing query:', err);
        throw err;
    } finally {
        await closeConnection();
    }
}

async function queryDatabase(query) {
    try {
        const result = await sql.query(query);
        return result.recordset;
    } catch (err) {
        console.error('Error executing query:', err);
    }
}

async function closeConnection() {
    try {
        await sql.close();console.log('Connection Closed.');
    } catch (err) {
        console.error('Error closing connection:', err);
    }
}

module.exports = { retrieveData, executeSqlQuery }