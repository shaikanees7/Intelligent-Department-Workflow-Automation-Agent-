/**
 * Permission Intent Validation Service
 * 
 * Provides an interface to the Permission Intent Validation Agent,
 * evaluating student applications using Groq LPU models (openai/gpt-oss-120b)
 * to verify legitimate institutional intent before submission and database persistence.
 */

const PermissionIntentAgent = require('../agents/permissionIntentAgent');
const logger = require('../utils/logger');

class PermissionIntentService {
  /**
   * Validates student permission request intent against institutional rules
   * 
   * @param {Object} params
   * @param {string} params.subject - Application Subject / Title
   * @param {string} params.reason - Detailed reason or description
   * @param {string} [params.request_type='OD'] - Category of request
   * @param {string} [params.start_date] - Start date
   * @param {string} [params.end_date] - End date
   * @returns {Promise<Object>} Formatted validation contract
   */
  static async validateIntent({ subject = '', reason = '', request_type = 'OD', start_date = '', end_date = '' } = {}) {
    try {
      return await PermissionIntentAgent.validateIntent({
        subject,
        reason,
        request_type,
        start_date,
        end_date
      });
    } catch (err) {
      logger.error(`[PermissionIntentService] Validation failed: ${err.message}`);
      // Fallback to heuristic classification for 100% availability
      return PermissionIntentAgent.heuristicClassification(subject, reason, request_type);
    }
  }
}

module.exports = PermissionIntentService;
