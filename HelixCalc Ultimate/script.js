document.addEventListener('DOMContentLoaded', () => {
    
    // --- DOM Elements ---
    const el = {
        mode: document.getElementById('calc-mode'),
        inputs: {
            wire: { group: 'group-wire', r: 'range-wire', i: 'input-wire', d: 'disp-wire' },
            od:   { group: 'group-od',   r: 'range-od',   i: 'input-od',   d: 'disp-od' },
            coils:{ group: 'group-coils',r: 'range-coils',i: 'input-coils',d: 'disp-coils' },
            len:  { group: null,         r: 'range-len',  i: 'input-len',  d: 'disp-len' },
            mat:  'material',
            targetK: { group: 'group-target-k', i: 'input-target-k' }
        },
        rev: {
            force: 'rev-force', len: 'rev-len', res: 'rev-k-result', btn: 'btn-apply-target'
        },
        out: {
            rate: 'res-rate', solid: 'res-solid', travel: 'res-travel', index: 'res-index'
        },
        sim: {
            len: 'sim-len', force: 'sim-force', bar: 'load-bar', warn: 'load-warning'
        },
        canvas: 'springCanvas',
        download: 'btn-download'
    };

    const ctx = document.getElementById(el.canvas).getContext('2d');

    // --- State ---
    let currentMode = 'k'; // 'k' (calc rate), 'd' (solve wire), 'na' (solve coils)
    let spring = { k: 0, d: 0, od: 0, na: 0, l0: 0, G: 0 };

    function init() {
        // Initialize Input Syncing (Slider <-> Number)
        setupDualInput(el.inputs.wire);
        setupDualInput(el.inputs.od);
        setupDualInput(el.inputs.coils);
        setupDualInput(el.inputs.len);
        
        // Event Listeners
        document.getElementById(el.inputs.mat).addEventListener('change', update);
        document.getElementById(el.inputs.targetK.i).addEventListener('input', update);
        
        // Mode Switcher
        el.mode.addEventListener('change', (e) => {
            currentMode = e.target.value;
            updateUIMode();
            update();
        });

        // Reverse Engineering
        document.getElementById(el.rev.force).addEventListener('input', calcReverseEng);
        document.getElementById(el.rev.len).addEventListener('input', calcReverseEng);
        document.getElementById(el.rev.btn).addEventListener('click', applyTargetToDesign);

        // Tools
        document.getElementById(el.sim.len).addEventListener('input', runSimulation);
        document.getElementById(el.download).addEventListener('click', downloadData);

        // Canvas Resize
        window.addEventListener('resize', () => { resizeCanvas(); drawSpring(); });

        // Initial Boot
        updateUIMode();
        resizeCanvas();
        update();
    }

    function setupDualInput(obj) {
        if(!obj.r) return;
        const r = document.getElementById(obj.r);
        const i = document.getElementById(obj.i);
        r.addEventListener('input', (e) => { i.value = e.target.value; update(); });
        i.addEventListener('input', (e) => { r.value = e.target.value; update(); });
    }

    function updateUIMode() {
        const kGroup = document.getElementById(el.inputs.targetK.group);
        const wireGroup = document.getElementById(el.inputs.wire.group);
        const coilsGroup = document.getElementById(el.inputs.coils.group);

        // Reset
        kGroup.classList.add('hidden');
        wireGroup.classList.remove('locked');
        coilsGroup.classList.remove('locked');

        // Apply Locks based on Mode
        if (currentMode === 'd') {
            wireGroup.classList.add('locked');
            kGroup.classList.remove('hidden');
        } else if (currentMode === 'na') {
            coilsGroup.classList.add('locked');
            kGroup.classList.remove('hidden');
        }
    }

    // --- REVERSE ENGINEERING LOGIC ---
    function calcReverseEng() {
        const f = parseFloat(document.getElementById(el.rev.force).value);
        const l_target = parseFloat(document.getElementById(el.rev.len).value);
        const l_free = parseFloat(document.getElementById(el.inputs.len.i).value);
        const resEl = document.getElementById(el.rev.res);
        const btn = document.getElementById(el.rev.btn);

        if(!f || !l_target) {
            resEl.innerText = "---";
            btn.disabled = true;
            return;
        }

        const deflection = l_free - l_target;
        
        if(deflection <= 0) {
            resEl.innerText = "Inv. Length";
            btn.disabled = true;
            return;
        }

        const reqK = f / deflection;
        resEl.innerText = reqK.toFixed(2) + " N/mm";
        btn.disabled = false;
        return reqK;
    }

    function applyTargetToDesign() {
        const reqK = calcReverseEng();
        if(!reqK) return;

        // 1. Switch mode to Solve for Wire (d)
        el.mode.value = 'd';
        currentMode = 'd';
        updateUIMode();

        // 2. Set the target K
        document.getElementById(el.inputs.targetK.i).value = reqK.toFixed(2);

        // 3. Recalculate
        update();
    }

    // --- SOLVER ENGINE ---
    function update() {
        let G = parseFloat(document.getElementById(el.inputs.mat).value);
        let od = parseFloat(document.getElementById(el.inputs.od.i).value);
        let l0 = parseFloat(document.getElementById(el.inputs.len.i).value);
        
        let d, na, k;

        // Determine Math Path based on Mode
        if (currentMode === 'k') {
            // Standard: Calculate K from inputs
            d = parseFloat(document.getElementById(el.inputs.wire.i).value);
            na = parseFloat(document.getElementById(el.inputs.coils.i).value);
            const D = od - d;
            k = (d < od && d > 0) ? (G * Math.pow(d, 4)) / (8 * Math.pow(D, 3) * na) : 0;
        } else {
            // Solver: Calculate d or na from Target K
            let targetK = parseFloat(document.getElementById(el.inputs.targetK.i).value) || 0.1;
            
            if (currentMode === 'd') {
                na = parseFloat(document.getElementById(el.inputs.coils.i).value);
                d = solveForWire(G, od, na, targetK);
                // Update UI for locked input
                document.getElementById(el.inputs.wire.i).value = d.toFixed(2);
                document.getElementById(el.inputs.wire.r).value = d.toFixed(2);
                k = targetK;
            } else if (currentMode === 'na') {
                d = parseFloat(document.getElementById(el.inputs.wire.i).value);
                const D = od - d;
                na = (d < od) ? (G * Math.pow(d, 4)) / (8 * Math.pow(D, 3) * targetK) : 0;
                // Update UI for locked input
                document.getElementById(el.inputs.coils.i).value = na.toFixed(1);
                document.getElementById(el.inputs.coils.r).value = na.toFixed(1);
                k = targetK;
            }
        }

        // Derived Physics
        const solid = (na + 2) * d; // Approx squared ends
        const travel = Math.max(0, l0 - solid);
        const meanDia = od - d;
        const index = d > 0 ? meanDia / d : 0;

        spring = { k, d, od, na, l0, solid, travel, index };

        // Update Displays
        updateUIValues();
        runSimulation();
        drawSpring();
        
        // Re-check reverse engineering validity (since L0 might change)
        calcReverseEng();
    }

    // Binary Search to solve for Wire Diameter (Iterative)
    function solveForWire(G, OD, Na, targetK) {
        let min = 0.1, max = OD - 0.1; 
        let d = 0;
        for(let i=0; i<25; i++) {
            d = (min + max) / 2;
            const D = OD - d;
            const calcK = (G * Math.pow(d, 4)) / (8 * Math.pow(D, 3) * Na);
            if (calcK < targetK) min = d; else max = d;
        }
        return d;
    }

    function updateUIValues() {
        document.getElementById(el.inputs.wire.d).innerText = spring.d.toFixed(2) + " mm";
        document.getElementById(el.inputs.od.d).innerText = spring.od.toFixed(1) + " mm";
        document.getElementById(el.inputs.coils.d).innerText = spring.na.toFixed(1);
        document.getElementById(el.inputs.len.d).innerText = spring.l0.toFixed(0) + " mm";

        document.getElementById(el.out.rate).innerText = spring.k.toFixed(2);
        document.getElementById(el.out.solid).innerText = spring.solid.toFixed(2);
        document.getElementById(el.out.travel).innerText = spring.travel.toFixed(2);
        document.getElementById(el.out.index).innerText = spring.index.toFixed(2);
    }

    function runSimulation() {
        const simLen = parseFloat(document.getElementById(el.sim.len).value);
        const bar = document.getElementById(el.sim.bar);
        const warn = document.getElementById(el.sim.warn);
        
        if(isNaN(simLen)) return;

        const deflection = spring.l0 - simLen;
        let force = spring.k * deflection;

        warn.innerText = "";
        bar.style.backgroundColor = "#6b21a8";

        if(simLen > spring.l0) {
            force = 0; bar.style.width = "0%";
        } else if (simLen < spring.solid) {
            force = spring.k * spring.travel; // Max theoretical
            bar.style.width = "100%";
            bar.style.backgroundColor = "#ef4444";
            warn.innerText = "⚠️ Error: Below solid height";
        } else {
            const pct = (deflection / spring.travel) * 100;
            bar.style.width = `${Math.min(pct, 100)}%`;
        }
        document.getElementById(el.sim.force).innerText = force.toFixed(2);
    }

    function downloadData() {
        const date = new Date().toLocaleString();
        const content = `
HELIXCALC ULTIMATE - DESIGN REPORT
Generated: ${date}
==================================

INPUT PARAMETERS
----------------
Material ID:    ASTM A228 / 302 / etc
Wire Diameter:  ${spring.d.toFixed(3)} mm
Outer Diameter: ${spring.od.toFixed(2)} mm
Active Coils:   ${spring.na.toFixed(2)}
Free Length:    ${spring.l0.toFixed(2)} mm

PERFORMANCE DATA
----------------
Spring Rate (k):  ${spring.k.toFixed(2)} N/mm
Solid Height:     ${spring.solid.toFixed(2)} mm
Max Travel:       ${spring.travel.toFixed(2)} mm
Spring Index:     ${spring.index.toFixed(2)}

LOAD SCENARIO
-------------
Compressed To:    ${document.getElementById(el.sim.len).value} mm
Resulting Force:  ${document.getElementById(el.sim.force).innerText} N

==================================
HelixCalc Ultimate
`;
        const blob = new Blob([content], { type: 'text/plain' });
        const a = document.createElement('a');
        a.href = window.URL.createObjectURL(blob);
        a.download = `SpringDesign_${Date.now()}.txt`;
        a.click();
    }

    function resizeCanvas() {
        const c = document.getElementById(el.canvas);
        c.width = c.parentElement.clientWidth;
        c.height = c.parentElement.clientHeight;
    }

    function drawSpring() {
        if(!spring.od || !spring.l0) return;
        const c = document.getElementById(el.canvas);
        const w = c.width, h = c.height;
        ctx.clearRect(0,0,w,h);
        
        const pad = 25;
        // Calculate Scale to fit canvas
        const scale = Math.min((w-pad*2)/spring.od, (h-pad*2)/spring.l0);
        const drawW = spring.od * scale, drawH = spring.l0 * scale;
        const sx = (w-drawW)/2, sy = (h-drawH)/2;
        const r = (spring.od/2)*scale, wr = (spring.d/2)*scale;
        const pitch = drawH / spring.na;
        const cx = sx + r;

        ctx.lineCap = "round"; ctx.lineJoin = "round";
        
        // 1. Draw Back Coils (Background)
        ctx.beginPath(); ctx.strokeStyle = "#94a3b8"; ctx.lineWidth = wr*2;
        for(let i=0; i<spring.na; i++) {
            let y = sy + (i*pitch);
            ctx.moveTo(cx-r+wr, y+pitch*0.25);
            ctx.quadraticCurveTo(cx, y-pitch*0.1, cx+r-wr, y+pitch*0.25);
        }
        ctx.stroke();

        // 2. Draw Front Coils (Foreground with Gradient)
        const grad = ctx.createLinearGradient(sx, 0, sx+drawW, 0);
        grad.addColorStop(0,"#334155"); grad.addColorStop(0.5,"#cbd5e1"); grad.addColorStop(1,"#334155");
        ctx.beginPath(); ctx.strokeStyle = grad; ctx.lineWidth = wr*2;
        
        // Top Flat
        ctx.moveTo(cx-r+wr, sy); ctx.lineTo(cx+r-wr, sy); 
        // Coils
        for(let i=0; i<spring.na; i++) {
            let y = sy + (i*pitch);
            ctx.moveTo(cx+r-wr, y+pitch*0.25);
            ctx.bezierCurveTo(cx+r, y+pitch*0.75, cx-r, y+pitch*0.75, cx-r+wr, y+pitch*1.25);
        }
        // Bottom Flat
        ctx.moveTo(cx-r+wr, sy+drawH); ctx.lineTo(cx+r-wr, sy+drawH);
        ctx.stroke();
    }

    init();
});