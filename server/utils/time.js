/**
 * Get current time in milliseconds.
 * If TEST_MODE=1 and x-test-now-ms header is present, use that.
 * Otherwise use Date.now().
 * 
 * @param {import('express').Request} req 
 * @returns {number}
 */
const getNow = (req) => {
  if (process.env.TEST_MODE === '1' && req.headers['x-test-now-ms']) {
    const testTime = parseInt(req.headers['x-test-now-ms'], 10);
    if (!isNaN(testTime)) {
      return testTime;
    }
  }
  return Date.now();
};

module.exports = { getNow };
