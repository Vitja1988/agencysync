import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import {
    CloudArrowUpIcon, KeyIcon, CheckCircleIcon, SparklesIcon,
    DocumentTextIcon, ArchiveBoxIcon, CpuChipIcon, ServerStackIcon
} from '@heroicons/react/24/outline';

const INTEGRATION_CATEGORIES = [
    { id: 'accounting', label: 'Accounting' },
    { id: 'ai', label: 'Artificial Intelligence' },
    { id: 'workspace', label: 'Workspaces' }
];

const PROVIDERS = [
    {
        id: 'sevdesk',
        category: 'accounting',
        name: 'SevDesk',
        description: 'Automate your bookkeeping. When a client accepts a proposal, AgencySync instantly creates a draft invoice in SevDesk with all line items included.',
        gradient: 'from-blue-500 to-indigo-600',
        icon: CloudArrowUpIcon
    },
    {
        id: 'openai',
        category: 'ai',
        name: 'OpenAI (ChatGPT)',
        description: 'Unlock "AI Magic Generate" on the Proposals page to auto-draft professional sales pitches from a single simple sentence.',
        gradient: 'from-emerald-500 to-teal-600',
        icon: SparklesIcon
    },
    {
        id: 'anthropic',
        category: 'ai',
        name: 'Anthropic (Claude)',
        description: 'Use the industry-leading Claude 3.5 Sonnet model to write high-converting client proposals in seconds via the AI Generate button.',
        gradient: 'from-orange-500 to-rose-600',
        icon: CpuChipIcon
    },
    {
        id: 'google_gemini',
        category: 'ai',
        name: 'Google Gemini',
        description: 'Connect Google\'s fastest AI model to write your proposals in the blink of an eye. Perfect for quick iterations.',
        gradient: 'from-blue-400 to-violet-600',
        icon: ServerStackIcon
    },
    {
        id: 'notion',
        category: 'workspace',
        name: 'Notion',
        description: '(Coming Soon) Automatically create new Notion pages for your clients and sync accepted proposals to your team database.',
        gradient: 'from-slate-700 to-black',
        icon: ArchiveBoxIcon
    },
    {
        id: 'google_workspace',
        category: 'workspace',
        name: 'Google Workspace',
        description: '(Coming Soon) Automatically create Google Drive folders for new clients and sync Kanban tasks to your Google Calendar.',
        gradient: 'from-blue-500 via-red-500 to-green-500',
        icon: DocumentTextIcon
    }
];

