// Data Awal
let positions = [
    {
        id: 1,
        coin: "PLUMEUSDT",
        side: "SHORT",
        leverage: 40,
        size: 1000,
        entry: 0.0246300,
        mark: 0.0241848,
        liq: 0.0266777,
        tpsl: "0.0223000 / 0.0255000"
    }
];

// Fungsi Helper Format Uang
function formatMoney(amount, decimalCount = 2, decimal = ".", thousands = ",") {
    try {
        decimalCount = Math.abs(decimalCount);
        decimalCount = isNaN(decimalCount) ? 2 : decimalCount;
        const negativeSign = amount < 0 ? "-" : "";
        let i = parseInt(amount = Math.abs(Number(amount) || 0).toFixed(decimalCount)).toString();
        let j = (i.length > 3) ? i.length % 3 : 0;
        return negativeSign + (j ? i.substr(0, j) + thousands : '') + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + thousands) + (decimalCount ? decimal + Math.abs(amount - i).toFixed(decimalCount).slice(2) : "");
    } catch (e) { console.log(e) }
}

// Render UI Utama (Kartu Posisi)
function renderMainInterface() {
    const container = document.getElementById('positions-container');
    container.innerHTML = ''; // Clear

    positions.forEach((pos, index) => {
        // Kalkulasi Logika Tampilan
        const isShort = pos.side === 'SHORT';
        const sideColor = isShort ? '#f6465d' : '#0ecb81';
        const sideChar = isShort ? 'S' : 'L';
        
        // Kalkulasi PNL untuk Tampilan
        const margin = pos.size / pos.leverage;
        let pnl = 0;
        if(pos.entry > 0) {
            if(isShort) {
                pnl = pos.size * ((pos.entry - pos.mark) / pos.entry);
            } else {
                pnl = pos.size * ((pos.mark - pos.entry) / pos.entry);
            }
        }
        let roi = (margin > 0) ? (pnl / margin) * 100 : 0;

        const pnlColor = pnl >= 0 ? '#0ecb81' : '#f6465d';
        
        // Kalkulasi Risk Ratio
        const walletVal = parseFloat(document.getElementById('in-wallet').value) || 0;
        const totalEquity = walletVal + pnl; 
        const risk = (totalEquity > 0) ? (margin / totalEquity) * 10 : 0;

        const html = `
        <div class="position-card">
            <div class="card-header">
                <div class="pair-info">
                    <div class="side-icon-box" style="background-color: ${sideColor}">${sideChar}</div>
                    
                    <span class="pair-name">${pos.coin}</span>
                    <span class="tag-perp">Perp</span>
                    <span class="leverage-badge">Cross ${pos.leverage}x</span>
                    <span class="side-tag" style="color: ${sideColor}">!!!!</span>
                </div>
                <i class="fas fa-share-alt share-icon"></i>
            </div>

            <div class="pnl-section">
                <div class="pnl-left">
                    <span class="pnl-label">PNL Belum Terealisasi (USDT)</span>
                    <span class="pnl-value-big" style="color: ${pnlColor}">${(pnl>0?'+':'')}${formatMoney(pnl, 2, '.', ',')}</span>
                </div>
                <div class="pnl-right">
                    <span class="pnl-label text-right">ROI</span>
                    <span class="roi-value" style="color: ${pnlColor}">${(roi>0?'+':'')}${formatMoney(roi, 2, '.', ',')}%</span>
                </div>
            </div>

            <div class="data-grid">
                <div class="d-item">
                    <label>Ukuran (USDT)</label>
                    <span>${formatMoney(pos.size, 5, '.', ',')}</span>
                </div>
                <div class="d-item">
                    <label>Margin (USDT)</label>
                    <span>${formatMoney(margin, 2, '.', ',')}</span>
                </div>
                <div class="d-item d-right">
                    <label>Rasio Margin</label>
                    <span class="risk-text">${formatMoney(risk, 2, '.', ',')}%</span>
                </div>
                <div class="d-item">
                    <label>Harga Entri (USDT)</label>
                    <span>${formatMoney(pos.entry, 7, '.', ',')}</span>
                </div>
                <div class="d-item">
                    <label>Harga Mark (USDT)</label>
                    <span>${formatMoney(pos.mark, 7, '.', ',')}</span>
                </div>
                <div class="d-item d-right">
                    <label>Harga Lik. (USDT)</label>
                    <span>${formatMoney(pos.liq, 7, '.', ',')}</span>
                </div>
            </div>

            <div class="tp-sl-line">
                TP/SL: <span>${pos.tpsl}</span>
            </div>
        </div>
        `;
        container.innerHTML += html;
    });

    // Update Global Header Totals
    updateGlobalTotals();
}

