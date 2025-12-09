import { NextApiRequest, NextApiResponse } from 'next'

// Proxy API: forwards requests to the backend set in NEXT_PUBLIC_BACKEND_API
export default async function handler(req, res) {
  const { path } = req.query
  const pathname = Array.isArray(path) ? path.join('/') : path || ''
  const targetBase = process.env.NEXT_PUBLIC_BACKEND_API || process.env.NEXT_PUBLIC_BASE_API || ''
  if (!targetBase) {
    res.status(500).json({ error: 'NEXT_PUBLIC_BACKEND_API not configured' })
    return
  }

  const targetUrl = `${targetBase.replace(/\/$/, '')}/${pathname}`
  try {
    const fetchOptions = {
      method: req.method,
      headers: { ...req.headers },
      redirect: 'follow'
    }

    // Remove host and connection headers to avoid passing local container info
    delete fetchOptions.headers.host
    delete fetchOptions.headers.connection

    // When there is a body, forward it appropriately
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      fetchOptions.body = req.body && Object.keys(req.body || {}).length ? JSON.stringify(req.body) : undefined
      fetchOptions.headers['content-type'] = fetchOptions.headers['content-type'] || 'application/json'
    }

    const r = await fetch(targetUrl, fetchOptions)
    const contentType = r.headers.get('content-type') || ''
    res.status(r.status)

    // forward headers
    r.headers.forEach((value, name) => {
      res.setHeader(name, value)
    })

    const buffer = await r.arrayBuffer()
    const body = Buffer.from(buffer)
    res.send(body)
  } catch (err) {
    console.error('Proxy error:', err)
    res.status(502).json({ error: 'Bad Gateway', detail: err.message })
  }
}
