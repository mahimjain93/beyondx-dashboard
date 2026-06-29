import { ExternalLink } from 'lucide-react'

export default function SourceButton({ href }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-700 border border-gray-200 rounded-lg px-3 py-1.5 transition-colors hover:bg-gray-50"
    >
      <ExternalLink size={12} />
      Source data
    </a>
  )
}
