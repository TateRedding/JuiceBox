const { database } = require('pg/lib/defaults');
const {
    client,
    getAllUsers,
    createUser
} = require('./index');

async function dropTables() {
    try {
        console.log('Dropping tables...');
        await client.query(`
            DROP TABLE IF EXISTS users;
        `);
        console.log('Finished dropping tables.');
    } catch (error) {
        console.log('Error when dropping tables!');
        throw error;
    };
};

async function createTables() {
    try {
        console.log('Created tables...');
        await client.query(`
            CREATE TABLE users (
                id SERIAL PRIMARY KEY,
                username varchar(255) UNIQUE NOT NULL,
                password varchar(255) NOT NULL
            );
      `);
        console.log('Finished creating tables.');
    } catch (error) {
        console.log('Error when creating tables!');
        throw error;
    };
};

async function createInitialUsers() {
    try {
        console.log('Creating users...');
        const albert = await createUser({ username: 'albert', password: 'bertie99' });
        const sandra = await createUser({ username: 'sandra', password: 'glamgal' });
        console.log(albert);
        console.log(sandra);
        console.log('Finished creating users.');
    } catch (error) {
        console.error('Error when creating users!');
        throw error;
    };
};

async function rebuildDB() {
    try {
        client.connect();
        await dropTables();
        await createTables();
        await createInitialUsers();
    } catch (error) {
        console.error(error);
    };
};

async function testDB() {
    try {
        console.log('Testing database...');
        const users = await getAllUsers();
        console.log('getAllUsers:', users);
        console.log('Finished testing database.');
    } catch (error) {
        console.log('Error testing databse!');
        console.error(error);
    } finally {
        client.end();
    };
};

rebuildDB()
    .then(testDB)
    .catch(console.error)
    .finally(() => client.end());