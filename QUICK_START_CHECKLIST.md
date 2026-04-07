# 빠른 시작 가이드 (Quick Reference)

## 🚀 5분 안에 할 일

### 1. 터미널 열기
```bash
# 프로젝트 폴더로 이동
cd /path/to/Guitar-Scale-Viewer
```

### 2. Node.js 설치 확인
```bash
node --version  # v18 이상이어야 함
npm --version
```

> Node.js 없으면: https://nodejs.org 에서 LTS 설치

### 3. npm 초기화
```bash
npm init -y
```

### 4. 파일 백업
```bash
# Windows
xcopy . backup_before_typescript /E /I

# Mac/Linux  
cp -r . ../Guitar-Scale-Viewer-backup/
```

---

## 📋 Step-by-Step 체크리스트

### Phase 1: 초기 설정 (15분)

- [ ] **Step 1**: npm init -y 실행
  ```bash
  npm init -y
  ```

- [ ] **Step 2**: package.json 수정
  - 제공된 `package.json` 파일 내용 복사 및 교체

- [ ] **Step 3**: 패키지 설치
  ```bash
  npm install
  ```
  > ⏱️ 2~3분 대기

- [ ] **Step 4**: 설정 파일 3개 생성
  - `tsconfig.json` → 제공된 파일 복사
  - `tsconfig.node.json` → 제공된 파일 복사
  - `vite.config.ts` → 제공된 파일 복사

- [ ] **Step 5**: 폴더 구조 정리
  ```bash
  mkdir src
  mv index.html src/
  mv styles.css src/
  mv data.js src/
  ```

---

### Phase 2: 파일 변환 (30분)

- [ ] **Step 6**: data.js → data.ts 변환
  ```bash
  # Mac/Linux
  mv src/data.js src/data.ts
  
  # Windows
  ren src\data.js data.ts
  ```

- [ ] **Step 7**: types.ts 생성
  - 제공된 `types.ts` 파일을 `src/types.ts`로 저장

- [ ] **Step 8**: app.js 복사
  ```bash
  cp app.js src/app.ts
  
  # 또는 수동으로:
  # 1. app.js 파일 열기
  # 2. 내용 모두 복사
  # 3. src/app.ts 로 저장
  ```

- [ ] **Step 9**: app.ts 맨 앞 수정
  - `src/app.ts` 파일 맨 위에 다음 3줄 추가:
  ```typescript
  import { AppStateType, DOMElements, Language, I18nDict } from './types';
  import { CONFIG, MUSIC_DATA, i18n } from './data';
  ```

- [ ] **Step 10**: app.ts 변수에 타입 추가
  - `let currentLang = 'en'` → `let currentLang: Language = 'en'`
  - `const AppState = {` → `const AppState: AppStateType = {`
  - `const DOM_CACHE = {` → `const DOM_CACHE: DOMElements = {`

- [ ] **Step 11**: index.html 수정
  - 제공된 `index.html`로 교체 (또는 다음만 수정):
  ```html
  <!-- 변경 전 -->
  <script src="data.js"></script>
  <script src="app.js"></script>
  
  <!-- 변경 후 -->
  <script type="module" src="./app.ts"></script>
  ```

---

### Phase 3: 검증 및 빌드 (20분)

- [ ] **Step 12**: 개발 서버 실행
  ```bash
  npm run dev
  ```
  > http://localhost:3000 자동 열림
  > 에러가 있으면 콘솔 확인

- [ ] **Step 13**: 모든 기능 테스트
  - [ ] 악기 선택 (기타/베이스/키보드)
  - [ ] 모드 선택 (스케일/코드)
  - [ ] 스케일 선택 및 표시
  - [ ] 코드 선택 및 표시
  - [ ] 언어 변경 (한글/English)
  - [ ] 지판 클릭해서 음 강조
  - [ ] 저장/불러오기

- [ ] **Step 14**: 빌드 실행
  ```bash
  npm run build
  ```
  > dist/ 폴더 생성되면 성공

- [ ] **Step 15**: 빌드 결과 테스트
  ```bash
  npm run preview
  ```
  > http://localhost:4173 접속해서 최종 확인

---

### Phase 4: 배포 (10분)

