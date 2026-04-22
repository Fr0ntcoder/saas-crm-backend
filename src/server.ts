import { app } from './app'
import { env } from './config/env.config'

app.listen(env.PORT, () => {
	console.log('CRM backend listening on http://localhost:3000')
})
