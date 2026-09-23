import { Brain, TrendingUp, TrendingDown, Minus, AlertTriangle } from 'lucide-react';
import Card, { CardHeader } from './ui/Card';
import Badge from './ui/Badge';
import type { AiPredictions, AiTrend } from '../types';

interface AiPredictionsCardProps {
  data: AiPredictions | null;
  loading: boolean;
  error: string | null;
}

const trendConfig: Record<
  AiTrend,
  { label: string; icon: typeof TrendingUp; tone: 'green' | 'red' | 'gray' }
> = {
  hausse: { label: 'Hausse', icon: TrendingUp, tone: 'green' },
  baisse: { label: 'Baisse', icon: TrendingDown, tone: 'red' },
  stable: { label: 'Stable', icon: Minus, tone: 'gray' },
};

export default function AiPredictionsCard({ data, loading, error }: AiPredictionsCardProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader title="Prévisions IA" subtitle="Analyse en cours…" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-10 bg-slate-100 rounded-lg animate-pulse" />
          ))}
        </div>
      </Card>
    );
  }

  if (error || !data) {
    return (
      <Card>
        <CardHeader title="Prévisions IA" />
        <div className="flex items-center gap-2 text-slate-500 text-sm py-4">
          <AlertTriangle className="w-4 h-4" />
          <span>Service IA indisponible</span>
        </div>
      </Card>
    );
  }

  const topServices = data.services.slice(0, 5);

  return (
    <Card>
      <CardHeader
        title="Prévisions IA"
        subtitle={`Charge prévue sur ${data.forecast_days} jours`}
        action={
          <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600">
            <Brain className="w-4 h-4" />
          </div>
        }
      />

      <div className="space-y-3">
        {topServices.map((service) => {
          const config = trendConfig[service.trend];
          const Icon = config.icon;

          return (
            <div
              key={service.service_name}
              className="flex items-center justify-between py-2.5 border-b border-slate-100 last:border-0"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-800 truncate">
                  {service.service_name}
                </p>
                <p className="text-xs text-slate-500">
                  Moy. hist. : {service.average_history} · Prévu :{' '}
                  {service.average_forecast}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0 ml-3">
                <Badge tone={config.tone} dot>
                  <Icon className="w-3 h-3" />
                  {config.label}
                </Badge>
                <span
                  className={`text-xs font-semibold w-14 text-right ${
                    service.variation_pct > 0
                      ? 'text-emerald-600'
                      : service.variation_pct < 0
                      ? 'text-red-600'
                      : 'text-slate-500'
                  }`}
                >
                  {service.variation_pct > 0 ? '+' : ''}
                  {service.variation_pct}%
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-xs text-slate-400 mt-4 text-center">
        Modèle de régression linéaire · {data.history_days} jours d'historique
      </p>
    </Card>
  );
}