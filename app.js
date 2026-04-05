// app.js
let currentLang = 'en'; 
const browserLang = navigator.language || navigator.userLanguage;
if (browserLang && browserLang.toLowerCase().includes('ko')) currentLang = 'ko';

const AppState = {
    instrument: 'guitar', 
    mode: CONFIG.MODES.SCALE,
    currentLang: currentLang,
    highlightedNotes: new Set(), 
    showFormHighlight: false,
    showChordDiagram: false, 
    chordProgression: [], 
    scaleProgression: [],
    lastFretCount: getTotalFrets(),

    clearCustomData() {
        Array.from(DOM_CACHE.allNoteElements).filter(el => el.classList.contains('custom')).forEach(el => el.classList.remove('custom')); 
        this.highlightedNotes.clear();
        DOM_CACHE.findNoteBtns.forEach(btn => btn.classList.remove('active')); 
        Array.from(DOM_CACHE.allNoteElements).filter(el => el.classList.contains('highlight')).forEach(el => el.classList.remove('highlight'));
        DOM_CACHE.majorSelect.value = ""; DOM_CACHE.minorSelect.value = ""; DOM_CACHE.chordSelect.value = "";
        if (this.mode === CONFIG.MODES.SCALE) DOM_CACHE.minorSelect.value = "Blues";
    }
};

function getSafeI18n() { return i18n[AppState.currentLang] || i18n['en']; }

const DOM_CACHE = {
    fretboardView: null, diagramView: null, scaleProgView: null,
    captureArea: null, captureTitle: null, fretboardTitle: null,
    fretboard: null, fretNumbers: null, analyzerResult: null,
    scaleControls: null, chordControls: null, tuningControls: null,
    formToggleRow: null, formToggleDivider: null, noteButtonsContainer: null,
    langBtn: null, guitarBtn: null, bassBtn: null, keyboardBtn: null,
    scaleModeBtn: null, chordModeBtn: null, captureBtn: null,
    toggleDiagramBtn: null, addChordBtn: null, addCustomBtn: null, addLinebreakBtn: null,
    addScaleBtn: null, saveJsonBtn: null, loadJsonBtn: null, clearProgBtn: null,
    clearCustomBtn: null, formToggleBtn: null, loadJsonInput: null,
    tuningSelect: null, keySelect: null, majorSelect: null, minorSelect: null, 
    chordSelect: null, formSelect: null,
    allNoteElements: [], allFretElements: [], findNoteBtns: [],

    init() {
        this.fretboardView = document.getElementById('fretboard-view');
        this.diagramView = document.getElementById('chord-diagram-view');
        this.scaleProgView = document.getElementById('scale-progression-view');
        this.captureArea = document.getElementById('capture-area');
        this.captureTitle = document.getElementById('capture-title');
        this.fretboardTitle = document.getElementById('fretboard-title');
        this.fretboard = document.getElementById('fretboard');
        this.fretNumbers = document.getElementById('fret-numbers');
        this.analyzerResult = document.getElementById('scale-analysis-result');
        this.scaleControls = document.getElementById('scale-controls');
        this.chordControls = document.getElementById('chord-controls');
        this.tuningControls = document.getElementById('tuning-controls');
        this.formToggleRow = document.getElementById('form-toggle-row');
        this.formToggleDivider = document.getElementById('form-toggle-divider');
        this.noteButtonsContainer = document.getElementById('note-buttons-container');

        this.langBtn = document.getElementById('lang-btn');
        this.guitarBtn = document.getElementById('guitar-btn');
        this.bassBtn = document.getElementById('bass-btn');
        this.keyboardBtn = document.getElementById('keyboard-btn');
        this.scaleModeBtn = document.getElementById('scale-mode-btn');
        this.chordModeBtn = document.getElementById('chord-mode-btn');
        this.captureBtn = document.getElementById('capture-btn');
        this.toggleDiagramBtn = document.getElementById('toggle-diagram-btn');
        this.addChordBtn = document.getElementById('add-chord-btn');
        this.addCustomBtn = document.getElementById('add-custom-btn');
        this.addLinebreakBtn = document.getElementById('add-linebreak-btn');
        this.addScaleBtn = document.getElementById('add-scale-btn');
        this.saveJsonBtn = document.getElementById('save-json-btn');
        this.loadJsonBtn = document.getElementById('load-json-btn');
        this.clearProgBtn = document.getElementById('clear-progression-btn');
        this.clearCustomBtn = document.getElementById('clear-custom-btn');
        this.formToggleBtn = document.getElementById('toggle-form-btn');
        this.loadJsonInput = document.getElementById('load-json-input');

        this.tuningSelect = document.getElementById('tuning-select');
        this.keySelect = document.getElementById('key-select');
        this.majorSelect = document.getElementById('major-select');
        this.minorSelect = document.getElementById('minor-select');
        this.chordSelect = document.getElementById('chord-select');
        this.formSelect = document.getElementById('form-select');
    },

    updateDynamicElements() {
        this.allNoteElements = this.fretboardView.querySelectorAll('.note');
        this.allFretElements = this.fretboardView.querySelectorAll('.fret');
    }
};

function generateKeyboardHTML(activeNotes = [], rootIdx = -1) {
    let html = `<div class="keyboard-container" style="margin: 0 auto;">`;
    for(let oct = 0; oct < 3; oct++) {
        CONFIG.KEYBOARD_WHITE_NOTES.forEach(whiteIdx => {
            let wActive = activeNotes.includes(whiteIdx) ? 'active' : '';
            let wRoot = (activeNotes.length > 0 && whiteIdx === rootIdx) ? 'root' : '';
            html += `<div class="piano-key-wrapper"><div class="white-key"><div class="note ${wActive} ${wRoot}" data-note-index="${whiteIdx}">${MUSIC_DATA.notes[whiteIdx]}</div></div>`;
            const blackIdx = CONFIG.KEYBOARD_BLACK_MAP[whiteIdx];
            if (blackIdx !== null) {
                let bActive = activeNotes.includes(blackIdx) ? 'active' : '';
                let bRoot = (activeNotes.length > 0 && blackIdx === rootIdx) ? 'root' : '';
                html += `<div class="black-key"><div class="note ${bActive} ${bRoot}" data-note-index="${blackIdx}">${MUSIC_DATA.notes[blackIdx]}</div></div>`;
            }
            html += `</div>`;
        });
    }
    html += `<div class="piano-key-wrapper"><div class="white-key"><div class="note ${activeNotes.includes(0) ? 'active' : ''} ${activeNotes.length > 0 && 0 === rootIdx ? 'root' : ''}" data-note-index="0">${MUSIC_DATA.notes[0]}</div></div></div></div>`;
    return html;
}

