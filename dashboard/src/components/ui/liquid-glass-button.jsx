import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority"
import { cn } from "@/lib/utils"

// ─── Global SVG filter — injected once at root ─────────────────────────────
export function GlassFilterDefs() {
  return (
    <svg
      aria-hidden="true"
      style={{ position: 'fixed', width: 0, height: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: -999 }}
    >
      <defs>
        <filter
          id="liquid-glass-filter"
          x="-20%" y="-20%"
          width="140%" height="140%"
          colorInterpolationFilters="sRGB"
        >
          <feTurbulence type="fractalNoise" baseFrequency="0.065 0.065" numOctaves="1" seed="2" result="turbulence" />
          <feGaussianBlur in="turbulence" stdDeviation="1.5" result="blurredNoise" />
          <feDisplacementMap in="SourceGraphic" in2="blurredNoise" scale="55" xChannelSelector="R" yChannelSelector="B" result="displaced" />
          <feGaussianBlur in="displaced" stdDeviation="3.5" result="finalBlur" />
          <feComposite in="finalBlur" in2="finalBlur" operator="over" />
        </filter>
      </defs>
    </svg>
  )
}
// ─── Standard Button ──────────────────────────────────────────────────────────
const buttonVariants = cva(
  "inline-flex items-center cursor-pointer justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  }
)

export const Button = React.forwardRef(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    )
  }
)
Button.displayName = "Button"

// ─── Liquid Glass Button ──────────────────────────────────────────────────────
const liquidbuttonVariants = cva(
  "inline-flex items-center transition-colors justify-center cursor-pointer gap-2 whitespace-nowrap text-sm font-semibold transition-[color,box-shadow] disabled:pointer-events-none disabled:opacity-50 outline-none",
  {
    variants: {
      variant: {
        default: "bg-transparent hover:scale-105 duration-300 transition text-white",
        ghost: "hover:bg-white/5",
      },
      size: {
        default: "h-9 px-5 py-2",
        sm: "h-8 text-xs px-4",
        lg: "h-11 px-7",
        xl: "h-12 px-8",
        xxl: "h-14 px-10",
        icon: "size-9",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  }
)

// The SVG filter that creates the liquid/water distortion effect
function GlassFilter() {
  return (
    <svg className="hidden" aria-hidden="true">
      <defs>
        <filter
          id="liquid-glass-filter"
          x="-20%" y="-20%"
          width="140%" height="140%"
          colorInterpolationFilters="sRGB"
        >
          {/* Turbulent noise for liquid distortion */}
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.065 0.065"
            numOctaves="1"
            seed="2"
            result="turbulence"
          />
          {/* Soften the noise */}
          <feGaussianBlur in="turbulence" stdDeviation="1.5" result="blurredNoise" />
          {/* Displace source graphic using noise channels */}
          <feDisplacementMap
            in="SourceGraphic"
            in2="blurredNoise"
            scale="55"
            xChannelSelector="R"
            yChannelSelector="B"
            result="displaced"
          />
          {/* Final blur pass for frosted effect */}
          <feGaussianBlur in="displaced" stdDeviation="3.5" result="finalBlur" />
          <feComposite in="finalBlur" in2="finalBlur" operator="over" />
        </filter>
      </defs>
    </svg>
  )
}

export function LiquidButton({ className, variant, size, asChild = false, children, ...props }) {
  const Comp = asChild ? Slot : "button"
  return (
    <>
      <Comp
        data-slot="button"
        className={cn("relative rounded-full", liquidbuttonVariants({ variant, size, className }))}
        {...props}
      >
        {/* Liquid glass lens layer — applies SVG distortion filter */}
        <div
          className="absolute inset-0 -z-10 rounded-full overflow-hidden"
          style={{ backdropFilter: 'url(#liquid-glass-filter) blur(2px)' }}
        />
        {/* Highlight ring — outer glow + inset shimmer */}
        <div
          className="absolute inset-0 z-0 rounded-full"
          style={{
            boxShadow: `
              0 0 0 1px rgba(255,255,255,0.18),
              0 2px 8px rgba(0,0,0,0.25),
              inset 0 1px 1px rgba(255,255,255,0.45),
              inset 0 -1px 1px rgba(0,0,0,0.25),
              inset 3px 3px 0.5px -3px rgba(255,255,255,0.15),
              inset -3px -3px 0.5px -3px rgba(255,255,255,0.75),
              inset 1px 1px 1px -0.5px rgba(255,255,255,0.55),
              inset -1px -1px 1px -0.5px rgba(255,255,255,0.55),
              inset 0 0 8px 4px rgba(255,255,255,0.08),
              0 0 16px rgba(255,255,255,0.06)
            `
          }}
        />
        {/* Content */}
        <span className="relative z-10 pointer-events-none">{children}</span>
      </Comp>
      <GlassFilter />
    </>
  )
}

// ─── Liquid Glass Panel (for cards and sections) ──────────────────────────────
// A div-level version of the liquid glass effect for use as panel backgrounds
export function LiquidPanel({ className, children, intensity = "md", ...props }) {
  const blurMap = { sm: "3px", md: "18px", lg: "24px" }
  const displaceMap = { sm: "30", md: "55", lg: "80" }

  return (
    <div className={cn("relative overflow-hidden", className)} {...props}>
      {/* Liquid glass distortion layer */}
      <div
        className="absolute inset-0 -z-10 rounded-[inherit]"
        style={{
          backdropFilter: `url(#liquid-glass-filter) blur(${blurMap[intensity]})`,
          WebkitBackdropFilter: `blur(${blurMap[intensity]})`,
        }}
      />
      {/* Glass surface tint */}
      <div
        className="absolute inset-0 -z-10 rounded-[inherit]"
        style={{
          background: 'rgba(255,255,255,0.04)',
          boxShadow: `
            0 0 0 1px rgba(255,255,255,0.12),
            0 8px 32px rgba(0,0,0,0.4),
            inset 0 1px 0 rgba(255,255,255,0.15),
            inset 0 -1px 0 rgba(0,0,0,0.1)
          `
        }}
      />
      {children}
    </div>
  )
}
