https://kimpandol.github.io/Guitar-Scale-Viewer/

# Guitar & Bass Scale Viewer

This project is a comprehensive visualization and analysis tool for guitar, bass, and piano scales and chords.

## Key Features
- **Type-Safe Data Architecture:** Instrument tunings, notes, and intervals are defined via TypeScript Interfaces to prevent runtime errors.
- **Harmony Analyzer:** A real-time algorithmic engine that analyzes note combinations to identify matching chord names and scales.
- **Instrument & Tuning System:** Supports 6-string guitar, 4-string bass, and piano keyboards with custom tuning offsets.
- **Position Form Highlighting:** Algorithmic calculation and display of the 1st through 5th fretboard forms (positions).
- **Data Persistence:** Supports serializing work sessions into JSON format for saving and loading data.
- **Image Capture:** Exports the current fretboard and notation area as a high-quality PNG file.
- **MIDI Analysis:** Analyze scales in Midi.

## Tech Stack
- **Language:** TypeScript (Static typing and interface-based architecture)
- **Build Tool:** Vite
- **Libraries:** `html2canvas` for high-resolution image capturing

## UI & Layout
- **Responsive Design:** Optimized layouts for both Desktop and Mobile environments.
- **Mobile UX Priority:** Ordered for mobile accessibility: Tuning → Key → Scale/Chord Selection → Fretboard → Save/Load → Instrument Selection → Mode Toggle → Analyzer.


<br><br><br><br>


# Guitar & Bass 스케일 뷰어
이 프로젝트는 기타, 베이스, 피아노의 스케일과 코드를 시각화하고 분석하는 도구입니다.

## 주요 기능
- **정적 타입 기반 데이터 관리:** 악기별 튜닝, 노트, 인터벌 데이터를 Interface로 정의하여 에러를 방지합니다.
- **화성 분석기 (Harmony Analyzer):** 선택된 음표 조합을 알고리즘으로 분석하여 일치하는 코드와 스케일을 실시간으로 도출합니다.
- **악기 및 튜닝 시스템:** 기타, 베이스, 피아노 지원 및 프리셋 기반의 커스텀 튜닝을 적용할 수 있습니다.
- **포지션 폼 강조:** 기타 지판의 1~5번 포지션(Form) 하이라이트 기능을 지원합니다.
- **데이터 영속성:** 작업 내역을 JSON 데이터로 저장하고 불러올 수 있습니다.
- **이미지 캡처:** 현재 지판 영역을 PNG 파일로 저장할 수 있습니다.
- **미디 분석:** Midi에서 스케일을 분석할 수 있습니다.

## 기술 스택
- **Language:** TypeScript (정적 타이핑 및 인터페이스 기반 설계)
- **Build Tool:** Vite
- **Libraries:** `html2canvas` (이미지 캡처)

## UI 및 레이아웃
- **반응형 디자인:** PC와 모바일 환경 모두에 최적화된 레이아웃을 제공합니다.
- **모바일 UX 최우선:** 모바일 접근성을 고려한 직관적인 배치: 튜닝 → 조(Key) → 스케일/코드 선택 → 지판 → 저장/불러오기 → 악기 선택 → 모드 전환 → 분석기 순서로 구성되었습니다.