function generateFretboardHTML(instrument, tuningVal, activeNotes = [], rootIdx = -1, anchorFrets = new Set()) {
    const FRET_COUNT = getTotalFrets();
    let html = `<div class="fret-numbers" style="display:flex; width:100%;">`;
    for (let i = 0; i <= FRET_COUNT; i++) {
        let cls = 'fret-number' + (i === CONFIG.OCTAVE_FRET ? ' highlight-12' : (CONFIG.INLAY_FRETS.includes(i) ? ' inlay-mark' : ''));
        html += `<div class="${cls}"><span>${i}</span></div>`;
    }
    html += `</div><div class="fretboard instrument-${instrument}" style="width:100%;">`;
    const currentTuning = MUSIC_DATA.tunings[instrument];
    const tuningOffsets = MUSIC_DATA.tuningPresets[instrument][tuningVal].offset;
    currentTuning.forEach((openNoteIndex, stringIndex) => {
        html += `<div class="string">`;
        for (let fret = 0; fret <= FRET_COUNT; fret++) {
            const currentNoteIndex = (openNoteIndex + tuningOffsets[stringIndex] + fret + 120) % 12;
            let nActive = activeNotes.includes(currentNoteIndex) ? 'active' : '';
            let nRoot = (activeNotes.length > 0 && currentNoteIndex === rootIdx) ? 'root' : '';
            let anchorCls = anchorFrets.has(fret) ? 'anchor-highlight' : '';
            html += `<div class="fret ${anchorCls}" data-fret-index="${fret}"><div class="note ${nActive} ${nRoot}" data-note-index="${currentNoteIndex}">${MUSIC_DATA.notes[currentNoteIndex]}</div></div>`;
        }
        html += `</div>`;
    });
    html += `</div>`;
    return html;
}

window.removeChord = function(idx) { AppState.chordProgression.splice(idx, 1); updateFretboard(); };
window.removeScale = function(idx) { AppState.scaleProgression.splice(idx, 1); updateFretboard(); };
window.shiftCustomFret = function(idx, dir) {
    const item = AppState.chordProgression[idx]; if (!item || item.type !== 'custom') return;
    let newFret = item.startFret + dir; if (newFret >= 1 && newFret <= getTotalFrets()) { item.startFret = newFret; updateFretboard(); }
};
window.editCustomTitle = function(idx) {
    const item = AppState.chordProgression[idx]; if (!item || item.type !== 'custom') return;
    let newTitle = prompt(getSafeI18n().promptCustomTitle, item.title); if (newTitle !== null) { item.title = newTitle; updateFretboard(); }
};
window.toggleCustomDiagramNote = function(progIdx, strIdx, relFret) {
    const item = AppState.chordProgression[progIdx]; if (!item || item.type !== 'custom') return;
    let currentVal = item.voicing[strIdx];
    if (relFret === 0) { item.voicing[strIdx] = (currentVal === 'x' ? 0 : 'x'); } 
    else { let actualFret = item.startFret + relFret - 1; item.voicing[strIdx] = (currentVal === actualFret ? 'x' : actualFret); }
    updateFretboard();
};

function updateNoteHighlights(activeNotesArray, rootIndex) {
    const activeNotesSet = new Set(activeNotesArray);
    DOM_CACHE.allNoteElements.forEach(noteEl => {
        const noteIdx = parseInt(noteEl.dataset.noteIndex);
        const shouldBeActive = activeNotesSet.has(noteIdx);
        noteEl.classList.toggle('active', shouldBeActive);
        noteEl.classList.toggle('root', shouldBeActive && noteIdx === rootIndex);
    });
}

function updateAnchorFrets(anchorFrets) {
    DOM_CACHE.allFretElements.forEach(fretEl => {
        const fretIdx = parseInt(fretEl.dataset.fretIndex);
        fretEl.classList.toggle('anchor-highlight', anchorFrets.has(fretIdx));
    });
}

function setButtonVisibility(buttons) {
    Object.entries(buttons).forEach(([cacheKey, visible]) => {
        if (DOM_CACHE[cacheKey]) {
            DOM_CACHE[cacheKey].style.display = visible ? '' : 'none';
        }
    });
}

