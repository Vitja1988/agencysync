const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../database/db');
const { auth } = require('./auth');
const router = express.Router();

// Mock Stripe & PayPal setup based on Environment Variables
// const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
// const paypal = require('@paypal/checkout-server-sdk');

const STRIPE_SECRET = process.env.STRIPE_SECRET_KEY || 'sk_test_mock123';
const PAYPAL_CLIENT = process.env.PAYPAL_CLIENT_ID || 'mock_paypal_client_id';

const PRICE_MAP = {
    'solo': 1900, // in cents
    'team': 4900,
    'enterprise': 19900
};

// Initiate Checkout
router.post('/checkout', auth, async (req, res) => {
    const { plan, gateway } = req.body;

    if (!['solo', 'team', 'enterprise'].includes(plan)) {
        return res.status(400).json({ error: 'Invalid plan selected' });
    }

    if (!['stripe', 'paypal'].includes(gateway)) {
        return res.status(400).json({ error: 'Invalid payment gateway' });
    }

    try {
        if (gateway === 'stripe') {
            // Because we don't have real keys here, we mock the stripe checkout URL.
            // In a real scenario:
            // const session = await stripe.checkout.sessions.create({ ... })
            // return res.json({ url: session.url });

            const mockSessionUrl = `https://checkout.stripe.com/pay/cs_test_${uuidv4()}?plan=${plan}`;

            // Immediately activate for testing purposes (simulate webhook)
            activateSubscription(req.userId, plan, 'stripe');

            return res.json({
                provider: 'stripe',
                url: mockSessionUrl,
                message: `Stripe Checkout Session created for ${plan} plan.`
            });
        }

        if (gateway === 'paypal') {
            // Mocking PayPal Order creation
            const mockOrderId = `PAYID-${uuidv4().substring(0, 16).toUpperCase()}`;

            // Immediately activate for testing purposes
            activateSubscription(req.userId, plan, 'paypal');

            return res.json({
                provider: 'paypal',
                orderId: mockOrderId,
                message: `PayPal Order created for ${plan} plan.`
            });
        }
    } catch (error) {
        console.error('Checkout error:', error);
        res.status(500).json({ error: 'Failed to initiate checkout' });
    }
});

// Helper function to activate subscription
function activateSubscription(userId, planType, provider) {
    const subId = uuidv4();
    db.run(
        `INSERT INTO subscriptions (id, user_id, plan_type, status, payment_provider, created_at, updated_at) 
         VALUES (?, ?, ?, 'active', ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
        [subId, userId, planType, provider],
        function (err) {
            if (err) {
                console.error('Failed to create mock subscription:', err.message);
            } else {
                console.log(`\n===========================================`);
                console.log(`💳 PAYMENT RECEIVED: ${provider.toUpperCase()}`);
                console.log(`Plan Activated: ${planType.toUpperCase()}`);
                console.log(`User ID: ${userId}`);
                console.log(`===========================================\n`);
            }
        }
    );
}

// Mock Webhooks (Usually hit by Stripe/PayPal servers)
router.post('/webhook/stripe', express.raw({ type: 'application/json' }), (req, res) => {
    // Verify signature, extract customer info, update DB
    // Since we lack real keys, we just acknowledge receipt
    res.json({ received: true });
});

module.exports = router;
