import { useEffect, useState } from 'react'
import { useFileStore } from '@/store/fileStore'

export const useStoreHydration = (): boolean => {
  const [hydrated, setHydrated] = useState(() =>
    useFileStore.persist.hasHydrated(),
  )

  useEffect(() => {
    setHydrated(useFileStore.persist.hasHydrated())
    return useFileStore.persist.onFinishHydration(() => setHydrated(true))
  }, [])

  return hydrated
}
