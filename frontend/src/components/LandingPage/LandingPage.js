import React, { useState } from 'react';
import {
  CheckIcon,
  ArrowRightIcon,
  UsersIcon,
  DocumentTextIcon,
  ClockIcon,
  ChartBarIcon,
  StarIcon,
  ShieldCheckIcon,
  BoltIcon,
  SunIcon,
  MoonIcon
} from '@heroicons/react/24/outline';
import axios from 'axios';
import { useTheme } from '../../context/ThemeContext';

function LandingPage({ onLoginClick }) {
  const [email, setEmail] = useState('');
  const [joined, setJoined] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const { isDarkMode, toggleTheme } = useTheme();

  const handlePlanClick = (plan) => {
    let internalPlanName = 'solo';
    if (plan.name === 'Team') internalPlanName = 'team';
    if (plan.name === 'Enterprise AI') internalPlanName = 'enterprise';

    setSelectedPlan({ ...plan, internalId: internalPlanName });
    setShowPaymentModal(true);
  };

  const processPayment = async (gateway) => {
    try {
      // Typically we'd pass an auth token here, assuming test mock behavior without auth
      const token = localStorage.getItem('token') || 'mock-token';
      const res = await axios.post('http://localhost:5000/api/payments/checkout', {
        plan: selectedPlan.internalId,
        gateway
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (gateway === 'stripe') {
        alert(`Redirecting to Stripe Checkout: \n\n${res.data.url}`);
      } else {
        alert(`PayPal Order Created: \n\n${res.data.orderId}`);
      }
      setShowPaymentModal(false);
    } catch (error) {
      console.error("Payment Error:", error);
      alert("Bitte logge dich zuerst ein, um ein Abo abzuschließen.");
      setShowPaymentModal(false);
      onLoginClick();
    }
  };

  const handleJoinWaitlist = async (e) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    try {
      await axios.post('/api/waitlist', { email });
      setJoined(true);
    } catch (err) {
      console.error('Waitlist error:', err);
    } finally {
      setLoading(false);
    }
  };

  const features = [
    {
      icon: UsersIcon,
      title: 'Kundenverwaltung',
      description: 'Behalte alle Kundendaten, Kontakte und Projektgeschichte an einem Ort.'
    },
    {
      icon: DocumentTextIcon,
      title: 'Angebote & Verträge',
      description: 'Erstelle professionelle Angebote und track den Status in Echtzeit.'
    },
    {
      icon: ClockIcon,
      title: 'Zeiterfassung',
      description: 'Integrierter Timer für Projekte – nie wieder vergessene Stunden.'
    },
    {
      icon: ChartBarIcon,
      title: 'Task Management',
      description: 'Kanban-Board für alle Projekte. Delegiere Aufgaben effizient.'
    }
  ];

  const plans = [
    {
      name: 'Solo',
      price: '19',
      oldPrice: '29',
      description: 'Für Freelancer & Einzelkämpfer',
      features: ['Bis 10 Kunden', 'Unbegrenzte Projekte', 'Zeiterfassung', 'E-Mail Support'],
      buttonText: 'Kostenlos testen'
    },
    {
      name: 'Team',
      price: '49',
      oldPrice: '79',
      description: 'Für wachsende Agenturen',
      popular: true,
      features: ['Unbegrenzte Kunden', 'Team-Mitglieder', 'Erweiterte Berichte', 'Priorität Support', 'API Zugang'],
      buttonText: 'Kostenlos testen'
    },
    {
      name: 'Enterprise AI',
      price: '199',
      oldPrice: '299',
      description: 'Auto-Pilot für maximale Skalierung',
      earlyAccess: true,
      features: ['Alles aus Team', 'Native Claude 4.5 Opus KI', 'Automatische Angebotserstellung', 'Vollautomatisierte Kundenkommunikation', 'Lebenslanger Preis-Garantie'],
      buttonText: 'Early Access sichern'
    }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 transition-colors duration-300">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-gray-100 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <BoltIcon className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 dark:from-violet-400 dark:to-indigo-400 bg-clip-text text-transparent">
                AgencySync
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={toggleTheme}
                className="p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                {isDarkMode ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
              </button>
              <button
                onClick={onLoginClick}
                className="px-5 py-2 text-sm font-medium text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 transition-colors"
              >
                Login
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-50 via-white to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-950/20 opacity-70" />
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-bl from-violet-100/50 dark:from-violet-900/10 to-transparent" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 text-sm font-medium mb-8">
            <StarIcon className="h-4 w-4 mr-2" />
            Jetzt Beta-Tester werden & 50% Rabatt sichern
          </div>

          <h1 className="text-5xl lg:text-7xl font-bold text-gray-900 dark:text-white leading-tight mb-6">
            Deine Agentur.
            <br />
            <span className="bg-gradient-to-r from-violet-600 to-indigo-600 dark:from-violet-400 dark:to-indigo-400 bg-clip-text text-transparent">
              Endlich organisiert.
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-xl text-gray-600 dark:text-slate-400 mb-10">
            Kunden, Projekte, Zeiterfassung – alles in einer Plattform.
            Speziell für Marketing-Agenturen und Freelancer entwickelt.
          </p>

          {!joined ? (
            <form onSubmit={handleJoinWaitlist} className="max-w-md mx-auto flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="deine@email.de"
                required
                className="flex-1 px-5 py-4 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 text-gray-900 dark:text-white transition-all"
              />
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-4 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-violet-500/25 transition-all flex items-center justify-center"
              >
                {loading ? '...' : <>Loslegen <ArrowRightIcon className="h-5 w-5 ml-2" /></>}
              </button>
            </form>
          ) : (
            <div className="max-w-md mx-auto p-6 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl">
              <div className="flex items-center justify-center mb-3">
                <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-800/50 rounded-full flex items-center justify-center">
                  <CheckIcon className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-emerald-900 dark:text-emerald-300">Du bist auf der Liste!</h3>
              <p className="text-emerald-700 dark:text-emerald-400/80">Wir melden uns bald mit deinem Early-Access.</p>
            </div>
          )}

          <p className="mt-4 text-sm text-gray-500 dark:text-slate-500">
            Kein Spam. Jederzeit abmeldbar.
          </p>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-12 border-y border-gray-100 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-800/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm font-medium text-gray-500 dark:text-slate-500 uppercase tracking-wider mb-6">
            Entwickelt für Agenturen wie
          </p>
          <div className="flex flex-wrap justify-center items-center gap-8 opacity-50">
            {['MarketingPro', 'CreativeStudio', 'DigitalWerk', 'BrandBoost', 'AdAgency'].map((brand) => (
              <div key={brand} className="text-xl font-bold text-gray-400 dark:text-slate-600">
                {brand}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Alles was du brauchst.
              <br />
              <span className="text-gray-400 dark:text-slate-500">Nichts, was dich ablenkt.</span>
            </h2>
            <p className="text-lg text-gray-600 dark:text-slate-400 max-w-2xl mx-auto">
              Wir haben die essentiellen Tools für Agenturen gebaut –
              intuitiv, schnell und ohne überflüssigen Schnickschnack.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, idx) => (
              <div
                key={idx}
                className="group p-8 bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 hover:border-violet-200 dark:hover:border-violet-500/50 hover:shadow-xl hover:shadow-violet-500/10 transition-all duration-300"
              >
                <div className="w-14 h-14 bg-gradient-to-br from-violet-100 to-indigo-100 dark:from-violet-900/40 dark:to-indigo-900/40 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <feature.icon className="h-7 w-7 text-violet-600 dark:text-violet-400" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{feature.title}</h3>
                <p className="text-gray-600 dark:text-slate-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-24 bg-gray-50 dark:bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Einfache Preise.
            </h2>
            <p className="text-lg text-gray-600 dark:text-slate-400">
              Keine versteckten Kosten. Kein Kleingedrucktes.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {plans.map((plan, idx) => {
              // Determine styles based on plan type
              let cardStyle = 'bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700';
              let headerStyle = 'text-gray-900 dark:text-white';
              let descStyle = 'text-gray-500 dark:text-slate-400';
              let priceStyle = 'text-gray-900 dark:text-white';
              let oldPriceStyle = 'text-gray-400 dark:text-slate-500';
              let featureIconStyle = 'text-violet-600 dark:text-violet-400';
              let featureTextStyle = 'text-gray-600 dark:text-slate-300';
              let buttonStyle = 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:shadow-lg hover:shadow-violet-500/25';
              let badge = null;

              if (plan.popular) {
                cardStyle = 'bg-gradient-to-br from-violet-600 to-indigo-700 text-white shadow-xl shadow-violet-500/25 scale-105 z-10';
                headerStyle = 'text-white';
                descStyle = 'text-violet-200';
                priceStyle = 'text-white';
                oldPriceStyle = 'text-violet-300/60';
                featureIconStyle = 'text-violet-300';
                featureTextStyle = 'text-white';
                buttonStyle = 'bg-white text-violet-600 hover:bg-gray-100';
                badge = (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-sm font-bold rounded-full shadow-lg">
                    Beliebt
                  </div>
                );
              } else if (plan.earlyAccess) {
                cardStyle = 'bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 border border-indigo-500/30 text-white shadow-2xl shadow-indigo-500/20 relative group mt-4 md:mt-0';
                headerStyle = 'text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-200 drop-shadow-sm font-black';
                descStyle = 'text-indigo-200/80';
                priceStyle = 'text-white';
                oldPriceStyle = 'text-slate-500';
                featureIconStyle = 'text-amber-400';
                featureTextStyle = 'text-indigo-100';
                buttonStyle = 'bg-gradient-to-tr from-amber-400 to-yellow-300 hover:from-amber-300 hover:to-yellow-200 text-slate-900 shadow-xl shadow-amber-500/20 hover:shadow-amber-500/40 transform hover:-translate-y-1';
                badge = (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-amber-300 to-yellow-500 text-slate-900 border border-yellow-200 text-xs font-black uppercase tracking-widest rounded-full shadow-lg whitespace-nowrap z-20">
                    Limitiert: Early Access
                  </div>
                );
              }

              return (
                <div key={idx} className={`relative p-8 rounded-2xl transition-all duration-300 flex flex-col ${cardStyle}`}>
                  {plan.earlyAccess && (
                    <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-violet-600/30 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-violet-500/40 transition-colors duration-700"></div>
                      <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-600/30 rounded-full blur-3xl -ml-10 -mb-10 group-hover:bg-indigo-500/40 transition-colors duration-700"></div>
                    </div>
                  )}
                  {badge}

                  <div className="mb-6 relative z-10">
                    <h3 className={`text-2xl font-bold mb-2 ${headerStyle}`}>
                      {plan.name}
                    </h3>
                    <p className={`text-sm ${descStyle}`}>
                      {plan.description}
                    </p>
                  </div>

                  <div className="mb-6 relative z-10 flex items-end gap-2">
                    <div className="flex flex-col">
                      <span className={`text-sm line-through font-semibold mb-[-4px] ${oldPriceStyle}`}>
                        {plan.oldPrice}€
                      </span>
                      <span className={`text-5xl font-bold tracking-tight ${priceStyle}`}>
                        {plan.price}€
                      </span>
                    </div>
                    <span className={`pb-1 font-medium ${descStyle}`}>/Monat</span>
                  </div>

                  <ul className="space-y-4 mb-8 flex-1 relative z-10">
                    {plan.features.map((feature, fidx) => (
                      <li key={fidx} className="flex items-start">
                        {plan.earlyAccess && fidx >= 1 ? (
                          <StarIcon className={`h-5 w-5 mr-3 shrink-0 ${featureIconStyle}`} />
                        ) : (
                          <CheckIcon className={`h-5 w-5 mr-3 shrink-0 ${featureIconStyle}`} />
                        )}
                        <span className={`text-sm ${featureTextStyle}`}>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => handlePlanClick(plan)}
                    className={`w-full py-4 rounded-xl font-bold transition-all relative z-10 ${buttonStyle}`}
                  >
                    {plan.earlyAccess ? <span className="flex items-center justify-center gap-2"><StarIcon className="w-5 h-5" /> {plan.buttonText}</span> : plan.buttonText}
                  </button>
                  {plan.earlyAccess && (
                    <p className="text-center text-xs font-medium text-amber-200/60 mt-3 relative z-10">
                      Auf 50 Plätze limitiert.
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="w-16 h-16 mx-auto mb-4 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center">
                <ShieldCheckIcon className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-2">DSGVO-konform</h3>
              <p className="text-gray-600 dark:text-slate-400">Daten werden sicher in Deutschland gespeichert.</p>
            </div>
            <div>
              <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center">
                <BoltIcon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-2">Blitzschnell</h3>
              <p className="text-gray-600 dark:text-slate-400">Modernste Technologie für sofortige Reaktionszeiten.</p>
            </div>
            <div>
              <div className="w-16 h-16 mx-auto mb-4 bg-purple-100 dark:bg-purple-900/30 rounded-2xl flex items-center justify-center">
                <UsersIcon className="h-8 w-8 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-2">Support</h3>
              <p className="text-gray-600 dark:text-slate-400">Persönlicher Support – kein Chatbot, echte Menschen.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-violet-600 to-indigo-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <h2 className="text-3xl lg:text-5xl font-bold mb-6">
            Bereit, deine Agentur zu skalieren?
          </h2>
          <p className="text-xl text-violet-200 mb-10">
            Schließe dich den Beta-Testern an und sichere dir 50% Rabatt für 6 Monate.
          </p>
          <button
            onClick={onLoginClick}
            className="px-10 py-5 bg-white text-violet-600 font-bold text-lg rounded-xl hover:bg-gray-100 transition-colors shadow-xl shadow-black/10"
          >
            Jetzt kostenlos starten
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-gray-900 text-gray-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <BoltIcon className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">AgencySync</span>
            </div>
            <div className="text-sm">
              © 2026 AgencySync. Alle Rechte vorbehalten.
            </div>
          </div>
        </div>
      </footer>
      {/* Payment Selection Modal */}
      {showPaymentModal && selectedPlan && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 dark:bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 max-w-sm w-full shadow-2xl relative border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setShowPaymentModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-white"
            >
              ✕
            </button>
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Checkout</h3>
              <p className="text-gray-600 dark:text-slate-400">
                Wähle deine Zahlungsmethode für den <strong className="dark:text-white">{selectedPlan.name}</strong> Tarif ({selectedPlan.price}€).
              </p>
            </div>

            <div className="space-y-4">
              <button
                onClick={() => processPayment('stripe')}
                className="w-full py-4 px-6 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold flex items-center justify-center transition-colors"
              >
                💳 Mit Kreditkarte (Stripe)
              </button>
              <button
                onClick={() => processPayment('paypal')}
                className="w-full py-4 px-6 bg-yellow-400 hover:bg-yellow-500 text-slate-900 rounded-xl font-bold flex items-center justify-center transition-colors"
              >
                🅿️ Mit PayPal bezahlen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default LandingPage;
