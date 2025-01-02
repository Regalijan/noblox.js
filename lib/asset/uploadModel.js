// Includes
const upload = require('../util/upload.js').func
const { createReadStream } = require('fs')

// Args
exports.required = ['data']
exports.optional = ['itemOptions', 'assetId', 'jar']

// Docs
/**
 * 🔐 Upload a model.
 * @category Asset
 * @alias uploadModel
 * @param {string | Stream} data - The model data.
 * @param {object=} itemOptions - The options for the upload.
 * @param {string=} itemOptions.name - The name of the model.
 * @param {string=} itemOptions.description - The description for the model.
 * @param {number=} itemOptions.groupId - The group to upload the model to.
 * @param {number=} assetId - An existing assetId to overwrite.
 * @returns {Promise<UploadModelResponse>}
 * @example const noblox = require("noblox.js")
 * const fs = require("fs")
 * // Login using your cookie
 * noblox.uploadModel(fs.readFileSync("./model.rbxm"), {
 *  name: "A cool model",
 *  description: "This is a very cool model",
 *  copyLocked: false, //The asset is allowed to be copied.
 *  allowComments: false,
 *  groupId: 1
 * }, 1117747196)
**/

// Define
exports.func = async function (args) {
  let { assetId, data, itemOptions, jar } = args

  if (assetId) assetId = assetId.toString()
  if (typeof data === 'string') data = createReadStream(data)

  const operation = await upload(
    {
      uploadOptions: {
        assetId,
        assetType: 'Model',
        file: data,
        ...itemOptions
      }
    },
    jar
  )

  return {
    AssetId: parseInt(operation.response.assetId),
    AssetVersionId: parseInt(operation.response.revisionId)
  }
}
