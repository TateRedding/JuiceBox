const express = require('express');
const tagsRouter = express.Router();

const { getAllTags, getPostsByTagName, getUserById } = require('../db');

tagsRouter.use((req, res, next) => {
    console.log('A request is being made to /tags');
    next();
});

tagsRouter.get('/', async (req, res) => {
    try {
        const tags = await getAllTags();
        res.send({
            tags
        });
    } catch ({ name, message }) {
        next({ name, message });
    };
});

tagsRouter.get('/:tagName/posts', async (req, res, next) => {
    try {
        const allPosts = await getPostsByTagName(req.params.tagName);
        const posts = allPosts.filter(post => {
            return (post.active && post.author.active) || (req.user && post.author.id === req.user.id);
        })
        res.send({ posts });
    } catch ({ name, message }) {
        next({ name, message });
    };
});

module.exports = tagsRouter;