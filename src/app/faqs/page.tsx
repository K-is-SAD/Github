"use client";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { faqData } from "@/assets/faq";

const FAQS = () => {
  return (
    <div className="relative top-20 mt-4 md:py-10 bg-transparent w-full rounded-3xl">
      <div className="p-10 md:p-4 md:px-20">
        <div className="text-xl sm:text-2xl md:text-4xl lg:text-5xl font-bold dark:text-[#f6f5f4] text-black text-[1.4rem]">
          Have questions ?
        </div>
        <div className="font-semibold text-lg sm:text-xl md:text-3xl text-green-500">
          Get answers.
        </div>
        <Accordion type="single" collapsible className="dark:text-[#f6f5f4] text-black text-xl">
          {faqData.map((faq) => (
            <AccordionItem key={faq.id} value={faq.id}>
              <AccordionTrigger>{faq.question}</AccordionTrigger>
              <AccordionContent>
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
};

export default FAQS;