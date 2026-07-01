import { ExternalLink } from 'lucide-react'
import clsx from 'clsx'

export default function SourceButton({ href, size = 'md' }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={clsx(
        'inline-flex items-center gap-1.5 font-semibold text-[#7a91b8] hover:text-[#1B2A6B] border border-[#E8EEF6] rounded-lg transition-colors hover:bg-[#F5F7FA] bg-white shrink-0',
        size === 'sm' ? 'text-[10px] px-2 py-1' : 'text-xs px-3 py-1.5'
      )}
    >
      <ExternalLink size={size === 'sm' ? 10 : 12} />
      Source data
    </a>
  )
}
