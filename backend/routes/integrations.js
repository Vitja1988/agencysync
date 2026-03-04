const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../database/db');
const { auth } = require('./auth');
const router = express.Router();
const https = require('https');

// Get all integrations for user
router.get('/', auth, (req, res) => {
    db.all(
        'SELECT id, provider, created_at FROM integrations WHERE user_id = ?',
        [req.userId],
        (err, rows) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json(rows);
        }
    );
});

// Add or update an integration
router.post('/', auth, (req, res) => {
    const provider = req.body.provider;
    const apiKey = req.body.api_key || req.body.apiKey;
    if (!provider || !apiKey) {
        return res.status(400).json({ error: 'Provider and API key are required' });
    }

    // Check if exists
    db.get(
        'SELECT id FROM integrations WHERE user_id = ? AND provider = ?',
        [req.userId, provider],
        (err, row) => {
            if (err) return res.status(500).json({ error: err.message });

            if (row) {
                // Update
                db.run(
                    'UPDATE integrations SET api_key = ? WHERE id = ?',
                    [apiKey, row.id],
                    function (err) {
                        if (err) return res.status(500).json({ error: err.message });
                        res.json({ message: 'Integration updated successfully' });
                    }
                );
            } else {
                // Insert
                const id = uuidv4();
                db.run(
                    'INSERT INTO integrations (id, user_id, provider, api_key) VALUES (?, ?, ?, ?)',
                    [id, req.userId, provider, apiKey],
                    function (err) {
                        if (err) return res.status(500).json({ error: err.message });
                        res.status(201).json({ message: 'Integration added successfully' });
                    }
                );
            }
        }
    );
});

// Specific route to push a proposal to SevDesk as an invoice
router.post('/sevdesk/invoice', auth, (req, res) => {
    const { proposalId } = req.body;

    // 1. Get SevDesk API Key
    db.get(
        'SELECT api_key FROM integrations WHERE user_id = ? AND provider = ?',
        [req.userId, 'sevdesk'],
        (err, integration) => {
            if (err) return res.status(500).json({ error: err.message });
            if (!integration) return res.status(400).json({ error: 'SevDesk integration not configured' });

            // 2. Fetch Proposal data
            db.get(
                'SELECT p.*, c.name as client_name FROM proposals p JOIN clients c ON p.client_id = c.id WHERE p.id = ? AND p.user_id = ?',
                [proposalId, req.userId],
                (err, proposal) => {
                    if (err) return res.status(500).json({ error: err.message });
                    if (!proposal) return res.status(404).json({ error: 'Proposal not found' });

                    // In a real scenario, you would structure the exact SevDesk JSON payload here 
                    // and use `axios` or `https` to make the POST request to my.sevdesk.de/api/v1/Invoice.
                    // For now, we simulate a successful push.

                    setTimeout(() => {
                        res.json({
                            message: 'Successfully sent to SevDesk!',
                            mock_invoice_id: uuidv4(),
                            details: `Mock invoice created for ${proposal.title} (${proposal.amount}) for ${proposal.client_name}`
                        });
                    }, 1000);
                }
            );
        }
    );
});

// AI Generation Route
router.post('/ai/generate', auth, (req, res) => {
    const { prompt, providerPreference } = req.body;

    if (!prompt) {
        return res.status(400).json({ error: 'Prompt is required' });
    }

    // Find configured AI provider for this user
    db.all(
        'SELECT provider, api_key FROM integrations WHERE user_id = ? AND provider IN ("openai", "anthropic", "google_gemini")',
        [req.userId],
        async (err, integrations) => {
            if (err) return res.status(500).json({ error: err.message });
            if (integrations.length === 0) return res.status(400).json({ error: 'No AI integration configured. Please add an API key in Settings > Integrations.' });

            let selectedIntegration = integrations.find(i => i.provider === providerPreference) || integrations[0];
            const { provider, api_key } = selectedIntegration;

            try {
                let generatedText = '';

                if (provider === 'openai') {
                    const OpenAI = require('openai');
                    const openai = new OpenAI({ apiKey: api_key });
                    const response = await openai.chat.completions.create({
                        model: 'gpt-4o',
                        messages: [{ role: 'user', content: prompt }],
                    });
                    generatedText = response.choices[0].message.content;

                } else if (provider === 'anthropic') {
                    const Anthropic = require('@anthropic-ai/sdk');
                    const anthropic = new Anthropic({ apiKey: api_key });
                    const response = await anthropic.messages.create({
                        model: 'claude-3-5-sonnet-20241022',
                        max_tokens: 1024,
                        messages: [{ role: 'user', content: prompt }],
                    });
                    generatedText = response.content[0].text;

                } else if (provider === 'google_gemini') {
                    const { GoogleGenAI } = require('@google/genai');
                    const ai = new GoogleGenAI({ apiKey: api_key });
                    const response = await ai.models.generateContent({
                        model: 'gemini-2.5-flash',
                        contents: prompt,
                    });
                    generatedText = response.text;
                }

                res.json({ text: generatedText, provider });
            } catch (apiError) {
                console.error(`AI Generation Error (${provider}):`, apiError);
                res.status(500).json({ error: `AI generation failed using ${provider}. Check your API key.` });
            }
        }
    );
});

// AgencySync Auto-Pilot Lead Generation Route
router.post('/autopilot/request', auth, (req, res) => {
    // In a real app, this would trigger an email via SendGrid, Mailgun, etc.
    // or create a high-ticket lead record in a CRM.
    // We are simulating that action here.

    db.get('SELECT name, email, company_name FROM users WHERE id = ?', [req.userId], (err, user) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!user) return res.status(404).json({ error: 'User not found' });

        console.log(`\n===========================================`);
        console.log(`🚀 NEW AUTO-PILOT LEAD GENERATED!`);
        console.log(`===========================================`);
        console.log(`Name:    ${user.name}`);
        console.log(`Email:   ${user.email}`);
        console.log(`Company: ${user.company_name || 'N/A'}`);
        console.log(`===========================================\n`);

        // Simulate 1-second delay for email dispatch
        setTimeout(() => {
            res.json({
                message: 'Successfully requested early access! Our enterprise team will contact you shortly.',
                status: 'success'
            });
        }, 1000);
    });
});

module.exports = router;
