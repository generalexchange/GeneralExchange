import React from 'react';

interface ConfusionMatrixGridProps {
  rows: { predicted: string; actuals: Record<string, number> }[];
}

export const ConfusionMatrixGrid: React.FC<ConfusionMatrixGridProps> = ({ rows }) => {
  const cols = ['Up', 'Down', 'Hold'];
  const maxVal = Math.max(
    ...rows.flatMap((r) => cols.map((c) => r.actuals[c] ?? 0)),
    1
  );

  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] backdrop-blur-md p-4 sm:p-5 h-full transition-all hover:border-cyan-500/20">
      <p className="text-[11px] uppercase tracking-wider text-cyan-400/90 font-semibold mb-1">Confusion matrix</p>
      <p className="text-xs text-zinc-500 mb-4" title="Rows: model prediction. Columns: realized outcome.">
        Predicted vs realized direction (mock counts)
      </p>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[280px] text-sm border-separate border-spacing-2">
          <thead>
            <tr>
              <th className="text-left text-zinc-500 text-xs font-medium p-2" />
              {cols.map((c) => (
                <th key={c} className="text-center text-zinc-400 text-xs font-semibold p-2">
                  Actual {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.predicted}>
                <td className="text-zinc-400 text-xs font-medium p-2 whitespace-nowrap">Pred {row.predicted}</td>
                {cols.map((c) => {
                  const v = row.actuals[c] ?? 0;
                  const intensity = v / maxVal;
                  return (
                    <td key={c} className="p-0">
                      <div
                        className="rounded-lg p-3 text-center font-mono text-white text-sm border border-white/10 transition-transform duration-200 hover:scale-[1.03] hover:z-10 hover:border-white/25 cursor-default"
                        style={{
                          backgroundColor: `rgba(6, 182, 212, ${0.12 + intensity * 0.55})`,
                        }}
                        title={`Count: ${v}`}
                      >
                        {v}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
