# HireIndex - Resume ATS Checker

A modern web application for analyzing resumes against Applicant Tracking System (ATS) requirements using AI-powered analysis.

## Features

- Upload and analyze resumes (PDF/DOCX)
- AI-powered resume analysis using Google Gemini
- ATS compatibility scoring
- Detailed feedback and improvement suggestions
- Export analysis reports
- Modern React + TypeScript frontend
- Express.js backend with PostgreSQL database

## Prerequisites

- Node.js 18+ 
- PostgreSQL database
- Google Gemini API key

## Setup Instructions

### 1. Clone and Install Dependencies

```bash
git clone <repository-url>
cd HireIndex-v0
npm install
```

### 2. Environment Configuration

Create a `.env` file in the root directory with the following variables:

```env
# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/hireindex

# Gemini API Configuration
GEMINI_API_KEY=your-actual-gemini-api-key

# Server Configuration
PORT=5000
NODE_ENV=development
```

### 3. Database Setup

1. Create a PostgreSQL database named `hireindex`
2. Run the database migrations:

```bash
npm run db:push
```

### 4. Get Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Add it to your `.env` file

### 5. Start the Application

```bash
# Start both frontend and backend
npm run dev

# Or start them separately
npm run dev:server  # Backend only
npm run dev         # Frontend only
```

The application will be available at `http://localhost:5000`

## Troubleshooting

### 500 Internal Server Error on Resume Upload

If you're getting a 500 error when uploading resumes, check the following:

1. **Gemini API Key**: Ensure your `GEMINI_API_KEY` is properly set in the `.env` file
2. **Database Connection**: Verify your `DATABASE_URL` is correct and the database is accessible
3. **File Format**: Ensure you're uploading PDF or DOCX files
4. **File Size**: Files should be under 5MB

### Common Issues

#### "Gemini API key not configured"
- Set the `GEMINI_API_KEY` environment variable
- The application will still work with fallback analysis

#### "Database connection failed"
- Check your `DATABASE_URL` format
- Ensure PostgreSQL is running
- Verify database credentials

#### "Failed to extract text from document"
- Ensure the file is not corrupted
- Try with a different PDF/DOCX file
- Check file permissions

### Development Mode

The application includes fallback mechanisms for development:
- If Gemini API is not configured, it returns a basic analysis
- If database is not available, it uses in-memory storage
- Detailed error logging is enabled

## API Endpoints

- `POST /api/resume/analyze` - Upload and analyze resume
- `GET /api/resume/analysis/:id` - Get specific analysis
- `GET /api/resume/analyses/recent` - Get recent analyses

## Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS, Shadcn/ui
- **Backend**: Express.js, TypeScript, Multer
- **Database**: PostgreSQL with Drizzle ORM
- **AI**: Google Gemini API
- **File Processing**: pdf-parse, mammoth
- **Build Tool**: Vite

## License

MIT 