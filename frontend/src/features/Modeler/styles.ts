import React from 'react'
import { XP_BTN, XP_BTN_ACTIVE, XP_BTN_SM, XP_ERR, XP_INPUT, XP_LABEL, XP_OK, XP_PAGE, XP_TITLE } from '../../ui/xp'

export const DEG = Math.PI / 180

export { XP_BTN_SM, XP_INPUT, XP_TITLE }

export const s: Record<string, React.CSSProperties> = {
  page: XP_PAGE,
  topBar: { display: 'flex', alignItems: 'center', gap: '6px', padding: '4px 8px', flexShrink: 0, borderBottom: '2px solid var(--bdr-dk)', background: 'var(--bg-panel)' },
  content: { flex: 1, display: 'flex', overflow: 'hidden' },
  outliner: { width: 240, flexShrink: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: 'var(--bg-panel)', borderRight: '2px solid var(--bdr-dk)' },
  viewport: { flex: 1, position: 'relative', overflow: 'hidden' },
  rPanel: { flexShrink: 0, position: 'relative', display: 'flex', flexDirection: 'column', overflow: 'hidden', background: 'var(--bg-panel)', borderLeft: '2px solid var(--bdr-dk)' },
  label: XP_LABEL,
  btnSm: XP_BTN_SM,
  btnAct: XP_BTN_ACTIVE,
  btn: XP_BTN,
  divider: { width: 1, height: 22, background: 'var(--bdr-dk)', margin: '0 2px', flexShrink: 0 },
  select: { ...XP_INPUT },
  numInput: { ...XP_INPUT, flex: 1, minWidth: '40px' },
  propLabel: { color: 'var(--clr-text-dim)', fontSize: '10px', fontFamily: 'Monocraft, sans-serif', width: '14px', textAlign: 'right', flexShrink: 0 },
  ok: XP_OK,
  err: XP_ERR,
  treeRow: { display: 'flex', alignItems: 'center', gap: '3px', padding: '1px 4px', cursor: 'pointer', fontSize: '11px', fontFamily: 'Monocraft, sans-serif', userSelect: 'none', minHeight: '20px' },
}
