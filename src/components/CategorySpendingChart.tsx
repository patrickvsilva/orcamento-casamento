import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import type { CategorySpending } from '@/lib/vendor-utils';
import { PieChart } from 'lucide-react';

const CHART_COLORS = [
  'var(--chart-1)',
  'var(--chart-2)',
  'var(--chart-3)',
  'var(--chart-4)',
  'var(--chart-5)',
  'var(--chart-6)',
  'var(--chart-7)',
  'var(--chart-8)',
] as const;

const SLICE_GAP = 2.5;

function polarToCartesian(cx: number, cy: number, radius: number, angleDeg: number) {
  const angleRad = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: cx + radius * Math.cos(angleRad),
    y: cy + radius * Math.sin(angleRad),
  };
}

function describeDonutSlice(
  cx: number,
  cy: number,
  outerRadius: number,
  innerRadius: number,
  startAngle: number,
  endAngle: number,
) {
  const startOuter = polarToCartesian(cx, cy, outerRadius, endAngle);
  const endOuter = polarToCartesian(cx, cy, outerRadius, startAngle);
  const startInner = polarToCartesian(cx, cy, innerRadius, startAngle);
  const endInner = polarToCartesian(cx, cy, innerRadius, endAngle);
  const largeArc = endAngle - startAngle > 180 ? 1 : 0;

  return [
    `M ${startOuter.x} ${startOuter.y}`,
    `A ${outerRadius} ${outerRadius} 0 ${largeArc} 0 ${endOuter.x} ${endOuter.y}`,
    `L ${startInner.x} ${startInner.y}`,
    `A ${innerRadius} ${innerRadius} 0 ${largeArc} 1 ${endInner.x} ${endInner.y}`,
    'Z',
  ].join(' ');
}

interface CategorySpendingChartProps {
  data: CategorySpending[];
}

export function CategorySpendingChart({ data }: CategorySpendingChartProps) {
  const total = data.reduce((acc, item) => acc + item.amount, 0);
  const size = 220;
  const center = size / 2;
  const outerRadius = center - 8;
  const innerRadius = outerRadius * 0.62;
  const totalGap = data.length * SLICE_GAP;
  const availableAngle = 360 - totalGap;

  let currentAngle = SLICE_GAP / 2;
  const slices = data.map((item, index) => {
    const sliceAngle = (item.percentage / 100) * availableAngle;
    const startAngle = currentAngle;
    const endAngle = currentAngle + sliceAngle;
    currentAngle = endAngle + SLICE_GAP;

    return {
      ...item,
      color: CHART_COLORS[index % CHART_COLORS.length],
      path: describeDonutSlice(center, center, outerRadius, innerRadius, startAngle, endAngle),
    };
  });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-base font-medium">Gasto por categoria</CardTitle>
          <CardDescription>Valor pago em cada categoria</CardDescription>
        </div>
        <PieChart className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Nenhum pagamento registrado ainda.
          </p>
        ) : (
          <div className="flex flex-col items-center gap-8 sm:flex-row sm:items-center sm:justify-center">
            <div className="relative shrink-0">
              <svg
                viewBox={`0 0 ${size} ${size}`}
                className="h-52 w-52"
                role="img"
                aria-label="Gráfico de pizza com gasto por categoria"
              >
                {slices.map((slice) => (
                  <path
                    key={slice.category}
                    d={slice.path}
                    fill={slice.color}
                    className="transition-opacity hover:opacity-90"
                  />
                ))}
              </svg>
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                  Total pago
                </span>
                <span className="mt-0.5 text-lg font-semibold tracking-tight">
                  {formatCurrency(total)}
                </span>
              </div>
            </div>

            <ul className="w-full min-w-0 space-y-3 sm:max-w-sm sm:flex-1">
              {slices.map((slice) => (
                <li key={slice.category} className="flex items-center gap-3">
                  <span
                    className="h-3 w-3 shrink-0 rounded-[5px]"
                    style={{ backgroundColor: slice.color }}
                    aria-hidden
                  />
                  <span className="min-w-0 flex-1 truncate text-sm font-medium">
                    {slice.category}
                  </span>
                  <span className="shrink-0 text-sm tabular-nums text-muted-foreground">
                    {slice.percentage.toFixed(0)}%
                  </span>
                  <span className="shrink-0 text-sm font-medium tabular-nums">
                    {formatCurrency(slice.amount)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
