// Includes
const upload = require('../util/upload.js')
const { createReadStream } = require('fs')

// Args
exports.required = ['data']
exports.optional = ['itemOptions', 'assetId', 'jar']

// Docs
/**
 * 🔐 Upload an animation, either as a new asset or by overwriting an existing animation.
 * @category Asset
 * @alias uploadAnimation
 * @param {string | Stream} data - The rbxm file containing the KeyframeSequence.
 * @param {object=} itemOptions - The options for the upload. Only optional if assetId is not provided.
 * @param {string=} itemOptions.name - The name of the animation.
 * @param {string=} itemOptions.description - The description for the animation.
 * @param {number=} itemOptions.groupId - The group to upload the animation to. This is ignored if the assetId is provided.
 * @param {number=} assetId - An existing assetId to overwrite.
 * @returns {Promise<number>}
 * @example const noblox = require("noblox.js")
 * const fs = require("fs")
 * // Login using your cookie
 * const assetId = await noblox.uploadAnimation(fs.readFileSync("./KeyframeSequence.rbxm"), {
 *  name: "A cool animation",
 *  description: "This is a very cool animation"
 * }, 7132858975)
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
        assetType: 'Animation',
        file: data,
        ...itemOptions
      }
    },
    jar
  )

  return parseInt(operation.response.assetId)
}
