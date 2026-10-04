import { motion } from 'framer-motion'
import { Rocket } from 'lucide-react'
import { SHARED_STRINGS } from '../strings'

export function RunButton({ onRun }: { onRun: () => void }) {
  return (
    <motion.button
      type="button"
      onClick={onRun}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-2xl bg-success-600 px-7 text-base font-semibold text-white shadow-lift transition-colors hover:bg-success-700 sm:flex-none"
    >
      <Rocket className="size-5" aria-hidden="true" />
      {SHARED_STRINGS.run}
    </motion.button>
  )
}
