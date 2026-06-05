import { s, XP_TITLE } from '../styles'
import { XpButton, XpSelect } from '../../../ui/components'

export default function TopBar({ editMode, setEditMode, bodies, bodyId, setBodyId, parts, partId, setPartId, showBody, setShowBody, tcMode, setTcMode, showGrid, setShowGrid, sel, status, isDirty, addCube, deleteSelected, save, revert, onBack }) {
  return (
    <div style={s.topBar}>
      {onBack && <div style={s.divider} />}
      <XpButton active={editMode === 'body'} onClick={() => setEditMode('body')}>Body</XpButton>
      <XpButton active={editMode === 'part'} onClick={() => setEditMode('part')}>Part</XpButton>
      {editMode === 'body'
        ? <XpSelect style={{ width: 'auto' }} value={bodyId ?? ''} onChange={e => setBodyId(Number(e.target.value))}>
          {bodies.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
        </XpSelect>
        : <XpSelect style={{ width: 'auto' }} value={partId ?? ''} onChange={e => setPartId(Number(e.target.value))}>
          {parts.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </XpSelect>
      }
      {editMode === 'part' && bodyId && <>
        <div style={s.divider} />
        <XpButton active={showBody} onClick={() => setShowBody(v => !v)} title="Toggle body preview">◉ Body</XpButton>
      </>}
      <div style={s.divider} />
      <XpButton active={tcMode === 'translate'} onClick={() => setTcMode('translate')} title="Move (W)">⤢ Move</XpButton>
      <XpButton active={tcMode === 'rotate'} onClick={() => setTcMode('rotate')} title="Rotate (E)">↻ Rotate</XpButton>
      <XpButton active={tcMode === 'pivot'} onClick={() => setTcMode('pivot')} title="Move pivot (keeps geometry in place)">⊙ Pivot</XpButton>
      <div style={s.divider} />
      <XpButton active={showGrid} onClick={() => setShowGrid(v => !v)}>⊞ Grid</XpButton>
      <div style={s.divider} />
      <XpButton onClick={addCube}>+ Cube</XpButton>
      <XpButton style={{ opacity: sel ? 1 : 0.4 }} onClick={deleteSelected} disabled={!sel} title="Delete (Del)">✕ Delete</XpButton>
      <div style={{ marginLeft: 'auto', display: 'flex', gap: '6px', alignItems: 'center' }}>
        {status === 'ok' && <span style={s.ok}>Saved!</span>}
        {status && status !== 'ok' && <span style={s.err}>{status}</span>}
        <XpButton style={{ opacity: isDirty ? 1 : 0.4 }} onClick={revert} disabled={!isDirty}>Revert</XpButton>
        <XpButton variant="primary" onClick={save}>Save</XpButton>
      </div>
    </div>
  )
}
