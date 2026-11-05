/**
 * Groq AI Routing Service
 * Handles classification and office routing using Groq's high-efficiency LPU models (openai/gpt-oss-120b)
 */
const GeminiRoutingService = require('./geminiRouting.service');

// Export Groq routing service as first-class provider
module.exports = GeminiRoutingService;

