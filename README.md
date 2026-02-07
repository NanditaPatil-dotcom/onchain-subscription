# Onchain Subscription

A consent-driven, escrow-based on-chain subscription protocol built for HackMoney 2026. The project demonstrates how recurring payments can be executed on Ethereum **without blind approvals**, while preserving user control, transparency, and service guarantees.

The system replaces opaque auto-debits with explicit, cycle-based consent using signed messages (EIP-712) and ETH escrow that is **subscription-specific**.

---

## Problem

Traditional Web2 subscriptions and many Web3 implementations suffer from:

* Hidden or irreversible auto-renewals
* Unlimited token approvals
* No clear linkage between consent, escrow, and payment execution
* Poor UX around cancellation and refunds

Users lose control. Services lose trust.

---

## Solution

Onchain Subscription introduces a **consent-first subscription model**:

* ETH is escrowed per subscription
* Each payment cycle requires explicit user approval
* Services can only claim funds that are both:

  * Due by time
  * Approved by signature
* Unused escrow is withdrawable after cancellation

No cron jobs. No silent drains. No global approvals.

---

## Core Concepts

### Subscription

Each subscription is an on-chain object containing:

* Subscriber address
* Service address
* Amount per cycle
* Period (seconds)
* Last payment timestamp
* Nonce (prevents replay)
* Escrow balance (ETH)
* Active / cancelled state

All escrow is **subscription-scoped**, not wallet-wide.

### Escrow

* ETH is deposited at creation or via `add funds`
* Escrow belongs to exactly one subscription
* Payments can only be made from available escrow
* Remaining escrow is refundable on cancellation

### Consent

* Payments are authorized using EIP-712 typed signatures
* A signature approves:

  * subscriptionId
  * amount
  * nonce
  * expiry
* Prevents replay and overcharging

---

## Smart Contract

### Key Functions

* `createSubscription(service, amount, period)`

  * Creates a new subscription
  * Accepts initial ETH escrow

* `claimPayment(subscriptionId, amount, nonce, expiry, signature)`

  * Executes a payment if:

    * The cycle is due
    * Signature is valid
    * Escrow is sufficient

* `cancelSubscription(subscriptionId)`

  * Stops future payments

* `withdrawEscrow(subscriptionId)`

  * Refunds unused escrow after cancellation

### Security Properties

* No unlimited approvals
* No service-side fund access
* Replay protection via nonce
* Time-based enforcement via `period`

---

## Frontend

The frontend demonstrates protocol behavior visually:

### Subscription Cards

* Status: Paid, Awaiting Consent, Cancelled
* Period display (seconds or days)
* Per-subscription escrow balance
* Actions:

  * Approve Payment
  * Add Funds
  * Cancel Subscription

### Stats Panel

* Active subscriptions
* Total escrowed ETH (sum of all subscriptions)
* Pending approvals

### UX Principles

* Explicit user intent per cycle
* Clear separation of funds per subscription
* No hidden state or background actions

---

## Why This Matters

This model:

* Aligns incentives between users and services
* Makes recurring payments auditable
* Eliminates approval-based exploits
* Is compatible with wallets, DAOs, and smart accounts

It can be extended to:

* ERC20 payments
* Subscription NFTs
* Account abstraction
* Automated consent via smart wallets

---

## Tech Stack

* Solidity (EIP-712, OpenZeppelin)
* Ethers.js
* React / Next.js
* Tailwind CSS
* Sepolia testnet

---

## Status

This is a functional prototype built during HackMoney 2026. The contract and UI are live on testnet and demonstrate the full subscription lifecycle.

---

## Future Work

* ERC20 support (USDC, DAI)
* Smart wallet automation
* Subscription indexing
* Gas optimizations
* Mainnet deployment

---


