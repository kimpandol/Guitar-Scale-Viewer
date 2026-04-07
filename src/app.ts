import { AppStateType, DOMElements, Language, I18nDict } from './types';
import { CONFIG, MUSIC_DATA, i18n } from './data';
//
// (html2canvas 전역 선언)
declare const html2canvas: any;

let currentLang: Language = 'en';
const browserLang = navigator.language || (navigator as any).userLanguage;
if (browserLang && browserLang.toLowerCase().includes('ko')) currentLang = 'ko';

function getTotalFrets(): number {
    return window.innerWidth <= 768 ? 18 : 21;
}

const AppState: AppStateType = {
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
        if (DOM_CACHE.majorSelect) DOM_CACHE.majorSelect.value = ""; 
        if (DOM_CACHE.minorSelect) DOM_CACHE.minorSelect.value = ""; 
        if (DOM_CACHE.chordSelect) DOM_CACHE.chordSelect.value = "";
        if (this.mode === CONFIG.MODES.SCALE && DOM_CACHE.minorSelect) DOM_CACHE.minorSelect.value = "Blues";
    }
};

function getSafeI18n(): I18nDict[Language] { return i18n[AppState.currentLang] || i18n['en']; }

const DOM_CACHE: DOMElements = {
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
    allNoteElements: [] as any, allFretElements: [] as any, findNoteBtns: [] as HTMLButtonElement[],

    init() {
        // 🚀 타입 단언 (as HTMLElement) 적용
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

        this.langBtn = document.getElementById('lang-btn') as HTMLButtonElement;
        this.guitarBtn = document.getElementById('guitar-btn') as HTMLButtonElement;
        this.bassBtn = document.getElementById('bass-btn') as HTMLButtonElement;
        this.keyboardBtn = document.getElementById('keyboard-btn') as HTMLButtonElement;
        this.scaleModeBtn = document.getElementById('scale-mode-btn') as HTMLButtonElement;
        this.chordModeBtn = document.getElementById('chord-mode-btn') as HTMLButtonElement;
        this.captureBtn = document.getElementById('capture-btn') as HTMLButtonElement;
        this.toggleDiagramBtn = document.getElementById('toggle-diagram-btn') as HTMLButtonElement;
        this.addChordBtn = document.getElementById('add-chord-btn') as HTMLButtonElement;
        this.addCustomBtn = document.getElementById('add-custom-btn') as HTMLButtonElement;
        this.addLinebreakBtn = document.getElementById('add-linebreak-btn') as HTMLButtonElement;
        this.addScaleBtn = document.getElementById('add-scale-btn') as HTMLButtonElement;
        this.saveJsonBtn = document.getElementById('save-json-btn') as HTMLButtonElement;
        this.loadJsonBtn = document.getElementById('load-json-btn') as HTMLButtonElement;
        this.clearProgBtn = document.getElementById('clear-progression-btn') as HTMLButtonElement;
        this.clearCustomBtn = document.getElementById('clear-custom-btn') as HTMLButtonElement;
        this.formToggleBtn = document.getElementById('toggle-form-btn') as HTMLButtonElement;
        this.loadJsonInput = document.getElementById('load-json-input') as HTMLInputElement;

        this.tuningSelect = document.getElementById('tuning-select') as HTMLSelectElement;
        this.keySelect = document.getElementById('key-select') as HTMLSelectElement;
        this.majorSelect = document.getElementById('major-select') as HTMLSelectElement;
        this.minorSelect = document.getElementById('minor-select') as HTMLSelectElement;
        this.chordSelect = document.getElementById('chord-select') as HTMLSelectElement;
        this.formSelect = document.getElementById('form-select') as HTMLSelectElement;
    },

    updateDynamicElements() {
        if (!this.fretboardView) return;
        this.allNoteElements = this.fretboardView.querySelectorAll('.note') as NodeListOf<HTMLElement>;
        this.allFretElements = this.fretboardView.querySelectorAll('.fret') as NodeListOf<HTMLElement>;
    }
};