const EventManager = {
    init() {
        this.bindUIEvents();
        this.bindFretboardEvents();
        this.bindDragAndDropEvents();
        
        window.addEventListener('resize', () => {
            const currentFretCount = getTotalFrets();
            if (AppState.lastFretCount !== currentFretCount) {
                AppState.lastFretCount = currentFretCount;
                renderFretboard();
                DOM_CACHE.updateDynamicElements();
                updateFretboard();
            }
        });
    },

    bindUIEvents() {
        DOM_CACHE.langBtn.addEventListener('click', toggleLanguage);
        DOM_CACHE.keySelect.addEventListener('change', updateFretboard);
        DOM_CACHE.majorSelect.addEventListener('change', function() { DOM_CACHE.minorSelect.value = ""; updateFretboard(); });
        DOM_CACHE.minorSelect.addEventListener('change', function() { DOM_CACHE.majorSelect.value = ""; updateFretboard(); });
        DOM_CACHE.chordSelect.addEventListener('change', updateFretboard);
        DOM_CACHE.tuningSelect.addEventListener('change', function() { 
            renderFretboard(); DOM_CACHE.updateDynamicElements(); updateFretboard(); analyzeCustomNotes(); 
        });
        DOM_CACHE.formToggleBtn.addEventListener('click', function() {
            AppState.showFormHighlight = !AppState.showFormHighlight;
            this.textContent = AppState.showFormHighlight ? getSafeI18n().btnOn : getSafeI18n().btnOff;
            this.style.backgroundColor = AppState.showFormHighlight ? '#4CAF50' : '#e0e0e0';
            this.style.color = AppState.showFormHighlight ? '#fff' : '#333';
            DOM_CACHE.formSelect.style.display = AppState.showFormHighlight ? '' : 'none'; 
            updateFretboard();
        });
        DOM_CACHE.toggleDiagramBtn.addEventListener('click', function() {
            AppState.showChordDiagram = !AppState.showChordDiagram; 
            this.innerHTML = AppState.showChordDiagram ? getSafeI18n().btnFretboard : getSafeI18n().btnDiagram; 
            updateFretboard();
        });
        DOM_CACHE.addScaleBtn.addEventListener('click', function() {
            const rootIdx = parseInt(DOM_CACHE.keySelect.value);
            const scaleVal = DOM_CACHE.majorSelect.value || DOM_CACHE.minorSelect.value;
            const tuningVal = DOM_CACHE.tuningSelect ? DOM_CACHE.tuningSelect.value : 'standard';
            if (scaleVal) { AppState.scaleProgression.push({ instrument: AppState.instrument, tuningVal: tuningVal, rootIdx: rootIdx, scaleName: scaleVal }); updateFretboard(); }
        });
        DOM_CACHE.addChordBtn.addEventListener('click', function() {
            const rootIdx = parseInt(DOM_CACHE.keySelect.value);
            const chordVal = DOM_CACHE.chordSelect.value;
            if (chordVal) { AppState.chordProgression.push({ type: 'preset', rootIdx: rootIdx, chordName: chordVal }); updateFretboard(); }
        });
        DOM_CACHE.addCustomBtn.addEventListener('click', function() {
            AppState.chordProgression.push({ type: 'custom', title: 'Custom', startFret: 1, voicing: ['x', 'x', 'x', 'x', 'x', 'x'] }); updateFretboard();
        });
        DOM_CACHE.addLinebreakBtn.addEventListener('click', function() {
            AppState.chordProgression.push({ type: 'linebreak' }); updateFretboard();
        });
        DOM_CACHE.saveJsonBtn.addEventListener('click', function() {
            let dataToSave = AppState.mode === CONFIG.MODES.CHORD ? AppState.chordProgression : AppState.scaleProgression;
            if (dataToSave.length === 0) { alert(getSafeI18n().msgNoData); return; }
            const blob = new Blob([JSON.stringify(dataToSave, null, 2)], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a'); link.href = url; link.download = AppState.mode === CONFIG.MODES.CHORD ? "chord_progression.json" : "scale_progression.json";
            link.click(); URL.revokeObjectURL(url);
        });
        DOM_CACHE.loadJsonBtn.addEventListener('click', function() { DOM_CACHE.loadJsonInput.click(); });
        DOM_CACHE.loadJsonInput.addEventListener('change', function(e) {
            const file = e.target.files[0]; if (!file) return;
            const reader = new FileReader();
            reader.onload = function(e) {
                try {
                    const parsed = JSON.parse(e.target.result);
                    if (isValidProgressionData(parsed)) {
                        if (parsed.length > 0 && parsed[0].scaleName) { 
                            AppState.scaleProgression = parsed; 
                            if(AppState.mode !== CONFIG.MODES.SCALE) switchMode(CONFIG.MODES.SCALE);
                            else updateFretboard();
                        } else { 
                            AppState.chordProgression = parsed; 
                            if(AppState.mode !== CONFIG.MODES.CHORD) switchMode(CONFIG.MODES.CHORD);
                            else updateFretboard();
                        }
                    } else throw new Error("Invalid Format");
                } catch (err) { alert(getSafeI18n().msgLoadFail); }
            };
            reader.readAsText(file); this.value = ''; 
        });
        DOM_CACHE.clearProgBtn.addEventListener('click', function() {
            AppState.mode === CONFIG.MODES.SCALE ? AppState.scaleProgression = [] : AppState.chordProgression = []; updateFretboard();
        });
        DOM_CACHE.formSelect.addEventListener('change', updateFretboard);
        DOM_CACHE.clearCustomBtn.addEventListener('click', function() {
            AppState.clearCustomData(); analyzeCustomNotes();
        });
        DOM_CACHE.guitarBtn.addEventListener('click', () => switchInstrument('guitar'));
        DOM_CACHE.bassBtn.addEventListener('click', () => switchInstrument('bass'));
        DOM_CACHE.keyboardBtn.addEventListener('click', () => switchInstrument('keyboard'));
        DOM_CACHE.scaleModeBtn.addEventListener('click', () => switchMode(CONFIG.MODES.SCALE));
        DOM_CACHE.chordModeBtn.addEventListener('click', () => switchMode(CONFIG.MODES.CHORD));
        DOM_CACHE.captureBtn.addEventListener('click', captureFretboard);
    },

    bindFretboardEvents() {
        DOM_CACHE.fretboardView.addEventListener('click', function(e) {
            let noteEl = null;
            if (e.target.classList.contains('note')) noteEl = e.target;
            else if (e.target.classList.contains('fret') || e.target.classList.contains('white-key') || e.target.classList.contains('black-key')) noteEl = e.target.querySelector('.note');
            if (noteEl) { noteEl.classList.toggle('custom'); analyzeCustomNotes(); }
        });
    },

    bindDragAndDropEvents() {
        const handleDragStart = (e) => { 
            const item = e.target.closest('.chord-item, .scale-item'); 
            if (item) { 
                e.dataTransfer.effectAllowed = 'move'; 
                e.dataTransfer.setData('text/plain', item.dataset.index); 
                setTimeout(() => item.style.opacity = '0.4', 0); 
            } 
        };
        const handleDragEnd = (e) => { 
            const item = e.target.closest('.chord-item, .scale-item'); 
            if (item) item.style.opacity = '1'; 
        };
        const handleDragOver = (e) => { 
            if (e.target.closest('.chord-item, .scale-item') || e.target === DOM_CACHE.diagramView || e.target === DOM_CACHE.scaleProgView) { 
                e.preventDefault(); 
                e.dataTransfer.dropEffect = 'move'; 
            } 
        };
        const handleDrop = (e, type) => {
            e.preventDefault();
            const draggedIdx = parseInt(e.dataTransfer.getData('text/plain'));
            if (isNaN(draggedIdx)) return;

            const arr = type === 'chord' ? AppState.chordProgression : AppState.scaleProgression;
            const item = e.target.closest('.chord-item, .scale-item'); 
            
            if (item) {
                const targetIdx = parseInt(item.dataset.index);
                if (draggedIdx !== targetIdx) { 
                    const draggedElement = arr.splice(draggedIdx, 1)[0]; 
                    arr.splice(targetIdx, 0, draggedElement); 
                    updateFretboard(); 
                }
            } else {
                const container = type === 'chord' ? DOM_CACHE.diagramView : DOM_CACHE.scaleProgView;
                if (e.target === container || container.contains(e.target)) {
                    const draggedElement = arr.splice(draggedIdx, 1)[0];
                    arr.push(draggedElement);
                    updateFretboard();
                }
            }
        };
        const attachEvents = (view, type) => {
            view.addEventListener('dragstart', handleDragStart); 
            view.addEventListener('dragend', handleDragEnd); 
            view.addEventListener('dragover', handleDragOver); 
            view.addEventListener('drop', (e) => handleDrop(e, type));
        };
        attachEvents(DOM_CACHE.diagramView, 'chord'); 
        attachEvents(DOM_CACHE.scaleProgView, 'scale');
    }
};

function isValidProgressionData(data) {
    if (!Array.isArray(data)) return false;
    return data.every(item => item.type === 'linebreak' || item.scaleName || item.chordName || (item.voicing && Array.isArray(item.voicing)));
}

function init() {
    DOM_CACHE.init();
    setupSelects(); 
    updateTuningOptions(); 
    setupNoteButtons(); 
    renderFretboard(); 
    DOM_CACHE.updateDynamicElements(); 
    updateFretboard(); 
    applyLanguage(); 
    EventManager.init();
}

function extractChordSymbol(chordName) {
    const match = chordName.match(/\(([^)]+)\)/);
    let symbol = match ? match[1] : '';
    return symbol === 'M' ? '' : symbol;
}

