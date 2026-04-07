// ============================================
// 악기 및 모드 관련 타입
// ============================================
export type Instrument = 'guitar' | 'bass' | 'keyboard';
export type Mode = 'scale' | 'chord';
export type Language = 'ko' | 'en';

// ============================================
// 악보/코드 관련 타입
// ============================================
export interface ChordItem {
  key: string;        // 'C', 'D#', 'F' 등
  chordType: string;  // 'Major', 'Minor', 'Dominant 7' 등
  fretPositions: (string | number)[]; // ['x', 3, 2, 0, 1, 0]
}

export interface ScaleItem {
  key: string;        // 'C', 'D' 등
  scaleType: string;  // 'Major', 'Minor Pentatonic' 등
  notes: number[];    // [0, 2, 4, 5, 7, 9, 11]
}

export interface LineBreak {
  type: 'linebreak';
}

export type ProgressionItem = ChordItem | ScaleItem | LineBreak;

// ============================================
// 앱 전역 상태 타입
// ============================================
export interface AppStateType {
  instrument: Instrument;
  mode: Mode;
  currentLang: Language;
  highlightedNotes: Set<number>;
  showFormHighlight: boolean;
  showChordDiagram: boolean;
  chordProgression: ProgressionItem[];
  scaleProgression: ProgressionItem[];
  lastFretCount: number;
  
  clearCustomData(): void;
}

// ============================================
// DOM 캐시 타입
// ============================================
export interface DOMElements {
  // 뷰 영역
  fretboardView: HTMLElement | null;
  diagramView: HTMLElement | null;
  scaleProgView: HTMLElement | null;
  captureArea: HTMLElement | null;
  captureTitle: HTMLElement | null;
  fretboardTitle: HTMLElement | null;
  fretboard: HTMLElement | null;
  fretNumbers: HTMLElement | null;
  analyzerResult: HTMLElement | null;
  
  // 컨트롤 그룹
  scaleControls: HTMLElement | null;
  chordControls: HTMLElement | null;
  tuningControls: HTMLElement | null;
  formToggleRow: HTMLElement | null;
  formToggleDivider: HTMLElement | null;
  noteButtonsContainer: HTMLElement | null;
  
  // 버튼들
  langBtn: HTMLButtonElement | null;
  guitarBtn: HTMLButtonElement | null;
  bassBtn: HTMLButtonElement | null;
  keyboardBtn: HTMLButtonElement | null;
  scaleModeBtn: HTMLButtonElement | null;
  chordModeBtn: HTMLButtonElement | null;
  captureBtn: HTMLButtonElement | null;
  toggleDiagramBtn: HTMLButtonElement | null;
  addChordBtn: HTMLButtonElement | null;
  addCustomBtn: HTMLButtonElement | null;
  addLinebreakBtn: HTMLButtonElement | null;
  addScaleBtn: HTMLButtonElement | null;
  saveJsonBtn: HTMLButtonElement | null;
  loadJsonBtn: HTMLButtonElement | null;
  clearProgBtn: HTMLButtonElement | null;
  clearCustomBtn: HTMLButtonElement | null;
  formToggleBtn: HTMLButtonElement | null;
  
  // 셀렉트들
  tuningSelect: HTMLSelectElement | null;
  keySelect: HTMLSelectElement | null;
  majorSelect: HTMLSelectElement | null;
  minorSelect: HTMLSelectElement | null;
  chordSelect: HTMLSelectElement | null;
  formSelect: HTMLSelectElement | null;
  loadJsonInput: HTMLInputElement | null;
  
  // 동적 요소들
  allNoteElements: NodeListOf<HTMLElement>;
  allFretElements: NodeListOf<HTMLElement>;
  findNoteBtns: HTMLButtonElement[];
  
  init(): void;
  updateDynamicElements(): void;
}

// ============================================
// 기타 유틸리티 타입
// ============================================
export interface I18nStrings {
  langBtn: string;
  guitarBtn: string;
  bassBtn: string;
  keyboardBtn: string;
  lblTuning: string;
  scaleModeBtn: string;
  chordModeBtn: string;
  captureBtn: string;
  lblKey: string;
  lblMajor: string;
  lblMinor: string;
  lblChord: string;
  lblFindNote: string;
  lblFormToggle: string;
  btnOff: string;
  btnOn: string;
  btnDiagram: string;
  btnFretboard: string;
  btnAddScale: string;
  btnAddChord: string;
  btnAddCustom: string;
  btnAddLinebreak: string;
  btnSaveJson: string;
  btnLoadJson: string;
  btnClear: string;
  titleChordProgression: string;
  titleScaleProgression: string;
  form1: string;
  form2: string;
  form3: string;
  form4: string;
  form5: string;
  selectDefault: string;
  analyzerTitle: string;
  clearBtn: string;
  analyzerDefault: string;
  txtCurrentNotes: string;
  txtExactChords: string;
  txtExactScales: string;
  txtPartialScales: string;
  txtNone: string;
  txtEtc: string;
  txtCustom: string;
  promptCustomTitle: string;
  msgNoData: string;
  msgLoadFail: string;
  txtLineBreak: string;
}

export type I18nDict = {
  [key in Language]: I18nStrings;
};