function generateKeyboardHTML(activeNotes: number[] = [], rootIdx: number = -1): string {
    let html = `<div class="keyboard-container" style="margin: 0 auto;">`;
    for(let oct = 0; oct < 3; oct++) {
        CONFIG.KEYBOARD_WHITE_NOTES.forEach((whiteIdx: number) => {
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

function generateFretboardHTML(instrument: string, tuningVal: string, activeNotes: number[] = [], rootIdx: number = -1, anchorFrets: Set<number> = new Set()): string {
    const FRET_COUNT = getTotalFrets();
    let html = `<div class="fret-numbers" style="display:flex; width:100%;">`;
    for (let i = 0; i <= FRET_COUNT; i++) {
        let cls = 'fret-number' + (i === CONFIG.OCTAVE_FRET ? ' highlight-12' : (CONFIG.INLAY_FRETS.includes(i) ? ' inlay-mark' : ''));
        html += `<div class="${cls}"><span>${i}</span></div>`;
    }
    html += `</div><div class="fretboard instrument-${instrument}" style="width:100%;">`;
    const currentTuning = MUSIC_DATA.tunings[instrument];
    const tuningOffsets = MUSIC_DATA.tuningPresets[instrument][tuningVal].offset;
    currentTuning.forEach((openNoteIndex: number, stringIndex: number) => {
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

// 전역 함수 등록
(window as any).removeChord = function(idx: number) { AppState.chordProgression.splice(idx, 1); updateFretboard(); };
(window as any).removeScale = function(idx: number) { AppState.scaleProgression.splice(idx, 1); updateFretboard(); };
(window as any).shiftCustomFret = function(idx: number, dir: number) {
    const item: any = AppState.chordProgression[idx]; if (!item || item.type !== 'custom') return;
    let newFret = item.startFret + dir; if (newFret >= 1 && newFret <= getTotalFrets()) { item.startFret = newFret; updateFretboard(); }
};
(window as any).editCustomTitle = function(idx: number) {
    const item: any = AppState.chordProgression[idx]; if (!item || item.type !== 'custom') return;
    let newTitle = prompt(getSafeI18n().promptCustomTitle, item.title); if (newTitle !== null) { item.title = newTitle; updateFretboard(); }
};
(window as any).toggleCustomDiagramNote = function(progIdx: number, strIdx: number, relFret: number) {
    const item: any = AppState.chordProgression[progIdx]; if (!item || item.type !== 'custom') return;
    let currentVal = item.voicing[strIdx];
    if (relFret === 0) { item.voicing[strIdx] = (currentVal === 'x' ? 0 : 'x'); } 
    else { let actualFret = item.startFret + relFret - 1; item.voicing[strIdx] = (currentVal === actualFret ? 'x' : actualFret); }
    updateFretboard();
};

function updateNoteHighlights(activeNotesArray: number[], rootIndex: number) {
    const activeNotesSet = new Set(activeNotesArray);
    if (!DOM_CACHE.allNoteElements) return;
    DOM_CACHE.allNoteElements.forEach((noteEl: HTMLElement) => {
        const noteIdx = parseInt(noteEl.dataset.noteIndex || "0");
        const shouldBeActive = activeNotesSet.has(noteIdx);
        noteEl.classList.toggle('active', shouldBeActive);
        noteEl.classList.toggle('root', shouldBeActive && noteIdx === rootIndex);
    });
}

function updateAnchorFrets(anchorFrets: Set<number>) {
    if (!DOM_CACHE.allFretElements) return;
    DOM_CACHE.allFretElements.forEach((fretEl: HTMLElement) => {
        const fretIdx = parseInt(fretEl.dataset.fretIndex || "0");
        fretEl.classList.toggle('anchor-highlight', anchorFrets.has(fretIdx));
    });
}

function setButtonVisibility(buttons: Record<string, boolean>) {
    Object.entries(buttons).forEach(([cacheKey, visible]) => {
        const el = (DOM_CACHE as any)[cacheKey];
        if (el) { el.style.display = visible ? '' : 'none'; }
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
        if (!DOM_CACHE.langBtn) return;
        DOM_CACHE.langBtn.addEventListener('click', toggleLanguage);
        DOM_CACHE.keySelect!.addEventListener('change', updateFretboard);
        DOM_CACHE.majorSelect!.addEventListener('change', function() { DOM_CACHE.minorSelect!.value = ""; updateFretboard(); });
        DOM_CACHE.minorSelect!.addEventListener('change', function() { DOM_CACHE.majorSelect!.value = ""; updateFretboard(); });
        DOM_CACHE.chordSelect!.addEventListener('change', updateFretboard);
        DOM_CACHE.tuningSelect!.addEventListener('change', function() { 
            renderFretboard(); DOM_CACHE.updateDynamicElements(); updateFretboard(); analyzeCustomNotes(); 
        });
        DOM_CACHE.formToggleBtn!.addEventListener('click', function(this: HTMLButtonElement) {
            AppState.showFormHighlight = !AppState.showFormHighlight;
            this.textContent = AppState.showFormHighlight ? getSafeI18n().btnOn : getSafeI18n().btnOff;
            this.style.backgroundColor = AppState.showFormHighlight ? '#4CAF50' : '#e0e0e0';
            this.style.color = AppState.showFormHighlight ? '#fff' : '#333';
            DOM_CACHE.formSelect!.style.display = AppState.showFormHighlight ? '' : 'none'; 
            updateFretboard();
        });
        DOM_CACHE.toggleDiagramBtn!.addEventListener('click', function(this: HTMLButtonElement) {
            AppState.showChordDiagram = !AppState.showChordDiagram; 
            this.innerHTML = AppState.showChordDiagram ? getSafeI18n().btnFretboard : getSafeI18n().btnDiagram; 
            updateFretboard();
        });
        DOM_CACHE.addScaleBtn!.addEventListener('click', function() {
            const rootIdx = parseInt(DOM_CACHE.keySelect!.value);
            const scaleVal = DOM_CACHE.majorSelect!.value || DOM_CACHE.minorSelect!.value;
            const tuningVal = DOM_CACHE.tuningSelect ? DOM_CACHE.tuningSelect.value : 'standard';
            if (scaleVal) { AppState.scaleProgression.push({ instrument: AppState.instrument, tuningVal: tuningVal, rootIdx: rootIdx, scaleName: scaleVal } as any); updateFretboard(); }
        });
        DOM_CACHE.addChordBtn!.addEventListener('click', function() {
            const rootIdx = parseInt(DOM_CACHE.keySelect!.value);
            const chordVal = DOM_CACHE.chordSelect!.value;
            if (chordVal) { AppState.chordProgression.push({ type: 'preset', rootIdx: rootIdx, chordName: chordVal } as any); updateFretboard(); }
        });
        DOM_CACHE.addCustomBtn!.addEventListener('click', function() {
            AppState.chordProgression.push({ type: 'custom', title: 'Custom', startFret: 1, voicing: ['x', 'x', 'x', 'x', 'x', 'x'] } as any); updateFretboard();
        });
        DOM_CACHE.addLinebreakBtn!.addEventListener('click', function() {
            AppState.chordProgression.push({ type: 'linebreak' } as any); updateFretboard();
        });
        DOM_CACHE.saveJsonBtn!.addEventListener('click', function() {
            let dataToSave = AppState.mode === CONFIG.MODES.CHORD ? AppState.chordProgression : AppState.scaleProgression;
            if (dataToSave.length === 0) { alert(getSafeI18n().msgNoData); return; }
            const blob = new Blob([JSON.stringify(dataToSave, null, 2)], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a'); link.href = url; link.download = AppState.mode === CONFIG.MODES.CHORD ? "chord_progression.json" : "scale_progression.json";
            link.click(); URL.revokeObjectURL(url);
        });
        DOM_CACHE.loadJsonBtn!.addEventListener('click', function() { DOM_CACHE.loadJsonInput!.click(); });
        DOM_CACHE.loadJsonInput!.addEventListener('change', function(this: HTMLInputElement, e: Event) {
            const file = (e.target as HTMLInputElement).files?.[0]; if (!file) return;
            const reader = new FileReader();
            reader.onload = function(e) {
                try {
                    const parsed = JSON.parse(e.target?.result as string);
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
        DOM_CACHE.clearProgBtn!.addEventListener('click', function() {
            AppState.mode === CONFIG.MODES.SCALE ? AppState.scaleProgression = [] : AppState.chordProgression = []; updateFretboard();
        });
        DOM_CACHE.formSelect!.addEventListener('change', updateFretboard);
        DOM_CACHE.clearCustomBtn!.addEventListener('click', function() {
            AppState.clearCustomData(); analyzeCustomNotes();
        });
        DOM_CACHE.guitarBtn!.addEventListener('click', () => switchInstrument('guitar'));
        DOM_CACHE.bassBtn!.addEventListener('click', () => switchInstrument('bass'));
        DOM_CACHE.keyboardBtn!.addEventListener('click', () => switchInstrument('keyboard'));
        DOM_CACHE.scaleModeBtn!.addEventListener('click', () => switchMode(CONFIG.MODES.SCALE));
        DOM_CACHE.chordModeBtn!.addEventListener('click', () => switchMode(CONFIG.MODES.CHORD));
        DOM_CACHE.captureBtn!.addEventListener('click', captureFretboard);
    },

    bindFretboardEvents() {
        DOM_CACHE.fretboardView!.addEventListener('click', function(e: Event) {
            let noteEl: HTMLElement | null = null;
            const target = e.target as HTMLElement;
            if (target.classList.contains('note')) noteEl = target;
            else if (target.classList.contains('fret') || target.classList.contains('white-key') || target.classList.contains('black-key')) noteEl = target.querySelector('.note');
            if (noteEl) { noteEl.classList.toggle('custom'); analyzeCustomNotes(); }
        });
    },

    bindDragAndDropEvents() {
        const handleDragStart = (e: DragEvent) => { 
            const item = (e.target as HTMLElement).closest('.chord-item, .scale-item') as HTMLElement; 
            if (item && e.dataTransfer) { 
                e.dataTransfer.effectAllowed = 'move'; 
                e.dataTransfer.setData('text/plain', item.dataset.index || ""); 
                setTimeout(() => item.style.opacity = '0.4', 0); 
            } 
        };
        const handleDragEnd = (e: DragEvent) => { 
            const item = (e.target as HTMLElement).closest('.chord-item, .scale-item') as HTMLElement; 
            if (item) item.style.opacity = '1'; 
        };
        const handleDragOver = (e: DragEvent) => { 
            const target = e.target as HTMLElement;
            if (target.closest('.chord-item, .scale-item') || target === DOM_CACHE.diagramView || target === DOM_CACHE.scaleProgView) { 
                e.preventDefault(); 
                if (e.dataTransfer) e.dataTransfer.dropEffect = 'move'; 
            } 
        };
        const handleDrop = (e: DragEvent, type: string) => {
            e.preventDefault();
            const draggedIdx = parseInt(e.dataTransfer?.getData('text/plain') || "");
            if (isNaN(draggedIdx)) return;

            const arr = type === 'chord' ? AppState.chordProgression : AppState.scaleProgression;
            const target = e.target as HTMLElement;
            const item = target.closest('.chord-item, .scale-item') as HTMLElement; 
            
            if (item) {
                const targetIdx = parseInt(item.dataset.index || "");
                if (draggedIdx !== targetIdx) { 
                    const draggedElement = arr.splice(draggedIdx, 1)[0]; 
                    arr.splice(targetIdx, 0, draggedElement); 
                    updateFretboard(); 
                }
            } else {
                const container = type === 'chord' ? DOM_CACHE.diagramView : DOM_CACHE.scaleProgView;
                if (target === container || container?.contains(target)) {
                    const draggedElement = arr.splice(draggedIdx, 1)[0];
                    arr.push(draggedElement);
                    updateFretboard();
                }
            }
        };
        const attachEvents = (view: HTMLElement | null, type: string) => {
            if (!view) return;
            view.addEventListener('dragstart', handleDragStart); 
            view.addEventListener('dragend', handleDragEnd); 
            view.addEventListener('dragover', handleDragOver); 
            view.addEventListener('drop', (e) => handleDrop(e, type));
        };
        attachEvents(DOM_CACHE.diagramView, 'chord'); 
        attachEvents(DOM_CACHE.scaleProgView, 'scale');
    }
};

function isValidProgressionData(data: any) {
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

function extractChordSymbol(chordName: string) {
    const match = chordName.match(/\(([^)]+)\)/);
    let symbol = match ? match[1] : '';
    return symbol === 'M' ? '' : symbol;
}

function getChordVoicing(rootIdx: number, chordName: string) {
    const key = `${rootIdx}_${chordName}`; if (MUSIC_DATA.openChords[key]) return MUSIC_DATA.openChords[key]; 
    const shape = MUSIC_DATA.chordShapes[chordName]; if (!shape) return null;
    let f6 = (rootIdx - 4 + 12) % 12, f5 = (rootIdx - 9 + 12) % 12; 
    const applyOffset = (baseShape: any[], offset: number) => baseShape.map(f => f === 'x' ? 'x' : f + offset);
    let voicingE = applyOffset(shape.E, f6), voicingA = applyOffset(shape.A, f5);
    const isValid = (v: any[]) => v.every(f => f === 'x' || (f >= 0 && f <= 24));
    let validE = isValid(voicingE), validA = isValid(voicingA);
    if (validE && validA) return f6 <= f5 ? voicingE : voicingA; else if (validE) return voicingE; else if (validA) return voicingA;
    return null;
}

function generateChordDiagramSVG(voicing: any[], titleText: string, isCustom = false, progIdx = -1, customStartFret = 1) {
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

function generateScaleBoardHTML(item: any, idx: number) {
    let intervals = MUSIC_DATA.allScales[item.scaleName] || [];
    const activeNotes = intervals.map((interval: number) => (item.rootIdx + interval) % 12);
    let html = `<div class="scale-item" draggable="true" data-index="${idx}">`;
    html += `<button class="no-capture scale-item-close" onclick="removeScale(${idx})">X</button>`;
    
    let t_instrument = item.instrument === 'keyboard' ? 'Keyboard' : item.instrument === 'guitar' ? 'Guitar' : 'Bass';
    if (item.instrument !== 'keyboard' && item.tuningVal !== 'standard') t_instrument += ` [${MUSIC_DATA.tuningPresets[item.instrument][item.tuningVal][AppState.currentLang] || 'Standard'}]`;
    html += `<h3 class="scale-item-title">${t_instrument} ${MUSIC_DATA.notes[item.rootIdx]} ${item.scaleName}</h3>`;
    html += `<div style="overflow-x:auto; width:100%; padding-bottom:10px;">`;
    
    if (item.instrument === 'keyboard') {
        html += generateKeyboardHTML(activeNotes, item.rootIdx);
    } else {
        let anchorFrets = new Set<number>();
        if (AppState.showFormHighlight && !item.scaleName.includes("Phrygian")) {
            const tuningOffsets = MUSIC_DATA.tuningPresets[item.instrument][item.tuningVal].offset;
            const lowestStrIdx = MUSIC_DATA.tunings[item.instrument].length - 1;
            let f1 = ((item.rootIdx - 3 + 12) % 12 - ((MUSIC_DATA.tunings[item.instrument][lowestStrIdx] + tuningOffsets[lowestStrIdx] + 120) % 12) + 12) % 12;
            let offsets = [...CONFIG.FORM_OFFSETS[DOM_CACHE.formSelect!.value]];
            if (item.instrument === 'bass' && DOM_CACHE.formSelect!.value === '3') offsets = [4, 5, 6, 7]; 
            offsets.map(o => f1 + o).forEach(f => CONFIG.FRET_OCTAVE_SHIFTS.forEach((s: number) => { if (f+s >= 0 && f+s <= getTotalFrets()) anchorFrets.add(f+s); }));
        }
        html += generateFretboardHTML(item.instrument, item.tuningVal, activeNotes, item.rootIdx, anchorFrets);
    }
    return html + `</div></div>`;
}

function updateTuningOptions() {
    if (AppState.instrument === 'keyboard' || !DOM_CACHE.tuningSelect) return; 
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
    if(DOM_CACHE.langBtn) DOM_CACHE.langBtn.innerHTML = t.langBtn; 
    if(DOM_CACHE.guitarBtn) DOM_CACHE.guitarBtn.innerHTML = t.guitarBtn;
    if(DOM_CACHE.bassBtn) DOM_CACHE.bassBtn.innerHTML = t.bassBtn; 
    if(DOM_CACHE.keyboardBtn) DOM_CACHE.keyboardBtn.innerHTML = t.keyboardBtn;
    const lblTuning = document.getElementById('lbl-tuning'); if (lblTuning) lblTuning.textContent = t.lblTuning; 
    if(DOM_CACHE.scaleModeBtn) DOM_CACHE.scaleModeBtn.innerHTML = t.scaleModeBtn;
    if(DOM_CACHE.chordModeBtn) DOM_CACHE.chordModeBtn.innerHTML = t.chordModeBtn; 
    if(DOM_CACHE.captureBtn) DOM_CACHE.captureBtn.innerHTML = t.captureBtn;
    
    const lblKey = document.getElementById('lbl-key'); if(lblKey) lblKey.textContent = t.lblKey; 
    const lblMajor = document.getElementById('lbl-major'); if(lblMajor) lblMajor.textContent = t.lblMajor;
    const lblMinor = document.getElementById('lbl-minor'); if(lblMinor) lblMinor.textContent = t.lblMinor; 
    const lblChord = document.getElementById('lbl-chord'); if(lblChord) lblChord.textContent = t.lblChord;
    const lblFindNote = document.getElementById('lbl-find-note'); if(lblFindNote) lblFindNote.textContent = t.lblFindNote; 
    const lblFormToggle = document.getElementById('lbl-form-toggle'); if(lblFormToggle) lblFormToggle.textContent = t.lblFormToggle;
    
    if(DOM_CACHE.formToggleBtn) DOM_CACHE.formToggleBtn.textContent = AppState.showFormHighlight ? t.btnOn : t.btnOff;
    if(DOM_CACHE.toggleDiagramBtn) DOM_CACHE.toggleDiagramBtn.innerHTML = AppState.showChordDiagram ? t.btnFretboard : t.btnDiagram;
    if(DOM_CACHE.addScaleBtn) DOM_CACHE.addScaleBtn.innerHTML = t.btnAddScale; 
    if(DOM_CACHE.addChordBtn) DOM_CACHE.addChordBtn.innerHTML = t.btnAddChord;
    if(DOM_CACHE.addCustomBtn) DOM_CACHE.addCustomBtn.innerHTML = t.btnAddCustom; 
    if(DOM_CACHE.addLinebreakBtn) DOM_CACHE.addLinebreakBtn.innerHTML = t.btnAddLinebreak; 
    if(DOM_CACHE.saveJsonBtn) DOM_CACHE.saveJsonBtn.innerHTML = t.btnSaveJson;
    if(DOM_CACHE.loadJsonBtn) DOM_CACHE.loadJsonBtn.innerHTML = t.btnLoadJson; 
    if(DOM_CACHE.clearProgBtn) DOM_CACHE.clearProgBtn.innerHTML = t.btnClear;
    
    if(DOM_CACHE.formSelect) {
        DOM_CACHE.formSelect.options[0].text = t.form1; DOM_CACHE.formSelect.options[1].text = t.form2; 
        DOM_CACHE.formSelect.options[2].text = t.form3; DOM_CACHE.formSelect.options[3].text = t.form4; 
        DOM_CACHE.formSelect.options[4].text = t.form5;
    }
    const analyzerTitle = document.getElementById('lbl-analyzer-title'); if(analyzerTitle) analyzerTitle.innerHTML = t.analyzerTitle; 
    if(DOM_CACHE.clearCustomBtn) DOM_CACHE.clearCustomBtn.innerText = t.clearBtn;
    document.querySelectorAll('select option[value=""]').forEach((opt: any) => opt.innerText = t.selectDefault);
    updateTuningOptions(); updateFretboard();
}

function setupNoteButtons() {
    if (!DOM_CACHE.noteButtonsContainer) return;
    DOM_CACHE.noteButtonsContainer.innerHTML = '';
    DOM_CACHE.findNoteBtns = []; 
    MUSIC_DATA.notes.forEach((note: string, index: number) => {
        const btn = document.createElement('button'); btn.className = 'btn find-note-btn'; btn.textContent = note;
        btn.addEventListener('click', function(this: HTMLButtonElement) { 
            AppState.highlightedNotes.has(index) ? (AppState.highlightedNotes.delete(index), this.classList.remove('active')) : (AppState.highlightedNotes.add(index), this.classList.add('active')); 
            applyHighlights(); 
        });
        DOM_CACHE.noteButtonsContainer!.appendChild(btn);
        DOM_CACHE.findNoteBtns.push(btn);
    });
}

function applyHighlights() {
    if (!DOM_CACHE.allNoteElements) return;
    DOM_CACHE.allNoteElements.forEach((noteEl: HTMLElement) => { 
        AppState.highlightedNotes.has(parseInt(noteEl.dataset.noteIndex || "0")) ? noteEl.classList.add('highlight') : noteEl.classList.remove('highlight'); 
    });
}

function switchInstrument(instrument: 'guitar' | 'bass' | 'keyboard') {
    if (AppState.instrument === instrument) return; AppState.instrument = instrument;
    if(DOM_CACHE.guitarBtn) DOM_CACHE.guitarBtn.classList.toggle('active', instrument === 'guitar'); 
    if(DOM_CACHE.bassBtn) DOM_CACHE.bassBtn.classList.toggle('active', instrument === 'bass'); 
    if(DOM_CACHE.keyboardBtn) DOM_CACHE.keyboardBtn.classList.toggle('active', instrument === 'keyboard');
    
    if (DOM_CACHE.tuningControls) {
        DOM_CACHE.tuningControls.style.display = instrument === 'keyboard' ? 'none' : ''; 
    }
    resetSelections(); updateTuningOptions(); 
    renderFretboard(); DOM_CACHE.updateDynamicElements(); 
    updateFretboard(); analyzeCustomNotes();
}

function switchMode(mode: 'scale' | 'chord') {
    if (AppState.mode === mode) return; AppState.mode = mode;
    if(DOM_CACHE.scaleModeBtn) DOM_CACHE.scaleModeBtn.classList.toggle('active', mode === CONFIG.MODES.SCALE); 
    if(DOM_CACHE.chordModeBtn) DOM_CACHE.chordModeBtn.classList.toggle('active', mode === CONFIG.MODES.CHORD);
    
    if(DOM_CACHE.scaleControls) DOM_CACHE.scaleControls.style.display = mode === CONFIG.MODES.SCALE ? '' : 'none'; 
    if(DOM_CACHE.chordControls) DOM_CACHE.chordControls.style.display = mode === CONFIG.MODES.CHORD ? '' : 'none';
    
    if (mode !== CONFIG.MODES.CHORD) { 
        AppState.showChordDiagram = false; 
        if(DOM_CACHE.toggleDiagramBtn) DOM_CACHE.toggleDiagramBtn.innerHTML = getSafeI18n().btnDiagram; 
    }
    resetSelections(); updateFretboard();
}

function resetSelections() {
    AppState.clearCustomData();
    if(DOM_CACHE.majorSelect) DOM_CACHE.majorSelect.value = ""; 
    if(DOM_CACHE.minorSelect) DOM_CACHE.minorSelect.value = ""; 
    if(DOM_CACHE.chordSelect) DOM_CACHE.chordSelect.value = "";
    if (AppState.mode === CONFIG.MODES.SCALE && DOM_CACHE.minorSelect) DOM_CACHE.minorSelect.value = "Blues";
}

function setupSelects() {
    if (!DOM_CACHE.keySelect || !DOM_CACHE.majorSelect || !DOM_CACHE.minorSelect || !DOM_CACHE.chordSelect) return;
    MUSIC_DATA.notes.forEach((note: string, index: number) => DOM_CACHE.keySelect!.appendChild(new Option(note, index.toString())));
    for (let scale in MUSIC_DATA.majorScales) DOM_CACHE.majorSelect!.appendChild(new Option(scale, scale));
    for (let scale in MUSIC_DATA.minorScales) { 
        const option = new Option(scale, scale); 
        if (scale === "Blues") option.selected = true; 
        DOM_CACHE.minorSelect!.appendChild(option); 
    }
    for (let chord in MUSIC_DATA.allChords) DOM_CACHE.chordSelect!.appendChild(new Option(chord, chord));
}

function renderFretboard() {
    if (!DOM_CACHE.fretNumbers || !DOM_CACHE.fretboard) return;
    if (AppState.instrument === 'keyboard') {
        DOM_CACHE.fretNumbers.style.display = 'none'; DOM_CACHE.fretboard.className = 'keyboard-container'; DOM_CACHE.fretboard.innerHTML = generateKeyboardHTML(); 
    } else {
        DOM_CACHE.fretNumbers.style.display = 'flex'; DOM_CACHE.fretboard.className = `fretboard instrument-${AppState.instrument}`;
        const tuningVal = DOM_CACHE.tuningSelect ? DOM_CACHE.tuningSelect.value : 'standard';
        const tempDiv = document.createElement('div'); tempDiv.innerHTML = generateFretboardHTML(AppState.instrument, tuningVal);
        DOM_CACHE.fretNumbers.innerHTML = tempDiv.querySelector('.fret-numbers')!.innerHTML; DOM_CACHE.fretboard.innerHTML = tempDiv.querySelector('.fretboard')!.innerHTML;
    }
    applyHighlights();
}

function updateFretboard() {
    if (!DOM_CACHE.keySelect || !DOM_CACHE.fretboardTitle || !DOM_CACHE.captureTitle) return;
    const rootIndex = parseInt(DOM_CACHE.keySelect.value); const rootName = MUSIC_DATA.notes[rootIndex]; const t = getSafeI18n();
    let intervals: number[] = []; let displayTitle = "";
    const tuningVal = DOM_CACHE.tuningSelect ? DOM_CACHE.tuningSelect.value : 'standard';
    let instrumentLabel = AppState.instrument === 'keyboard' ? 'Keyboard' : (AppState.instrument === 'guitar' ? 'Guitar' : 'Bass');
    if (AppState.instrument !== 'keyboard' && tuningVal !== 'standard') instrumentLabel += ` [${MUSIC_DATA.tuningPresets[AppState.instrument][tuningVal][AppState.currentLang] || 'Standard'}]`;

    const chordVal = DOM_CACHE.chordSelect ? DOM_CACHE.chordSelect.value : "";
    const majorVal = DOM_CACHE.majorSelect ? DOM_CACHE.majorSelect.value : "";
    const minorVal = DOM_CACHE.minorSelect ? DOM_CACHE.minorSelect.value : "";
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
        if(DOM_CACHE.diagramView) DOM_CACHE.diagramView.style.display = 'none'; 
        if(DOM_CACHE.fretboardView) DOM_CACHE.fretboardView.style.display = 'block';

        if (AppState.scaleProgression.length > 0) {
            setButtonVisibility({ saveJsonBtn: true, clearProgBtn: true });
            if(DOM_CACHE.scaleProgView) {
                DOM_CACHE.scaleProgView.style.display = 'flex';
                let html = ''; AppState.scaleProgression.forEach((c, idx) => html += generateScaleBoardHTML(c, idx)); DOM_CACHE.scaleProgView.innerHTML = html;
            }
        } else { 
            setButtonVisibility({ saveJsonBtn: false, clearProgBtn: false });
            if(DOM_CACHE.scaleProgView) DOM_CACHE.scaleProgView.style.display = 'none'; 
        }
    } else {
        const isGuitar = AppState.instrument === 'guitar' && tuningVal === 'standard';
        setButtonVisibility({
            addScaleBtn: false, toggleDiagramBtn: isGuitar, addChordBtn: isGuitar && AppState.showChordDiagram,
            addCustomBtn: isGuitar && AppState.showChordDiagram, addLinebreakBtn: isGuitar && AppState.showChordDiagram,
            saveJsonBtn: isGuitar && AppState.showChordDiagram && AppState.chordProgression.length > 0,
            clearProgBtn: isGuitar && AppState.showChordDiagram && AppState.chordProgression.length > 0
        });
        if(DOM_CACHE.scaleProgView) DOM_CACHE.scaleProgView.style.display = 'none';
        
        if (isGuitar && AppState.showChordDiagram) { renderChordDiagrams(AppState.chordProgression, rootIndex, chordVal); } 
        else { 
            if(DOM_CACHE.diagramView) DOM_CACHE.diagramView.style.display = 'none'; 
            if(DOM_CACHE.fretboardView) DOM_CACHE.fretboardView.style.display = 'block'; 
        }
    }

    if (AppState.instrument !== 'keyboard') {
        let anchorFrets = new Set<number>(); 
        if (AppState.showFormHighlight && intervals.length > 0) {
            let useRelativeMinor = AppState.mode === CONFIG.MODES.SCALE ? (!scaleVal.includes("Phrygian")) : (chordVal && (chordVal.includes("Major") || chordVal.includes("Dominant") || chordVal === "Sus 2 (sus2)" || chordVal === "Sus 4 (sus4)"));
            const anchorNote = useRelativeMinor ? (rootIndex - 3 + 12) % 12 : rootIndex;
            const lowestStrIdx = MUSIC_DATA.tunings[AppState.instrument].length - 1;
            const tuningOffsets = MUSIC_DATA.tuningPresets[AppState.instrument][tuningVal].offset;
            let f1 = (anchorNote - ((MUSIC_DATA.tunings[AppState.instrument][lowestStrIdx] + tuningOffsets[lowestStrIdx] + 120) % 12) + 12) % 12;
            const formSelectVal = DOM_CACHE.formSelect ? DOM_CACHE.formSelect.value : '1';
            let offsets = CONFIG.BASS_FORM_SPECIAL_OFFSETS[formSelectVal] || [...CONFIG.FORM_OFFSETS[formSelectVal]];
            offsets.map(o => f1 + o).forEach(f => CONFIG.FRET_OCTAVE_SHIFTS.forEach(s => { if (f+s >= 0 && f+s <= getTotalFrets()) anchorFrets.add(f+s); }));
        }
        updateAnchorFrets(anchorFrets);
    }

    const activeNotes = new Set(intervals.map((interval: number) => (rootIndex + interval) % 12));
    updateNoteHighlights(Array.from(activeNotes), rootIndex);
}

function renderChordDiagrams(progression: any[], rootIndex: number, chordVal: string) {
    if (!DOM_CACHE.diagramView || !DOM_CACHE.fretboardView) return;
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

(window as any).applyView = function(rootIndex: number, name: string, type: string) {
    if(DOM_CACHE.keySelect) DOM_CACHE.keySelect.value = rootIndex.toString();
    if (type === 'scale') { 
        switchMode(CONFIG.MODES.SCALE); 
        if (MUSIC_DATA.majorScales.hasOwnProperty(name)) { 
            if(DOM_CACHE.majorSelect) DOM_CACHE.majorSelect.value = name; 
            if(DOM_CACHE.minorSelect) DOM_CACHE.minorSelect.value = ""; 
        } 
        else { 
            if(DOM_CACHE.minorSelect) DOM_CACHE.minorSelect.value = name; 
            if(DOM_CACHE.majorSelect) DOM_CACHE.majorSelect.value = ""; 
        } 
    } else if (type === 'chord') { 
        switchMode(CONFIG.MODES.CHORD); 
        if(DOM_CACHE.chordSelect) DOM_CACHE.chordSelect.value = name; 
    }
    updateFretboard(); window.scrollTo({ top: 0, behavior: 'smooth' });
};

function analyzeCustomNotes() {
    if (!DOM_CACHE.allNoteElements || !DOM_CACHE.analyzerResult) return;
    const customElements = Array.from(DOM_CACHE.allNoteElements).filter(el => el.classList.contains('custom'));
    const selectedNotesSet = new Set<number>(); const t = getSafeI18n();
    customElements.forEach(el => selectedNotesSet.add(parseInt(el.dataset.noteIndex || "0"))); 
    const selectedArr = Array.from(selectedNotesSet).sort((a, b) => a - b);
    if (selectedArr.length === 0) { DOM_CACHE.analyzerResult.innerHTML = t.analyzerDefault; return; }
    
    let exactChords: string[] = [], exactScales: string[] = [], partialScales: string[] = [];
    const arraysEqual = (a: number[], b: number[]) => a.length === b.length && a.every((v, i) => v === b[i]);

    for (let root = 0; root < 12; root++) {
        let rootName = MUSIC_DATA.notes[root];
        for (let chordName in MUSIC_DATA.allChords) {
            if (arraysEqual(MUSIC_DATA.allChords[chordName].map((i: number) => (root + i) % 12).sort((a: number, b: number) => a - b), selectedArr)) exactChords.push(`<span class="clickable-scale" onclick="applyView(${root}, '${chordName}', 'chord')"><strong>${rootName}${extractChordSymbol(chordName)}</strong> (${chordName})</span>`);
        }
        for (let scaleName in MUSIC_DATA.allScales) {
            let scaleNotes = MUSIC_DATA.allScales[scaleName].map((i: number) => (root + i) % 12).sort((a: number, b: number) => a - b);
            if (arraysEqual(scaleNotes, selectedArr)) exactScales.push(`<span class="clickable-scale" onclick="applyView(${root}, '${scaleName}', 'scale')"><strong>${rootName}</strong> ${scaleName}</span>`);
            else if (selectedArr.length >= 3 && selectedArr.every(val => scaleNotes.includes(val))) partialScales.push(`<span class="clickable-scale" onclick="applyView(${root}, '${scaleName}', 'scale')">${rootName} ${scaleName}</span>`);
        }
    }

    let html = `${t.txtCurrentNotes}<strong>[ ${selectedArr.map(n => MUSIC_DATA.notes[n]).join(', ')} ]</strong><br><br>${t.txtExactChords}<br>${exactChords.length > 0 ? exactChords.join('<br>') + '<br><br>' : t.txtNone + '<br><br>'}${t.txtExactScales}<br>${exactScales.length > 0 ? exactScales.join('<br>') + '<br><br>' : t.txtNone + '<br><br>'}`;
    if (partialScales.length > 0) html += `${t.txtPartialScales}<br>${partialScales.slice(0, 15).join('')}${partialScales.length > 15 ? t.txtEtc : ''}`;
    DOM_CACHE.analyzerResult.innerHTML = html;
}

function captureFretboard() {
    if (!DOM_CACHE.captureTitle || !DOM_CACHE.fretboardTitle || !DOM_CACHE.captureArea || !DOM_CACHE.captureBtn) return;
    let titleText = "";
    if (DOM_CACHE.captureTitle.style.display !== 'none') {
        titleText = DOM_CACHE.captureTitle.textContent || "";
    } else {
        titleText = DOM_CACHE.fretboardTitle.textContent || "";
    }
    
    const hideElements = DOM_CACHE.captureArea.querySelectorAll('.no-capture') as NodeListOf<HTMLElement>; 
    const originalDisplays: string[] = []; 
    hideElements.forEach((el, i) => { originalDisplays[i] = el.style.display; el.style.display = 'none'; });
    
    const originalBg = DOM_CACHE.captureArea.style.backgroundColor; 
    DOM_CACHE.captureArea.style.backgroundColor = 'transparent';
    const originalText = DOM_CACHE.captureBtn.innerHTML; 
    DOM_CACHE.captureBtn.innerHTML = AppState.currentLang === 'ko' ? '저장 중...' : 'Saving...'; 
    DOM_CACHE.captureBtn.disabled = true;

    if (typeof html2canvas !== 'undefined') {
        html2canvas(DOM_CACHE.captureArea, { backgroundColor: null, scale: 2 }).then((canvas: any) => {
            const link = document.createElement('a'); 
            link.download = titleText.replace(/ /g, '_').replace(/[()]/g, '') + '_capture.png'; 
            link.href = canvas.toDataURL("image/png"); 
            link.click();
            DOM_CACHE.captureArea!.style.backgroundColor = originalBg; hideElements.forEach((el, i) => el.style.display = originalDisplays[i]); DOM_CACHE.captureBtn!.innerHTML = originalText; DOM_CACHE.captureBtn!.disabled = false;
        }).catch((err: any) => {
            console.error('캡처 실패:', err); DOM_CACHE.captureArea!.style.backgroundColor = originalBg; hideElements.forEach((el, i) => el.style.display = originalDisplays[i]); DOM_CACHE.captureBtn!.innerHTML = originalText; DOM_CACHE.captureBtn!.disabled = false;
        });
    }
}

window.addEventListener('DOMContentLoaded', init);