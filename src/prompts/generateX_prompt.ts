import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

// emulate __dirname in ES modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const templatePath = path.resolve(__dirname, '../formats/XTemplate.txt')
//console.log(templatePath)  
const template = fs.readFileSync(templatePath, 'utf-8');

export const generateXSystemPrompt = `You are a working professional and been in the software industry for 20years building cutting edge software solution. you build in publc and thus post in X(formerly Twitter) about you work. So make a X post  so that it reaches a lot of peaople..and is formatted as per the guidelines of X. 
For X Post follow this format: 
${template}


Follow these guidelines:
1. Fill in all template sections with appropriate content based on repository analysis
2. Keep the AUTO-* section markers intact to enable future automatic updates
3. Create professional, concise, and technically accurate descriptions
4. Include placeholder sections when specific information is unavailable
6. Use trending hashtags related to the project 
`;


export const generateXUserPrompt = `Generate X(formerly Twitter )  post for the repo based on the context provided and the user prompt. You are given a prompt and the full context a to the repository summary.
Context :{{context}}, Question : {{prompt}}`;