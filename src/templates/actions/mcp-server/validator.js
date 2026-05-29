/*
Copyright 2022 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

/**
 * Request authentication for the MCP server action.
 * - IMS: validate Bearer token via Adobe IMS userinfo
 * - API key: require Authorization Bearer or x-api-key to match SERVICE_API_KEY
 */

const IMS_USERINFO_URL = "https://ims-na1.adobelogin.com/ims/userinfo/v2";

/**
 * Normalize request headers to lowercase keys.
 * @param {Record<string, string>} raw
 * @returns {Record<string, string>}
 */
function getHeadersNormalized(raw) {
  if (!raw || typeof raw !== "object") return {};
  return Object.keys(raw).reduce((acc, k) => {
    acc[k.toLowerCase()] = raw[k];
    return acc;
  }, {});
}

/**
 * Extract Bearer token or x-api-key from request params (__ow_headers).
 * @param {Record<string, any>} params
 * @returns {string}
 */
function getTokenFromRequest(params) {
  const h = getHeadersNormalized(params.__ow_headers);
  const authHeader = h["authorization"];
  const apiKey = h["x-api-key"];
  const bearer = authHeader && authHeader.startsWith("Bearer ") ? authHeader.slice(7).trim() : "";
  return bearer || apiKey || "";
}

/**
 * Validate Bearer token with Adobe IMS userinfo endpoint.
 * GET ims/userinfo/v2 with Authorization: Bearer <token>; 200 => valid.
 * @param {string} token - Bearer token (no "Bearer " prefix)
 * @param {{ info?: (...args: any[]) => void, warn?: (...args: any[]) => void }} logger
 * @returns {Promise<{ valid: boolean, userInfo?: object, error?: string }>}
 */
async function validateTokenWithIms(token, logger = console) {
  if (!token || typeof token !== "string" || !token.trim()) {
    return { valid: false, error: "Missing token" };
  }
  try {
    const res = await fetch(IMS_USERINFO_URL, {
      method: "GET",
      headers: { Authorization: `Bearer ${token.trim()}` },
    });
    if (res.ok) {
      const userInfo = await res.json().catch(() => ({}));
      try { logger.info("[auth] IMS token valid", { status: res.status }); } catch {}
      return { valid: true, userInfo };
    }
    const text = await res.text().catch(() => "");
    try { logger.warn("[auth] IMS userinfo rejected token", { status: res.status, body: text.slice(0, 200) }); } catch {}
    return {
      valid: false,
      error: res.status === 401 ? "Invalid or expired token" : `Token validation failed (${res.status})`,
    };
  } catch (e) {
    try { logger.warn("[auth] IMS userinfo request failed", e?.message || e); } catch {}
    return { valid: false, error: "Token validation unavailable" };
  }
}

/**
 * Validate request auth.
 * - If AUTH_VALIDATE_IMS is true: require Authorization: Bearer <token>, validate via IMS userinfo.
 * - Else if SERVICE_API_KEY is set: require same key in Authorization Bearer or x-api-key.
 * - Else: no auth required.
 * @param {Record<string, any>} params - action params (__ow_headers, SERVICE_API_KEY, AUTH_VALIDATE_IMS)
 * @param {{ info?: (...args: any[]) => void, warn?: (...args: any[]) => void }} logger
 * @returns {Promise<{ error?: string, token?: string, userInfo?: object }>} error set if invalid; token/userInfo set when IMS-validated
 */
async function validateRequestAuth(params, logger = console) {
  const token = getTokenFromRequest(params);
  const useIms = String(params.AUTH_VALIDATE_IMS || "").toLowerCase() === "true";
  const serviceKey = params.SERVICE_API_KEY && String(params.SERVICE_API_KEY).trim();

  if (useIms) {
    if (!token) {
      return { 
        error: "IMS Authentication Required: No Bearer token provided. " +
               "This MCP server has IMS token validation enabled (AUTH_VALIDATE_IMS=true). " +
               "Please provide a valid Adobe IMS access token in the Authorization header " +
               "(format: 'Authorization: Bearer YOUR_IMS_TOKEN') or via the x-api-key header. " +
               "Configure your MCP client (Cursor/Claude) with the 'Authorization' or 'x-api-key' header. " +
               "See server documentation for configuration examples."
      };
    }
    const result = await validateTokenWithIms(token, logger);
    if (result.valid) return { token, userInfo: result.userInfo };
    return { 
      error: `IMS Authentication Failed: ${result.error || "Invalid or expired token"}. ` +
             "Please ensure you're using a valid Adobe IMS access token. " +
             "You may need to refresh your token if it has expired."
    };
  }

  if (serviceKey) {
    if (!token) {
      return { 
        error: "API Key Authentication Required: No API key provided. " +
               "This MCP server requires an API key (SERVICE_API_KEY is configured). " +
               "Please provide the API key in the Authorization header " +
               "(format: 'Authorization: Bearer YOUR_API_KEY') or via the x-api-key header."
      };
    }
    if (token === serviceKey) return {};
    return { 
      error: "API Key Authentication Failed: Invalid API key provided. " +
             "The API key does not match the configured SERVICE_API_KEY. " +
             "Please check your API key and try again."
    };
  }

  return {};
}

module.exports = {
  getHeadersNormalized,
  getTokenFromRequest,
  validateTokenWithIms,
  validateRequestAuth,
};
