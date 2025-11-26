/**
 * API Health Check Utility
 * Use this to test if your API is accessible
 */

export async function checkApiHealth(baseUrl: string = 'https://localhost:5001'): Promise<boolean> {
  try {
    // Try to make a simple request to see if API is accessible
    const response = await fetch(`${baseUrl}/health`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });
    
    return response.ok;
  } catch (error) {
    console.error('API Health Check Failed:', error);
    return false;
  }
}

export async function testApiEndpoints() {
  const baseUrl = 'https://localhost:5001';
  
  console.log('🔍 Testing API endpoints...');
  console.log(`Base URL: ${baseUrl}`);
  
  // Test basic connectivity
  const isHealthy = await checkApiHealth(baseUrl);
  console.log(`Health check: ${isHealthy ? '✅' : '❌'}`);
  
  // Test auth endpoint
  try {
    const response = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@test.com',
        password: 'test123'
      })
    });
    
    console.log(`Auth endpoint: ${response.status} ${response.statusText}`);
  } catch (error) {
    console.log('Auth endpoint: ❌ Connection failed');
    console.error(error);
  }
}

// Auto-run test in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  // Run test after a short delay to avoid blocking
  setTimeout(() => {
    testApiEndpoints();
  }, 2000);
}