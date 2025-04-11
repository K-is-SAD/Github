chunk_prompts = """You are an efficient LLM model which is analyzing a GitHub repository. You have been provided with a chunk of code from the repository. Your task is to identify important files, extract meaningful code, and summarize the project.
You are analyzing a chunk of a GitHub repository. Your task is to return a structured JSON that includes:

- The repo URL (use a placeholder if not provided).
- A list of important files in the chunk.
- For each important file:
  - Extract only **important code blocks** (omit import statements, unused code, and boilerplate).
  - List any **classes or components** defined in the file.

DO NOT include: import statements, comments, unused exports, type declarations unless relevant to business logic.

INCLUDE: functional code (like functions, component bodies, smart contract logic, stateful React hooks, business logic in API routes or models).

---
### Output Format (JSON):
{
  "important_files": ["file1.tsx", "file2.sol", "file3.ts"],
  "files": [
    {
      "file_name": "file1.tsx",
      "code": "function verifyImage(base64Image) { ... } (The entire function code with important lines)",
      "components_classes": ["VerifyPage"]
    },
    {
      "file_name": "file2.sol",
      "code": "function createReward(string memory _uri) public onlyOwner { ... } (The entire function code with important lines)",
      "components_classes": ["GarbageNFT"]
    }
  ]
}

---

Now analyze the following chunk. Identify all important files, extract only meaningful code (excluding import lines), and list defined components or classes and go on with the next chunks as well appending the results to the previous ones. REMEMBER TO GIVE THE OUTPUT AS THE FORMAT GIVEN ABOVE! GIVE A VALID JSON RESPONSE!
---
"""

integration_prompts = """You are an LLM model which is efficient in analyzing GitHub repositories. You have been provided with a structured JSON output from the previous analysis of a GitHub repository. Your task is to generate a comprehensive summary of the project based on the provided JSON data.
You have now finished analyzing all the parts of a GitHub repository. Based on your observations from each chunk, generate a **structured JSON output** that provides a consolidated understanding of the project. Your response must be under 4000 tokens but a detailed and impactful response

Format:
{
  "files": [
    {
      "file_name": "contracts/GarbageNFT.sol",
      "content": "function createReward(...) { ... } (The entire function code with important lines)",
      "summary": "Smart contract to mint reward NFTs for eco-actions."
    },
    {
      "file_name": "src/app/verify/page.tsx",
      "content": "async function verifyImage(...) (The entire function code with important lines)",
      "summary": "Handles sending image data to an external verification API."
    },
    ...
  ],
  "project_idea": "A decentralized platform to incentivize eco-friendly behaviors (e.g., waste disposal) through blockchain rewards (NFTs), using QR/barcode scanning and image verification. Like this...A detailed project_idea",
  "project_summary": (A detailed project summary) "The repository implements a full-stack DApp that allows users (students) to scan barcodes of waste deposits, verify them with AI, and receive NFTs as rewards. It uses Thirdweb for blockchain integration, MongoDB for data persistence, and Next.js for frontend/backend routing.",
  "tech_stack":(techstacks and technologies used in details) {
    "frontend": ["Next.js", "React", "TailwindCSS", "Shadcn UI", "Radix UI"],
    "backend": ["Next.js API Routes", "Node.js"],
    "database": ["MongoDB", "Mongoose"],
    "blockchain": ["Solidity", "Thirdweb SDK", "Hardhat"],
    "external_services": ["Azure FastAPI for Image Recognition", "Thirdweb Wallet"]
  },
  "key_features": (important key features in details) [
    "Smart contract for NFT rewards",
    "QR/barcode scanning integration",
    "AI-based waste type verification",
    "Student and Admin dashboards",
    "Geolocation-based contribution tracking",
    "MongoDB data modeling"
  ],
  "potential_issues": (potential issues in details like this) [
    "Incomplete Admin Dashboard",
    "Heavy reliance on external image API",
    "Limited error handling in API routes",
    "Redundant smart contract files"
  ],
  "feasibility": (feasibility in details) "Highly feasible. All core components are present and functional. Minor enhancements in admin features, error handling, and local AI model integration would improve robustness."
}
"""