- [ ] **Step 16**: dist 폴더 배포
  - GitHub 웹사이트에서 dist/ 폴더 모든 파일 업로드
  - 또는 Git 명령어:
  ```bash
  git add dist/*
  git commit -m "TypeScript migration: build files"
  git push
  ```

- [ ] **Step 17**: GitHub Pages 설정
  1. 레포지토리 Settings 열기
  2. Pages 섹션으로 이동
  3. Branch: `main`, Directory: `/dist` 선택
  4. Save

- [ ] **Step 18**: 배포 확인
  - GitHub Pages URL (https://username.github.io/Guitar-Scale-Viewer) 접속

---

## 🐛 문제 발생 시

### npm run dev 에러
```
Cannot find module './types'
```
**해결:**
- `src/types.ts` 파일이 있는지 확인
- `src/app.ts` 맨 위에 import 있는지 확인

### npm run build 에러
```
Error: data.ts not found
```
**해결:**
- `src/data.ts` 파일이 있는지 확인 (data.js → data.ts 변환됐는지)

### 스타일이 적용 안 됨
```html
<!-- index.html에서 -->
<!-- ❌ 잘못됨 -->
<link rel="stylesheet" href="styles.css">

<!-- ✅ 올바름 -->
<link rel="stylesheet" href="./styles.css">
```

### "as HTMLElement" 같은 타입 단언 에러
```typescript
// ❌ 에러 발생
this.fretboard = document.getElementById('fretboard');

// ✅ 해결
this.fretboard = document.getElementById('fretboard') as HTMLElement;
```

---

## 📁 최종 폴더 구조 (완성 후)

```
Guitar-Scale-Viewer/
├── src/                    ← TypeScript 소스
│   ├── index.html
│   ├── styles.css
│   ├── data.ts            ← 변환됨
│   ├── app.ts             ← 변환됨
│   └── types.ts           ← 새로 생성됨
│
├── dist/                   ← 빌드 결과 (자동 생성)
│   ├── index.html
│   └── assets/
│       ├── index-abc.js
│       └── style-def.css
│
├── node_modules/           ← npm 패키지 (자동 생성)
│
├── package.json            ← 수정됨
├── tsconfig.json          ← 새로 생성됨
├── tsconfig.node.json     ← 새로 생성됨
├── vite.config.ts         ← 새로 생성됨
│
├── README.md
└── (옛날 app.js는 삭제 가능)
```

---

## 💡 팁

### 1. 단계별 진행 추천
> 한 번에 모든 걸 하려다 보면 헷갈립니다
> 각 Phase마다 commit하세요

```bash
git add .
git commit -m "Phase 1: Initial setup"
git push
```

### 2. 확인 용이하게 하려면
```bash
# Terminal 1: 개발 서버
npm run dev

# Terminal 2: 타입 체크 (선택사항)
npx tsc --noEmit
```

### 3. 이미 GitHub Pages에 배포 중이면
```bash
# 새로운 dist 폴더가 이전 파일들을 대체합니다
# GitHub Pages 설정에서 /docs 대신 /dist 선택하면 됨
```

---

## 🎯 완료 후 다음 단계

### 즉시
- ✅ TypeScript 마이그레이션 완료
- ✅ 기능 정상 작동 확인
- ✅ 배포 확인

### 추가 개선 (선택사항, 2~3일)
```
src/ 폴더 구조 정리:
├── types/
│   ├── index.ts        (모든 타입)
│   ├── state.ts
│   └── components.ts
├── utils/
│   ├── music-theory.ts
│   └── dom-helpers.ts
├── managers/
│   ├── fretboard.ts
│   ├── analyzer.ts
│   └── keyboard.ts
└── app.ts

→ AI가 코드 생성할 때 훨씬 더 정확해집니다
```

---

## ❓ 막히면

다음 정보와 함께 질문하세요:
1. **어느 단계인가?** (예: Phase 2, Step 6)
2. **어떤 에러인가?** (전체 에러 메시지 복사)
3. **어떤 파일인가?** (app.ts, types.ts 등)

예:
> "Phase 2, Step 12에서 npm run dev 실행 시 'Cannot find module './data'' 에러가 뜹니다"

이런 식으로 하면 정확하게 도와드릴 수 있습니다.
