import { WORKFLOW_ORDER } from '@/lib/workflowConfig';

export default function ProgressTracker({ status }) {
  const order = WORKFLOW_ORDER;
  const idx = order.indexOf(status);

  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      {order.map((s, i) => {
        const done = i < idx;
        const current = i === idx;
        return (
          <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 22,
              height: 22,
              borderRadius: 999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: done ? '#28a745' : current ? '#1e90ff' : '#e9ecef',
              color: done || current ? '#fff' : '#6c757d',
              fontSize: 12,
              fontWeight: 700,
              border: '2px solid rgba(0,0,0,0.03)'
            }}>{done ? '✓' : i + 1}</div>
            {i < order.length - 1 && (
              <div style={{ width: 36, height: 2, background: done ? '#28a745' : '#e9ecef' }} />
            )}
          </div>
        );
      })}
    </div>
  );
}
