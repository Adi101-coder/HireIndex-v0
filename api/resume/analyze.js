const multer = require("multer");

// Configure multer for file uploads (store in memory)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

// Add CORS headers for Vercel
const addCorsHeaders = (res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
};

module.exports = async function handler(req, res) {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    addCorsHeaders(res);
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    addCorsHeaders(res);
    return res.status(405).json({ message: 'Method not allowed' });
  }

  addCorsHeaders(res);

  // Use multer to handle file upload
  upload.single("file")(req, res, async (err) => {
    if (err) {
      console.error("Multer error:", err);
      return res.status(400).json({ message: err.message });
    }

    try {
      console.log("Resume upload request received");
      const file = req.file;
      
      if (!file) {
        console.log("No file uploaded");
        return res.status(400).json({ message: "No file uploaded" });
      }

      console.log("File received:", {
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: file.size
      });

      // For now, return a simple response to test the API
      const result = {
        id: Date.now(),
        filename: file.originalname,
        fileType: file.mimetype,
        createdAt: new Date().toISOString(),
        overallScore: 75,
        keywordsScore: 75,
        experienceScore: 75,
        skillsScore: 75,
        educationScore: 75,
        formattingScore: 75,
        feedback: {
          keywords: "File uploaded successfully. Analysis will be implemented soon.",
          experience: "File uploaded successfully. Analysis will be implemented soon.",
          skills: "File uploaded successfully. Analysis will be implemented soon.",
          education: "File uploaded successfully. Analysis will be implemented soon.",
          formatting: "File uploaded successfully. Analysis will be implemented soon."
        },
        improvementSuggestions: [
          "API is working correctly!",
          "File upload functionality is operational.",
          "Full analysis will be implemented in the next update."
        ]
      };

      console.log("Returning test result");
      return res.status(200).json(result);
    } catch (error) {
      console.error("Error processing request:", error);
      return res.status(500).json({ 
        message: error instanceof Error ? error.message : "An error occurred while processing the request" 
      });
    }
  });
}; 