function Integrations() {
    const { t } = useTranslation();
    const [integrations, setIntegrations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [keys, setKeys] = useState({});
    const [savingProviders, setSavingProviders] = useState({});
    const [activeCategory, setActiveCategory] = useState('accounting');
    const [requestingAutopilot, setRequestingAutopilot] = useState(false);

    useEffect(() => {
        fetchIntegrations();
    }, []);

    const fetchIntegrations = async () => {
        try {
            const res = await axios.get('/api/integrations');
            setIntegrations(res.data);

            const keyMap = {};
            res.data.forEach(integration => {
                keyMap[integration.provider] = integration.api_key;
            });
            setKeys(keyMap);
        } catch (error) {
            console.error('Error fetching integrations:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e, providerId) => {
        e.preventDefault();
        setSavingProviders(prev => ({ ...prev, [providerId]: true }));

        const keyToSave = keys[providerId] || '';

        try {
            if (keyToSave.trim() === '') {
                // Option to delete or handle empty
            } else {
                await axios.post('/api/integrations', { provider: providerId, api_key: keyToSave });
                // alert(t('save') + ' successful!');
                fetchIntegrations();
            }
        } catch (error) {
            console.error('Error saving integration:', error);
            alert('Error saving integration');
        } finally {
            setSavingProviders(prev => ({ ...prev, [providerId]: false }));
        }
    };

    const handleKeyChange = (providerId, value) => {
        setKeys(prev => ({ ...prev, [providerId]: value }));
    };

    const handleAutopilotRequest = async () => {
        setRequestingAutopilot(true);
        try {
            const res = await axios.post('/api/integrations/autopilot/request');
            alert(res.data.message);
        } catch (error) {
            console.error('Error requesting auto-pilot access:', error);
            alert('Oh no! Could not process your request. Please try again later.');
        } finally {
            setRequestingAutopilot(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center p-10">
                <div className="w-8 h-8 border-4 border-violet-500 rounded-full animate-spin border-t-transparent" />
            </div>
        );
    }

    const isProviderActive = (id) => integrations.some(i => i.provider === id && i.api_key);

    const filteredProviders = PROVIDERS.filter(p => p.category === activeCategory);

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full flex flex-col">
            <div className="page-header mb-8">
                <div>
                    <h1 className="page-title">{t('integrations')}</h1>
                    <p className="page-subtitle">Connect AgencySync to your favorite tools</p>
                </div>
            </div>

            {/* Category Tabs */}
            <div className="flex space-x-2 mb-8 border-b border-slate-200 dark:border-slate-800 pb-px">
                {INTEGRATION_CATEGORIES.map((category) => (
                    <button
                        key={category.id}
                        onClick={() => setActiveCategory(category.id)}
                        className={`px-4 py-2.5 text-sm font-semibold transition-all relative ${activeCategory === category.id
                            ? 'text-violet-600 dark:text-violet-400'
                            : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
                            }`}
                    >
                        {category.label}
                        {activeCategory === category.id && (
                            <motion.div
                                layoutId="activeTab"
                                className="absolute bottom-0 left-0 right-0 h-0.5 bg-violet-600 dark:bg-violet-400"
                            />
                        )}
                    </button>
                ))}
            </div>

            {/* Premium AgencySync Auto-Pilot Upsell (Only in AI tab) */}
            <AnimatePresence>
                {activeCategory === 'ai' && (
                    <motion.div
                        initial={{ opacity: 0, height: 0, scale: 0.95 }}
                        animate={{ opacity: 1, height: 'auto', scale: 1 }}
                        exit={{ opacity: 0, height: 0, scale: 0.95 }}
                        className="mb-8 overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-500/30 shadow-2xl shadow-indigo-500/20 relative group"
                    >
                        {/* Background flare */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-violet-600/20 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none group-hover:bg-violet-500/30 transition-colors duration-700"></div>
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-600/20 rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none group-hover:bg-indigo-500/30 transition-colors duration-700"></div>

                        <div className="relative p-8 md:p-10 flex flex-col md:flex-row items-center gap-8">
                            <div className="flex-1">
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-bold uppercase tracking-wider mb-4">
                                    <SparklesIcon className="w-3.5 h-3.5" />
                                    {t('autopilot_badge')}
                                </span>
                                <h2 className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-200 mb-4 drop-shadow-sm">
                                    {t('autopilot_title')}
                                </h2>
                                <p className="text-indigo-100/80 leading-relaxed max-w-2xl text-lg md:text-xl">
                                    {t('autopilot_desc')}
                                </p>
                            </div>

                            <div className="w-full md:w-auto shrink-0 flex flex-col items-center">
                                <button
                                    onClick={handleAutopilotRequest}
                                    disabled={requestingAutopilot}
                                    className="w-full md:w-auto px-8 py-4 bg-gradient-to-tr from-amber-400 to-yellow-300 hover:from-amber-300 hover:to-yellow-200 text-slate-900 font-bold text-lg rounded-xl shadow-xl shadow-amber-500/20 hover:shadow-amber-500/40 transform hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-2 whitespace-nowrap focus:outline-none focus:ring-4 focus:ring-amber-500/30 disabled:opacity-75 disabled:transform-none disabled:shadow-none"
                                >
                                    {requestingAutopilot ? (
                                        <div className="w-6 h-6 border-4 border-slate-900/30 border-t-slate-900 rounded-full animate-spin" />
                                    ) : (
                                        <SparklesIcon className="w-6 h-6" />
                                    )}
                                    {requestingAutopilot ? 'Processing...' : t('autopilot_btn')}
                                </button>
                                <span className="text-xs text-indigo-300/60 mt-4 uppercase tracking-widest font-semibold text-center">OpenClaw Native Integration</span>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Provider Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-10">
                <AnimatePresence mode="popLayout">
                    {filteredProviders.map((provider) => {
                        const Icon = provider.icon;
                        const active = isProviderActive(provider.id);
                        const saving = savingProviders[provider.id];

                        return (
                            <motion.div
                                key={provider.id}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.2 }}
                                className="glass-card flex flex-col h-full overflow-hidden relative"
                            >
                                {active && (
                                    <div className="absolute top-0 right-0 p-4">
                                        <CheckCircleIcon className="w-6 h-6 text-emerald-500" />
                                    </div>
                                )}

                                <div className="flex items-center space-x-4 mb-6 pr-8">
                                    <div className={`w-14 h-14 shrink-0 rounded-2xl bg-gradient-to-br ${provider.gradient} flex items-center justify-center shadow-lg shadow-black/10`}>
                                        <Icon className="w-7 h-7 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">{provider.name}</h2>
                                    </div>
                                </div>

                                <p className="text-sm text-slate-600 dark:text-slate-400 mb-6 flex-1">
                                    {provider.description}
                                </p>

                                <form onSubmit={(e) => handleSave(e, provider.id)} className="space-y-4 mt-auto">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                                            API Token
                                        </label>
                                        <div className="relative">
                                            <KeyIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                            <input
                                                type="password"
                                                placeholder={`Enter ${provider.name} API Key`}
                                                className="input-field pl-9 bg-slate-50 dark:bg-slate-900/50 py-2.5 text-sm"
                                                value={keys[provider.id] || ''}
                                                onChange={(e) => handleKeyChange(provider.id, e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className={`w-full justify-center transition-all ${active ? 'btn-secondary text-sm py-2.5' : 'btn-primary text-sm py-2.5'
                                            }`}
                                    >
                                        {saving ? 'Saving...' : (active ? 'Update Token' : 'Connect')}
                                    </button>
                                </form>
                            </motion.div>
                        )
                    })}
                </AnimatePresence>
            </div>
        </motion.div>
    );
}

export default Integrations;
