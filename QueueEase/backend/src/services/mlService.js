/**
 * QueueEase V2 — ML Service Client
 * Communicates with the FastAPI ML microservice for wait-time predictions.
 */

const axios = require('axios');
const config = require('../config');

const mlClient = axios.create({
  baseURL: config.mlService.url,
  timeout: 10000,
  headers: {
    'X-API-Key': config.mlService.apiKey,
    'Content-Type': 'application/json',
  },
});

/**
 * Check ML service health
 */
async function checkHealth() {
  try {
    const response = await mlClient.get('/health');
    return response.data;
  } catch (error) {
    console.error('ML Service health check failed:', error.message);
    return { status: 'unhealthy', error: error.message };
  }
}

/**
 * Get model info
 */
async function getModelInfo() {
  try {
    const response = await mlClient.get('/info');
    return response.data;
  } catch (error) {
    console.error('ML Service get info failed:', error.message);
    return null;
  }
}

/**
 * Predict wait time for a single patient
 * @param {object} features - Feature values for prediction
 */
async function predictWaitTime(features) {
  try {
    const response = await mlClient.post('/predict', features);
    return response.data;
  } catch (error) {
    console.error('ML prediction failed:', error.message);
    // Return a fallback estimate
    return {
      predicted_wait_minutes: Math.max(5, (features.patients_ahead || 3) * 12),
      confidence: 0.5,
      fallback: true,
    };
  }
}

/**
 * Batch predict wait times
 * @param {object[]} featuresList - Array of feature objects
 */
async function batchPredictWaitTime(featuresList) {
  try {
    const response = await mlClient.post('/predict/batch', {
      predictions: featuresList,
    });
    return response.data;
  } catch (error) {
    console.error('ML batch prediction failed:', error.message);
    return {
      predictions: featuresList.map(f => ({
        predicted_wait_minutes: Math.max(5, (f.patients_ahead || 3) * 12),
        confidence: 0.5,
        fallback: true,
      })),
    };
  }
}

/**
 * Get feature importances
 */
async function getFeatureImportances() {
  try {
    const response = await mlClient.get('/model/importances');
    return response.data;
  } catch (error) {
    console.error('ML feature importances failed:', error.message);
    return null;
  }
}

module.exports = {
  checkHealth,
  getModelInfo,
  predictWaitTime,
  batchPredictWaitTime,
  getFeatureImportances,
};
