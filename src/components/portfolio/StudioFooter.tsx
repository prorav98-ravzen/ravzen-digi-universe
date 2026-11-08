import Image from 'next/image'
import { Poppins } from 'next/font/google'
import { Phone, Mail, Instagram } from 'lucide-react'

const badgeFont = Poppins({ subsets: ['latin'], weight: '400', display: 'swap' })

function WhatsAppIcon() {
  return <svg viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6" aria-hidden="true"><path d="M20.52 3.48A11.86 11.86 0 0 0 12.06 0C5.48 0 .12 5.35.12 11.94c0 2.1.55 4.16 1.6 5.97L0 24l6.26-1.64a11.94 11.94 0 0 0 5.8 1.48h.01C18.65 23.84 24 18.49 24 11.9a11.8 11.8 0 0 0-3.48-8.42ZM12.07 21.8a9.9 9.9 0 0 1-5.05-1.38l-.36-.22-3.72.98.99-3.63-.24-.37a9.9 9.9 0 1 1 8.38 4.62Zm5.43-7.42c-.3-.15-1.77-.87-2.04-.97-.28-.1-.48-.15-.68.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.8-1.49-1.79-1.66-2.09-.17-.3-.02-.46.13-.61.14-.13.3-.35.45-.52.15-.18.2-.3.3-.5.1-.2.05-.38-.03-.53-.07-.15-.67-1.62-.92-2.22-.24-.58-.48-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.49s1.07 2.89 1.22 3.09c.15.2 2.1 3.2 5.08 4.49.71.3 1.26.49 1.69.63.71.23 1.36.2 1.88.12.57-.08 1.77-.72 2.02-1.42.25-.7.25-1.3.17-1.42-.07-.12-.27-.2-.57-.35Z"/></svg>
}
function FacebookIcon() {
  return <svg viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6" aria-hidden="true"><path d="M13.5 22v-9h3l.5-3h-3V8.5c0-.87.25-1.5 1.5-1.5H17V4.25A19 19 0 0 0 14.5 4C12 4 10.5 5.5 10.5 8.25V10H8v3h2.5v9h3Z"/></svg>
}

type Props = { fontClassName: string; whatsapp: string; email: string; facebook: string; instagram: string }
export default function StudioFooter({ fontClassName, whatsapp, email, facebook, instagram }: Props) {
  const phone = whatsapp.replace(/\D/g, '')
  const contacts = [
    { label: 'WhatsApp', href: `https://wa.me/${phone}`, icon: <WhatsAppIcon />, external: true, show: Boolean(phone) },
    { label: 'Facebook', href: facebook, icon: <FacebookIcon />, external: true, show: /^https:\/\//i.test(facebook) },
    { label: 'Call us', href: 'tel:+94781556575', icon: <Phone className="h-6 w-6" strokeWidth={1.5} aria-hidden="true" />, external: false, show: true },
    { label: 'Email', href: `mailto:${email}`, icon: <Mail className="h-6 w-6" strokeWidth={1.5} aria-hidden="true" />, external: false, show: Boolean(email) },
    { label: 'Instagram', href: instagram, icon: <Instagram className="h-6 w-6" strokeWidth={1.5} aria-hidden="true" />, external: true, show: /^https:\/\//i.test(instagram) },
  ]
  return <footer id="contact" className="relative overflow-hidden border-t border-white/10 bg-[#0d0d14] px-5 pb-28 pt-14 md:px-10 md:pt-20">
    <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#E9A46B]/60 to-transparent" />
    <div className="relative mx-auto max-w-7xl">
      <div className="grid items-end gap-8 lg:grid-cols-2 lg:gap-16">
        <div>
          <p className="text-[10px] font-medium uppercase tracking-[.25em] text-[#E9A46B]">Your next idea starts here</p>
          <h2 className={`${fontClassName} mt-4 max-w-xl text-4xl font-normal leading-[1.12] tracking-tight md:text-6xl`}>Let&apos;s create something <span className="italic text-[#E9A46B]">memorable.</span></h2>
          <p className="mt-4 max-w-md text-sm leading-6 text-white/55">Thoughtful design. Personal collaboration.<br />A creative partner for your next chapter.</p>
        </div>
        <div>
          <nav aria-label="Contact RAVZEN" className="grid w-full max-w-sm grid-cols-5 gap-2 sm:gap-3 lg:ml-auto">
            {contacts.filter(contact => contact.show).map(contact => <a key={contact.label} href={contact.href} target={contact.external ? '_blank' : undefined} rel={contact.external ? 'noopener noreferrer' : undefined} aria-label={contact.label === 'Call us' ? 'Call RAVZEN at +94 78 155 6575' : `${contact.label} — contact RAVZEN${contact.external ? ' (opens in a new tab)' : ''}`} className="group flex aspect-square min-h-11 min-w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[.025] p-2 text-white transition hover:border-[#E9A46B]/50 hover:bg-white/[.06] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#E9A46B]">
              {contact.icon}
            </a>)}
          </nav>

        </div>
      </div>
      <div className="mt-10 grid items-center gap-7 border-t border-white/10 pt-8 md:mt-14 md:grid-cols-[1fr_auto]">
        <div className="flex items-center gap-4">
          <Image src="/images/ravzen-header-emblem.svg" alt="" width={40} height={34} className="h-auto w-10 shrink-0" />
          <div><p className="text-sm font-semibold tracking-[.18em] text-white">RAVZEN<span className="text-[#E9A46B]">.</span></p><p className="mt-1 text-[11px] tracking-wide text-white/50">Independent creative studio · Since 2016</p></div>
        </div>
        <div className="flex items-center gap-3" aria-label="Website age recommendation: ages 3 and up">
          <span className={`${badgeFont.className} flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-white/20 text-xl font-normal leading-none text-white`}>3+</span>
        </div>
      </div>
      <div className="mt-7 flex flex-col gap-3 border-t border-white/[.06] pt-5 text-[11px] leading-5 text-white/45 md:flex-row md:items-center md:justify-between">
        <p>© 2016–2026 RAVZEN. All rights reserved.</p>
        <p>Designed &amp; developed by <span className="text-white/70">Ravindu Zekara</span></p>
      </div>
    </div>
  </footer>
}
