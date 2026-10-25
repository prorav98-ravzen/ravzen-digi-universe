type Credential = { year: string; title: string; description: string; tag: string }
const credentials: Credential[] = [
  { year: '2018', title: 'International Creative Recognition', description: 'Placed among the top three in a Creative Photo Manipulation competition organized by a private graphic design academy in France.', tag: 'International recognition' },
  { year: '2019', title: 'Advanced Graphic & Vector Design — Dansky', description: 'Completed an online advanced graphics and vector design program with a High Pass distinction.', tag: 'Professional training' },
  { year: '2019–2021', title: 'Advanced Raster & Vector Design Studies', description: 'Developed advanced proficiency in photo manipulation, raster graphics and vector illustration through intensive independent study.', tag: 'Self-directed expertise' },
  { year: 'Completed', title: 'NVQ Level 4 — Design & Multimedia', description: 'Successfully completed a Design & Multimedia program at a semi-government academy supported by a Sri Lankan government institution.', tag: 'Vocational qualification' },
  { year: 'Completed', title: 'Artificial Intelligence Foundations', description: 'Completed foundational coursework in Artificial Intelligence.', tag: 'Technology education' },
  { year: 'In progress', title: 'Advanced Prompt Engineering & Vibe Coding', description: 'Currently studying advanced prompt engineering and an online vibe coding program offered by a UK-based academy.', tag: 'Ongoing development' },
  { year: 'Assessed', title: 'Freelance Platform Skills Assessments', description: 'Achieved 9/10 assessment scores in Adobe Photoshop, Adobe Illustrator, virtual assistance, digital marketing and marketing strategy.', tag: 'Practical proficiency' },
  { year: 'Recognized', title: 'National Literary & Creative Writing Awards', description: 'Received national-level recognition for creative writing, alongside work in fiction, poetry and songwriting.', tag: 'Creative achievement' },
]
export default function CredentialsSection() {
  return <section id="credentials" aria-labelledby="credentials-heading" className="relative border-y border-white/10 bg-white/[.025] scroll-mt-24">
    <div className="mx-auto max-w-7xl px-5 py-24 md:px-10">
      <p className="text-xs font-bold uppercase tracking-[.3em] text-fuchsia-300">Behind the creative work</p>
      <h2 id="credentials-heading" className="mt-4 text-4xl font-black md:text-5xl">Credentials &amp; <span className="text-fuchsia-400">Creative Journey.</span></h2>
      <p className="mt-6 max-w-3xl text-base leading-8 text-white/60">A multidisciplinary creative professional combining visual storytelling, technical precision and a commitment to lifelong learning. From internationally recognized photo manipulation to design, multimedia and emerging AI workflows, each milestone reflects a drive to make ideas memorable.</p>
      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { value: 'Top 3', label: 'International creative competition · 2018' },
          { value: 'NVQ 4', label: 'Design & Multimedia qualification' },
          { value: 'High Pass', label: 'Advanced graphics program · 2019' },
          { value: '9/10', label: 'Freelance skills assessment results' },
        ].map(item => <div key={item.value} className="rounded-2xl border border-fuchsia-400/20 bg-[#15151e] p-6">
          <p className="text-3xl font-black text-fuchsia-300">{item.value}</p><p className="mt-3 text-sm leading-6 text-white/60">{item.label}</p>
        </div>)}
      </div>
      <div className="mt-10 grid gap-4 md:grid-cols-2">
        {credentials.map(item => <article key={item.title} className="rounded-2xl border border-white/10 bg-[#15151e] p-6 md:p-7">
          <div className="flex flex-wrap items-center justify-between gap-2"><span className="text-xs font-bold uppercase tracking-widest text-fuchsia-300">{item.year}</span><span className="rounded-full border border-white/15 px-3 py-1 text-[11px] text-white/55">{item.tag}</span></div>
          <h3 className="mt-4 text-lg font-bold">{item.title}</h3><p className="mt-3 text-sm leading-7 text-white/60">{item.description}</p>
        </article>)}
      </div>
      <div className="mt-12 rounded-2xl border border-white/10 bg-[#15151e] p-7 md:p-9">
        <p className="text-xs font-bold uppercase tracking-[.3em] text-fuchsia-300">Academic foundation</p>
        <h3 className="mt-3 text-2xl font-bold">General Education Qualifications</h3>
        <div className="mt-6 grid gap-5 md:grid-cols-3">
          {[
            { title: 'Grade 5 Scholarship Examination', description: 'Successfully passed the Sri Lankan Grade 5 Scholarship Examination.' },
            { title: 'G.C.E. Ordinary Level (O/L)', description: 'Successfully completed the General Certificate of Education Ordinary Level Examination with excellent results.' },
            { title: 'G.C.E. Advanced Level (A/L) — Commerce', description: 'Successfully passed the General Certificate of Education Advanced Level Examination in the Commerce stream.' },
          ].map(item => <div key={item.title} className="border-l border-fuchsia-400/50 pl-5">
            <h4 className="font-semibold text-white/90">{item.title}</h4>
            <p className="mt-2 text-sm leading-7 text-white/60">{item.description}</p>
          </div>)}
        </div>
      </div>
      <div className="mt-10 rounded-2xl border border-fuchsia-400/20 bg-fuchsia-400/[.045] p-7 md:p-9">
        <p className="text-xs font-bold uppercase tracking-[.25em] text-fuchsia-300">The person behind RAVZEN</p>
        <p className="mt-4 max-w-4xl text-lg leading-9 text-white/80">More than a designer, the creator behind RAVZEN is a curious visual storyteller — equally drawn to the discipline of design, the possibilities of technology and the emotion of the written word. This blend of artistic sensitivity, hands-on learning and technical ambition shapes a studio focused on thoughtful, distinctive creative work.</p>
      </div>
    </div>
  </section>
}