// Render Editor (Input Fields)
function renderEditorInterface() {
    const container = document.getElementById('editor-positions-list');
    container.innerHTML = '';

    positions.forEach((pos, index) => {
        const html = `
        <div class="pos-block">
            <div class="pos-block-header">
                <span style="font-weight:bold; color:white;">Posisi #${index + 1}</span>
                <button class="btn-delete" onclick="deletePosition(${index})">Hapus</button>
            </div>
            <div class="edit-group">
                <label>Nama Koin</label>
                <input type="text" value="${pos.coin}" oninput="updatePos(${index}, 'coin', this.value)">
            </div>
            <div class="edit-group">
                <label>Posisi</label>
                <select onchange="updatePos(${index}, 'side', this.value)">
                    <option value="SHORT" ${pos.side === 'SHORT' ? 'selected' : ''}>Short (Merah)</option>
                    <option value="LONG" ${pos.side === 'LONG' ? 'selected' : ''}>Long (Hijau)</option>
                </select>
            </div>
            <div class="edit-group">
                <label>Leverage</label>
                <input type="number" value="${pos.leverage}" oninput="updatePos(${index}, 'leverage', this.value)">
            </div>
            <div class="edit-group">
                <label>Ukuran (USDT)</label>
                <input type="number" value="${pos.size}" oninput="updatePos(${index}, 'size', this.value)">
            </div>
            <div class="edit-group">
                <label>Entry Price</label>
                <input type="number" value="${pos.entry}" step="0.0000001" oninput="updatePos(${index}, 'entry', this.value)">
            </div>
            <div class="edit-group">
                <label>Mark Price</label>
                <input type="number" value="${pos.mark}" step="0.0000001" oninput="updatePos(${index}, 'mark', this.value)">
            </div>
            <div class="edit-group">
                <label>Liq Price</label>
                <input type="number" value="${pos.liq}" step="0.0000001" oninput="updatePos(${index}, 'liq', this.value)">
            </div>
             <div class="edit-group">
                <label>TP/SL Text</label>
                <input type="text" value="${pos.tpsl}" oninput="updatePos(${index}, 'tpsl', this.value)">
            </div>
        </div>
        `;
        container.innerHTML += html;
    });
}

// Update Data Posisi dari Input
function updatePos(index, field, value) {
    if(field === 'coin' || field === 'side' || field === 'tpsl') {
        positions[index][field] = value;
    } else {
        positions[index][field] = parseFloat(value) || 0;
    }
    // Re-render Main UI only
    renderMainInterface();
}

// Tambah Posisi Baru
function addNewPosition() {
    positions.push({
        id: Date.now(),
        coin: "BTCUSDT",
        side: "LONG",
        leverage: 20,
        size: 1000,
        entry: 50000,
        mark: 51000,
        liq: 45000,
        tpsl: "-- / --"
    });
    renderEditorInterface();
    renderMainInterface();
}

// Hapus Posisi
function deletePosition(index) {
    if(confirm("Hapus posisi ini?")) {
        positions.splice(index, 1);
        renderEditorInterface();
        renderMainInterface();
    }
}

// Update Global Totals
function updateGlobalTotals() {
    const wallet = parseFloat(document.getElementById('in-wallet').value) || 0;
    const rate = parseFloat(document.getElementById('in-rate').value) || 0;
    
    // --- Update PnL Harian (Fitur Baru) ---
    const dailyPnlText = document.getElementById('in-daily-pnl').value;
    const dailyPnlDisp = document.getElementById('disp-daily-pnl');
    dailyPnlDisp.innerText = dailyPnlText;
    
    // Logika Warna PnL Harian (Merah jika ada "-", Hijau jika tidak)
    if (dailyPnlText.includes('-')) {
        dailyPnlDisp.className = 'text-red';
    } else {
        dailyPnlDisp.className = 'text-green';
    }
    // ---------------------------------------

    // Hitung Total PNL dari semua posisi
    let totalUnrealizedPNL = 0;

    positions.forEach(pos => {
        let pnl = 0;
        if(pos.entry > 0) {
            if(pos.side === 'SHORT') {
                pnl = pos.size * ((pos.entry - pos.mark) / pos.entry);
            } else {
                pnl = pos.size * ((pos.mark - pos.entry) / pos.entry);
            }
        }
        totalUnrealizedPNL += pnl;
    });

    const totalMarginBalance = wallet + totalUnrealizedPNL;

    // Update DOM Header Elements dengan Format Uang
    document.getElementById('disp-wallet-balance').innerText = formatMoney(wallet, 2, '.', ',');
    document.getElementById('disp-wallet-balance-idr').innerText = formatMoney(wallet * rate, 2, '.', ',');

    document.getElementById('disp-unrealized-total').innerText = formatMoney(totalUnrealizedPNL, 2, '.', ',');
    document.getElementById('disp-unrealized-idr').innerText = formatMoney(totalUnrealizedPNL * rate, 2, '.', ',');

    document.getElementById('disp-wallet-total').innerText = formatMoney(totalMarginBalance, 2, '.', ',');
    document.getElementById('disp-wallet-idr').innerText = formatMoney(totalMarginBalance * rate, 2, '.', ',');
    
    // Update Promo Icons
    document.getElementById('icon-bnb').src = document.getElementById('in-url-bnb').value;
    document.getElementById('icon-bfusd').src = document.getElementById('in-url-bfusd').value;
    document.getElementById('icon-ldusdt').src = document.getElementById('in-url-ldusdt').value;
}

function toggleDashboard() {
    const db = document.getElementById('editor-dashboard');
    db.style.display = (db.style.display === 'block') ? 'none' : 'block';
}

// Listeners Global Inputs
document.querySelectorAll('.global-input').forEach(input => {
    input.addEventListener('input', () => {
        updateGlobalTotals();
        renderMainInterface(); 
    });
});

// Init
renderMainInterface();
renderEditorInterface();