/**
 * UTILITY: SHA-256 Hashing
 */
async function sha256(message) {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * BLOCK CLASS
 */
class Block {
    constructor(index, timestamp, data, previousHash = '') {
        this.index = index;
        this.timestamp = timestamp;
        this.data = data;
        this.previousHash = previousHash;
        this.nonce = 0;
        this.hash = '';
    }

    async calculateHash() {
        return await sha256(
            this.index + 
            this.previousHash + 
            this.timestamp + 
            JSON.stringify(this.data) + 
            this.nonce
        );
    }

    async mineBlock(difficulty, onIteration) {
        const target = Array(difficulty + 1).join("0");
        
        while (true) {
            this.hash = await this.calculateHash();
            if (this.hash.substring(0, difficulty) === target) {
                break;
            }
            this.nonce++;
            
            if (this.nonce % 100 === 0 && onIteration) {
                onIteration(this.nonce, this.hash);
            }
        }
    }
}

/**
 * BLOCKCHAIN CLASS
 */
class Blockchain {
    constructor() {
        this.chain = [];
        this.difficulty = 4;
    }

    async createGenesisBlock() {
        const genesis = new Block(0, new Date().toISOString(), "Genesis Block", "0");
        await genesis.mineBlock(this.difficulty);
        this.chain.push(genesis);
    }

    getLatestBlock() {
        return this.chain[this.chain.length - 1];
    }

    async addBlock(newBlock) {
        newBlock.previousHash = this.getLatestBlock().hash;
        await newBlock.mineBlock(this.difficulty);
        this.chain.push(newBlock);
    }

    async isChainValid() {
        for (let i = 1; i < this.chain.length; i++) {
            const currentBlock = this.chain[i];
            const previousBlock = this.chain[i - 1];

            const recalculatedHash = await currentBlock.calculateHash();
            if (currentBlock.hash !== recalculatedHash) {
                return { valid: false, index: i, reason: 'TAMPERED_DATA' };
            }

            if (currentBlock.previousHash !== previousBlock.hash) {
                return { valid: false, index: i, reason: 'BROKEN_LINK' };
            }
        }
        return { valid: true };
    }
}

// --- UI & APP LOGIC ---

const ledger = new Blockchain();
const container = document.getElementById('blockchain-container');
const consoleEl = document.getElementById('console-log');
const addBtn = document.getElementById('add-block-btn');
const validateBtn = document.getElementById('validate-btn');

function log(message, type = '') {
    const entry = document.createElement('div');
    entry.className = `log-entry ${type}`;
    entry.innerText = `[${new Date().toLocaleTimeString()}] ${message}`;
    consoleEl.appendChild(entry);
    consoleEl.scrollTop = consoleEl.scrollHeight;
}

async function renderChain() {
    container.innerHTML = '';
    const validationStatus = await ledger.isChainValid();

    ledger.chain.forEach((block, idx) => {
        let statusClass = 'valid';
        if (!validationStatus.valid && idx >= validationStatus.index) {
            statusClass = 'invalid';
        }

        const blockDiv = document.createElement('div');
        blockDiv.className = `block-card ${statusClass}`;
        blockDiv.id = `block-${idx}`;
        
        blockDiv.innerHTML = `
            <div class="block-header">
                <span class="block-index">BLOCK #${block.index}</span>
                <span class="block-ts">${new Date(block.timestamp).toLocaleTimeString()}</span>
            </div>
            <div class="field">
                <label class="label">Data / Transaction</label>
                <input type="text" class="data-input" value="${block.data}" 
                       oninput="updateBlockData(${idx}, this.value)">
            </div>
            <div class="field">
                <label class="label">Previous Hash</label>
                <div class="hash-display previous-hash">${block.previousHash}</div>
            </div>
            <div class="field">
                <label class="label">Hash</label>
                <div class="hash-display">${block.hash}</div>
            </div>
            <div style="display:flex; justify-content: space-between; align-items: center">
                <div>
                    <label class="label">Nonce</label>
                    <span style="font-size: 0.8rem; font-family: monospace;">${block.nonce}</span>
                </div>
                <div style="text-align: right">
                    <label class="label">Status</label>
                    <span style="font-size: 0.7rem; font-weight: bold; color: ${statusClass === 'valid' ? 'var(--valid-green)' : 'var(--invalid-red)'}">
                        ${statusClass.toUpperCase()}
                    </span>
                </div>
            </div>
        `;

        container.appendChild(blockDiv);

        if (idx < ledger.chain.length - 1) {
            const link = document.createElement('div');
            link.className = 'chain-link';
            container.appendChild(link);
        }
    });
}

async function updateBlockData(index, newVal) {
    ledger.chain[index].data = newVal;
    log(`Block #${index} data edited! Integrity check failing...`, 'log-error');
    renderChain();
}

addBtn.addEventListener('click', async () => {
    addBtn.disabled = true;
    const index = ledger.chain.length;
    const ts = new Date().toISOString();
    const data = `Transaction ${Math.floor(Math.random() * 9000 + 1000)}`;
    const newBlock = new Block(index, ts, data);

    log(`Mining Block #${index}...`, 'log-mining');
    
    const tempDiv = document.createElement('div');
    tempDiv.className = 'block-card mining';
    tempDiv.innerHTML = `<div class="block-header">MINING...</div><div class="field"><label class="label">Current Nonce</label><div id="mining-nonce" class="hash-display">0</div></div>`;
    container.appendChild(tempDiv);
    container.scrollLeft = container.scrollWidth;

    await ledger.addBlock(newBlock);
    
    log(`Block #${index} successfully mined! Hash found.`, 'log-success');
    renderChain();
    addBtn.disabled = false;
});

validateBtn.addEventListener('click', async () => {
    log('Initiating full chain validation...', 'log-mining');
    const result = await ledger.isChainValid();
    if (result.valid) {
        log('CHAIN INTEGRITY VERIFIED: All hashes match.', 'log-success');
    } else {
        log(`CHAIN CORRUPTED: Error at Block #${result.index} (${result.reason})`, 'log-error');
    }
    renderChain();
});

window.onload = async () => {
    await ledger.createGenesisBlock();
    renderChain();
};
