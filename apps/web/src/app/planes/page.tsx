'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api, Plan, Subscription } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';

function formatPrice(cents: number, currency: string): string {
  if (cents === 0) return 'Gratis';
  return `${(cents / 100).toLocaleString('es-MX', { style: 'currency', currency })}/mes`;
}

export default function PlanesPage() {
  const { user, token, loading: authLoading } = useAuth();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [actioningPlanId, setActioningPlanId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadSubscription = async () => {
    if (!user) {
      setSubscription(null);
      return;
    }
    const mine = await api.get<Subscription | null>('/subscriptions/me', token).catch(() => null);
    setSubscription(mine);
  };

  useEffect(() => {
    if (authLoading) return;
    api
      .get<Plan[]>('/plans')
      .then(setPlans)
      .catch(() => setPlans([]))
      .finally(() => setLoading(false));
    loadSubscription();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, user]);

  const handleSubscribe = async (planId: string) => {
    setError(null);
    setActioningPlanId(planId);
    try {
      await api.post('/subscriptions', { planId }, token);
      await loadSubscription();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo activar el plan');
    } finally {
      setActioningPlanId(null);
    }
  };

  const handleCancel = async () => {
    setError(null);
    setActioningPlanId('cancel');
    try {
      await api.post('/subscriptions/cancel', undefined, token);
      await loadSubscription();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo cancelar la suscripción');
    } finally {
      setActioningPlanId(null);
    }
  };

  return (
    <div className="min-h-screen px-4 pb-16 pt-24 sm:px-6 md:px-12">
      <div className="mx-auto max-w-4xl text-center">
        <h1 className="text-3xl font-extrabold text-white sm:text-4xl">Planes WAMVIDEO</h1>
        <p className="mt-3 text-white/60">
          Elige el plan que se ajuste a ti. Cancela cuando quieras.
        </p>

        {!authLoading && !user && (
          <p className="mt-4 text-sm text-white/50">
            <Link href="/login" className="font-medium text-white hover:underline">
              Inicia sesión
            </Link>{' '}
            para suscribirte a un plan.
          </p>
        )}

        {subscription && (
          <p className="mt-4 inline-block rounded-full bg-white/10 px-4 py-1.5 text-sm text-white">
            Tu plan actual: <span className="font-semibold">{subscription.plan.name}</span>
          </p>
        )}

        {error && <p className="mt-4 text-sm text-red-400">{error}</p>}
      </div>

      {!loading && (
        <div className="mx-auto mt-10 grid max-w-4xl grid-cols-1 gap-6 sm:grid-cols-2">
          {plans.map((plan) => {
            const isCurrent = subscription?.plan.id === plan.id;
            const isFree = plan.priceCents === 0;

            return (
              <div
                key={plan.id}
                className={`flex flex-col rounded-lg border p-6 ${
                  isCurrent ? 'border-primary bg-primary/10' : 'border-white/10 bg-surface'
                }`}
              >
                <h2 className="text-xl font-bold text-white">{plan.name}</h2>
                <p className="mt-2 text-3xl font-extrabold text-white">
                  {formatPrice(plan.priceCents, plan.currency)}
                </p>
                <ul className="mt-4 flex-1 space-y-2 text-sm text-white/70">
                  <li>Calidad hasta {plan.maxQuality}</li>
                  <li>{plan.maxProfiles} perfil(es)</li>
                  <li>{isFree ? 'Sin contenido Premium' : 'Incluye contenido Premium'}</li>
                </ul>

                {user && isCurrent && !isFree && (
                  <button
                    onClick={handleCancel}
                    disabled={actioningPlanId === 'cancel'}
                    className="mt-6 rounded-md border border-white/20 px-4 py-2.5 font-semibold text-white transition hover:bg-white/10 disabled:opacity-60"
                  >
                    {actioningPlanId === 'cancel' ? 'Cancelando…' : 'Cancelar suscripción'}
                  </button>
                )}

                {user && !isCurrent && (
                  <button
                    onClick={() => handleSubscribe(plan.id)}
                    disabled={actioningPlanId === plan.id}
                    className="mt-6 rounded-md bg-primary px-4 py-2.5 font-semibold text-white transition hover:bg-primary/90 disabled:opacity-60"
                  >
                    {actioningPlanId === plan.id ? 'Activando…' : 'Elegir plan'}
                  </button>
                )}

                {user && isCurrent && isFree && (
                  <span className="mt-6 rounded-md bg-white/10 px-4 py-2.5 text-center font-semibold text-white/60">
                    Plan actual
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