function getChordVoicing(rootIdx, chordName) {
    const key = `${rootIdx}_${chordName}`; if (MUSIC_DATA.openChords[key]) return MUSIC_DATA.openChords[key]; 
    const shape = MUSIC_DATA.chordShapes[chordName]; if (!shape) return null;
    let f6 = (rootIdx - 4 + 12) % 12, f5 = (rootIdx - 9 + 12) % 12; 
    const applyOffset = (baseShape, offset) => baseShape.map(f => f === 'x' ? 'x' : f + offset);
    let voicingE = applyOffset(shape.E, f6), voicingA = applyOffset(shape.A, f5);
    const isValid = v => v.every(f => f === 'x' || (f >= 0 && f <= CONFIG.TOTAL_FRETS));
    let validE = isValid(voicingE), validA = isValid(voicingA);
    if (validE && validA) return f6 <= f5 ? voicingE : voicingA; else if (validE) return voicingE; else if (validA) return voicingA;
    return null;
}

function generateChordDiagramSVG(voicing, titleText, isCustom = false, progIdx = -1, customStartFret = 1) {
    const validFrets = voicing.filter(f => f !== 'x' && f > 0);
    let minFret = validFrets.length ? Math.min(...validFrets) : 1, maxFret = validFrets.length ? Math.max(...validFrets) : 1;
    let startFret = isCustom ? customStartFret : (maxFret > 5 ? minFret : 1);
    
    let svg = `<svg viewBox="0 0 220 300" xmlns="http://www.w3.org/2000/svg" style="background:#222; border-radius:12px; box-shadow: 0 4px 10px rgba(0,0,0,0.3); width: 100%; height: auto;">`;
    let titleStyle = isCustom ? 'cursor:pointer; text-decoration:underline;' : '';
    let titleClick = isCustom ? `onclick="editCustomTitle(${progIdx})"` : '';
    svg += `<text x="110" y="40" fill="white" font-size="24" font-family="sans-serif" text-anchor="middle" style="${titleStyle}" ${titleClick}>${titleText}</text>`;
    const startX = 45, startY = 85, gapX = 26, gapY = 38; 
    for (let i = 0; i <= 5; i++) {
        let y = startY + i * gapY; let strokeW = (i === 0 && startFret === 1) ? 5 : 1.5; let color = (i === 0 && startFret === 1) ? "#fff" : "#999";
        svg += `<line x1="${startX}" y1="${y}" x2="${startX + 5 * gapX}" y2="${y}" stroke="${color}" stroke-width="${strokeW}" />`;
        let x = startX + i * gapX; svg += `<line x1="${x}" y1="${startY}" x2="${x}" y2="${startY + 5 * gapY}" stroke="#ccc" stroke-width="1.5" />`;
    }
    if (startFret > 1) svg += `<text x="22" y="${startY + gapY/2}" fill="white" font-size="14" font-weight="bold" font-family="sans-serif" text-anchor="middle" dominant-baseline="central">${startFret}fr</text>`;
    const tuningVal = DOM_CACHE.tuningSelect ? DOM_CACHE.tuningSelect.value : 'standard';
    const tuningOffsets = MUSIC_DATA.tuningPresets['guitar'][tuningVal].offset;
    const stringOpenNotes = [4, 11, 7, 2, 9, 4].map((open, i) => (open + tuningOffsets[i] + 120) % 12);
    voicing.forEach((fret, strIdx) => {
        let x = startX + strIdx * gapX;
        if (fret === 'x') { svg += `<text x="${x}" y="${startY - 15}" fill="#fff" font-size="16" font-family="sans-serif" text-anchor="middle" pointer-events="none">X</text>`; 
        } else if (fret === 0) { svg += `<circle cx="${x}" cy="${startY - 20}" r="6" fill="none" stroke="white" stroke-width="2" pointer-events="none"/>`;
        } else if (fret >= startFret && fret <= startFret + 4) {
            let y = startY + (fret - startFret + 0.5) * gapY;
            svg += `<circle cx="${x}" cy="${y}" r="12" fill="white" stroke="#ff9800" stroke-width="2" pointer-events="none"/>`;
            svg += `<text x="${x}" y="${y}" fill="#333" font-size="11" font-weight="bold" font-family="sans-serif" text-anchor="middle" dominant-baseline="central" pointer-events="none">${MUSIC_DATA.notes[(stringOpenNotes[strIdx] + fret) % 12]}</text>`;
        }
    });
    if (isCustom) {
        for (let strIdx = 0; strIdx <= 5; strIdx++) {
            let x = startX + strIdx * gapX;
            svg += `<rect class="custom-click-zone" x="${x-10}" y="${startY - 35}" width="20" height="30" style="cursor:pointer;" onclick="toggleCustomDiagramNote(${progIdx}, ${strIdx}, 0)" />`;
            for (let relFret = 1; relFret <= 5; relFret++) {
                svg += `<rect class="custom-click-zone" x="${x-10}" y="${startY + (relFret - 1) * gapY}" width="20" height="${gapY}" style="cursor:pointer;" onclick="toggleCustomDiagramNote(${progIdx}, ${strIdx}, ${relFret})" />`;
            }
        }
        svg += `
        <g class="no-capture custom-fret-svg-btn" onclick="shiftCustomFret(${progIdx}, -1)">
            <rect x="8" y="115" width="26" height="26" rx="4" fill="rgba(255,255,255,0.25)" />
            <text x="21" y="133" fill="white" font-size="14" font-family="sans-serif" text-anchor="middle">▲</text>
        </g>
        <g class="no-capture custom-fret-svg-btn" onclick="shiftCustomFret(${progIdx}, 1)">
            <rect x="8" y="145" width="26" height="26" rx="4" fill="rgba(255,255,255,0.25)" />
            <text x="21" y="163" fill="white" font-size="14" font-family="sans-serif" text-anchor="middle">▼</text>
        </g>`;
    }
    return svg + `</svg>`;
}

