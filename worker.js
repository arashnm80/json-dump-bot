/////////////////////////////////////////////////////////////////////////////////
// serverless telegram bot connected to database channel
// Creator: Arashnm80
// https://github.com/arashnm80/worker-telegram-bot-with-database-channel
/////////////////////////////////////////////////////////////////////////////////

const TOKEN = "" // put token from botfather here
// then register webhook so the bot will be enabled

/////////////////////////////////////////////////////////////////////////////////

// other vars
const WEBHOOK = '/endpoint' // don't change it unless you're a programmer and you know what you're doing
const SECRET = TOKEN.replace(/[^a-zA-Z0-9]/g, ''); // get SECRET from TOKEN, we could've set it manually to a random value with (A-Z, a-z, 0-9, _ and -) too
const promoteMessage = 0 // set it to a non-zero id of a message to be sent as ad after every command (leave it to 0 if you don't need)

/**
 * Wait for requests to the worker
 */
addEventListener('fetch', event => {
  const url = new URL(event.request.url)
  if (url.pathname === WEBHOOK) {
    event.respondWith(handleWebhook(event))
  } else if (url.pathname === '/registerWebhook') {
    event.respondWith(registerWebhook(event, url, WEBHOOK, SECRET))
  } else if (url.pathname === '/unRegisterWebhook') {
    event.respondWith(unRegisterWebhook(event))
  } else {
    event.respondWith(new Response('No handler for this request'))
  }
})

/**
 * Handle requests to WEBHOOK
 * https://core.telegram.org/bots/api#update
 */
async function handleWebhook (event) {
  // Check secret
  if (event.request.headers.get('X-Telegram-Bot-Api-Secret-Token') !== SECRET) {
    return new Response('Unauthorized', { status: 403 })
  }

  // Read request body synchronously
  const update = await event.request.json()
  // Deal with response asynchronously
  event.waitUntil(onUpdate(update))

  return new Response('Ok')
}

/**
 * Handle incoming Update
 * https://core.telegram.org/bots/api#update
 */
async function onUpdate (update) {
  if ('message' in update) {
    await onMessage(update.message)
  }
}

/**
 * Handle incoming Message
 * https://core.telegram.org/bots/api#message
 */
async function onMessage (message) {
  var returnMessage = JSON.stringify(message, null, 2)
  returnMessage = "<pre>" + returnMessage + "</pre>\n@JSON_Dump_Bot"
  var mainMessage = sendPlainText(message.chat.id, returnMessage)
  
  // Wait for 0.5 second
  await delay(500);

  var secondMessage = sendPlainText(message.chat.id, "More high quality bots:\n@Arashnm80\_Channel")
  return secondMessage
}

/**
 * Send plain text message
 * https://core.telegram.org/bots/api#sendmessage
 */
async function sendPlainText (chatId, text) {
  return (await fetch(apiUrl('sendMessage', {
    chat_id: chatId,
    text,
    parse_mode: "html"
  }))).json()
}

/**
 * Set webhook to this worker's url
 * https://core.telegram.org/bots/api#setwebhook
 */
async function registerWebhook (event, requestUrl, suffix, secret) {
  // https://core.telegram.org/bots/api#setwebhook
  const webhookUrl = `${requestUrl.protocol}//${requestUrl.hostname}${suffix}`
  const r = await (await fetch(apiUrl('setWebhook', { url: webhookUrl, secret_token: secret }))).json()
  return new Response('ok' in r && r.ok ? 'Ok' : JSON.stringify(r, null, 2))
}

/**
 * Remove webhook
 * https://core.telegram.org/bots/api#setwebhook
 */
async function unRegisterWebhook (event) {
  const r = await (await fetch(apiUrl('setWebhook', { url: '' }))).json()
  return new Response('ok' in r && r.ok ? 'Ok' : JSON.stringify(r, null, 2))
}

/**
 * Return url to telegram api, optionally with parameters added
 */
function apiUrl (methodName, params = null) {
  let query = ''
  if (params) {
    query = '?' + new URLSearchParams(params).toString()
  }
  return `https://api.telegram.org/bot${TOKEN}/${methodName}${query}`
}

// Define the delay function
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
