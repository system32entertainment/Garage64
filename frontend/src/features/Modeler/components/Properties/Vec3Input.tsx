import { s } from '../../styles'
import { XpInput } from '../../../../ui/components'

export default function Vec3Input({ label, value = [0, 0, 0], step = 0.5, onChange }) {
  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{ ...s.label, marginBottom: 2 }}>{label}</div>
      <div style={{ display: 'flex', gap: 3, width: '100%' }}>
        {['X', 'Y', 'Z'].map((ax, i) => (
          <div key={ax} style={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1, minWidth: 0 }}>
            <span style={s.propLabel}>{ax}</span>
            <XpInput type="number" step={step} style={{ flex: 1, minWidth: '40px', width: 0 }}
              value={Math.round((value[i] ?? 0) * 1000) / 1000}
              onChange={e => { const n = [...value]; n[i] = Number(e.target.value); onChange(n) }} />
          </div>
        ))}
      </div>
    </div>
  )
}
