import type React from 'react'
import {
  XP_BTN,
  XP_BTN_ACTIVE,
  XP_BTN_SM,
  XP_INPUT,
  XP_RAISED,
  XP_TITLE_BAR,
} from './xp'

type XpButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  active?: boolean
  variant?: 'small' | 'primary'
}

export function XpButton({ active = false, variant = 'small', style, ...props }: XpButtonProps) {
  const base = variant === 'primary' ? XP_BTN : XP_BTN_SM
  return <button style={{ ...base, ...(active ? XP_BTN_ACTIVE : {}), ...style }} {...props} />
}

type XpInputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  full?: boolean
}

export function XpInput({ full = false, style, ...props }: XpInputProps) {
  return (
    <input
      style={{ ...XP_INPUT, ...(full ? { width: '100%', boxSizing: 'border-box' as const } : {}), ...style }}
      {...props}
    />
  )
}

type XpSelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  full?: boolean
}

export function XpSelect({ full = false, style, ...props }: XpSelectProps) {
  return (
    <select
      style={{ ...XP_INPUT, ...(full ? { width: '100%', boxSizing: 'border-box' as const } : {}), ...style }}
      {...props}
    />
  )
}

type XpPanelProps = React.HTMLAttributes<HTMLDivElement> & {
  raised?: boolean
}

export function XpPanel({ raised = true, style, ...props }: XpPanelProps) {
  return (
    <div
      style={{ background: 'var(--bg-window)', overflow: 'hidden', flexShrink: 0, ...(raised ? XP_RAISED : {}), ...style }}
      {...props}
    />
  )
}

type XpSectionProps = React.HTMLAttributes<HTMLDivElement> & {
  title: React.ReactNode
  actions?: React.ReactNode
  bodyStyle?: React.CSSProperties
  raised?: boolean
}

type XpTitleBarProps = React.HTMLAttributes<HTMLDivElement>

export function XpTitleBar({ style, ...props }: XpTitleBarProps) {
  return <div style={{ ...XP_TITLE_BAR, display: 'flex', alignItems: 'center', ...style }} {...props} />
}

export function XpSection({ title, actions, bodyStyle, children, raised = true, style, ...props }: XpSectionProps) {
  return (
    <XpPanel raised={raised} style={style} {...props}>
      <XpTitleBar>
        <span style={{ flex: 1 }}>{title}</span>
        {actions}
      </XpTitleBar>
      <div style={{ padding: '6px 8px', ...bodyStyle }}>{children}</div>
    </XpPanel>
  )
}
