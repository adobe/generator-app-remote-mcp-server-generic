/**
 * Utility functions for Adobe I/O Runtime actions
 */

/**
 * Returns a log ready string of the action input parameters.
 * The `Authorization` header content will be replaced by '<hidden>'.
 *
 * @param {object} params action input parameters.
 *
 * @returns {string}
 */
function stringParameters(params) {
  // hide authorization header
  let headers = params.__ow_headers || {}
  if (headers.authorization) {
    headers = { ...headers, authorization: '<hidden>' }
  }
  return JSON.stringify({ ...params, __ow_headers: headers })
}

/**
 * Returns the list of missing keys giving an object and its required keys.
 * A parameter is missing if its value is undefined or ''.
 * A header is missing if its value is undefined.
 *
 * @param {object} obj object to check.
 * @param {Array} required list of required keys.
 * @param {Array} requiredHeaders list of required headers.
 * @returns {Array}
 *
 */
function getMissingKeys(obj, required = [], requiredHeaders = []) {
  return required.filter(r => (typeof obj[r] === 'undefined' || obj[r] === '' || obj[r] === null))
    .concat(requiredHeaders.filter(h => typeof obj.__ow_headers[h] === 'undefined'))
}

/**
 * Returns the first error message given an object and its required keys.
 * A parameter is missing if its value is undefined or ''.
 * A header is missing if its value is undefined.
 *
 * @param {object} params action input parameters.
 * @param {Array} requiredHeaders list of required input headers.
 * @param {Array} requiredParams list of required input parameters.
 * @returns {string}
 *
 */
function checkMissingRequestInputs(params, requiredParams = [], requiredHeaders = []) {
  const missing = getMissingKeys(params, requiredParams, requiredHeaders)
  if (missing.length > 0) {
    return `missing parameter(s) '${missing}'`
  }
  return null
}

/**
 * Extracts the bearer token string from the Authorization header in the request parameters.
 *
 * @param {object} params action input parameters.
 *
 * @returns {string|undefined} the token string or undefined if not set.
 */
function getBearerToken(params) {
  if (params.__ow_headers &&
      params.__ow_headers.authorization &&
      params.__ow_headers.authorization.startsWith('Bearer ')) {
    return params.__ow_headers.authorization.substring('Bearer '.length)
  }
  return undefined
}

/**
 * Returns an error response object and attempts to log.info the status code and error message
 *
 * @param {number} statusCode the error status code.
 * @param {string} message the error message.
 * @param {*} [logger] an optional logger instance object with an `info` method
 * e.g. `new require('@adobe/aio-sdk').Core.Logger()`.
 *
 * @returns {object} the error object, ready to be returned from the action main's function.
 */
function errorResponse(statusCode, message, logger) {
  if (logger && typeof logger.info === 'function') {
    logger.info(`${statusCode}: ${message}`)
  }
  return {
    error: {
      statusCode,
      body: {
        error: message
      }
    }
  }
}

/**
 * Returns a success response object
 *
 * @param {object} body the response body.
 * @param {number} [statusCode=200] the response status code.
 *
 * @returns {object} the response object, ready to be returned from the action main's function.
 */
function successResponse(body, statusCode = 200) {
  return {
    statusCode,
    body
  }
}

module.exports = {
  errorResponse,
  successResponse,
  stringParameters,
  checkMissingRequestInputs,
  getBearerToken
}
