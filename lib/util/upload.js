// Includes
const http = require('./http.js')
const getAuthenticatedUser = require('./getAuthenticatedUser.js')
const getGeneralToken = require('./getGeneralToken.js')
const RobloxAPIError = require('./apiError.js')

// Args
exports.required = ['uploadOptions']
exports.optional = ['jar']

// Docs
/**
 * 🔐 Uploads an asset to Roblox
 * @category Utility
 * @alias upload
 * @param {object} uploadOptions - The options for the upload
 * @param {number=} uploadOptions.assetId - The ID of the asset (only for overwriting models and animations)
 * @param {string=} uploadOptions.assetType - The type of asset being uploaded
 * @param {string=} uploadOptions.description - The description of the asset being uploaded
 * @param {string=} uploadOptions.displayName - The name of the asset being uploaded
 * @param {ReadStream} uploadOptions.file - The file to upload
 * @param {number=} uploadOptions.groupId - The group to upload the asset under
 * @returns {OperationResponse}
 * @example const noblox = require('noblox.js')
 * // Log in
 * await noblox.upload({
 *   uploadOptions: {
 *     assetType: "Model",
 *     displayName: "test",
 *     description: "test",
 *     file: fs.createReadStream("./test.rbxm")
 *     assetId: 1,
 *     groupId: 2
 *   }
 * })
**/

// Define
exports.func = async function (args) {
  const { jar, uploadOptions } = args
  const token = await getGeneralToken({ jar })
  let url = '//apis.roblox.com/assets/user-auth/v1/assets'
  let userId

  if (!uploadOptions.groupId) {
    const authData = await getAuthenticatedUser({ jar })
    userId = authData.id.toString()
  }

  if (uploadOptions.assetId) url += `/${uploadOptions.assetId}`

  let mimeType

  if (uploadOptions.file) {
    // form-data will not catch these so they must be set manually
    if (uploadOptions.file.path.endsWith('.rbxm')) mimeType = 'model/x-rbmx'
    else if (uploadOptions.file.path.endsWith('.fbx')) mimeType = 'model/fbx'
  }

  const formData = {
    request: {
      value: JSON.stringify({
        assetId: uploadOptions.assetId.toString(),
        assetType: uploadOptions.assetType,
        creationContext: uploadOptions.assetId
          ? undefined
          : {
              creator: uploadOptions.groupId
                ? {
                    groupId: uploadOptions.groupId.toString()
                  }
                : {
                    userId
                  }
            },
        displayName: uploadOptions.displayName,
        description: uploadOptions.description
      }),
      type: 'application/json'
    }
  }

  if (uploadOptions.file) {
    formData.fileContent = {
      value: uploadOptions.file,
      type: mimeType
    }
  }

  const opts = {
    url,
    options: {
      method: uploadOptions.assetId ? 'PATCH' : 'POST',
      headers: {
        'x-csrf-token': token
      },
      resolveWithFullResponse: true,
      formData,
      jar
    }
  }

  const response = await http(opts)

  if (response.statusCode !== 200) { throw new RobloxAPIError(response) }

  const body = JSON.parse(response.body)

  if (body.response) {
    body.response.revisionCreateTime = new Date(body.response.revisionCreateTime)
  }

  return JSON.parse(response.body)
}
