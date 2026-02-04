'use client'

import { useEffect, useState } from 'react'

// Returns true when viewport width is below the given breakpoint (default 768px).
export function useIsMobile(breakpoint: number = 768) {
  const [isMobile, setIsMobile] = useState<boolean>(false)

  useEffect(() => {
    const query = window.matchMedia(`(max-width: ${breakpoint}px)`)
    const handleChange = (event: MediaQueryListEvent | MediaQueryList) =>
      setIsMobile(event.matches)

    // Set initial value and subscribe to changes
    handleChange(query)
    query.addEventListener('change', handleChange)

    return () => query.removeEventListener('change', handleChange)
  }, [breakpoint])

  return isMobile
}
