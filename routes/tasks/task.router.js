const express=require('express');
const {httpAddNewTask, }= require('./task.controller');

const taskRouter = express.Router();

taskRouter.post('/',httpAddNewTask);

module.exports ={
taskRouter,
}
