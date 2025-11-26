/**
 *  * @deprecated Use the new API structure from '@/api' instead\n * This file is kept for backward compatibility\n */
 
 // Re-export everything from the new API structure\nexport * from '@/api';\n\n// Legacy exports for backward compatibility\nexport { apiClient as default } from '@/api';\nexport { API_BASE_URL as default as API_BASE_URL } from '@/api/client';\n\n/**\n * @deprecated Use API_BASE_URL from '@/api/client' instead\n */\nexport function createApiUrl(path: string): string {\n  const { API_BASE_URL } = require('@/api/client');\n  return `${API_BASE_URL}${path}`;\n}"