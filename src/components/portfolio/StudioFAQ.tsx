export default function StudioFAQ() {
  const questions=[
    {q:'How do I request a design?',a:'Browse the portfolio, save your favorite examples, then use the project inquiry form below. You can send your brief directly through WhatsApp or email.'},
    {q:'How much does a design cost?',a:'Pricing depends on the type of design, complexity, and deliverables. Listed portfolio prices are starting points where shown; request a personalized quotation for your project.'},
    {q:'Can I request revisions?',a:'Yes. Revision rounds and their scope are agreed in the quotation before work begins, so expectations are clear.'},
    {q:'Which files will I receive?',a:'Deliverables depend on your selected service and agreed package. Tell us if you need print-ready files, editable source files, or specific export formats.'},
    {q:'How long does a project take?',a:'Timelines depend on the brief, complexity, feedback, and workload. Share your preferred deadline in the inquiry form and we will confirm feasibility.'},
    {q:'Can overseas clients work with RAVZEN?',a:'Yes. We welcome international inquiries. We will confirm communication, payment options, and delivery details before starting.'}
  ]
  return <section id="faq" aria-labelledby="faq-title" className="mx-auto max-w-7xl px-5 pb-24 md:px-10">
    <p className="text-xs font-bold uppercase tracking-[.3em] text-fuchsia-300">Helpful answers</p>
    <h2 id="faq-title" className="mt-4 text-3xl font-black md:text-4xl">Frequently asked questions.</h2>
    <div className="mt-8 grid gap-3 md:grid-cols-2">{questions.map(({q,a})=><details key={q} className="group rounded-2xl border border-white/15 bg-white/[.025] p-5 open:border-fuchsia-400/40">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-bold leading-6 marker:hidden">{q}<span aria-hidden="true" className="text-xl text-fuchsia-300 group-open:rotate-45">+</span></summary>
      <p className="mt-4 text-sm leading-7 text-white/65">{a}</p>
    </details>)}</div>
  </section>
}
