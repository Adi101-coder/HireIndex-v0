import type { VercelRequest, VercelResponse } from '@vercel/node';
import multer from "multer";
import { extractTextFromDocument, isValidFileType } from "../../server/document-parser";
import { isResumeDocument, analyzeResumeWithGemini } from "../../server/gemini";
import crypto from "crypto";

// Configure multer for file uploads (store in memory)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Check file type
    if (isValidFileType(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only PDF and DOCX files are allowed.") as any);
    }
  },
});

// In-memory cache for resume analysis results
const resumeCache: Record<string, any> = {};

// Add CORS headers for Vercel
const addCorsHeaders = (res: VercelResponse) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
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
  upload.single("file")(req as any, res as any, async (err) => {
    if (err) {
      console.error("Multer error:", err);
      return res.status(400).json({ message: err.message });
    }

    try {
      console.log("Resume upload request received");
      const file = (req as any).file;
      
      if (!file) {
        console.log("No file uploaded");
        return res.status(400).json({ message: "No file uploaded" });
      }

      console.log("File received:", {
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: file.size
      });

      // Extract text from the document
      let text: string;
      try {
        text = await extractTextFromDocument(file.buffer, file.mimetype);
        console.log("Text extracted successfully, length:", text.length);
      } catch (extractError) {
        console.error("Error extracting text:", extractError);
        return res.status(400).json({ 
          message: extractError instanceof Error ? extractError.message : "Failed to extract text from document" 
        });
      }
      
      // Hash the resume text for caching
      const hash = crypto.createHash('sha256').update(text).digest('hex');
      if (resumeCache[hash]) {
        console.log("Returning cached result");
        return res.status(200).json(resumeCache[hash]);
      }

      // Check if the document is a resume using Gemini
      let isResume: boolean;
      try {
        isResume = await isResumeDocument(text);
        console.log("Resume check result:", isResume);
      } catch (resumeCheckError) {
        console.error("Error checking if document is resume:", resumeCheckError);
        isResume = true;
      }

      if (!isResume) {
        const notResumeResult = {
          id: Date.now(),
          filename: file.originalname,
          fileType: file.mimetype,
          createdAt: new Date().toISOString(),
          overallScore: 0,
          keywordsScore: 0,
          experienceScore: 0,
          skillsScore: 0,
          educationScore: 0,
          formattingScore: 0,
          feedback: {
            keywords: "This document does not appear to be a resume. Please upload a valid resume (CV) for analysis.",
            experience: "This document does not appear to be a resume. Please upload a valid resume (CV) for analysis.",
            skills: "This document does not appear to be a resume. Please upload a valid resume (CV) for analysis.",
            education: "This document does not appear to be a resume. Please upload a valid resume (CV) for analysis.",
            formatting: "This document does not appear to be a resume. Please upload a valid resume (CV) for analysis."
          },
          improvementSuggestions: [
            "Please upload a resume or CV document for accurate analysis."
          ]
        };
        resumeCache[hash] = notResumeResult;
        return res.status(200).json(notResumeResult);
      }
      
      // Analyze the resume using Gemini
      let analysisResult: any;
      try {
        analysisResult = await analyzeResumeWithGemini(text);
        console.log("Analysis completed successfully");
      } catch (analysisError) {
        console.error("Error analyzing resume with Gemini:", analysisError);
        // Return a fallback analysis if Gemini fails
        analysisResult = {
          overallScore: 70,
          keywordsScore: 70,
          experienceScore: 70,
          skillsScore: 70,
          educationScore: 70,
          formattingScore: 70,
          feedback: {
            keywords: "Unable to analyze keywords due to technical issues. Please try again later.",
            experience: "Unable to analyze experience due to technical issues. Please try again later.",
            skills: "Unable to analyze skills due to technical issues. Please try again later.",
            education: "Unable to analyze education due to technical issues. Please try again later.",
            formatting: "Unable to analyze formatting due to technical issues. Please try again later."
          },
          improvementSuggestions: [
            "Please try uploading your resume again in a few moments.",
            "Ensure your resume is in PDF or DOCX format.",
            "Check that your resume contains clear sections for experience, skills, and education."
          ]
        };
      }

      const result = {
        id: Date.now(),
        filename: file.originalname,
        fileType: file.mimetype,
        createdAt: new Date().toISOString(),
        ...analysisResult
      };
      resumeCache[hash] = result;
      console.log("Analysis result cached and returning");
      return res.status(200).json(result);
    } catch (error) {
      console.error("Error analyzing resume:", error);
      return res.status(500).json({ 
        message: error instanceof Error ? error.message : "An error occurred while analyzing the resume" 
      });
    }
  });
} 