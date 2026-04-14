exports.handler = async function (event) {
  const isNetlify = Boolean(process.env.NETLIFY) || Boolean(process.env.NETLIFY_BUILD)
  const environment = process.env.CONTEXT || (isNetlify ? 'production' : 'local')
  const hasWeb3FormsKey = Boolean(process.env.WEB3FORMS_KEY)

  const logContext = {
    environment,
    isNetlify,
    netlifyContext: process.env.CONTEXT || null,
    hasWeb3FormsKey,
  }

  console.log('contact-submit function invoked', logContext)

  const jsonResponse = (statusCode, body) => ({
    statusCode,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  if (event.httpMethod !== 'POST') {
    console.warn('Invalid HTTP method', { method: event.httpMethod })
    return jsonResponse(405, { success: false, message: 'Method not allowed. Use POST.' })
  }

  if (!hasWeb3FormsKey) {
    console.error('Missing WEB3FORMS_KEY environment variable', logContext)
    return jsonResponse(500, {
      success: false,
      message: 'Server configuration error: WEB3FORMS_KEY is not configured.',
      debug: { environment, hasWeb3FormsKey },
    })
  }

  let payload = {}
  try {
    payload = JSON.parse(event.body || '{}')
  } catch (error) {
    console.error('Invalid JSON payload received', { error: error.message, rawBody: event.body })
    return jsonResponse(400, { success: false, message: 'Invalid JSON payload.', error: error.message })
  }

  const { name, email, phone, message } = payload
  const validationErrors = []

  const isNonEmptyString = value => typeof value === 'string' && value.trim().length > 0
  const isValidEmail = value => typeof value === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)

  if (!isNonEmptyString(name)) validationErrors.push('name is required')
  if (!isNonEmptyString(email) || !isValidEmail(email)) validationErrors.push('valid email is required')
  if (!isNonEmptyString(phone)) validationErrors.push('phone is required')
  if (!isNonEmptyString(message)) validationErrors.push('message is required')

  console.log('Payload validation', { payload, validationErrors })

  if (validationErrors.length > 0) {
    return jsonResponse(400, {
      success: false,
      message: 'Validation failed for contact form fields.',
      errors: validationErrors,
    })
  }

  const requestBody = {
    access_key: process.env.WEB3FORMS_KEY,
    name: name.trim(),
    email: email.trim(),
    phone: phone.trim(),
    message: message.trim(),
    subject: 'New contact request from portfolio',
    source: 'React Portfolio',
  }

  console.log('Submitting request to Web3Forms', {
    apiEndpoint: 'https://api.web3forms.com/submit',
    requestBody: {
      access_key: Boolean(requestBody.access_key),
      name: requestBody.name,
      email: requestBody.email,
      phone: requestBody.phone,
      message: requestBody.message,
      subject: requestBody.subject,
      source: requestBody.source,
    },
  })

  try {
    const response = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    })

    const responseText = await response.text()
    let responseJson = null
    try {
      responseJson = responseText ? JSON.parse(responseText) : null
    } catch (error) {
      console.warn('Web3Forms response not JSON', { error: error.message, responseText })
    }

    const apiLog = {
      status: response.status,
      statusText: response.statusText,
      responseText,
      responseJson,
    }
    console.log('Web3Forms API response', apiLog)

    if (!response.ok || !responseJson || responseJson.success !== true) {
      const errorMessage = responseJson?.message || 'Web3Forms submission failed.'
      console.error('Web3Forms submission error', { status: response.status, errorMessage, apiLog })
      return jsonResponse(response.ok ? 502 : response.status, {
        success: false,
        message: 'Web3Forms submission failed.',
        details: errorMessage,
        apiLog,
      })
    }

    return jsonResponse(200, {
      success: true,
      message: 'Message sent successfully.',
      debug: { environment, hasWeb3FormsKey, apiLog },
    })
  } catch (error) {
    console.error('Unexpected error while sending to Web3Forms', { error: error.message })
    return jsonResponse(500, {
      success: false,
      message: 'Server error while sending message.',
      error: error.message,
    })
  }
}
