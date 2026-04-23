import { Router } from 'express'
import { roleMiddleware } from '../../middlewares/role'
import { validate } from '../../middlewares/validate'
import { companiesController } from './companies.controller'
import { updateCompanyDto } from './companies.dto'

const companyRouter = Router()

companyRouter.get('/current', companiesController.getCurrent)
companyRouter.patch(
	'/current',
	roleMiddleware('ADMIN'),
	validate(updateCompanyDto),
	companiesController.updateCurrent
)

export default companyRouter
