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
  BoltIcon
} from '@heroicons/react/24/outline';
import axios from 'axios';

function LandingPage({ onLoginClick }) {
  const [email, setEmail] = useState('');
  const [joined, setJoined] = useState(false);
  const [loading, setLoading] = useState(false);

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
      price: '29',
      description: 'Für Freelancer & Einzelkämpfer',
      features: ['Bis 10 Kunden', 'Unbegrenzte Projekte', 'Zeiterfassung', 'E-Mail Support']
    },
    {
      name: 'Team',
      price: '79',
      description: 'Für wachsende Agenturen',
      popular: true,
      features: ['Unbegrenzte Kunden', 'Team-Mitglieder', 'Erweiterte Berichte', 'Priorität Support', 'API Zugang']
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <BoltIcon className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
                AgencySync
              </span>
            </div>
            <button 
              onClick={onLoginClick}
              className="px-5 py-2 text-sm font-medium text-violet-600 hover:text-violet-700 transition-colors"
            >
              Login
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-50 via-white to-indigo-50 opacity-70" />
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-bl from-violet-100/50 to-transparent" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-violet-100 text-violet-700 text-sm font-medium mb-8">
            <StarIcon className="h-4 w-4 mr-2" />
            Jetzt Beta-Tester werden & 50% Rabatt sichern
          </div>
          
          <h1 className="text-5xl lg:text-7xl font-bold text-gray-900 leading-tight mb-6">
            Deine Agentur.
            <br />
            <span className="bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
              Endlich organisiert.
            </span>
          </h1>
          
          <p className="max-w-2xl mx-auto text-xl text-gray-600 mb-10">
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
                className="flex-1 px-5 py-4 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all"
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
            <div className="max-w-md mx-auto p-6 bg-emerald-50 border border-emerald-200 rounded-xl">
              <div className="flex items-center justify-center mb-3">
                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                  <CheckIcon className="h-6 w-6 text-emerald-600" />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-emerald-900">Du bist auf der Liste!</h3>
              <p className="text-emerald-700">Wir melden uns bald mit deinem Early-Access.</p>
            </div>
          )}
          
          <p className="mt-4 text-sm text-gray-500">
            Kein Spam. Jederzeit abmeldbar.
          </p>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-12 border-y border-gray-100 bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-6">
            Entwickelt für Agenturen wie
          </p>
          <div className="flex flex-wrap justify-center items-center gap-8 opacity-50">
            {['MarketingPro', 'CreativeStudio', 'DigitalWerk', 'BrandBoost', 'AdAgency'].map((brand) => (
              <div key={brand} className="text-xl font-bold text-gray-400">
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
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Alles was du brauchst.
              <br />
              <span className="text-gray-400">Nichts, was dich ablenkt.</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Wir haben die essentiellen Tools für Agenturen gebaut – 
              intuitiv, schnell und ohne überflüssigen Schnickschnack.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, idx) => (
              <div 
                key={idx}
                className="group p-8 bg-white rounded-2xl border border-gray-100 hover:border-violet-200 hover:shadow-xl hover:shadow-violet-500/10 transition-all duration-300"
              >
                <div className="w-14 h-14 bg-gradient-to-br from-violet-100 to-indigo-100 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <feature.icon className="h-7 w-7 text-violet-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Einfache Preise.
            </h2>
            <p className="text-lg text-gray-600">
              Keine versteckten Kosten. Kein Kleingedrucktes.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {plans.map((plan, idx) => (
              <div 
                key={idx}
                className={`relative p-8 rounded-2xl ${
                  plan.popular 
                    ? 'bg-gradient-to-br from-violet-600 to-indigo-700 text-white shadow-xl shadow-violet-500/25' 
                    : 'bg-white border border-gray-200'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-sm font-bold rounded-full">
                    Beliebt
                  </div>
                )}
                
                <div className="mb-6">
                  <h3 className={`text-xl font-bold mb-2 ${plan.popular ? 'text-white' : 'text-gray-900'}`}>
                    {plan.name}
                  </h3>
                  <p className={`text-sm ${plan.popular ? 'text-violet-200' : 'text-gray-500'}`}>
                    {plan.description}
                  </p>
                </div>
                
                <div className="mb-6">
                  <span className={`text-5xl font-bold ${plan.popular ? 'text-white' : 'text-gray-900'}`}>
                    {plan.price}€
                  </span>
                  <span className={plan.popular ? 'text-violet-200' : 'text-gray-500'}>/Monat</span>
                </div>
                
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, fidx) => (
                    <li key={fidx} className="flex items-center">
                      <CheckIcon className={`h-5 w-5 mr-3 ${plan.popular ? 'text-violet-300' : 'text-violet-600'}`} />
                      <span className={plan.popular ? 'text-white' : 'text-gray-600'}>{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <button
                  onClick={onLoginClick}
                  className={`w-full py-4 rounded-xl font-semibold transition-all ${
                    plan.popular
                      ? 'bg-white text-violet-600 hover:bg-gray-100'
                      : 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:shadow-lg hover:shadow-violet-500/25'
                  }`}
                >
                  Kostenlos testen
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="w-16 h-16 mx-auto mb-4 bg-emerald-100 rounded-2xl flex items-center justify-center">
                <ShieldCheckIcon className="h-8 w-8 text-emerald-600" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">DSGVO-konform</h3>
              <p className="text-gray-600">Daten werden sicher in Deutschland gespeichert.</p>
            </div>
            <div>
              <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-2xl flex items-center justify-center">
                <BoltIcon className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Blitzschnell</h3>
              <p className="text-gray-600">Modernste Technologie für sofortige Reaktionszeiten.</p>
            </div>
            <div>
              <div className="w-16 h-16 mx-auto mb-4 bg-purple-100 rounded-2xl flex items-center justify-center">
                <UsersIcon className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Support</h3>
              <p className="text-gray-600">Persönlicher Support – kein Chatbot, echte Menschen.</p>
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
    </div>
  );
}

export default LandingPage;
