'use strict';

const { Router } = require('express');
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
    return res.status(200).end();
}));

router.get('/courses/:id', asyncHandler(async (req, res, next) => {
    let courses = await Course.findByPk(req.params.id);
    res.json(courses);
    return res.status(200).end();
}));

router.post('/courses', asyncHandler(async (req, res, next) => {
    try {
        await Course.create(req.body);
        console.log(req.body);
        res.location('/courses/:id'); //sets location header
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

router.put('/courses/:id', asyncHandler(async (req, res, next) => {
    try {
        let course = await Course.findByPk(req.params.id);
        if (course) {
            await course.update(req.body);
            console.log(req.body);
            res.status(204).end();
        } else {
            res.status(404).json({ "message": "Course not found" })
        }
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

router.delete('/courses/:id', asyncHandler(async (req, res, next) => {
    try {
        let course = await Course.findByPk(req.params.id);
        console.log(course);
        if (course) {
            await course.destroy();
            // console.log(req.body);
            res.status(204).end();
        }
    } catch (error){
        console.log('Error: ', error.name)
        if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
            const errors = error.errors.map(err => err.message);
            res.status(404).json('Validation errors: ', errors);
        } else {
            throw error;
        } 
    }
}))

module.exports = router;