import { Router } from 'express'
import { validate } from '../../middlewares/validate'
import { tasksController } from './tasks.controller'
import { createTaskDto, listTasksDto, updateTaskDto } from './tasks.dto'

const tasksRouter = Router()

tasksRouter.post('/', validate(createTaskDto), tasksController.create)
tasksRouter.get('/', validate(listTasksDto, 'query'), tasksController.list)
tasksRouter.get('/:id', tasksController.getById)
tasksRouter.patch('/:id', validate(updateTaskDto), tasksController.update)
tasksRouter.delete('/:id', tasksController.remove)

export default tasksRouter