function generateScaleBoardHTML(item, idx) {
    let intervals = MUSIC_DATA.allScales[item.scaleName] || [];
    const activeNotes = intervals.map(interval => (item.rootIdx + interval) % 12);
    let html = `<div class="scale-item" draggable="true" data-index="${idx}">`;
    html += `<button class="no-capture scale-item-close" onclick="removeScale(${idx})">X</button>`;
    
    let t_instrument = item.instrument === 'keyboard' ? 'Keyboard' : item.instrument === 'guitar' ? 'Guitar' : 'Bass';
    if (item.instrument !== 'keyboard' && item.tuningVal !== 'standard') t_instrument += ` [${MUSIC_DATA.tuningPresets[item.instrument][item.tuningVal][AppState.currentLang] || 'Standard'}]`;
    html += `<h3 class="scale-item-title">${t_instrument} ${MUSIC_DATA.notes[item.rootIdx]} ${item.scaleName}</h3>`;
    html += `<div style="overflow-x:auto; width:100%; padding-bottom:10px;">`;
    
    if (item.instrument === 'keyboard') {
        html += generateKeyboardHTML(activeNotes, item.rootIdx);
    } else {
        let anchorFrets = new Set();
        if (AppState.showFormHighlight && !item.scaleName.includes("Phrygian")) {
            const tuningOffsets = MUSIC_DATA.tuningPresets[item.instrument][item.tuningVal].offset;
            const lowestStrIdx = MUSIC_DATA.tunings[item.instrument].length - 1;
            let f1 = ((item.rootIdx - 3 + 12) % 12 - ((MUSIC_DATA.tunings[item.instrument][lowestStrIdx] + tuningOffsets[lowestStrIdx] + 120) % 12) + 12) % 12;
            let offsets = [...CONFIG.FORM_OFFSETS[DOM_CACHE.formSelect.value]];
            if (item.instrument === 'bass' && DOM_CACHE.formSelect.value === '3') offsets = [4, 5, 6, 7]; 
            offsets.map(o => f1 + o).forEach(f => CONFIG.FRET_OCTAVE_SHIFTS.forEach(s => { if (f+s >= 0 && f+s <= getTotalFrets()) anchorFrets.add(f+s); }));
        }
        html += generateFretboardHTML(item.instrument, item.tuningVal, activeNotes, item.rootIdx, anchorFrets);
    }
    return html + `</div></div>`;
}

function updateTuningOptions() {
    if (AppState.instrument === 'keyboard') return; 
    const currentVal = DOM_CACHE.tuningSelect.value; 
    DOM_CACHE.tuningSelect.innerHTML = ''; 
    const presets = MUSIC_DATA.tuningPresets[AppState.instrument]; 
    const safeLang = AppState.currentLang === 'ko' ? 'ko' : 'en';
    for (let key in presets) DOM_CACHE.tuningSelect.appendChild(new Option(presets[key][safeLang], key));
    DOM_CACHE.tuningSelect.value = presets[currentVal] ? currentVal : 'standard';
}

function toggleLanguage() { AppState.currentLang = AppState.currentLang === 'ko' ? 'en' : 'ko'; applyLanguage(); }

function applyLanguage() {
    const t = getSafeI18n();
    DOM_CACHE.langBtn.innerHTML = t.langBtn; DOM_CACHE.guitarBtn.innerHTML = t.guitarBtn;
    DOM_CACHE.bassBtn.innerHTML = t.bassBtn; DOM_CACHE.keyboardBtn.innerHTML = t.keyboardBtn;
    document.getElementById('lbl-tuning').textContent = t.lblTuning; DOM_CACHE.scaleModeBtn.innerHTML = t.scaleModeBtn;
    DOM_CACHE.chordModeBtn.innerHTML = t.chordModeBtn; DOM_CACHE.captureBtn.innerHTML = t.captureBtn;
    document.getElementById('lbl-key').textContent = t.lblKey; document.getElementById('lbl-major').textContent = t.lblMajor;
    document.getElementById('lbl-minor').textContent = t.lblMinor; document.getElementById('lbl-chord').textContent = t.lblChord;
    document.getElementById('lbl-find-note').textContent = t.lblFindNote; document.getElementById('lbl-form-toggle').textContent = t.lblFormToggle;
    DOM_CACHE.formToggleBtn.textContent = AppState.showFormHighlight ? t.btnOn : t.btnOff;
    DOM_CACHE.toggleDiagramBtn.innerHTML = AppState.showChordDiagram ? t.btnFretboard : t.btnDiagram;
    DOM_CACHE.addScaleBtn.innerHTML = t.btnAddScale; DOM_CACHE.addChordBtn.innerHTML = t.btnAddChord;
    DOM_CACHE.addCustomBtn.innerHTML = t.btnAddCustom; DOM_CACHE.addLinebreakBtn.innerHTML = t.btnAddLinebreak; 
    DOM_CACHE.saveJsonBtn.innerHTML = t.btnSaveJson;
    DOM_CACHE.loadJsonBtn.innerHTML = t.btnLoadJson; DOM_CACHE.clearProgBtn.innerHTML = t.btnClear;
    
    DOM_CACHE.formSelect.options[0].text = t.form1; DOM_CACHE.formSelect.options[1].text = t.form2; DOM_CACHE.formSelect.options[2].text = t.form3; DOM_CACHE.formSelect.options[3].text = t.form4; DOM_CACHE.formSelect.options[4].text = t.form5;
    document.getElementById('lbl-analyzer-title').innerHTML = t.analyzerTitle; DOM_CACHE.clearCustomBtn.innerText = t.clearBtn;
    document.querySelectorAll('select option[value=""]').forEach(opt => opt.innerText = t.selectDefault);
    updateTuningOptions(); updateFretboard();
}

