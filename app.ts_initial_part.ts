// ============================================
// 타입 및 데이터 import
// ============================================
import { 
  AppStateType, 
  DOMElements, 
  Language, 
  I18nDict 
} from './src/types';
import { CONFIG, i18n } from './src/data';

// ============================================
// 전역 변수 (타입 추가)
// ============================================
let currentLang: Language = 'en'; 
// 이렇게 수정:
const browserLang = navigator.language || (navigator as any).userLanguage;
if (browserLang && browserLang.toLowerCase().includes('ko')) currentLang = 'ko';

// 타입이 추가된 AppState
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

function getSafeI18n(): I18nDict[Language] { 
    return i18n[AppState.currentLang] || i18n['en']; 
}

// 타입이 추가된 DOM_CACHE
const DOM_CACHE: DOMElements = {
    fretboardView: null, 
    diagramView: null, 
    scaleProgView: null,
    captureArea: null, 
    captureTitle: null, 
    fretboardTitle: null,
    fretboard: null, 
    fretNumbers: null, 
    analyzerResult: null,
    scaleControls: null, 
    chordControls: null, 
    tuningControls: null,
    formToggleRow: null, 
    formToggleDivider: null, 
    noteButtonsContainer: null,
    langBtn: null, 
    guitarBtn: null, 
    bassBtn: null, 
    keyboardBtn: null,
    scaleModeBtn: null, 
    chordModeBtn: null, 
    captureBtn: null,
    toggleDiagramBtn: null, 
    addChordBtn: null, 
    addCustomBtn: null, 
    addLinebreakBtn: null,
    addScaleBtn: null, 
    saveJsonBtn: null, 
    loadJsonBtn: null, 
    clearProgBtn: null,
    clearCustomBtn: null, 
    formToggleBtn: null, 
    loadJsonInput: null,
    tuningSelect: null, 
    keySelect: null, 
    majorSelect: null, 
    minorSelect: null, 
    chordSelect: null, 
    formSelect: null,
    allNoteElements: document.querySelectorAll('.note') as NodeListOf<HTMLElement>, 
    allFretElements: document.querySelectorAll('.fret') as NodeListOf<HTMLElement>, 
    findNoteBtns: [],

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

// ============================================
// 기존 코드
// ============================================
// 여기부터 원본 app.js의 나머지 코드를 그대로 복사
// (getTotalFrets(), generateKeyboardHTML() 등...)
// 아래에 추가하면 됩니다.

function getTotalFrets(): number {
    return window.innerWidth <= 768 ? 18 : 21;
}

// ... 나머지 함수들은 원본 app.js에서 복사 ...
