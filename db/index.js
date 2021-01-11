'use strict';

const Sequelize = require('sequelize');
const fs = require('fs');
const path = require('path');

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: 'fsjstd-restapi.db'
});

const models = {};

//import all of the models
fs
    .readdirSync(path.join(__dirname, 'models'))
    .forEach((file) => {
        console.info(`Importing database model from file: ${file}`);
        const model = require(path.join(__dirname, 'models', file))(sequelize, Sequelize.DataTypes);
        models[model.name] = model;
    });

//Call method to create associations
Object.keys(models).forEach((modelName) =>{
    if(models[modelName].associate) {
        console.info(`Configuring the associations for the ${modelName} model`);
        models[modelName].associate(models);
    }
});

module.exports = {
    sequelize,
    Sequelize,
    models
};