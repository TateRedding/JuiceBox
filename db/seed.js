const { database } = require('pg/lib/defaults');
const {
    client,
    getAllUsers,
    createUser
} = require('./index');

const dropTables = async () => {
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

const createTables = async () => {
    try {
        console.log('Creating tables...');
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

const createInitialUsers = async () => {
    try {
        console.log('Creating users...');
        await createUser({ username: 'albert', password: 'bertie99' });
        await createUser({ username: 'sandra', password: '2sandy4me' });
        await createUser({ username: 'sandra', password: 'glamgal' });
        console.log('Finished creating users.');
    } catch (error) {
        console.error('Error when creating users!');
        throw error;
    };
};

const rebuildDB = async () => {
    try {
        client.connect();
        await dropTables();
        await createTables();
        await createInitialUsers();
    } catch (error) {
        console.error(error);
    };
};

const testDB = async () => {
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