const { database } = require('pg/lib/defaults');
const {
    client,
    getAllUsers,
    createUser,
    updateUser,
    getAllPosts,
    getPostsByTagName,
    createPost,
    updatePost,
    getUserById,
    createTags,
    addTagsToPost
} = require('./index');

const dropTables = async () => {
    try {
        console.log('Dropping tables...');
        await client.query(`
            DROP TABLE IF EXISTS post_tags;
            DROP TABLE IF EXISTS tags;
            DROP TABLE IF EXISTS posts;
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
                name VARCHAR(255) NOT NULL,
                location VARCHAR(255) NOT NULL,
                active BOOLEAN DEFAULT true,
                username varchar(255) UNIQUE NOT NULL,
                password varchar(255) NOT NULL
            );
            
            CREATE TABlE posts (
                id SERIAL PRIMARY KEY,
                "authorId" INTEGER REFERENCES users(id) NOT NULL,
                title VARCHAR(255) NOT NULL,
                content TEXT NOT NULL,
                active BOOLEAN DEFAULT true
            );

            CREATE TABLE tags (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) UNIQUE NOT NULL
            );

            CREATE TABLE post_tags (
                "postId" INTEGER REFERENCES posts(id),
                "tagId" INTEGER REFERENCES tags(id),
                UNIQUE ("postId", "tagId")
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
        await createUser({ username: 'albert', password: 'bertie99', name: 'Al Bert', location: 'Sidney, Australia' });
        await createUser({ username: 'sandra', password: '2sandy4me', name: 'Just Sandra', location: "Ain't Tellin'" });
        await createUser({ username: 'glamgal', password: 'soglam', name: 'Joshua', location: 'Upper East Side' });
        console.log('Finished creating users.');
    } catch (error) {
        console.error('Error when creating users!');
        throw error;
    };
};

const createInitialPosts = async () => {
    try {
        console.log('Creating posts...')
        const [albert, sandra, glamgal] = await getAllUsers();
        await createPost({
            authorId: albert.id,
            title: "First Post",
            content: "This is my first post. I hope I love writing blogs as much as I love writing them.",
            tags: ['#happy', '#youcandoanything']
        });
        await createPost({
            authorId: albert.id,
            title: "Another Post",
            content: "I realize my first post made no sense. Unfortunatley, that's how the FSA workshop told me to do it!",
            tags: ['#happy', '#worst-day-ever']
        });
        await createPost({
            authorId: sandra.id,
            title: "Sanda's Post",
            content: "This is Sandra's post",
            tags: ['#sandra', '#canhumansdoeverything']
        });
        await createPost({
            authorId: glamgal.id,
            title: "GlamGal's Post",
            content: "Here we are again!",
            tags: ['#happy', '#youcandoanything', '#canhumansdoeverything']
        });
        console.log('Finished creating posts.');
    } catch (error) {
        console.error('Error when creating posts!');
        throw error;
    };
};

const createInitialTags = async () => {
    try {
        console.log('Creating tags...');

        const [happy, sad, inspo, catman] = await createTags([
            '#happy',
            '#worst-day-ever',
            '#youcandoanything',
            '#catmandoeverything'
        ]);

        const [postOne, postTwo, postThree] = await getAllPosts();

        await addTagsToPost(postOne.id, [happy, inspo]);
        await addTagsToPost(postTwo.id, [sad, inspo]);
        await addTagsToPost(postThree.id, [happy, catman, inspo]);

        console.log('Finished creating tags.');
    } catch (error) {
        console.log('Error when creating tags!');
        throw error;
    }
}

const rebuildDB = async () => {
    try {
        client.connect();
        await dropTables();
        await createTables();
        await createInitialUsers();
        await createInitialPosts();
        // await createInitialTags();
    } catch (error) {
        console.error(error);
    };
};

const testDB = async () => {
    try {
        console.log('Testing database...');

        console.log('Getting all users...');
        const users = await getAllUsers();
        console.log('getAllUsers:', users);

        console.log('Updating first user...');
        const updateUserResult = await updateUser(users[0].id, {
            name: 'Tate Redding',
            location: 'Fort Collins, CO'
        });
        console.log('Result: ', updateUserResult);

        console.log('Getting all posts...');
        const posts = await getAllPosts();
        console.log('getAllPosts:', posts);

        console.log('Updating first post...');
        const updatePostResult = await updatePost(posts[0].id, {
            title: 'New Title',
            content: 'Updated Content'
        });
        console.log('Result: ', updatePostResult);

        console.log('Updating tags on second post...');
        const updatePostTagsResult = await updatePost(posts[1].id, {
            tags: ['#youcandoanything', '#redfish', '#bluefish']
        });
        console.log('Result: ', updatePostTagsResult);

        console.log('Getting all posts with tag: #happy...');
        const postsWithHappy = await getPostsByTagName('#happy');
        console.log("Result: ", postsWithHappy);

        console.log('Getting information for first user...');
        const firstUser = await getUserById(1);
        console.log('Result: ', firstUser);

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