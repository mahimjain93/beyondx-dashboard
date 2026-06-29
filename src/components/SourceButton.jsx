import { ExternalLink } from 'lucide-react'

export default function SourceButton({ href }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#6b84b8] hover:text-[#1a2f6b] border border-[#d0daea] rounded-lg px-3 py-1.5 transition-colors hover:bg-[#eef2f7] bg-white"
    >
      <ExternalLink size={12} />
      Source data
    </a>
  )
}
