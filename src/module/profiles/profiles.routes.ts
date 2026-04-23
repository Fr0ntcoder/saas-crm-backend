import { Router } from 'express'
import { validate } from '../../middlewares/validate'
import { profilesController } from './profiles.controller'
import { teamQueryDto, updateMeDto } from './profiles.dto'

const profilesRouter = Router()

profilesRouter.get('/me', profilesController.me)
profilesRouter.patch('/me', validate(updateMeDto), profilesController.updateMe)
profilesRouter.get(
	'/team',
	validate(teamQueryDto, 'query'),
	profilesController.listTeam
)

export default profilesRouter
