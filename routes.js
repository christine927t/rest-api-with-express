'use strict';

const { Router } = require('express');
const express = require('express');
const router = express.Router();
const db = require('./db');
const { User, Course } = db.models;
const auth = require('basic-auth');
const bcrypt = require('bcrypt');

//async handler
function asyncHandler(cb) {
    return async (req, res, next) => {
        try {
            await cb(req, res, next);
        } catch (error) {
            console.log(error)
            next(error); //fwd error to global error handler
        }
    }
}

//middleware for basic authentication
exports.authenticateUser = async (req, res, next) => {
    let message; //stores the error message to display

    const credentials = auth(req);
    if (credentials) {
        const user = await User.findOne({ where: { emailAddress: credentials.name } });
        if (user) {
            const authenticated = bcrypt
                .compareSync(credentials.pass, user.password);
            if (authenticated) {
                console.log(`Authentication successful for username: ${user.emailAddress}`);
                res.currentUser = user; //store the user on the request object
            } else {
                message = `Authentication not successful for username: ${user.emailAddress}`;
            }
        } else {
            message = `User not found for username: ${credentials.name}`;
        }
    } else {
        message = `Auth header not found`;
    }

    if (message) {
        console.warn(message);
        res.status(401).json({ message: 'Access Denied' });
    } else {
        next();
    }
}

//---USER routes---//
router.get('/users', this.authenticateUser, asyncHandler(async (req, res, next) => {
    let users = await User.findAll();
    res.json(users);
    return res.status(200).end();
}));

router.post('/users', asyncHandler(async (req, res, next) => {
    try {
        await User.create(req.body);
        res.location('/'); //sets location header
        console.log(req.body);
        res.status(201).json({ "message": "User created successfully!" })
    } catch (error) {
        console.log('Error: ', error.name);
        if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
            const errors = error.errors.map(err => err.message);
            res.status(400).json({ errors });
        } else {
            throw error;
        }
    }
}));


//---COURSE routes---//
router.get('/courses', asyncHandler(async (req, res, next) => {
    let courses = await Course.findAll();
    res.json(courses);
    return res.status(200).end();
}));

router.get('/courses/:id', asyncHandler(async (req, res, next) => {
    let courses = await Course.findByPk(req.params.id);
    res.json(courses);
    return res.status(200).end();
}));

router.post('/courses', this.authenticateUser, asyncHandler(async (req, res, next) => {
    try {
        await Course.create(req.body);
        console.log(req.body);
        res.location('/courses/:id'); //sets location header
        res.status(201).json({ "message": "Course created successfully" })
    } catch (error) {
        console.log('Error: ', error.name)
        if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
            const errors = error.errors.map(err => err.message);
            res.status(400).json({ errors });
        } else {
            throw error;
        }
    }
}));

router.put('/courses/:id', this.authenticateUser, asyncHandler(async (req, res, next) => {
    try {
        let course = await Course.findByPk(req.params.id);
        if (course) {
            await course.update(req.body);
            console.log(req.body);
            res.status(204).end();
        } else {
            res.status(400).json({ "message": "Course not found" })
        }
    } catch (error) {
        console.log('Error: ', error.name)
        if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
            const errors = error.errors.map(err => err.message);
            res.status(400).json({ errors });
        } else {
            throw error;
        }
    }

}));

router.delete('/courses/:id', this.authenticateUser, asyncHandler(async (req, res, next) => {
    try {
        let course = await Course.findByPk(req.params.id);
        if (course) {
            await course.destroy();
            res.status(204).end();
        }
    } catch (error) {
        console.log('Error: ', error.name)
        if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
            const errors = error.errors.map(err => err.message);
            res.status(400).json({ errors });
        } else {
            throw error;
        }
    }
}))

module.exports = router;