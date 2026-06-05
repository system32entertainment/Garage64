import type React from 'react'
import {
  XP_BORDER_BUTTON,
  XP_BORDER_BUTTON_ACTIVE,
  XP_BORDER_BUTTON_PRIMARY,
  XP_BORDER_RAISED,
  XP_BORDER_SUNKEN,
  XP_FONT,
} from './tokens'

export const XP_RAISED: React.CSSProperties = XP_BORDER_RAISED
export const XP_SUNKEN: React.CSSProperties = XP_BORDER_SUNKEN

export const XP_TITLE: React.CSSProperties = {
  background: 'var(--bg-title)',
  color: 'var(--clr-text-on-title)',
  padding: '2px 8px',
  fontSize: '11px',
  fontWeight: 'bold',
  fontFamily: XP_FONT,
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  flexShrink: 0,
}

export const XP_TITLE_BAR: React.CSSProperties = {
  ...XP_TITLE,
  borderBottom: '1px solid var(--bdr-dk)',
}

export const XP_BTN_SM: React.CSSProperties = {
  padding: '2px 8px',
  background: 'var(--bg-btn)',
  ...XP_BORDER_BUTTON,
  color: 'var(--clr-text)',
  cursor: 'pointer',
  fontSize: '11px',
  fontFamily: XP_FONT,
  fontWeight: 'bold',
}

export const XP_BTN_ACTIVE: React.CSSProperties = {
  ...XP_BTN_SM,
  background: 'var(--bg-btn-active)',
  ...XP_BORDER_BUTTON_ACTIVE,
}

export const XP_BTN: React.CSSProperties = {
  padding: '4px 16px',
  background: 'var(--bg-btn-primary)',
  ...XP_BORDER_BUTTON_PRIMARY,
  color: '#fff',
  fontFamily: XP_FONT,
  fontSize: '11px',
  fontWeight: 'bold',
  cursor: 'pointer',
}

export const XP_INPUT: React.CSSProperties = {
  padding: '3px 6px',
  background: 'var(--bg-input)',
  color: 'var(--clr-text)',
  ...XP_BORDER_SUNKEN,
  fontFamily: XP_FONT,
  fontSize: '11px',
}

export const XP_PAGE: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  height: 'calc(100vh - 48px)',
  background: 'var(--bg-window)',
  margin: '-1.5rem -2rem',
  overflow: 'hidden',
}

export const XP_LABEL: React.CSSProperties = {
  color: 'var(--clr-text-dim)',
  fontSize: '11px',
  fontFamily: XP_FONT,
}

export const XP_OK: React.CSSProperties = {
  color: 'var(--clr-ok)',
  fontSize: '11px',
  fontFamily: XP_FONT,
}

export const XP_ERR: React.CSSProperties = {
  color: 'var(--clr-err)',
  fontSize: '11px',
  fontFamily: XP_FONT,
}
