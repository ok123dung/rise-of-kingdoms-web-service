'use client'

import { useEffect, useRef } from 'react'

interface ScrollDepthMonitorProps {
  onMilestone?: (depth: number) => void
  milestones?: number[]
}

export function ScrollDepthMonitor({ 
  onMilestone,
  milestones = [25, 50, 75, 90] 
}: ScrollDepthMonitorProps) {
  const maxScrollDepthRef = useRef(0)
  const milestonesReachedRef = useRef(new Set<number>())

  useEffect(() => {
    if (typeof window === 'undefined') return

    const handleScroll = () => {
      const scrollDepth = Math.round(
        (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100
      )

      if (scrollDepth > maxScrollDepthRef.current) {
        maxScrollDepthRef.current = scrollDepth

        // Check milestones
        milestones.forEach(milestone => {
          if (
            scrollDepth >= milestone && 
            !milestonesReachedRef.current.has(milestone)
          ) {
            milestonesReachedRef.current.add(milestone)
            onMilestone?.(milestone)

            if (window.gtag) {
              window.gtag('event', 'scroll_depth', {
                event_category: 'engagement',
                event_label: `${milestone}%`,
                value: milestone,
                custom_parameter_1: 'user_engagement'
              })
            }
          }
        })
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [milestones, onMilestone])

  return null
}