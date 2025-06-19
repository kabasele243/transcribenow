import Link from 'next/link'

interface LogoProps {
  className?: string
  showLink?: boolean
}

export default function Logo({ className = '', showLink = true }: LogoProps) {
  const logoContent = (
    <span className={`text-2xl font-bold text-blue-600 ${className}`}>
      Transcribe
    </span>
  )

  if (showLink) {
    return (
      <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
        {logoContent}
      </Link>
    )
  }

  return logoContent
} 