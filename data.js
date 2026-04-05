// data.js
const CONFIG = {
    KEYBOARD_WHITE_NOTES: [0, 2, 4, 5, 7, 9, 11],
    KEYBOARD_BLACK_MAP: {0: 1, 2: 3, 4: null, 5: 6, 7: 8, 9: 10, 11: null},
    INLAY_FRETS: [3, 5, 7, 9, 15, 17, 19, 21],
    OCTAVE_FRET: 12,
    FRET_OCTAVE_SHIFTS: [-24, -12, 0, 12, 24],
    BASS_FORM_SPECIAL_OFFSETS: { '3': [4, 5, 6, 7] },
    FORM_OFFSETS: { '1': [0, 1, 2, 3], '2': [2, 3, 4, 5], '3': [4, 5, 6, 7, 8], '4': [7, 8, 9, 10], '5': [-3, -2, -1, 0] },
    MODES: { SCALE: 'scale', CHORD: 'chord' }
};

const getTotalFrets = () => window.innerWidth <= 768 ? 18 : 21;

const i18n = {
    ko: {
        langBtn: '🌐<span class="hide-on-mobile"> English</span><span class="show-on-mobile" style="display:none;"> EN</span>', 
        guitarBtn: '🎸 기타<span class="hide-on-mobile"> (6줄)</span>', 
        bassBtn: '🎸 베이스<span class="hide-on-mobile"> (4줄)</span>', 
        keyboardBtn: '🎹<span class="hide-on-mobile"> 키보드 (피아노)</span><span class="show-on-mobile" style="display:none;"> 피아노</span>', 
        lblTuning: "튜닝: ",
        scaleModeBtn: '🎶 스케일<span class="hide-on-mobile"> 모드</span>', 
        chordModeBtn: '🎹 코드<span class="hide-on-mobile"> 모드</span>', 
        captureBtn: '📸<span class="hide-on-mobile"> 지판/악보 저장</span><span class="show-on-mobile" style="display:none;"> 저장</span>', 
        lblKey: "조(Key/Root): ",
        lblMajor: "메이저 계열: ", lblMinor: "마이너 계열: ", lblChord: "코드 종류: ", lblFindNote: "특정 음 찾기 (보라색): ",
        lblFormToggle: "🎸 폼(포지션) 영역 표시: ", btnOff: "OFF", btnOn: "ON", 
        btnDiagram: '📋<span class="hide-on-mobile"> 코드표로 보기</span><span class="show-on-mobile" style="display:none;"> 표 보기</span>', 
        btnFretboard: '🎸<span class="hide-on-mobile"> 지판으로 보기</span><span class="show-on-mobile" style="display:none;"> 지판 보기</span>',
        btnAddScale: "➕ 지판 추가", btnAddChord: '➕<span class="hide-on-mobile"> 악보에 추가</span><span class="show-on-mobile" style="display:none;"> 코드</span>', 
        btnAddCustom: '➕<span class="hide-on-mobile"> 빈 지판 추가</span><span class="show-on-mobile" style="display:none;"> 빈 지판</span>', 
        btnAddLinebreak: "⏎ 줄바꿈", 
        btnSaveJson: '💾<span class="hide-on-mobile"> 악보 저장</span><span class="show-on-mobile" style="display:none;"> 저장</span>',
        btnLoadJson: '📂<span class="hide-on-mobile"> 불러오기</span><span class="show-on-mobile" style="display:none;"> 열기</span>', 
        btnClear: "🗑️ 비우기", titleChordProgression: "코드 진행 악보", titleScaleProgression: "스케일 모음 악보",
        form1: "1번 폼 (Root-6)", form2: "2번 폼", form3: "3번 폼", form4: "4번 폼", form5: "5번 폼 (Root-5)", selectDefault: "-- 선택 --",
        analyzerTitle: "🔍 화성 분석기", clearBtn: "초록/보라색 초기화", 
        analyzerDefault: "지판/건반을 클릭해서 초록색 음을 추가하면, 어떤 <strong>코드</strong>와 <strong>스케일</strong>인지 여기에 분석해 줄게!",
        txtCurrentNotes: "현재 찍은 음: ", txtExactChords: "🎹 <strong>일치하는 코드:</strong>", txtExactScales: "🎯 <strong>정확히 일치하는 스케일:</strong>",
        txtPartialScales: "🧩 <strong>이 음들을 포함하는 스케일 (일부 일치):</strong>", txtNone: "없음", txtEtc: " 등등...", txtCustom: "커스텀",
        promptCustomTitle: "표시할 코드/스케일 이름을 입력하세요:", msgNoData: "저장할 데이터가 없습니다.", msgLoadFail: "파일을 불러오는 데 실패했습니다.",
        txtLineBreak: "줄바꿈"
    },
    en: {
        langBtn: '🌐<span class="hide-on-mobile"> 한국어</span><span class="show-on-mobile" style="display:none;"> KO</span>', 
        guitarBtn: '🎸 Guitar<span class="hide-on-mobile"> (6-string)</span>', 
        bassBtn: '🎸 Bass<span class="hide-on-mobile"> (4-string)</span>', 
        keyboardBtn: '🎹 Keyboard', 
        lblTuning: "Tuning: ",
        scaleModeBtn: '🎶 Scale<span class="hide-on-mobile"> Mode</span>', 
        chordModeBtn: '🎹 Chord<span class="hide-on-mobile"> Mode</span>', 
        captureBtn: '📸<span class="hide-on-mobile"> Save Image</span><span class="show-on-mobile" style="display:none;"> Save</span>', 
        lblKey: "Key/Root: ",
        lblMajor: "Major Scales: ", lblMinor: "Minor Scales: ", lblChord: "Chord Type: ", lblFindNote: "Find Notes (Purple): ",
        lblFormToggle: "🎸 Position Highlight: ", btnOff: "OFF", btnOn: "ON", 
        btnDiagram: '📋<span class="hide-on-mobile"> View Diagram</span><span class="show-on-mobile" style="display:none;"> Diagram</span>', 
        btnFretboard: '🎸<span class="hide-on-mobile"> View Fretboard</span><span class="show-on-mobile" style="display:none;"> Fretboard</span>',
        btnAddScale: "➕ Add Fretboard", btnAddChord: '➕<span class="hide-on-mobile"> Add to Sheet</span><span class="show-on-mobile" style="display:none;"> Add</span>', 
        btnAddCustom: '➕<span class="hide-on-mobile"> Blank Diagram</span><span class="show-on-mobile" style="display:none;"> Blank</span>', 
        btnAddLinebreak: "⏎ Break", 
        btnSaveJson: '💾<span class="hide-on-mobile"> Save JSON</span><span class="show-on-mobile" style="display:none;"> Save</span>',
        btnLoadJson: '📂<span class="hide-on-mobile"> Load JSON</span><span class="show-on-mobile" style="display:none;"> Load</span>', 
        btnClear: "🗑️ Clear All", titleChordProgression: "Chord Progression", titleScaleProgression: "Scale Collection",
        form1: "Form 1 (Root-6)", form2: "Form 2", form3: "Form 3", form4: "Form 4", form5: "Form 5 (Root-5)", selectDefault: "-- Select --",
        analyzerTitle: "🔍 Harmony Analyzer", clearBtn: "Clear Highlights", 
        analyzerDefault: "Click the fretboard/keys to add green notes, and I'll analyze the <strong>Chord</strong> and <strong>Scale</strong> for you!",
        txtCurrentNotes: "Current Notes: ", txtExactChords: "🎹 <strong>Exact Chords:</strong>", txtExactScales: "🎯 <strong>Exact Scales:</strong>",
        txtPartialScales: "🧩 <strong>Scales Containing These Notes:</strong>", txtNone: "None", txtEtc: " etc...", txtCustom: "Custom",
        promptCustomTitle: "Enter name:", msgNoData: "No data to save.", msgLoadFail: "Failed to load the file.",
        txtLineBreak: "Line Break"
    }
};

