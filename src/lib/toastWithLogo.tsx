import { toast } from 'sonner'
import { SparkLogo } from '@/components/SparkLogo'

export function successToast(message: string) {
  return toast.success(message, {
    icon: (
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary via-accent to-primary-foreground/20 flex items-center justify-center">
        <SparkLogo className="w-5 h-5 text-primary-foreground" animated />
      </div>
    ),
    duration: 3000,
  })
}

export function sparkToast(message: string, options?: { duration?: number; description?: string }) {
  return toast(message, {
    icon: (
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary via-accent to-primary-foreground/20 flex items-center justify-center">
        <SparkLogo className="w-5 h-5 text-primary-foreground" animated />
      </div>
    ),
    duration: options?.duration ?? 3000,
    description: options?.description,
  })
}
