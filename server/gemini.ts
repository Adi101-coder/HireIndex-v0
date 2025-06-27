// Define ResumeAnalysisResult interface directly here, matching the previous structure
export interface ResumeAnalysisResult {
  overallScore: number;
  keywordsScore: number;
  experienceScore: number;
  skillsScore: number;
  educationScore: number;
  formattingScore: number;
  feedback: {
    keywords: string;
    experience: string;
    skills: string;
    education: string;
    formatting: string;
  };
  improvementSuggestions: string[];
}

import fetch from "node-fetch";

// Get API key from environment variable with fallback
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "your-gemini-api-key-here";
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=" + GEMINI_API_KEY;
const GEMINI_TIMEOUT_MS = 30000; // 30 seconds

const SYSTEM_PROMPT = `You are an expert ATS (Applicant Tracking System) resume analyzer. Score the resume realistically, not overly strict. Most good resumes should score between 60 and 85. Be encouraging and provide actionable feedback for each section.

Strictly evaluate the following resume as a real ATS would, using these criteria:
- Keyword & phrase match for the target job
- Work experience relevance and quantification
- Skills match (technical and soft)
- Education completeness
- Formatting & structure (ATS-friendly, no images, simple layout, clear sections)

For each category, give a score out of 100.
For each section, provide 1-2 sentences of feedback.
Return your response as a JSON object with these keys:
- overallScore
- keywordsScore
- experienceScore
- skillsScore
- educationScore
- formattingScore
- feedback (object with keys: keywords, experience, skills, education, formatting)
- improvementSuggestions (array of 3-5 actionable suggestions)
`;

// Function to check if the document is a resume using Gemini
export async function isResumeDocument(text: string): Promise<boolean> {
  // Check if API key is valid
  if (!GEMINI_API_KEY || GEMINI_API_KEY === "your-gemini-api-key-here") {
    console.warn("Gemini API key not configured, assuming document is a resume");
    return true;
  }

  const prompt = `Is the following document a resume or CV? Reply only with 'yes' or 'no'.\n\nDocument:\n${text}`;
  const body = {
    contents: [
      {
        parts: [
          { text: prompt }
        ]
      }
    ]
  };
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), GEMINI_TIMEOUT_MS);
  let response;
  try {
    response = await fetch(GEMINI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body),
      signal: controller.signal
    });
  } catch (error) {
    console.error("Network error calling Gemini API:", error);
    return true; // Assume it's a resume if API call fails
  } finally {
    clearTimeout(timeout);
  }
  
  if (!response.ok) {
    console.error(`Gemini API error: ${response.status} ${response.statusText}`);
    return true; // Assume it's a resume if API call fails
  }
  
  try {
    const data: any = await response.json();
    let resultText = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
    resultText = resultText.trim().toLowerCase();
    return resultText.startsWith('yes');
  } catch (error) {
    console.error("Error parsing Gemini response:", error);
    return true; // Assume it's a resume if parsing fails
  }
}

// Helper to ensure all sections are present
function fillSectionDefaults(result: ResumeAnalysisResult): ResumeAnalysisResult {
  return {
    ...result,
    feedback: {
      keywords: result.feedback?.keywords || "No feedback provided.",
      experience: result.feedback?.experience || "No feedback provided.",
      skills: result.feedback?.skills || "No feedback provided.",
      education: result.feedback?.education || "No feedback provided.",
      formatting: result.feedback?.formatting || "No feedback provided.",
    },
    improvementSuggestions: Array.isArray(result.improvementSuggestions) && result.improvementSuggestions.length > 0
      ? result.improvementSuggestions
      : ["No suggestions provided."]
  };
}

export async function analyzeResumeWithGemini(text: string): Promise<ResumeAnalysisResult> {
  if (!text || !text.trim()) {
    throw new Error("Resume text is empty. Cannot analyze an empty document.");
  }
  console.log("Extracted resume text:", text.slice(0, 500)); // Log first 500 chars

  // Check if API key is valid
  if (!GEMINI_API_KEY || GEMINI_API_KEY === "your-gemini-api-key-here") {
    console.warn("Gemini API key not configured, returning fallback analysis");
    return {
      overallScore: 75,
      keywordsScore: 75,
      experienceScore: 75,
      skillsScore: 75,
      educationScore: 75,
      formattingScore: 75,
      feedback: {
        keywords: "API not configured. Please configure Gemini API key for detailed analysis.",
        experience: "API not configured. Please configure Gemini API key for detailed analysis.",
        skills: "API not configured. Please configure Gemini API key for detailed analysis.",
        education: "API not configured. Please configure Gemini API key for detailed analysis.",
        formatting: "API not configured. Please configure Gemini API key for detailed analysis."
      },
      improvementSuggestions: [
        "Configure your Gemini API key for detailed resume analysis.",
        "Ensure your resume is in PDF or DOCX format.",
        "Make sure your resume contains clear sections for experience, skills, and education."
      ]
    };
  }

  const prompt = `${SYSTEM_PROMPT}\n\nResume:\n${text}`;

  const body = {
    contents: [
      {
        parts: [
          { text: prompt }
        ]
      }
    ],
    generationConfig: {
      temperature: 0,
      topP: 1,
      topK: 1
    }
  };

  console.log("Gemini request body:", JSON.stringify(body, null, 2));

  // Timeout logic
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), GEMINI_TIMEOUT_MS);

  let response;
  try {
    response = await fetch(GEMINI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body),
      signal: controller.signal
    });
  } catch (error) {
    console.error("Network error calling Gemini API:", error);
    throw new Error("Failed to connect to analysis service. Please try again later.");
  } finally {
    clearTimeout(timeout);
  }

  if (!response.ok) {
    console.error(`Gemini API error: ${response.status} ${response.statusText}`);
    throw new Error(`Analysis service error: ${response.status}. Please try again later.`);
  }

  let data: any;
  try {
    data = await response.json();
  } catch (error) {
    console.error("Error parsing Gemini response:", error);
    throw new Error("Failed to parse analysis response. Please try again later.");
  }

  // Gemini returns the text in data.candidates[0].content.parts[0].text
  let resultText = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";

  // Remove code block markers if present
  resultText = resultText.trim().replace(/^```json\s*/i, '').replace(/^```/, '').replace(/```$/, '').trim();

  let result: ResumeAnalysisResult;
  try {
    result = JSON.parse(resultText);
  } catch (e) {
    console.error("Failed to parse Gemini response as JSON:", resultText);
    throw new Error("Failed to parse analysis results. Please try again later.");
  }

  // After parsing resultText, call fillSectionDefaults before returning
  return fillSectionDefaults(result);
} 