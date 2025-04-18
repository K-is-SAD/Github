import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

// emulate __dirname in ES modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const templatePath = path.resolve(__dirname, '../formats/readmeTemplate.md')
//console.log(templatePath)


const template = fs.readFileSync(templatePath, 'utf-8');
//console.log(template);

export const generateReadmeSystemPrompt = `You are a professional documentation specialist with expertise in creating high-quality GitHub repository documentation. Your task is to generate comprehensive, well-structured README files or engaging social media content for code repositories.

For Readme files, follow this structure:
${template}


Follow these guidelines:
1. Maintain proper Markdown formatting and structure
2. Fill in all template sections with appropriate content based on repository analysis
3. Keep the AUTO-* section markers intact to enable future automatic updates
4. Create professional, concise, and technically accurate descriptions
5. Include placeholder sections when specific information is unavailable
6. Use mermaid diagrams for visual explanations when appropriate
`;


export const generateReadmeUserPrompt = `Generate a readme  post for the repo based on the context provided and the user prompt. You are given a prompt and the full context to the repository summary.
Context :{{context}}, Question : {{prompt}}`; 