const MUSIC_DATA = {
    notes: ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'],
    tunings: { 'guitar': [4, 11, 7, 2, 9, 4], 'bass': [7, 2, 9, 4] },
    tuningPresets: {
        'guitar': {
            'standard': { offset: [0, 0, 0, 0, 0, 0], ko: "스탠다드", en: "Standard" },
            'halfDown': { offset: [-1, -1, -1, -1, -1, -1], ko: "하프 다운 (Eb)", en: "Half Step Down" },
            'wholeDown': { offset: [-2, -2, -2, -2, -2, -2], ko: "홀 다운 (D)", en: "Whole Step Down" },
            'dropD': { offset: [0, 0, 0, 0, 0, -2], ko: "드롭 D", en: "Drop D" },
            'dropC': { offset: [-2, -2, -2, -2, -2, -4], ko: "드롭 C", en: "Drop C" },
            'upHalf': { offset: [1, 1, 1, 1, 1, 1], ko: "하프 업 (F)", en: "Half Step Up" }
        },
        'bass': {
            'standard': { offset: [0, 0, 0, 0], ko: "스탠다드", en: "Standard" },
            'halfDown': { offset: [-1, -1, -1, -1], ko: "하프 다운 (Eb)", en: "Half Step Down" },
            'wholeDown': { offset: [-2, -2, -2, -2], ko: "홀 다운 (D)", en: "Whole Step Down" },
            'dropD': { offset: [0, 0, 0, -2], ko: "드롭 D", en: "Drop D" }
        }
    },
    majorScales: {
        "Major (Ionian)": [0, 2, 4, 5, 7, 9, 11], "Lydian": [0, 2, 4, 6, 7, 9, 11], "Mixolydian": [0, 2, 4, 5, 7, 9, 10],
        "Major Pentatonic": [0, 2, 4, 7, 9], "Bebop Major": [0, 2, 4, 5, 7, 8, 9, 11], "Phrygian Dominant": [0, 1, 4, 5, 7, 8, 10], "Lydian Dominant": [0, 2, 4, 6, 7, 9, 10] 
    },
    minorScales: {
        "Minor (Aeolian)": [0, 2, 3, 5, 7, 8, 10], "Dorian": [0, 2, 3, 5, 7, 9, 10], "Phrygian": [0, 1, 3, 5, 7, 8, 10], "Locrian": [0, 1, 3, 5, 6, 8, 10],
        "Minor Pentatonic": [0, 3, 5, 7, 10], "Blues": [0, 3, 5, 6, 7, 10], "Harmonic Minor": [0, 2, 3, 5, 7, 8, 11], "Melodic Minor": [0, 2, 3, 5, 7, 9, 11], 
        "Diminished (W-H)": [0, 2, 3, 5, 6, 8, 9, 11], "Bebop Minor": [0, 2, 3, 4, 5, 7, 9, 10], "Altered": [0, 1, 3, 4, 6, 8, 10]
    },
    allChords: {
        "Major (M)": [0, 4, 7], "Minor (m)": [0, 3, 7], "Dominant 7 (7)": [0, 4, 7, 10], "Major 7 (maj7)": [0, 4, 7, 11], "Minor 7 (m7)": [0, 3, 7, 10],
        "Sus 4 (sus4)": [0, 5, 7], "Sus 2 (sus2)": [0, 2, 7], "Diminished (dim)": [0, 3, 6], "Augmented (aug)": [0, 4, 8], "Half Diminished (m7b5)": [0, 3, 6, 10],
        "Diminished 7 (dim7)": [0, 3, 6, 9], "Minor Major 7 (mM7)": [0, 3, 7, 11]
    },
    openChords: {
        "0_Major (M)": ['x', 3, 2, 0, 1, 0], "2_Major (M)": ['x', 'x', 0, 2, 3, 2], "4_Major (M)": [0, 2, 2, 1, 0, 0], "7_Major (M)": [3, 2, 0, 0, 0, 3], "9_Major (M)": ['x', 0, 2, 2, 2, 0], 
        "2_Minor (m)": ['x', 'x', 0, 2, 3, 1], "4_Minor (m)": [0, 2, 2, 0, 0, 0], "9_Minor (m)": ['x', 0, 2, 2, 1, 0], "0_Dominant 7 (7)": ['x', 3, 2, 3, 1, 0], "2_Dominant 7 (7)": ['x', 'x', 0, 2, 1, 2], 
        "4_Dominant 7 (7)": [0, 2, 0, 1, 0, 0], "7_Dominant 7 (7)": [3, 2, 0, 0, 0, 1], "9_Dominant 7 (7)": ['x', 0, 2, 0, 2, 0], "11_Dominant 7 (7)": ['x', 2, 1, 2, 0, 2], 
        "0_Major 7 (maj7)": ['x', 3, 2, 0, 0, 0], "2_Major 7 (maj7)": ['x', 'x', 0, 2, 2, 2], "5_Major 7 (maj7)": ['x', 'x', 3, 2, 1, 0], "7_Major 7 (maj7)": [3, 'x', 0, 0, 0, 2], "9_Major 7 (maj7)": ['x', 0, 2, 1, 2, 0], 
        "2_Minor 7 (m7)": ['x', 'x', 0, 2, 1, 1], "4_Minor 7 (m7)": [0, 2, 0, 0, 0, 0], "9_Minor 7 (m7)": ['x', 0, 2, 0, 1, 0], "2_Sus 4 (sus4)": ['x', 'x', 0, 2, 3, 3], "4_Sus 4 (sus4)": [0, 2, 2, 2, 0, 0], 
        "9_Sus 4 (sus4)": ['x', 0, 2, 2, 3, 0], "2_Sus 2 (sus2)": ['x', 'x', 0, 2, 3, 0], "9_Sus 2 (sus2)": ['x', 0, 2, 2, 0, 0] 
    },
    chordShapes: {
        "Major (M)": { E: [0, 2, 2, 1, 0, 0], A: ['x', 0, 2, 2, 2, 0] }, "Minor (m)": { E: [0, 2, 2, 0, 0, 0], A: ['x', 0, 2, 2, 1, 0] }, "Dominant 7 (7)": { E: [0, 2, 0, 1, 0, 0], A: ['x', 0, 2, 0, 2, 0] },
        "Major 7 (maj7)": { E: [0, 'x', 1, 1, 0, 'x'], A: ['x', 0, 2, 1, 2, 0] }, "Minor 7 (m7)": { E: [0, 'x', 0, 0, 0, 'x'], A: ['x', 0, 2, 0, 1, 0] }, "Sus 4 (sus4)": { E: [0, 2, 2, 2, 0, 0], A: ['x', 0, 2, 2, 3, 0] },
        "Sus 2 (sus2)": { E: [0, 2, 4, 4, 0, 0], A: ['x', 0, 2, 2, 0, 0] }, "Diminished (dim)": { E: [0, 'x', 2, 0, -1, 'x'], A: ['x', 0, 1, 2, 1, 'x'] }, "Augmented (aug)": { E: [0, 'x', 2, 1, 1, 'x'], A: ['x', 0, 3, 2, 2, 'x'] },
        "Half Diminished (m7b5)": { E: [0, 'x', 0, 0, -1, 'x'], A: ['x', 0, 1, 0, 1, 'x'] }, "Diminished 7 (dim7)": { E: [0, 'x', -1, 0, -1, 'x'], A: ['x', 0, 1, 2, 1, 2] }, "Minor Major 7 (mM7)": { E: [0, 'x', 1, 0, 0, 'x'], A: ['x', 0, 2, 1, 1, 0] }
    }
};
MUSIC_DATA.allScales = { ...MUSIC_DATA.majorScales, ...MUSIC_DATA.minorScales };