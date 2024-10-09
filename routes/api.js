const express=require('express');
const {taskRouter, }= require('./tasks/task.router');
const api = express.Router();

api.use('/task',taskRouter);

module.exports= api;