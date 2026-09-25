import { useState } from "react";

const FAQ_ITEMS = [
  {
    question: "What payment methods are available?",
    answer:
      "You can choose cash on delivery or GCash when placing an order. GCash orders need a payment reference number.",
  },
  {
    question: "How do I place an order?",
    answer:
      "Browse the foods page or today’s menu, add items to your cart, then review your details and place the order.",
  },
  {
    question: "Can I track my order?",
    answer:
      "Yes. Open My Orders to see your orders, then select an order to view its current status.",
  },
  {
    question: "How do I know what food is available today?",
    answer:
      "Today’s Menu on this page shows the items currently posted for the day. You can also browse the full Foods page.",
  },
];

export default function HomeFaq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section
      aria-labelledby="quick-answers-title"
      className="my-12 grid min-w-0 grid-cols-1 gap-8 md:my-22 md:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] md:items-start md:gap-8 lg:gap-16"
    >
      <div className="max-w-xl">
        <p className="mb-3 inline-flex py-1 text-sm font-bold uppercase tracking-[0.32em] text-[#FFB800]">
          Quick Answers
        </p>
        <h2
          id="quick-answers-title"
          className="font-display text-4xl font-bold leading-[0.98] tracking-[-0.04em] text-stone-900 md:text-5xl"
        >
          Before you order.
        </h2>
        <p className="mt-5 max-w-md text-base leading-7 text-stone-500">
          Here are some common questions about ordering from Gemma&apos;s
          Kitchenette.
        </p>
      </div>

      <div className="min-w-0 overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-[0_8px_24px_rgba(41,37,36,0.04)]">
        {FAQ_ITEMS.map((item, index) => {
          const isOpen = openIndex === index;
          const answerId = `home-faq-answer-${index}`;

          return (
            <div
              key={item.question}
              className="border-b border-stone-200 last:border-b-0"
            >
              <h3>
                <button
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={answerId}
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="flex min-h-16 w-full items-center justify-between gap-4 px-4 py-4 text-left text-sm font-semibold text-stone-900 transition-colors hover:bg-stone-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#FFB800] md:px-6 md:text-base"
                >
                  <span>{item.question}</span>
                  <span
                    aria-hidden="true"
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xl leading-none transition-colors ${
                      isOpen
                        ? "bg-[#FFB800]/20 text-[#9A6B00]"
                        : "bg-stone-100 text-stone-500"
                    }`}
                  >
                    {isOpen ? "−" : "+"}
                  </span>
                </button>
              </h3>
              <div
                id={answerId}
                aria-hidden={!isOpen}
                className={`grid transition-[grid-template-rows,opacity] duration-200 ease-out ${
                  isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                }`}
              >
                <div className="min-h-0 overflow-hidden">
                  <p className="px-4 pb-5 text-sm leading-6 text-stone-500 md:px-6 md:pb-6">
                    {item.answer}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
