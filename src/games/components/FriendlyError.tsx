import { motion } from 'framer-motion'
import { CircleAlert } from 'lucide-react'

export function FriendlyError({ message }: { message: string }) {
  if (!message) return null

  return (
    <motion.p
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      role="alert"
      className="flex items-start gap-2.5 rounded-2xl border border-danger-200 bg-danger-50 px-4 py-3 text-sm leading-relaxed font-medium text-danger-700"
    >
      <CircleAlert className="mt-px size-4.5 shrink-0" aria-hidden="true" />
      <span>{message}</span>
    </motion.p>
  )
}
