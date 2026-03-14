// Test for URL Shortener redirect functionality

const assert = require('assert');

// Example test for verifying redirect behavior
async function testShortUrlRedirect() {
  const url = 'http://localhost:3000'; // Base URL
  const fullUrl = 'https://www.freecodecamp.org'; // Original URL
  const shortenedUrlVariable = 1; // Short URL ID
  
  try {
    const getResponse = await fetch(url + '/api/shorturl/' + shortenedUrlVariable);
    if (getResponse) {
      const { redirected, url: finalUrl } = getResponse;
      assert.isTrue(redirected); // The test runner crashes here if redirect failed
      assert.strictEqual(finalUrl, fullUrl);
      console.log('✓ Redirect test passed!');
    }
  } catch (err) {
    console.error('✗ Redirect test failed:', err.message);
  }
}

// Run test
testShortUrlRedirect();