function setupNoteButtons() {
    DOM_CACHE.noteButtonsContainer.innerHTML = '';
    DOM_CACHE.findNoteBtns = []; 
    MUSIC_DATA.notes.forEach((note, index) => {
        const btn = document.createElement('button'); btn.className = 'btn find-note-btn'; btn.textContent = note;
        btn.addEventListener('click', function() { AppState.highlightedNotes.has(index) ? (AppState.highlightedNotes.delete(index), this.classList.remove('active')) : (AppState.highlightedNotes.add(index), this.classList.add('active')); applyHighlights(); });
        DOM_CACHE.noteButtonsContainer.appendChild(btn);
        DOM_CACHE.findNoteBtns.push(btn);
    });
}

function applyHighlights() {
    DOM_CACHE.allNoteElements.forEach(noteEl => { AppState.highlightedNotes.has(parseInt(noteEl.dataset.noteIndex)) ? noteEl.classList.add('highlight') : noteEl.classList.remove('highlight'); });
}

function switchInstrument(instrument) {
    if (AppState.instrument === instrument) return; AppState.instrument = instrument;
    DOM_CACHE.guitarBtn.classList.toggle('active', instrument === 'guitar'); DOM_CACHE.bassBtn.classList.toggle('active', instrument === 'bass'); DOM_CACHE.keyboardBtn.classList.toggle('active', instrument === 'keyboard');
    
    if (instrument === 'keyboard') { 
        DOM_CACHE.tuningControls.style.display = 'none'; 
    } else { 
        DOM_CACHE.tuningControls.style.display = ''; 
    }
    resetSelections(); updateTuningOptions(); 
    renderFretboard(); DOM_CACHE.updateDynamicElements(); 
    updateFretboard(); analyzeCustomNotes();
}

function switchMode(mode) {
    if (AppState.mode === mode) return; AppState.mode = mode;
    DOM_CACHE.scaleModeBtn.classList.toggle('active', mode === CONFIG.MODES.SCALE); DOM_CACHE.chordModeBtn.classList.toggle('active', mode === CONFIG.MODES.CHORD);
    
    DOM_CACHE.scaleControls.style.display = mode === CONFIG.MODES.SCALE ? '' : 'none'; 
    DOM_CACHE.chordControls.style.display = mode === CONFIG.MODES.CHORD ? '' : 'none';
    
    if (mode !== CONFIG.MODES.CHORD) { AppState.showChordDiagram = false; DOM_CACHE.toggleDiagramBtn.innerHTML = getSafeI18n().btnDiagram; }
    resetSelections(); updateFretboard();
}

function resetSelections() {
    AppState.clearCustomData();
    DOM_CACHE.majorSelect.value = ""; DOM_CACHE.minorSelect.value = ""; DOM_CACHE.chordSelect.value = "";
    if (AppState.mode === CONFIG.MODES.SCALE) DOM_CACHE.minorSelect.value = "Blues";
}

function setupSelects() {
    MUSIC_DATA.notes.forEach((note, index) => DOM_CACHE.keySelect.appendChild(new Option(note, index)));
    for (let scale in MUSIC_DATA.majorScales) DOM_CACHE.majorSelect.appendChild(new Option(scale, scale));
    for (let scale in MUSIC_DATA.minorScales) { const option = new Option(scale, scale); if (scale === "Blues") option.selected = true; DOM_CACHE.minorSelect.appendChild(option); }
    for (let chord in MUSIC_DATA.allChords) DOM_CACHE.chordSelect.appendChild(new Option(chord, chord));
}

function renderFretboard() {
    if (AppState.instrument === 'keyboard') {
        DOM_CACHE.fretNumbers.style.display = 'none'; DOM_CACHE.fretboard.className = 'keyboard-container'; DOM_CACHE.fretboard.innerHTML = generateKeyboardHTML(); 
    } else {
        DOM_CACHE.fretNumbers.style.display = 'flex'; DOM_CACHE.fretboard.className = `fretboard instrument-${AppState.instrument}`;
        const tuningVal = DOM_CACHE.tuningSelect.value || 'standard';
        const tempDiv = document.createElement('div'); tempDiv.innerHTML = generateFretboardHTML(AppState.instrument, tuningVal);
        DOM_CACHE.fretNumbers.innerHTML = tempDiv.querySelector('.fret-numbers').innerHTML; DOM_CACHE.fretboard.innerHTML = tempDiv.querySelector('.fretboard').innerHTML;
    }
    applyHighlights();
}

