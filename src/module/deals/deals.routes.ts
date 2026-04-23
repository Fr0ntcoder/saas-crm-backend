import { Router } from 'express'
import { validate } from '../../middlewares/validate'
import { dealsController } from './deals,controller'
import { createDealDto, listDealDto, updateDealDto } from './deals.dto'

const dealsRouter = Router()

dealsRouter.post('/', validate(createDealDto), dealsController.create)
dealsRouter.get('/', validate(listDealDto, 'query'), dealsController.list)
dealsRouter.get('/:id', dealsController.getById)
dealsRouter.patch('/:id', validate(updateDealDto), dealsController.update)
dealsRouter.delete('/:id', dealsController.remove)

export default dealsRouter
