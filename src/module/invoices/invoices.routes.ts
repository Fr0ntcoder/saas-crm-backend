import { Router } from 'express'
import { validate } from '../../middlewares/validate'
import { invoicesController } from './invoices.controller'
import {
	createInvoiceDto,
	listInvoicesDto,
	updateInvoiceDto
} from './invoices.dto'

const invoicesRouter = Router()

invoicesRouter.post('/', validate(createInvoiceDto), invoicesController.create)
invoicesRouter.get(
	'/',
	validate(listInvoicesDto, 'query'),
	invoicesController.list
)
invoicesRouter.get('/:id', invoicesController.getById)
invoicesRouter.patch(
	'/:id',
	validate(updateInvoiceDto),
	invoicesController.update
)
invoicesRouter.delete('/:id', invoicesController.remove)

export default invoicesRouter
