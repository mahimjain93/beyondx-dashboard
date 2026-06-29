import { ExternalLink } from 'lucide-react'

export default function SourceButton({ href }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#7a91b8] hover:text-[#1B2A6B] border border-[#E8EEF6] rounded-lg px-3 py-1.5 transition-colors hover:bg-[#F5F7FA] bg-white"
    >
      <ExternalLink size={12} />
      Source data
    </a>
  )
}
