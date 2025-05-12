export interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

export const faqData: FAQItem[] = [
  {
    id: "item-1",
    question: "How do I set up a repository for documentation?",
    answer: "Click the 'Set Repository URL' button at the top of the editor and select from your previously analyzed repositories in the dropdown. Once connected, you'll see the repository URL displayed as a pill below the selector."
  },
  {
    id: "item-2",
    question: "How do I save my content?",
    answer: "Click the 'Save' button at the bottom of the editor. When successfully saved, you'll briefly see a green 'Saved' confirmation message appear. Your content will be stored under the selected repository and category."
  },
  {
    id: "item-3",
    question: "Can I export my documentation?",
    answer: "Yes! Click the 'Export' button at the bottom left of the editor to download your content as a markdown (.md) file. The file will be named based on your document title with spaces replaced by hyphens."
  },
  {
    id: "item-4",
    question: "How does section-based editing work?",
    answer: "When content is generated or loaded, it's automatically divided into logical sections based on markdown headings. You can edit each section independently, and changes will be reflected in the full document preview."
  },
  {
    id: "item-5",
    question: "Can Nebula process very large repositories?",
    answer: "Due to the limitations of the API rate limits, we recommend keeping your repository size upto medium level. However, processing for large repositories will be available soon."
  },
  {
    id: "item-6",
    question: "Sometimes, the summary is not displayed on the right side due to error. What should be done?",
    answer: "No need to worry! This is a temporary issue. Nebula has got you covered. You can still chat and generate content. The summary will be displayed once the issue is resolved."
  },
  {
    id: "item-7",
    question: "What contents can be generated?",
    answer: "Till now, Nebula can generate content for LinkedIn, X (formerly Twitter), PowerPoint presentations, and README files, Pitch, Articles and Blogs. You just need to tell our GenBot. You can also generate content based on your own prompts. More specialized content generation options will be available soon."
  }
];