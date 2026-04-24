import { useId } from 'react'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const InputError = () => {
  const id = useId()

  console.log(id)

  return (
    <div className='w-full max-w-xs space-y-2'>
      <Label htmlFor={id}>Input with error</Label>
      <Input
        id={id}
        type='email'
        placeholder='Email address'
        className='w-full min-h-[3.5rem] rounded-2xl border border-transparent bg-surface-lowest py-[0.9rem] pr-4 pl-12 text-text outline-none transition-all duration-200 focus:border-primary/36 focus:shadow-[0_0_0_3px_rgba(221,184,255,0.12)]'
        defaultValue='invalid@email.com'
        aria-invalid
      />
      <p className='text-muted-foreground peer-aria-invalid:text-destructive text-xs'>This email is invalid.</p>
    </div>
  )
}

export default InputError
