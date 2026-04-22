import { Router } from 'express'
import { validate } from '../../middlewares/validate'
import { clientsController } from './clients.controller'
import { createClientDto, listClientsDto, updateClientDto } from './clients.dto'

const clientsRouter = Router()

clientsRouter.post('/', validate(createClientDto), clientsController.create)
clientsRouter.get('/', validate(listClientsDto), clientsController.list)
clientsRouter.get('/:id', clientsController.getById)
clientsRouter.patch('/:id', validate(updateClientDto), clientsController.update)
clientsRouter.delete('/:id', clientsController.remove)

export default clientsRouter
