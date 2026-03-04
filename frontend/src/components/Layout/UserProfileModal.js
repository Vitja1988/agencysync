import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
    XMarkIcon,
    ArrowRightOnRectangleIcon,
    BuildingOfficeIcon,
    EnvelopeIcon,
    IdentificationIcon,
    StarIcon,
    CheckBadgeIcon,
    CheckIcon
} from '@heroicons/react/24/outline';

const UserProfileModal = ({ isOpen, onClose, user, onLogout }) => {
    const { t } = useTranslation();

    const [activeTab, setActiveTab] = useState('profile');
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: '', company_name: '',
        date_format: 'dd.MM.yyyy', time_format: '24h', currency: 'EUR'
    });
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [showPaymentModal, setShowPaymentModal] = useState(false);

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                company_name: user.company_name || '',
                date_format: user.date_format || 'dd.MM.yyyy',
                time_format: user.time_format || '24h',
                currency: user.currency || 'EUR'
            });
        }
    }, [user]);

    if (!isOpen) return null;

    const handleSaveProfile = async () => {
        try {
            const token = localStorage.getItem('token');
            await axios.put('/api/auth/me', formData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setIsEditing(false);
            // Ideally refresh user data globally here, but a window reload works for now or user state passed down
            window.location.reload();
        } catch (error) {
            console.error('Error saving profile:', error);
            alert('Fehler beim Speichern des Profils');
        }
    };

    const handlePlanClick = (planInternalId, planName, planPrice) => {
        setSelectedPlan({ internalId: planInternalId, name: planName, price: planPrice });
        setShowPaymentModal(true);
    };

    const processPayment = async (gateway) => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.post('/api/payments/checkout', {
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
            // Reload to show fresh subscription
            setTimeout(() => window.location.reload(), 1500);
        } catch (error) {
            console.error("Payment Error:", error);
            alert("Fehler bei der Zahlungsabwicklung.");
            setShowPaymentModal(false);
        }
    };

    const getPlanBadge = (planType) => {
        switch (planType) {
            case 'enterprise':
                return (
                    <div className="flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-900 rounded-full font-bold text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20">
                        <StarIcon className="w-4 h-4" />
                        Enterprise AI
                    </div>
                );
            case 'team':
                return (
                    <div className="flex items-center gap-1 px-3 py-1 bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300 rounded-full font-bold text-xs uppercase tracking-wider">
                        Team Plan
                    </div>
                );
            case 'solo':
                return (
                    <div className="flex items-center gap-1 px-3 py-1 bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300 rounded-full font-bold text-xs uppercase tracking-wider">
                        Solo Plan
                    </div>
                );
            default:
                return (
                    <div className="flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-500 dark:bg-slate-800 dark:text-slate-400 rounded-full font-bold text-xs uppercase tracking-wider">
                        Free / Local
                    </div>
                );
        }
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-0">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="fixed inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm"
                />

                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden z-[101] max-h-[90vh] flex flex-col"
                >
                    {/* Header Background */}
                    <div className="h-32 shrink-0 bg-gradient-to-br from-violet-600 to-indigo-700 relative">
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full backdrop-blur-md transition-colors"
                        >
                            <XMarkIcon className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Avatar overlapping header - MOVED OUTSIDE of scroll view */}
                    <div className="px-8 relative z-10">
                        <div className="relative -mt-12 mb-6 flex justify-between items-end">
                            <div className="w-24 h-24 rounded-2xl bg-white dark:bg-slate-800 p-1.5 shadow-xl">
                                <div className="w-full h-full rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-4xl font-bold text-white shadow-inner">
                                    {user?.name?.[0]?.toUpperCase() || 'U'}
                                </div>
                            </div>
                            <div className="mb-2">
                                {getPlanBadge(user?.subscription?.plan_type)}
                            </div>
                        </div>
                    </div>

                    <div className="px-8 flex-1 overflow-y-auto pb-8">


                        {/* Header Identity */}
                        <div className="mb-6">
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                {user?.name}
                                {user?.subscription?.plan_type === 'enterprise' && (
                                    <CheckBadgeIcon className="w-6 h-6 text-amber-500" title="Premium Account" />
                                )}
                            </h2>
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                                ID: {user?.id?.substring(0, 5)}...
                            </p>
                        </div>

                        {/* Tabs */}
                        <div className="flex space-x-4 border-b border-slate-200 dark:border-slate-800 mb-6">
                            <button
                                className={`pb-3 font-semibold text-sm transition-colors border-b-2 ${activeTab === 'profile' ? 'border-violet-500 text-violet-600 dark:text-violet-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                                onClick={() => setActiveTab('profile')}
                            >
                                Einstellungen
                            </button>
                            <button
                                className={`pb-3 font-semibold text-sm transition-colors border-b-2 ${activeTab === 'preferences' ? 'border-violet-500 text-violet-600 dark:text-violet-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                                onClick={() => setActiveTab('preferences')}
                            >
                                Präferenzen
                            </button>
                            <button
                                className={`pb-3 font-semibold text-sm transition-colors border-b-2 ${activeTab === 'subscription' ? 'border-violet-500 text-violet-600 dark:text-violet-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                                onClick={() => setActiveTab('subscription')}
                            >
                                Abonnement
                            </button>
                        </div>

                        {/* Tab Contents */}
                        {activeTab === 'profile' && (
                            <div className="space-y-6">
                                {isEditing ? (
                                    <div className="space-y-4 bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-100 dark:border-slate-700/50">
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Name</label>
                                            <input
                                                type="text"
                                                className="input-field"
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Unternehmen</label>
                                            <input
                                                type="text"
                                                className="input-field"
                                                value={formData.company_name}
                                                onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                                            />
                                        </div>
                                        <div className="flex items-center gap-3 pt-4">
                                            <button onClick={() => setIsEditing(false)} className="btn-secondary">Abbrechen</button>
                                            <button onClick={handleSaveProfile} className="btn-primary">Speichern</button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-3 bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-100 dark:border-slate-700/50">
                                        <div className="flex items-center text-slate-600 dark:text-slate-300">
                                            <IdentificationIcon className="w-5 h-5 mr-4 text-slate-400" />
                                            <div>
                                                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Name</p>
                                                <span className="text-sm font-medium">{user?.name}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center text-slate-600 dark:text-slate-300 pt-3 border-t border-slate-200 dark:border-slate-700/50">
                                            <EnvelopeIcon className="w-5 h-5 mr-4 text-slate-400" />
                                            <div>
                                                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Email (Nicht änderbar)</p>
                                                <span className="text-sm font-medium">{user?.email}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center text-slate-600 dark:text-slate-300 pt-3 border-t border-slate-200 dark:border-slate-700/50">
                                            <BuildingOfficeIcon className="w-5 h-5 mr-4 text-slate-400" />
                                            <div>
                                                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Unternehmen</p>
                                                <span className="text-sm font-medium">{user?.company_name || 'Kein Unternehmen angegeben'}</span>
                                            </div>
                                        </div>

                                        <div className="pt-4 mt-2 border-t border-slate-200 dark:border-slate-700/50">
                                            <button onClick={() => setIsEditing(true)} className="text-violet-600 dark:text-violet-400 text-sm font-semibold hover:underline">
                                                Profil bearbeiten
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Action Buttons */}
                                <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
                                    <button
                                        onClick={onLogout}
                                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-500/10 dark:hover:bg-red-500/20 dark:text-red-400 font-semibold rounded-xl transition-colors"
                                    >
                                        <ArrowRightOnRectangleIcon className="w-5 h-5" />
                                        {t('logout', 'Ausloggen')}
                                    </button>
                                </div>
                            </div>
                        )}

                        {activeTab === 'preferences' && (
                            <div className="space-y-6">
                                <p className="text-slate-600 dark:text-slate-400 text-sm mb-4">
                                    Passe an, wie Daten, Uhrzeiten und Währungen in der Oberfläche der App dargestellt werden sollen.
                                </p>
                                <div className="space-y-4 bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-100 dark:border-slate-700/50">
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Datumsformat</label>
                                        <select
                                            className="input-field py-2 text-sm"
                                            value={formData.date_format}
                                            onChange={(e) => setFormData({ ...formData, date_format: e.target.value })}
                                        >
                                            <option value="dd.MM.yyyy">Deutsch (31.12.2026)</option>
                                            <option value="MM/dd/yyyy">Englisch/US (12/31/2026)</option>
                                            <option value="yyyy-MM-dd">Logisch/ISO (2026-12-31)</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Zeitformat</label>
                                        <select
                                            className="input-field py-2 text-sm"
                                            value={formData.time_format}
                                            onChange={(e) => setFormData({ ...formData, time_format: e.target.value })}
                                        >
                                            <option value="24h">24 Stunden (14:30)</option>
                                            <option value="12h">12 Stunden (02:30 PM)</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Standardwährung</label>
                                        <select
                                            className="input-field py-2 text-sm"
                                            value={formData.currency}
                                            onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                                        >
                                            <option value="EUR">Euro (€)</option>
                                            <option value="USD">US Dollar ($)</option>
                                            <option value="GBP">Brite Pound (£)</option>
                                            <option value="CHF">Schweizer Franken (CHF)</option>
                                        </select>
                                    </div>

                                    <div className="pt-4 border-t border-slate-200 dark:border-slate-700/50 flex justify-end">
                                        <button onClick={handleSaveProfile} className="btn-primary w-full sm:w-auto">Einstellungen speichern</button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'subscription' && (
                            <div className="space-y-6">
                                <p className="text-slate-600 dark:text-slate-400 text-sm mb-4">
                                    Wechsle jederzeit dein Abo-Modell. Wähle das Paket, das am besten zu dir passt.
                                </p>

                                <div className="grid sm:grid-cols-2 gap-4">
                                    {/* Solo Plan Card */}
                                    <div className="border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-2xl p-5 flex flex-col hover:border-violet-500/50 transition-colors">
                                        <h3 className="font-bold text-slate-900 dark:text-white">Solo</h3>
                                        <div className="flex items-end gap-1 mb-4">
                                            <span className="text-2xl font-bold dark:text-white">19€</span><span className="text-slate-500 text-sm">/Monat</span>
                                        </div>
                                        <ul className="text-sm space-y-2 mb-6 flex-1 text-slate-600 dark:text-slate-400">
                                            <li className="flex gap-2"><CheckIcon className="w-4 h-4 text-violet-500 shrink-0" /> Bis 10 Kunden</li>
                                            <li className="flex gap-2"><CheckIcon className="w-4 h-4 text-violet-500 shrink-0" /> Zeiterfassung</li>
                                        </ul>
                                        <button
                                            onClick={() => handlePlanClick('solo', 'Solo Plan', '19')}
                                            disabled={user?.subscription?.plan_type === 'solo'}
                                            className={`w-full py-2 rounded-xl font-semibold text-sm ${user?.subscription?.plan_type === 'solo' ? 'bg-slate-100 text-slate-400 dark:bg-slate-700 cursor-not-allowed' : 'bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-700 dark:hover:bg-slate-600'}`}
                                        >
                                            {user?.subscription?.plan_type === 'solo' ? 'Aktuelles Paket' : 'Auswählen'}
                                        </button>
                                    </div>

                                    {/* Team Plan Card */}
                                    <div className="border border-violet-200 dark:border-violet-900 bg-violet-50/50 dark:bg-violet-900/10 rounded-2xl p-5 flex flex-col relative">
                                        {user?.subscription?.plan_type !== 'team' && (
                                            <div className="absolute top-0 right-4 -translate-y-1/2 bg-gradient-to-r from-violet-500 to-indigo-500 text-white text-[10px] uppercase font-bold px-2 py-0.5 rounded-full shadow-lg">Beliebt</div>
                                        )}
                                        <h3 className="font-bold text-slate-900 dark:text-white">Team</h3>
                                        <div className="flex items-end gap-1 mb-4">
                                            <span className="text-2xl font-bold dark:text-white">49€</span><span className="text-slate-500 text-sm">/Monat</span>
                                        </div>
                                        <ul className="text-sm space-y-2 mb-6 flex-1 text-slate-600 dark:text-slate-400">
                                            <li className="flex gap-2"><CheckIcon className="w-4 h-4 text-violet-500 shrink-0" /> Unbegrenzte Kunden</li>
                                            <li className="flex gap-2"><CheckIcon className="w-4 h-4 text-violet-500 shrink-0" /> Team-Mitglieder</li>
                                        </ul>
                                        <button
                                            onClick={() => handlePlanClick('team', 'Team Plan', '49')}
                                            disabled={user?.subscription?.plan_type === 'team'}
                                            className={`w-full py-2 rounded-xl font-semibold text-sm ${user?.subscription?.plan_type === 'team' ? 'bg-slate-100 text-slate-400 dark:bg-slate-800 cursor-not-allowed' : 'bg-violet-600 hover:bg-violet-700 text-white shadow-lg shadow-violet-500/20'}`}
                                        >
                                            {user?.subscription?.plan_type === 'team' ? 'Aktuelles Paket' : 'Auswählen'}
                                        </button>
                                    </div>

                                    {/* Enterprise Card */}
                                    <div className="sm:col-span-2 border border-amber-200 dark:border-amber-900/50 bg-gradient-to-br from-slate-900 to-indigo-950 rounded-2xl p-5 flex flex-col md:flex-row gap-6 relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/20 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-amber-400/30 transition-colors"></div>

                                        <div className="flex-1 relative z-10">
                                            <div className="flex items-center gap-2 mb-2">
                                                <StarIcon className="w-5 h-5 text-amber-400 flex-shrink-0" />
                                                <h3 className="font-bold bg-gradient-to-r from-amber-200 to-yellow-400 bg-clip-text text-transparent">Enterprise AI</h3>
                                            </div>
                                            <div className="flex items-end gap-1 mb-2">
                                                <span className="text-3xl font-bold text-white">199€</span><span className="text-slate-400 text-sm">/Monat</span>
                                            </div>
                                            <p className="text-sm text-indigo-200 mb-4">Auto-Pilot für maximale Skalierung. Voller Zugriff auf Claude 4.5 Opus Automatisierung.</p>
                                        </div>

                                        <div className="flex flex-col justify-end w-full md:w-48 relative z-10">
                                            <button
                                                onClick={() => handlePlanClick('enterprise', 'Enterprise AI', '199')}
                                                disabled={user?.subscription?.plan_type === 'enterprise'}
                                                className={`w-full py-3 rounded-xl font-bold text-sm transition-all ${user?.subscription?.plan_type === 'enterprise' ? 'bg-white/10 text-white/50 cursor-not-allowed border border-white/10' : 'bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-900 hover:shadow-xl hover:shadow-amber-500/20 hover:scale-105'}`}
                                            >
                                                {user?.subscription?.plan_type === 'enterprise' ? 'Aktives Paket' : 'Upgrade sichern'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>

            {/* Payment Selection Modal (Nested for Subscriptions) */}
            {showPaymentModal && selectedPlan && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-gray-900/60 dark:bg-black/60 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 max-w-sm w-full shadow-2xl relative border border-slate-200 dark:border-slate-700">
                        <button
                            onClick={() => setShowPaymentModal(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-white"
                        >
                            <XMarkIcon className="w-5 h-5" />
                        </button>
                        <div className="text-center mb-6">
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Sicheres Upgrade</h3>
                            <p className="text-gray-600 dark:text-slate-400">
                                Wähle deine Zahlungsmethode für den <strong className="dark:text-white">{selectedPlan.name}</strong> Tarif ({selectedPlan.price}€).
                            </p>
                        </div>

                        <div className="space-y-4">
                            <button
                                onClick={() => processPayment('stripe')}
                                className="w-full py-4 px-6 bg-slate-900 hover:bg-slate-700 text-white rounded-xl font-bold flex items-center justify-center transition-colors"
                            >
                                💳 Mit Kreditkarte (Stripe)
                            </button>
                            <button
                                onClick={() => processPayment('paypal')}
                                className="w-full py-4 px-6 bg-[#FFC439] hover:bg-[#F4BB33] text-slate-900 rounded-xl font-bold flex items-center justify-center transition-colors"
                            >
                                🅿️ Mit PayPal bezahlen
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default UserProfileModal;
