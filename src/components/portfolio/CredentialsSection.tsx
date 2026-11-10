type Credential = { year: string; title: string; description: string; tag: string }
const credentials: Credential[] = [
  { year: '2016', title: 'Beginning of a Creative Career', description: 'Entered the graphic design industry in 2016, beginning a professional journey shaped by hands-on practice, independent learning and a passion for visual communication.', tag: 'Career milestone' },
  { year: '2018', title: 'International Creative Recognition', description: 'Placed among the top three in a Creative Photo Manipulation competition organized by a private graphic design academy in France.', tag: 'International recognition' },
  { year: '2019', title: 'Advanced Graphic & Vector Design — Dansky', description: 'Completed an online advanced graphics and vector design program with a High Pass distinction.', tag: 'Professional training' },
  { year: '2019–2021', title: 'Advanced Raster & Vector Design Studies', description: 'Developed advanced proficiency in photo manipulation, raster graphics and vector illustration through intensive independent study.', tag: 'Self-directed expertise' },
  { year: 'Completed', title: 'NVQ Level 4 — Design & Multimedia', description: 'Successfully completed a Design & Multimedia program at a semi-government academy supported by a Sri Lankan government institution.', tag: 'Vocational qualification' },
  { year: 'Completed', title: 'Artificial Intelligence Foundations', description: 'Completed foundational coursework in Artificial Intelligence.', tag: 'Technology education' },
  { year: 'In progress', title: 'Advanced Prompt Engineering & Vibe Coding', description: 'Currently studying advanced prompt engineering and an online vibe coding program offered by a UK-based academy.', tag: 'Ongoing development' },
  { year: 'In progress', title: 'Offset Printing Technology & Print Production', description: 'Beyond Design. Into Production. Currently developing theoretical knowledge and hands-on practical skills in offset printing, exploring the complete journey from creative concept and prepress preparation to the final printed product. Building on an established foundation in graphic design and visual communication, my goal is to master the design-to-production process and work toward establishing my own offset printing press. From imagination to creation. From design to reality.', tag: 'Professional development' },
  { year: 'Assessed', title: 'Freelance Platform Skills Assessments', description: 'Achieved 9/10 assessment scores in Adobe Photoshop, Adobe Illustrator, virtual assistance, digital marketing and marketing strategy.', tag: 'Practical proficiency' },
  { year: 'Recognized', title: 'National Literary & Creative Writing Awards', description: 'Received national-level recognition for creative writing, alongside work in fiction, poetry and songwriting.', tag: 'Creative achievement' },
]
export default function CredentialsSection() {
  return <section id="credentials" aria-labelledby="credentials-heading" className="relative border-y border-white/10 bg-white/[.025] scroll-mt-24">
    <div className="mx-auto max-w-7xl px-5 py-24 md:px-10">
      <p className="text-xs font-bold uppercase tracking-[.3em] text-orange-300">Behind the creative work</p>
      <h2 id="credentials-heading" className="mt-4 text-4xl font-black md:text-5xl">Credentials &amp; <span className="text-orange-400">Creative Journey.</span></h2>
      <p className="mt-6 max-w-3xl text-base leading-8 text-white/60">A multidisciplinary creative professional combining visual storytelling, technical precision and a commitment to lifelong learning. From internationally recognized photo manipulation to design, multimedia and emerging AI workflows, each milestone reflects a drive to make ideas memorable.</p>
      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { value: 'Top 3', label: 'International creative competition · 2018' },
          { value: 'NVQ 4', label: 'Design & Multimedia qualification' },
          { value: 'High Pass', label: 'Advanced graphics program · 2019' },
          { value: '9/10', label: 'Freelance skills assessment results' },
        ].map(item => <div key={item.value} className="rounded-2xl border border-white/15 bg-white/[.055] backdrop-blur-xl shadow-[0_12px_36px_rgba(0,0,0,0.18)] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-orange-400/35 hover:shadow-[0_18px_45px_rgba(249,115,22,0.10)]">
          <p className="text-3xl font-black text-orange-300">{item.value}</p><p className="mt-3 text-sm leading-6 text-white/60">{item.label}</p>
        </div>)}
      </div>
      <div className="mt-10 grid gap-4 md:grid-cols-2">
        {credentials.map(item => <article key={item.title} className="group rounded-2xl border border-white/15 bg-white/[.055] backdrop-blur-xl shadow-[0_12px_36px_rgba(0,0,0,0.18)] p-6 md:p-7 transition-all duration-300 motion-safe:hover:-translate-y-1 hover:border-orange-400/35 hover:shadow-[0_18px_45px_rgba(249,115,22,0.10)]">
          <div className="flex flex-wrap items-center justify-between gap-2"><span className="text-xs font-bold uppercase tracking-widest text-orange-300">{item.year}</span><span className="rounded-full border border-white/15 px-3 py-1 text-[11px] text-white/55">{item.tag}</span></div>
          <h3 className="mt-4 text-lg font-bold">{item.title}</h3><p className="mt-3 text-sm leading-7 text-white/60">{item.description}</p>
        </article>)}
      </div>
      <div className="mt-16" aria-labelledby="experience-heading">
        <p className="text-xs font-bold uppercase tracking-[.3em] text-orange-300">Professional background</p>
        <h3 id="experience-heading" className="mt-3 text-3xl font-bold md:text-4xl">Professional <span className="text-orange-300">Work Experience.</span></h3>
        <p className="mt-3 text-sm leading-7 text-white/60">Digital Marketing &amp; Product Designer</p>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <article className="rounded-2xl border border-white/15 bg-white/[.055] backdrop-blur-xl shadow-[0_12px_36px_rgba(0,0,0,0.18)] p-6 md:p-8">
            <p className="text-xs font-bold uppercase tracking-widest text-orange-300">2024 – Present</p>
            <h4 className="mt-4 text-xl font-bold">Senior Digital &amp; Visual Graphic Designer</h4>
            <p className="mt-2 font-medium text-white/80">Leaves Stationery Company</p>
            <p className="mt-1 text-xs text-white/50">A business division of Galgedara Marketing (Pvt) Ltd</p>
            <p className="mt-5 text-sm leading-7 text-white/60">Specializing in digital and visual graphic design, product branding, packaging design, advertising, and creative marketing solutions. Focused on developing high-quality visual content, enhancing product presentation, and maintaining consistent brand identities across digital and print media.</p>
          </article>
          <article className="rounded-2xl border border-white/15 bg-white/[.055] backdrop-blur-xl shadow-[0_12px_36px_rgba(0,0,0,0.18)] p-6 md:p-8">
            <p className="text-xs font-bold uppercase tracking-widest text-orange-300">2018 – 2021</p>
            <h4 className="mt-4 text-xl font-bold">Graphic Designer &amp; Machine Operator</h4>
            <p className="mt-2 font-medium text-white/80">Galgedara Marketing (Pvt) Ltd</p>
            <p className="mt-5 text-sm leading-7 text-white/60">Gained hands-on experience in commercial graphic design, printing technology, and machine operations. Responsible for preparing print-ready artwork, operating production equipment, maintaining print quality, and supporting efficient production workflows.</p>
          </article>
        </div>
      </div>
      <div className="mt-12 rounded-2xl border border-white/15 bg-white/[.055] backdrop-blur-xl shadow-[0_12px_36px_rgba(0,0,0,0.18)] p-7 md:p-9">
        <p className="text-xs font-bold uppercase tracking-[.3em] text-orange-300">Academic foundation</p>
        <h3 className="mt-3 text-2xl font-bold">General Education Qualifications</h3>
        <div className="mt-6 grid gap-5 md:grid-cols-3">
          {[
            { title: 'Grade 5 Scholarship Examination', description: 'Successfully passed the Sri Lankan Grade 5 Scholarship Examination.' },
            { title: 'G.C.E. Ordinary Level (O/L)', description: 'Successfully completed the General Certificate of Education Ordinary Level Examination with excellent results.' },
            { title: 'G.C.E. Advanced Level (A/L) — Commerce', description: 'Successfully passed the General Certificate of Education Advanced Level Examination in the Commerce stream.' },
          ].map(item => <div key={item.title} className="border-l border-orange-400/50 pl-5">
            <h4 className="font-semibold text-white/90">{item.title}</h4>
            <p className="mt-2 text-sm leading-7 text-white/60">{item.description}</p>
          </div>)}
        </div>
      </div>
      <div className="mt-10 rounded-2xl border border-orange-400/20 bg-orange-400/[.045] p-7 md:p-9">
        <p className="text-xs font-bold uppercase tracking-[.25em] text-orange-300">The person behind RAVZEN</p>
        <p className="mt-4 max-w-4xl text-lg leading-9 text-white/80">More than a designer, the creator behind RAVZEN is a curious visual storyteller — equally drawn to the discipline of design, the possibilities of technology and the emotion of the written word. This blend of artistic sensitivity, hands-on learning and technical ambition shapes a studio focused on thoughtful, distinctive creative work.</p>
      </div>
    </div>
  </section>
}
