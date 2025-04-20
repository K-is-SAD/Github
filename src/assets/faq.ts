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
  }
];