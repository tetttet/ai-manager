import * as React from "react"

export interface UseSidebarResizeProps {
  direction?: "left" | "right"
  currentWidth: string
  onResize: (width: string) => void
  onToggle?: () => void
  isCollapsed?: boolean
  minResizeWidth?: string
  maxResizeWidth?: string
  enableAutoCollapse?: boolean
  autoCollapseThreshold?: number
  expandThreshold?: number
  enableDrag?: boolean
  setIsDraggingRail?: (isDragging: boolean) => void
  widthCookieName?: string
  widthCookieMaxAge?: number
  isNested?: boolean
  enableToggle?: boolean
}

interface WidthUnit {
  value: number
  unit: "rem" | "px"
}

function parseWidth(width: string): WidthUnit {
  const unit = width.endsWith("rem") ? "rem" : "px"
  const value = Number.parseFloat(width)
  return { value, unit }
}

function toPx(width: string): number {
  const { value, unit } = parseWidth(width)
  return unit === "rem" ? value * 16 : value
}

function formatWidth(value: number, unit: "rem" | "px"): string {
  return `${unit === "rem" ? value.toFixed(1) : Math.round(value)}${unit}`
}

export function useSidebarResize({
  direction = "right",
  currentWidth,
  onResize,
  onToggle,
  isCollapsed = false,
  minResizeWidth = "14rem",
  maxResizeWidth = "24rem",
  enableToggle = true,
  enableAutoCollapse = true,
  autoCollapseThreshold = 1.5,
  expandThreshold = 0.2,
  enableDrag = true,
  setIsDraggingRail = () => {},
  widthCookieName,
  widthCookieMaxAge = 60 * 60 * 24 * 7,
  isNested = false,
}: UseSidebarResizeProps) {
  const dragRef = React.useRef<HTMLButtonElement>(null)
  const startWidth = React.useRef(0)
  const startX = React.useRef(0)
  const isDragging = React.useRef(false)
  const isInteractingWithRail = React.useRef(false)
  const lastTogglePoint = React.useRef(0)
  const lastDragDirection = React.useRef<"expand" | "collapse" | null>(null)
  const toggleCooldown = React.useRef(false)
  const lastToggleTime = React.useRef(0)
  const railRect = React.useRef<DOMRect | null>(null)

  const minWidthPx = React.useMemo(() => toPx(minResizeWidth), [minResizeWidth])
  const maxWidthPx = React.useMemo(() => toPx(maxResizeWidth), [maxResizeWidth])

  const isIncreasingWidth = React.useCallback(
    (currentX: number, referenceX: number): boolean =>
      direction === "left" ? currentX < referenceX : currentX > referenceX,
    [direction]
  )

  const calculateWidth = React.useCallback(
    (
      event: MouseEvent,
      initialX: number,
      initialWidth: number,
      currentRailRect: DOMRect | null
    ): number => {
      if (isNested && currentRailRect) {
        const deltaX = event.clientX - initialX
        return direction === "left" ? initialWidth - deltaX : initialWidth + deltaX
      }

      return direction === "left"
        ? window.innerWidth - event.clientX
        : event.clientX
    },
    [direction, isNested]
  )

  const persistWidth = React.useCallback(
    (width: string) => {
      if (widthCookieName) {
        document.cookie = `${widthCookieName}=${width}; path=/; max-age=${widthCookieMaxAge}`
      }
    },
    [widthCookieMaxAge, widthCookieName]
  )

  const handleMouseDown = React.useCallback(
    (event: React.MouseEvent) => {
      isInteractingWithRail.current = true

      if (!enableDrag) {
        return
      }

      const currentWidthPx = isCollapsed ? 0 : toPx(currentWidth)
      startWidth.current = currentWidthPx
      startX.current = event.clientX
      lastTogglePoint.current = event.clientX
      lastDragDirection.current = null
      toggleCooldown.current = false
      lastToggleTime.current = 0
      railRect.current =
        isNested && dragRef.current
          ? dragRef.current.getBoundingClientRect()
          : null

      event.preventDefault()
    },
    [currentWidth, enableDrag, isCollapsed, isNested]
  )

  React.useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      if (!isInteractingWithRail.current) {
        return
      }

      const deltaX = Math.abs(event.clientX - startX.current)
      if (!isDragging.current && deltaX > 5) {
        isDragging.current = true
        setIsDraggingRail(true)
      }

      if (!isDragging.current) {
        return
      }

      const { unit } = parseWidth(currentWidth)
      const currentRailRect =
        isNested && dragRef.current
          ? dragRef.current.getBoundingClientRect()
          : railRect.current
      const currentDragDirection = isIncreasingWidth(
        event.clientX,
        lastTogglePoint.current
      )
        ? "expand"
        : "collapse"

      if (lastDragDirection.current !== currentDragDirection) {
        lastDragDirection.current = currentDragDirection
      }

      const now = Date.now()
      if (toggleCooldown.current && now - lastToggleTime.current > 200) {
        toggleCooldown.current = false
      }

      if (!toggleCooldown.current) {
        if (enableAutoCollapse && onToggle && !isCollapsed) {
          const currentDragWidth = calculateWidth(
            event,
            startX.current,
            startWidth.current,
            currentRailRect
          )
          const shouldCollapse =
            currentDragDirection === "collapse" &&
            currentDragWidth <= minWidthPx * autoCollapseThreshold

          if (shouldCollapse) {
            onToggle()
            lastTogglePoint.current = event.clientX
            toggleCooldown.current = true
            lastToggleTime.current = now
            return
          }
        }

        if (
          onToggle &&
          isCollapsed &&
          currentDragDirection === "expand" &&
          Math.abs(event.clientX - lastTogglePoint.current) >
            minWidthPx * expandThreshold
        ) {
          onToggle()
          const initialWidth = calculateWidth(
            event,
            startX.current,
            startWidth.current,
            currentRailRect
          )
          const clampedWidth = Math.max(
            minWidthPx,
            Math.min(maxWidthPx, initialWidth)
          )
          const formattedWidth = formatWidth(
            unit === "rem" ? clampedWidth / 16 : clampedWidth,
            unit
          )

          onResize(formattedWidth)
          persistWidth(formattedWidth)
          lastTogglePoint.current = event.clientX
          toggleCooldown.current = true
          lastToggleTime.current = now
          return
        }
      }

      if (isCollapsed) {
        return
      }

      const newWidthPx = calculateWidth(
        event,
        startX.current,
        startWidth.current,
        currentRailRect
      )
      const clampedWidthPx = Math.max(
        minWidthPx,
        Math.min(maxWidthPx, newWidthPx)
      )
      const formattedWidth = formatWidth(
        unit === "rem" ? clampedWidthPx / 16 : clampedWidthPx,
        unit
      )

      onResize(formattedWidth)
      persistWidth(formattedWidth)
    }

    const handleMouseUp = () => {
      if (!isInteractingWithRail.current) {
        return
      }

      if (!isDragging.current && onToggle && enableToggle) {
        onToggle()
      }

      isDragging.current = false
      isInteractingWithRail.current = false
      lastDragDirection.current = null
      lastTogglePoint.current = 0
      toggleCooldown.current = false
      lastToggleTime.current = 0
      railRect.current = null
      setIsDraggingRail(false)
    }

    document.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("mouseup", handleMouseUp)

    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }
  }, [
    autoCollapseThreshold,
    calculateWidth,
    currentWidth,
    enableAutoCollapse,
    enableToggle,
    expandThreshold,
    isCollapsed,
    isIncreasingWidth,
    isNested,
    maxWidthPx,
    minWidthPx,
    onResize,
    onToggle,
    persistWidth,
    setIsDraggingRail,
  ])

  return {
    dragRef,
    handleMouseDown,
    isDragging,
  }
}
