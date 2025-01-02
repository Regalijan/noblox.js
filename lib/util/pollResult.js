// Includes
const http = require('./http.js').func
const RobloxAPIError = require('./apiError.js')

// Args
exports.required = ['url']
exports.optional = ['jar']

// Docs
/**
 * 🔐 ☁️ Handle operations requiring polling.
 * @category Utility
 * @alias pollResult
 * @param {string} url - The url of the operation.
 * @returns {Promise<OperationResponse>}
 * @example const noblox = require("noblox.js")
 * const response = await noblox.pollResult("https://apis.roblox.com/api/v1/operations/operationId")
**/

// Define
exports.func = async function (args) {
  const httpOpt = {
    url: args.url,
    options: {
      jar: args.jar,
      method: 'GET',
      resolveWithFullResponse: true
    }
  }

  let attempts = 0

  while (attempts < 5) {
    const response = await http(httpOpt)
    attempts++

    if (response.statusCode !== 200) {
      throw new RobloxAPIError(response)
    }

    const body = JSON.parse(response.body)

    if (body.done || attempts === 5) {
      return body
    }

    await new Promise(resolve => setTimeout(resolve, 2 ** attempts * 1000))
  }
}
