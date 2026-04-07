# TypeScript 마이그레이션 가이드 (A to Z)

## 📋 목차
1. [사전 준비](#-사전-준비)
2. [프로젝트 초기화](#-프로젝트-초기화)
3. [폴더 구조 정리](#-폴더-구조-정리)
4. [TypeScript 설정](#-typescript-설정)
5. [Vite 설정](#-vite-설정)
6. [파일 변환](#-파일-변환)
7. [타입 정의](#-타입-정의)
8. [빌드 및 테스트](#-빌드-및-테스트)
9. [배포](#-배포)
10. [트러블슈팅](#-트러블슈팅)

---

## 🔧 사전 준비

### Step 1: Node.js 설치 확인

**Windows/Mac/Linux 모두:**

```bash
# 터미널/명령 프롬프트에서 실행
node --version
npm --version
```

**결과 예시:**
```
v18.17.0
9.6.7
```

> ❌ 설치 안 되어 있으면?
> https://nodejs.org/ 에서 LTS 버전 (v18 이상) 설치

---

### Step 2: 현재 프로젝트 백업

```bash
# 현재 작업 폴더에서
# Windows
xcopy . backup_before_typescript /E /I

# Mac/Linux
cp -r . backup_before_typescript/
```

---

## 📦 프로젝트 초기화

### Step 3: 작업 폴더 이동 및 준비

```bash
# 현재 프로젝트가 있는 폴더로 이동
cd /path/to/your/Guitar-Scale-Viewer

# 폴더 구조 확인
ls  # Mac/Linux
dir # Windows
```

**현재 폴더 구조 (확인):**
```
Guitar-Scale-Viewer/
├── index.html
├── app.js
├── data.js
├── styles.css
└── README.md
```

---

### Step 4: npm 초기화

```bash
# package.json 생성
npm init -y
```

**생성되는 파일:**
```
package.json
```

### Step 5: package.json 수정

생성된 `package.json`을 텍스트 에디터로 열어서 아래처럼 수정:

```json
{
  "name": "guitar-scale-viewer",
  "version": "1.0.0",
  "description": "Guitar/Bass/Keyboard Scale and Chord Viewer",
  "type": "module",
  "main": "dist/index.js",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  },
  "devDependencies": {
    "typescript": "^5.3.3",
    "vite": "^5.0.8"
  }
}
```

---

### Step 6: 필요한 패키지 설치

```bash
npm install
```

**설치 완료 시:**
```
added 100+ packages
```

> ⏱️ 시간이 걸릴 수 있습니다 (1~3분)

---

## 📁 폴더 구조 정리

### Step 7: src 폴더 생성

```bash
# src 폴더 생성
mkdir src

# dist 폴더는 빌드 시 자동 생성되므로 만들 필요 없음
```

### Step 8: 파일 이동

**현재 파일들을 src 폴더로 이동:**

```bash
# Mac/Linux
mv index.html src/
mv styles.css src/
mv data.js src/

# Windows (명령 프롬프트)
move index.html src\
move styles.css src\
move data.js src\
```

> ⚠️ app.js는 아직 src 폴더로 옮기지 마세요. 다음 단계에서 변환 후 옮깁니다.

**결과 폴더 구조:**
```
Guitar-Scale-Viewer/
├── src/
│   ├── index.html
│   ├── styles.css
│   └── data.js
├── app.js          ← 아직 여기
├── README.md
├── package.json
├── tsconfig.json   ← 이제 생성할 예정
└── vite.config.ts  ← 이제 생성할 예정
```

---

## ⚙️ TypeScript 설정

### Step 9: tsconfig.json 생성

프로젝트 루트에 `tsconfig.json` 파일을 생성하고 아래 내용 입력:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,

    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",

    /* Strict Type-Checking Options */
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "noImplicitThis": true,
    "alwaysStrict": true,

    /* Additional Checks */
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

### Step 10: tsconfig.node.json 생성

프로젝트 루트에 `tsconfig.node.json` 파일을 생성하고 아래 내용 입력:

```json
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true
  },
  "include": ["vite.config.ts"]
}
```

---

## 🚀 Vite 설정

### Step 11: vite.config.ts 생성

프로젝트 루트에 `vite.config.ts` 파일을 생성하고 아래 내용 입력:

```typescript
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    minify: 'terser',
  },
  server: {
    port: 3000,
    open: true,
  },
});
```

---

## 📄 파일 변환

### Step 12: data.js를 data.ts로 변환

현재 `data.js` 파일을 열고, 내용은 그대로 두되 이름만 `data.ts`로 저장:

```bash
# Mac/Linux
mv src/data.js src/data.ts

# Windows
ren src\data.js data.ts
```

---

### Step 13: types.ts 생성 (타입 정의)

`src/types.ts` 파일을 새로 생성하고 아래 내용 입력:

```typescript
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
```

---

### Step 14: app.js를 app.ts로 변환

#### Step 14-1: app.js 전체 복사

현재 `app.js` 파일 전체를 복사:

```bash
# Mac/Linux
cp app.js src/app.ts

# Windows
copy app.js src\app.ts
```

#### Step 14-2: app.ts 수정

`src/app.ts` 파일을 텍스트 에디터로 열고, 가장 위에 아래 코드 추가:

```typescript
// 파일 맨 위에 추가
import { AppStateType, DOMElements, Language, I18nDict } from './types';
```

#### Step 14-3: 전역 변수에 타입 추가

파일에서 다음 부분들을 찾아서 수정:

```typescript
// 원본:
let currentLang = 'en'; 
// 변경:
let currentLang: Language = 'en';

// 원본:
const AppState = {
// 변경:
const AppState: AppStateType = {

// 원본:
const DOM_CACHE = {
// 변경:
const DOM_CACHE: DOMElements = {
```

#### Step 14-4: data.ts import 추가

`src/app.ts` 파일에서 다음을 찾아:

```typescript
// 파일 맨 아래쯤에 이런 코드가 있거나 없을 수 있음
// 없으면 import 추가
import { CONFIG, MUSIC_DATA, i18n } from './data';
```

---

### Step 15: index.html 수정

`src/index.html` 파일을 텍스트 에디터로 열고, `<script>` 태그들을 수정:

**변경 전:**
```html
<script src="data.js"></script>
<script src="app.js"></script>
```

**변경 후:**
```html
<script type="module" src="app.ts"></script>
```

> ✅ data.js는 app.ts에서 import 되므로 따로 로드할 필요 없음

---

## 📝 타입 정의

### Step 16: data.ts에 타입 내보내기

`src/data.ts` 파일을 열고 가장 아래에 아래 코드 추가:

```typescript
// 파일 맨 아래 추가
export { CONFIG, i18n, MUSIC_DATA };
```

### Step 17: data.ts 타입 개선 (선택사항)

더 정확한 타입을 원하면 `src/data.ts` 파일 맨 위에 추가:

```typescript
// 파일 맨 위에 추가
import { I18nDict } from './types';

// 그리고 i18n 변수 선언 부분에서:
// 원본:
const i18n = {

// 변경:
const i18n: I18nDict = {
```

---

## 🔨 빌드 및 테스트

### Step 18: 개발 서버 실행

```bash
npm run dev
```

**성공 시 출력:**
```
  VITE v5.0.8  ready in 123 ms

  ➜  Local:   http://localhost:3000/
  ➜  press h to show help
```

> 💻 브라우저가 자동으로 열릴 수 있습니다

### Step 19: 사이트 확인

- 주소창에서 `http://localhost:3000` 접속
- 모든 기능이 정상 작동하는지 확인
- 콘솔(F12 > Console) 에러 확인

> ⚠️ 에러가 나면? [트러블슈팅](#-트러블슈팅) 섹션 참고

### Step 20: 프로덕션 빌드

```bash
npm run build
```

**성공 시:**
```
dist/index.html                0.45 kB │ gzip:  0.34 kB
dist/assets/index-abc123.js   34.21 kB │ gzip: 12.34 kB
dist/assets/style-def456.css   8.12 kB │ gzip:  2.15 kB

✓ built in 1.23s
```

> ✅ `dist/` 폴더가 생성되면 성공

### Step 21: 빌드 결과 테스트

```bash
npm run preview
```

- `http://localhost:4173` 접속해서 최종 확인
- 모든 기능이 정상인지 확인

---

## 🚀 배포

### Step 22: dist 폴더 배포 (GitHub Pages)

#### 옵션 A: GitHub에 업로드 (수동)

```bash
# 1. GitHub 웹사이트에서 레포지토리 열기
# 2. dist 폴더의 모든 파일 선택
# 3. 업로드

# 또는 Git 커맨드:
git add dist/*
git commit -m "TypeScript migration: build files"
git push
```

#### 옵션 B: 자동 배포 설정 (GitHub Actions - 선택사항)

`.github/workflows/build.yml` 파일 생성:

```yaml
name: Build and Deploy

on:
  push:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm install
      
      - name: Build
        run: npm run build
      
      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

### Step 23: GitHub Pages 설정

1. 깃허브 레포지토리 > Settings
2. Pages 섹션으로 이동
3. Branch를 `main`으로, 폴더를 `/dist`로 설정
4. Save 클릭

### Step 24: 배포 확인

배포 후 GitHub Pages URL (예: `https://username.github.io/Guitar-Scale-Viewer`) 접속해서 확인

---

## 🐛 트러블슈팅

### 문제 1: "Cannot find module" 에러

```
error TS2307: Cannot find module './data' or its corresponding type declarations.
```

**해결:**
```typescript
// src/app.ts 맨 위에 확인
import { CONFIG, MUSIC_DATA, i18n } from './data';
// 파일명이 data.ts 인지 확인
```

---

### 문제 2: DOM 요소가 null

```typescript
// 현재:
this.fretboard = document.getElementById('fretboard');

// 문제: TypeScript가 null일 수 있다고 경고

// 해결:
this.fretboard = document.getElementById('fretboard') as HTMLElement;
```

---

### 문제 3: 스타일이 적용 안 됨

**원본 index.html:**
```html
<link rel="stylesheet" href="styles.css">
```

**수정:**
```html
<link rel="stylesheet" href="/styles.css">
```

---

### 문제 4: 빌드는 성공하지만 실행 시 에러

```bash
# 1. 캐시 삭제
rm -rf dist/  # Mac/Linux
rmdir /s dist # Windows

# 2. 다시 빌드
npm run build

# 3. 미리보기
npm run preview
```

---

### 문제 5: import 경로 오류

```typescript
// ❌ 잘못된 경로
import { AppState } from 'app';

// ✅ 올바른 경로
import { AppState } from './app';
```

---

## ✅ 최종 폴더 구조 (완성)

```
Guitar-Scale-Viewer/
├── src/
│   ├── index.html
│   ├── styles.css
│   ├── data.ts          ← 변환됨
│   ├── app.ts           ← 변환됨
│   └── types.ts         ← 새로 생성됨
├── dist/                ← 빌드 결과 (자동 생성)
│   ├── index.html
│   ├── assets/
│   │   ├── index-abc.js
│   │   └── style-def.css
│   └── ...
├── node_modules/        ← npm 패키지들 (자동 생성)
├── .github/
│   └── workflows/
│       └── build.yml    ← GitHub Actions (선택사항)
├── package.json
├── tsconfig.json
├── tsconfig.node.json
├── vite.config.ts
├── README.md
└── (옛날 app.js는 삭제 가능)
```

---

## 📚 다음 단계

### A. 즉시 (권장)
```bash
# 1. 이 가이드대로 따라가기
# 2. npm run build 성공 확인
# 3. dist 폴더 배포

# 소요 시간: 1~2시간
```

### B. 추가 개선 (선택사항)
```typescript
// src/ 폴더 구조 정리
src/
├── types/
│   ├── index.ts
│   ├── state.ts
│   └── components.ts
├── utils/
│   ├── music-theory.ts
│   ├── dom-helpers.ts
│   └── storage.ts
├── managers/
│   ├── fretboard.ts
│   ├── analyzer.ts
│   └── chord-manager.ts
├── app.ts
├── data.ts
├── types.ts
├── styles.css
└── index.html

// 소요 시간: 추가 2~3일
```

---

## 🎉 완료 체크리스트

- [ ] Node.js 설치 확인
- [ ] npm init 완료
- [ ] package.json 수정
- [ ] npm install 완료
- [ ] src 폴더 생성 및 파일 이동
- [ ] tsconfig.json 생성
- [ ] tsconfig.node.json 생성
- [ ] vite.config.ts 생성
- [ ] data.js → data.ts 변환
- [ ] types.ts 생성
- [ ] app.js → app.ts 변환
- [ ] index.html 수정
- [ ] npm run dev 성공
- [ ] npm run build 성공
- [ ] npm run preview로 확인
- [ ] dist 폴더 배포
- [ ] GitHub Pages 확인

---

## 💬 도움이 필요하면

위 단계 중 막히는 부분이 있으면 **정확히 어느 단계에서 어떤 에러가 났는지** 알려주면 도와드리겠습니다.

예시:
> "Step 20에서 npm run build 실행 시 'Cannot find module' 에러가 뜹니다"

이런 식으로 질문하면 더 정확하게 도와드릴 수 있습니다.
