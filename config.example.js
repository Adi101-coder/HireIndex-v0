// Example configuration file
// Copy this to config.js and fill in your actual values

module.exports = {
  // Database Configuration
  DATABASE_URL: process.env.DATABASE_URL || 'postgresql://username:password@localhost:5432/hireindex',
  
  // Gemini API Configuration
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || 'your-gemini-api-key-here',
  
  // Server Configuration
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development'
}; 