'use strict';

const express = require('express');
const router = express.Router();
const db = require('./db');
const { User, Course } = db.models;