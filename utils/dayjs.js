import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'

dayjs.extend(utc)
dayjs.extend(timezone)

// default timezone: prefer NEXT_PUBLIC_APP_TIMEZONE (client), then APP_TIMEZONE (server), fallback UTC
const defaultTz = process.env.NEXT_PUBLIC_APP_TIMEZONE || process.env.APP_TIMEZONE || 'UTC'
try {
	dayjs.tz.setDefault(defaultTz)
} catch (e) {
	// if timezone data not available or invalid, fallback silently to UTC
	console.warn('dayjs tz setDefault failed, fallback to UTC', e)
}

export default dayjs
