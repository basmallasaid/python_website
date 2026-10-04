import { Link } from 'react-router-dom'
import { Compass } from 'lucide-react'
import { Button } from '../components/ui/Button'

export function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
      <span className="flex size-14 items-center justify-center rounded-2xl bg-python-50 text-python-600">
        <Compass className="size-7" aria-hidden="true" />
      </span>
      <div>
        <p className="font-mono text-sm text-ink-400">404</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-ink-900">
          That page does not exist
        </h1>
        <p className="mt-2 max-w-sm text-ink-600">
          The link may be out of date. Head back to your dashboard and pick up where you
          left off.
        </p>
      </div>
      <Link to="/">
        <Button variant="primary">Back to dashboard</Button>
      </Link>
    </div>
  )
}
