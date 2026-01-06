# Immutable Ledger Visualizer

An interactive blockchain simulation demonstrating the core principles of decentralized ledgers, cryptographic hashing, and the Proof-of-Work (PoW) consensus mechanism.

## Overview
This project provides a visual representation of how a blockchain maintains data integrity. It simulates the mining process and illustrates how tampering with a single block invalidates all subsequent blocks in the chain.



## Technical Features
- **Native Cryptography:** Uses the browser's `crypto.subtle` API for SHA-256 hashing.
- **Proof-of-Work (PoW):** Implements a mining algorithm where a specific hash prefix (difficulty) must be found.
- **Integrity Engine:** Real-time validation that detects broken links and data tampering.
- **Reactive UI:** Built with Vanilla JavaScript, HTML, and CSS with smooth animations and a system console.

## Core Concepts
- **The Hash:** A unique digital fingerprint of the block's content.
- **The Chain:** Each block stores the hash of the previous one, creating an unbreakable link.
- **The Nonce:** A number used during mining to find a valid hash that meets network difficulty.
- **Immutability:** Demonstrates that historical data cannot be changed without re-mining all following blocks.

## How to Run
1. Clone this repository.
2. Open `index.html` in any modern web browser.
3. Or visit the [Live Demo](https://murka-leader.github.io/Immutable-Ledger-Visualizer/) (Replace with your actual link).
