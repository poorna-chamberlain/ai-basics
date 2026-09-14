import { useEffect, type RefObject } from 'react'

/**
 * Keeps the OS window exactly as tall as the panel's content, so it collapses
 * to a single search field and grows as results arrive.
 */
export function useAutoHeight(ref: RefObject<HTMLElement | null>): void {
  useEffect(() => {
    const element = ref.current
    if (!element) return

    let frame = 0
    const report = (): void => {
      cancelAnimationFrame(frame)
      // Measure after layout settles, otherwise the first frame of an
      // animating element reports its pre-animation size.
      frame = requestAnimationFrame(() => {
        window.quickImage.setOverlayHeight(Math.ceil(element.getBoundingClientRect().height))
      })
    }

    const observer = new ResizeObserver(report)
    observer.observe(element)
    report()

    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
    }
  }, [ref])
}
