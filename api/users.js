const express = require('express');
const usersRouter = express.Router();

const { getAllUsers, getUserByUsername, createUser, getUserById, updateUser } = require('../db');
const { requireUser } = require('./utils');

const jwt = require('jsonwebtoken');

usersRouter.use((req, res, next) => {
    console.log('A request is being made to /users');
    next();
});

usersRouter.get('/', async (req, res) => {
    try {
        const allUsers = await getAllUsers();
        const users = allUsers.filter(user => {
            return (user.active || (req.user && user.id === req.user.id));
        });
        res.send({
            users
        });
    } catch ({ name, message }) {
        next({ name, message });
    };
});

usersRouter.post('/login', async (req, res, next) => {
    const { username, password } = req.body;
    if (!username || !password) {
        next({
            name: 'MissingCredentialsError',
            message: 'Please suppply both a username and a password'
        });
    }

    try {
        const user = await getUserByUsername(username);

        if (user && user.password === password) {
            const token = jwt.sign({
                id: user.id,
                username
            }, process.env.JWT_SECRET, {
                expiresIn: '1w'
            });
            res.send({
                message: "You're logged in!",
                token
            });
        } else {
            next({
                name: 'IncorrectCredentialsError',
                message: 'Username and password do not match!'
            });
        }
    } catch (error) {
        console.error(error);
        next(error);
    };
});

usersRouter.post('/register', async (req, res, next) => {
    const { username, password, name, location } = req.body;

    try {
        const _user = await getUserByUsername(username);

        if (_user) {
            next({
                name: 'UserExistsError',
                message: 'A user by that username already exists'
            });
        };

        const user = await createUser({
            username,
            password,
            name,
            location,
        });

        const token = jwt.sign({
            id: user.id,
            username
        }, process.env.JWT_SECRET, {
            expiresIn: '1w'
        });

        res.send({
            message: 'Thank you for signing up!',
            token
        });
    } catch ({ name, message }) {
        next({ name, message });
    };
});

usersRouter.delete('/:userId', requireUser, async (req, res, next) => {
    try {
        const user = await getUserById(req.params.userId);

        if (user && user.id === req.user.id) {
            const updatedUser = await updateUser(user.id, { active: false });
            res.send({ user: updatedUser });
        } else {
            next(user ? {
                name: 'UnauthorizedUserError',
                message: 'You can only deactivate your own account'
            } : {
                name: 'UserNotFoundError',
                message: 'User ID not recognized'
            });
        };
    } catch ({ name, message }) {
        next({ name, message })
    };
});

module.exports = usersRouter;