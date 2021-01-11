'use strict';

const express = require('express');
const router = express.Router();
const db = require('./db');
const { User, Course } = db.models;

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

//---USER routes---//
router.get('/users', asyncHandler(async (req, res, next) => {
    let users = await User.findAll();
    res.location('/'); //sets location header
    res.json(users);
    return res.status(201).end();
}));

router.post('/users', asyncHandler(async (req, res, next) => {
    try {
        await User.create(req.body);
        console.log(req.body);
        res.status(201).json({ "message": "User created successfully!" })
    } catch (error) {
        console.log('Error: ', error.name);
        if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
            const errors = error.errors.map(err => err.message);
            res.status(404).json('Validation Errors: ', errors);
        } else {
            throw error;
        }
    }
}));


//---COURSE routes---//
router.get('/courses', asyncHandler(async (req, res, next) => {
    let courses = await Course.findAll();
    res.json(courses);
    return res.status(201).end();
}));

router.get('/courses/:id', asyncHandler(async (req, res, next) => {
    let courses = await Course.findByPk(req.params.id);
    res.json(courses);
    return res.status(201).end();
}));

router.post('/courses', asyncHandler(async (req, res, next) => {
    try {
        await Course.create(req.body);
        console.log(req.body);
        res.location('/'); //sets location header
        res.status(201).json({ "message": "Course created successfully" })
    } catch (error) {
        console.log('Error: ', error.name)
        if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
            const errors = error.errors.map(err => err.message);
            res.status(404).json('Validation errors: ', errors);
        } else {
            throw error;
        }
    }
}));

module.exports = router;