function updateFretboard() {
    const rootIndex = parseInt(DOM_CACHE.keySelect.value); const rootName = MUSIC_DATA.notes[rootIndex]; const t = getSafeI18n();
    let intervals = []; let displayTitle = "";
    const tuningVal = DOM_CACHE.tuningSelect ? DOM_CACHE.tuningSelect.value : 'standard';
    let instrumentLabel = AppState.instrument === 'keyboard' ? 'Keyboard' : (AppState.instrument === 'guitar' ? 'Guitar' : 'Bass');
    if (AppState.instrument !== 'keyboard' && tuningVal !== 'standard') instrumentLabel += ` [${MUSIC_DATA.tuningPresets[AppState.instrument][tuningVal][AppState.currentLang] || 'Standard'}]`;

    const chordVal = DOM_CACHE.chordSelect.value;
    const majorVal = DOM_CACHE.majorSelect.value;
    const minorVal = DOM_CACHE.minorSelect.value;
    const scaleVal = majorVal || minorVal;

    if (AppState.mode === CONFIG.MODES.SCALE) {
        if (scaleVal) { intervals = MUSIC_DATA.allScales[scaleVal]; displayTitle = `${instrumentLabel} ${rootName} ${scaleVal}`; } 
        else displayTitle = `${instrumentLabel} ${rootName} ${t.txtCustom}`;
    } else {
        if (chordVal) { intervals = MUSIC_DATA.allChords[chordVal]; displayTitle = `${instrumentLabel} ${rootName} ${chordVal.split(' (')[0]} Chord`; } 
        else displayTitle = `${instrumentLabel} ${rootName} ${t.txtCustom}`;
    }
    
    DOM_CACHE.fretboardTitle.textContent = displayTitle;

    if (AppState.mode === CONFIG.MODES.CHORD && AppState.showChordDiagram) { 
        if (AppState.chordProgression.length > 0) DOM_CACHE.captureTitle.textContent = `${instrumentLabel} ${t.titleChordProgression}`; 
        else DOM_CACHE.captureTitle.textContent = displayTitle;
        DOM_CACHE.captureTitle.style.display = 'block';
        DOM_CACHE.captureTitle.classList.add('no-capture'); 
    } else { 
        DOM_CACHE.captureTitle.style.display = 'none'; 
    }

    if (AppState.mode === CONFIG.MODES.SCALE) {
        setButtonVisibility({ toggleDiagramBtn: false, addChordBtn: false, addCustomBtn: false, addLinebreakBtn: false, addScaleBtn: !!scaleVal });
        DOM_CACHE.diagramView.style.display = 'none'; DOM_CACHE.fretboardView.style.display = 'block';

        if (AppState.scaleProgression.length > 0) {
            setButtonVisibility({ saveJsonBtn: true, clearProgBtn: true });
            DOM_CACHE.scaleProgView.style.display = 'flex';
            let html = ''; AppState.scaleProgression.forEach((c, idx) => html += generateScaleBoardHTML(c, idx)); DOM_CACHE.scaleProgView.innerHTML = html;
        } else { 
            setButtonVisibility({ saveJsonBtn: false, clearProgBtn: false });
            DOM_CACHE.scaleProgView.style.display = 'none'; 
        }
    } else {
        const isGuitar = AppState.instrument === 'guitar' && tuningVal === 'standard';
        setButtonVisibility({
            addScaleBtn: false, toggleDiagramBtn: isGuitar, addChordBtn: isGuitar && AppState.showChordDiagram,
            addCustomBtn: isGuitar && AppState.showChordDiagram, addLinebreakBtn: isGuitar && AppState.showChordDiagram,
            saveJsonBtn: isGuitar && AppState.showChordDiagram && AppState.chordProgression.length > 0,
            clearProgBtn: isGuitar && AppState.showChordDiagram && AppState.chordProgression.length > 0
        });
        DOM_CACHE.scaleProgView.style.display = 'none';
        
        if (isGuitar && AppState.showChordDiagram) { renderChordDiagrams(AppState.chordProgression, rootIndex, chordVal); } 
        else { DOM_CACHE.diagramView.style.display = 'none'; DOM_CACHE.fretboardView.style.display = 'block'; }
    }

    if (AppState.instrument !== 'keyboard') {
        let anchorFrets = new Set(); 
        if (AppState.showFormHighlight && intervals.length > 0) {
            let useRelativeMinor = AppState.mode === CONFIG.MODES.SCALE ? (!scaleVal.includes("Phrygian")) : (chordVal && (chordVal.includes("Major") || chordVal.includes("Dominant") || chordVal === "Sus 2 (sus2)" || chordVal === "Sus 4 (sus4)"));
            const anchorNote = useRelativeMinor ? (rootIndex - 3 + 12) % 12 : rootIndex;
            const lowestStrIdx = MUSIC_DATA.tunings[AppState.instrument].length - 1;
            const tuningOffsets = MUSIC_DATA.tuningPresets[AppState.instrument][tuningVal].offset;
            let f1 = (anchorNote - ((MUSIC_DATA.tunings[AppState.instrument][lowestStrIdx] + tuningOffsets[lowestStrIdx] + 120) % 12) + 12) % 12;
            const formSelectVal = DOM_CACHE.formSelect.value;
            let offsets = CONFIG.BASS_FORM_SPECIAL_OFFSETS[formSelectVal] || [...CONFIG.FORM_OFFSETS[formSelectVal]];
            offsets.map(o => f1 + o).forEach(f => CONFIG.FRET_OCTAVE_SHIFTS.forEach(s => { if (f+s >= 0 && f+s <= getTotalFrets()) anchorFrets.add(f+s); }));
        }
        updateAnchorFrets(anchorFrets);
    }

    const activeNotes = new Set(intervals.map(interval => (rootIndex + interval) % 12));
    updateNoteHighlights(Array.from(activeNotes), rootIndex);
}

function renderChordDiagrams(progression, rootIndex, chordVal) {
    DOM_CACHE.diagramView.style.display = 'flex';
    DOM_CACHE.diagramView.style.flexWrap = 'wrap';
    DOM_CACHE.diagramView.style.gap = '20px';
    DOM_CACHE.diagramView.style.justifyContent = 'center';
    DOM_CACHE.diagramView.style.alignItems = 'flex-start';
    DOM_CACHE.fretboardView.style.display = 'none';
    
    let html = '';
    progression.forEach((c, idx) => {
        if (c.type === 'linebreak') {
            html += `<div class="chord-item linebreak-item" draggable="true" data-index="${idx}">
                        <div class="no-capture" style="width:100%; height:2px; background:#ccc; position:relative;">
                            <span style="position:absolute; top:-10px; left:50%; transform:translateX(-50%); background:#f4f4f4; padding:0 10px; color:#888; font-size:12px; font-weight:bold;">${getSafeI18n().txtLineBreak}</span>
                        </div>
                        <button class="no-capture scale-item-close" style="top:-12px; right:10px;" onclick="removeChord(${idx})">X</button>
                     </div>`;
            return;
        }

        let svgContent = '';
        if (c.type === 'preset') {
            const voicing = getChordVoicing(c.rootIdx, c.chordName);
            if (voicing) {
                const shortSymbol = extractChordSymbol(c.chordName);
                svgContent = generateChordDiagramSVG(voicing, `${MUSIC_DATA.notes[c.rootIdx]}${shortSymbol}`, false, idx);
            }
        } else if (c.type === 'custom') {
            svgContent = generateChordDiagramSVG(c.voicing, c.title, true, idx, c.startFret);
        }
        
        if (svgContent) {
            html += `<div class="chord-item" draggable="true" data-index="${idx}" style="position:relative; margin-bottom: 10px; cursor: grab;">${svgContent}<button class="no-capture scale-item-close" style="top:-10px; right:-10px;" onclick="removeChord(${idx})">X</button></div>`;
        }
    });
    
    if (chordVal) {
        const voicing = getChordVoicing(rootIndex, chordVal);
        if (voicing) {
            const shortSymbol = extractChordSymbol(chordVal);
            html += `<div class="no-capture chord-item" style="position:relative; opacity:0.8; border: 2px dashed #9c27b0; border-radius: 12px; padding: 5px; margin-bottom: 10px; box-sizing:border-box;"><div style="position:absolute; top:-12px; left:50%; transform:translateX(-50%); background:#9c27b0; color:white; padding:2px 10px; border-radius:12px; font-size:12px; font-weight:bold; white-space:nowrap;">${AppState.currentLang === 'ko' ? '미리보기 (Preview)' : 'Preview'}</div>${generateChordDiagramSVG(voicing, `${MUSIC_DATA.notes[rootIndex]}${shortSymbol}`, false, -1)}</div>`;
        } else html += `<p class="no-capture" style="color:#666; align-self:center; width:100%; text-align:center; padding: 20px;">해당 코드의 다이어그램을 찾을 수 없습니다.</p>`;
    }
    DOM_CACHE.diagramView.innerHTML = html;
}

