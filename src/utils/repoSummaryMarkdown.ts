type RepoFile = {
  file_name?: string;
  content?: string;
  summary?: string;
};

type RepoSummaryLike = {
  repoUrl?: string;
  projectIdea?: string;
  projectSummary?: string;
  techStacks?: Record<string, string[]> | string[];
  keyFeatures?: string[];
  potentialIssues?: string[];
  feasibility?: string;
  files?: RepoFile[];
};

const formatList = (items: string[] | undefined, emptyLabel: string) => {
  if (!items || items.length === 0) {
    return `- ${emptyLabel}`;
  }

  return items.map((item) => `- ${item}`).join("\n");
};

const formatTechStacks = (techStacks: RepoSummaryLike["techStacks"]) => {
  if (!techStacks) {
    return "- No tech stack information available";
  }

  if (Array.isArray(techStacks)) {
    return techStacks.length
      ? techStacks.map((item) => `- ${item}`).join("\n")
      : "- No tech stack information available";
  }

  const entries = Object.entries(techStacks);
  if (!entries.length) {
    return "- No tech stack information available";
  }

  return entries
    .map(([stack, values]) => {
      const formattedValues = values.length
        ? values.map((value) => `  - ${value}`).join("\n")
        : "  - Not specified";

      return `- ${stack}\n${formattedValues}`;
    })
    .join("\n");
};

export const buildRepoSummaryMarkdown = (summary: RepoSummaryLike) => {
  const title = summary.repoUrl || "Repository Summary";
  const projectIdea = summary.projectIdea?.trim() || "Not provided";
  const projectSummary = summary.projectSummary?.trim() || "Not provided";
  const feasibility = summary.feasibility?.trim() || "Unknown";
  const files = summary.files || [];

  const fileSection = files.length
    ? files
        .map((file) => {
          const fileName = file.file_name || "Untitled file";
          const fileSummary = file.summary?.trim() || "No summary provided";
          return `### ${fileName}\n\n${fileSummary}`;
        })
        .join("\n\n")
    : "No file-level analysis was provided.";

  return [
    `# Repository Summary`,
    ``,
    `**Repository:** ${title}`,
    ``,
    `## Project Idea`,
    projectIdea,
    ``,
    `## Project Summary`,
    projectSummary,
    ``,
    `## Tech Stack`,
    formatTechStacks(summary.techStacks),
    ``,
    `## Key Features`,
    formatList(summary.keyFeatures, "No key features available"),
    ``,
    `## Potential Issues`,
    formatList(summary.potentialIssues, "No issues were detected"),
    ``,
    `## Feasibility`,
    feasibility,
    ``,
    `## File Breakdown`,
    fileSection,
  ].join("\n");
};
