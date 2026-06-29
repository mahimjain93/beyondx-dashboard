import { ExternalLink } from 'lucide-react'

export default function SourceButton({ href }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 text-xs text-[#9b9a97] hover:text-[#37352f] border border-[#e9e9e7] rounded-md px-3 py-1.5 transition-colors hover:bg-[#f7f6f3]"
    >
      <ExternalLink size={12} />
      Source data
    </a>
  )
}
