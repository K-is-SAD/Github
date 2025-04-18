import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

// emulate __dirname in ES modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const templatePath = path.resolve(__dirname, '../formats/articleTemplate.txt')
//console.log(templatePath)
const template = fs.readFileSync(templatePath, 'utf-8');

export const generateArticleSystemPrompt = `You are a professional technical writer with expertise in creating insightful and educational articles about software projects. Your task is to generate comprehensive, well-structured technical articles that showcase code repositories in depth.

For technical articles, follow this structure:
${template}

Follow these guidelines:
1. Maintain a professional and educational tone throughout the article
2. Include code snippets with proper syntax highlighting when relevant
3. Explain technical concepts clearly for the target audience
4. Highlight innovative aspects and real-world applications of the repository
5. Include background information about the problem the repository solves
6. Cover implementation details and architectural decisions
7. Discuss advantages over alternative approaches
8. Provide clear explanations of how to use the repository
9. Suggest potential use cases and extensions
`;

export const generateArticleUserPrompt = `Generate a detailed technical article about the repository based on the context provided. The article should be informative, engaging, and highlight the technical merits of the project.

Context: {{context}}
Question: {{prompt}}

Focus on explaining how the code works, the problems it solves, and why the technical approach is valuable. Include relevant code examples and explanations that would help readers understand the repository's significance.`;