window.applyView = function(rootIndex, name, type) {
    DOM_CACHE.keySelect.value = rootIndex;
    if (type === 'scale') { 
        switchMode(CONFIG.MODES.SCALE); 
        if (MUSIC_DATA.majorScales.hasOwnProperty(name)) { DOM_CACHE.majorSelect.value = name; DOM_CACHE.minorSelect.value = ""; } 
        else { DOM_CACHE.minorSelect.value = name; DOM_CACHE.majorSelect.value = ""; } 
    } else if (type === 'chord') { switchMode(CONFIG.MODES.CHORD); DOM_CACHE.chordSelect.value = name; }
    updateFretboard(); window.scrollTo({ top: 0, behavior: 'smooth' });
};

function analyzeCustomNotes() {
    const customElements = Array.from(DOM_CACHE.allNoteElements).filter(el => el.classList.contains('custom'));
    const selectedNotesSet = new Set(); const t = getSafeI18n();
    customElements.forEach(el => selectedNotesSet.add(parseInt(el.dataset.noteIndex))); const selectedArr = Array.from(selectedNotesSet).sort((a, b) => a - b);
    if (selectedArr.length === 0) { DOM_CACHE.analyzerResult.innerHTML = t.analyzerDefault; return; }
    
    let exactChords = [], exactScales = [], partialScales = [];
    const arraysEqual = (a, b) => a.length === b.length && a.every((v, i) => v === b[i]);

    for (let root = 0; root < 12; root++) {
        let rootName = MUSIC_DATA.notes[root];
        for (let chordName in MUSIC_DATA.allChords) {
            if (arraysEqual(MUSIC_DATA.allChords[chordName].map(i => (root + i) % 12).sort((a, b) => a - b), selectedArr)) exactChords.push(`<span class="clickable-scale" onclick="applyView(${root}, '${chordName}', 'chord')"><strong>${rootName}${extractChordSymbol(chordName)}</strong> (${chordName})</span>`);
        }
        for (let scaleName in MUSIC_DATA.allScales) {
            let scaleNotes = MUSIC_DATA.allScales[scaleName].map(i => (root + i) % 12).sort((a, b) => a - b);
            if (arraysEqual(scaleNotes, selectedArr)) exactScales.push(`<span class="clickable-scale" onclick="applyView(${root}, '${scaleName}', 'scale')"><strong>${rootName}</strong> ${scaleName}</span>`);
            else if (selectedArr.length >= 3 && selectedArr.every(val => scaleNotes.includes(val))) partialScales.push(`<span class="clickable-scale" onclick="applyView(${root}, '${scaleName}', 'scale')">${rootName} ${scaleName}</span>`);
        }
    }

    let html = `${t.txtCurrentNotes}<strong>[ ${selectedArr.map(n => MUSIC_DATA.notes[n]).join(', ')} ]</strong><br><br>${t.txtExactChords}<br>${exactChords.length > 0 ? exactChords.join('<br>') + '<br><br>' : t.txtNone + '<br><br>'}${t.txtExactScales}<br>${exactScales.length > 0 ? exactScales.join('<br>') + '<br><br>' : t.txtNone + '<br><br>'}`;
    if (partialScales.length > 0) html += `${t.txtPartialScales}<br>${partialScales.slice(0, 15).join('')}${partialScales.length > 15 ? t.txtEtc : ''}`;
    DOM_CACHE.analyzerResult.innerHTML = html;
}

function captureFretboard() {
    let titleText = "";
    if (DOM_CACHE.captureTitle.style.display !== 'none') {
        titleText = DOM_CACHE.captureTitle.textContent;
    } else {
        titleText = DOM_CACHE.fretboardTitle.textContent;
    }
    
    const hideElements = DOM_CACHE.captureArea.querySelectorAll('.no-capture'); 
    const originalDisplays = []; 
    hideElements.forEach((el, i) => { originalDisplays[i] = el.style.display; el.style.display = 'none'; });
    
    const originalBg = DOM_CACHE.captureArea.style.backgroundColor; 
    DOM_CACHE.captureArea.style.backgroundColor = 'transparent';
    const originalText = DOM_CACHE.captureBtn.innerHTML; 
    DOM_CACHE.captureBtn.innerHTML = AppState.currentLang === 'ko' ? '저장 중...' : 'Saving...'; 
    DOM_CACHE.captureBtn.disabled = true;

    html2canvas(DOM_CACHE.captureArea, { backgroundColor: null, scale: 2 }).then(canvas => {
        const link = document.createElement('a'); 
        link.download = titleText.replace(/ /g, '_').replace(/[()]/g, '') + '_capture.png'; 
        link.href = canvas.toDataURL("image/png"); 
        link.click();
        DOM_CACHE.captureArea.style.backgroundColor = originalBg; hideElements.forEach((el, i) => el.style.display = originalDisplays[i]); DOM_CACHE.captureBtn.innerHTML = originalText; DOM_CACHE.captureBtn.disabled = false;
    }).catch(err => {
        console.error('캡처 실패:', err); DOM_CACHE.captureArea.style.backgroundColor = originalBg; hideElements.forEach((el, i) => el.style.display = originalDisplays[i]); DOM_CACHE.captureBtn.innerHTML = originalText; DOM_CACHE.captureBtn.disabled = false;
    });
}

window.addEventListener('DOMContentLoaded', init);