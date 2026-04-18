// ============================================
// MIDI 분석기 모듈
// 외부 라이브러리 없이 순수 TypeScript로 구현
// ============================================

import { MUSIC_DATA } from './data';

// ─── 타입 정의 ────────────────────────────────────────────────

export interface MidiScaleMatch {
  rootNote: string;       // 'C', 'D#' 등
  rootIndex: number;      // 0-11
  scaleName: string;      // 'Major (Ionian)' 등
  category: 'major' | 'minor';
  /** 탐지된 음 중 이 스케일에 속하는 비율 (0~100) */
  purityScore: number;
  /** 스케일 음 중 실제로 연주된 비율 (0~100) */
  coverageScore: number;
  /** 종합 신뢰도 (0~100) */
  confidence: number;
}

export interface MidiAnalysisResult {
  /** 파일에서 추출한 음표 개수 */
  totalNotes: number;
  /** 탐지된 음 (피치 클래스별 카운트, 인덱스 0=C) */
  pitchClassCounts: number[];
  /** 스케일 매칭 결과 (신뢰도 순) */
  matches: MidiScaleMatch[];
  /** 가장 많이 등장한 음 (추정 루트) */
  dominantNote: string;
}

// ─── MIDI 파서 ────────────────────────────────────────────────

/** 가변 길이 수량(Variable-Length Quantity) 읽기 */
function readVarLen(data: Uint8Array, offset: number): [value: number, bytesRead: number] {
  let value = 0;
  let bytesRead = 0;
  let byte: number;
  do {
    if (offset + bytesRead >= data.length) break;
    byte = data[offset + bytesRead];
    value = (value << 7) | (byte & 0x7F);
    bytesRead++;
  } while (byte & 0x80);
  return [value, bytesRead];
}

/** 4바이트 빅엔디안 읽기 */
function readUint32BE(data: Uint8Array, offset: number): number {
  return (data[offset] << 24 | data[offset + 1] << 16 | data[offset + 2] << 8 | data[offset + 3]) >>> 0;
}

/** 2바이트 빅엔디안 읽기 */
function readUint16BE(data: Uint8Array, offset: number): number {
  return (data[offset] << 8 | data[offset + 1]) & 0xFFFF;
}

/**
 * MIDI 파일에서 음표의 피치 클래스를 추출합니다.
 * 반환값: 각 Note On 이벤트의 MIDI 피치 번호 배열
 */
function parseMidiPitches(buffer: ArrayBuffer): number[] {
  const data = new Uint8Array(buffer);
  const pitches: number[] = [];

  // 헤더 검증
  if (data.length < 14) throw new Error('파일이 너무 짧습니다.');
  const headerTag = String.fromCharCode(data[0], data[1], data[2], data[3]);
  if (headerTag !== 'MThd') throw new Error('유효한 MIDI 파일이 아닙니다.');

  const numTracks = readUint16BE(data, 10);
  let offset = 14; // 헤더 청크 이후

  for (let trackIdx = 0; trackIdx < numTracks; trackIdx++) {
    if (offset + 8 > data.length) break;

    const trackTag = String.fromCharCode(data[offset], data[offset + 1], data[offset + 2], data[offset + 3]);
    const trackLen = readUint32BE(data, offset + 4);
    offset += 8;

    if (trackTag !== 'MTrk') {
      offset += trackLen;
      continue;
    }

    const trackEnd = Math.min(offset + trackLen, data.length);
    let runningStatus = 0;

    while (offset < trackEnd) {
      // 델타 타임 읽기
      const [, deltaBytes] = readVarLen(data, offset);
      offset += deltaBytes;
      if (offset >= trackEnd) break;

      let statusByte = data[offset];

      // 러닝 스테이터스 처리
      if (statusByte & 0x80) {
        // SysEx나 Meta는 running status 초기화
        if (statusByte === 0xF0 || statusByte === 0xF7) {
          runningStatus = 0;
        } else if (statusByte !== 0xFF) {
          // 일반 채널 이벤트는 running status 업데이트
          runningStatus = statusByte;
        }
        offset++;
      }
      // else: 데이터 바이트가 먼저 나오면 runningStatus 그대로 사용

      if (offset >= trackEnd) break;

      const eventType = runningStatus & 0xF0;

      if (eventType === 0x90) {
        // Note On
        if (offset + 1 >= trackEnd) break;
        const pitch = data[offset];
        const velocity = data[offset + 1];
        offset += 2;
        if (velocity > 0) {
          pitches.push(pitch); // 피치 클래스 변환은 나중에
        }
      } else if (eventType === 0x80) {
        // Note Off
        offset += 2;
      } else if (eventType === 0xA0 || eventType === 0xB0 || eventType === 0xE0) {
        // Aftertouch, Control Change, Pitch Bend (2 data bytes)
        offset += 2;
      } else if (eventType === 0xC0 || eventType === 0xD0) {
        // Program Change, Channel Pressure (1 data byte)
        offset += 1;
      } else if (data[offset - 1] === 0xFF) {
        // Meta 이벤트
        offset += 1;
        const [metaLen, metaBytes] = readVarLen(data, offset);
        offset += metaBytes + metaLen;
      } else if (data[offset - 1] === 0xF0 || data[offset - 1] === 0xF7) {
        // SysEx
        const [sysexLen, sysexBytes] = readVarLen(data, offset);
        offset += sysexBytes + sysexLen;
      } else {
        // 알 수 없는 이벤트 - 1바이트 스킵
        offset += 1;
      }
    }

    offset = Math.max(offset, 8 + trackLen); // 다음 청크로 이동
    // 이미 8 더했으니 trackLen만큼 더
  }

  return pitches;
}

// ─── 스케일 탐지 알고리즘 ────────────────────────────────────

/**
 * 피치 클래스 카운트 배열을 스케일과 매칭합니다.
 */
function detectScales(pitchClassCounts: number[]): MidiScaleMatch[] {
  const notes = MUSIC_DATA.notes as string[];
  const totalNoteCount = pitchClassCounts.reduce((a, b) => a + b, 0);
  if (totalNoteCount === 0) return [];

  const results: MidiScaleMatch[] = [];

  const allScales: Array<{ name: string; intervals: number[]; category: 'major' | 'minor' }> = [
    ...Object.entries(MUSIC_DATA.majorScales as Record<string, number[]>).map(([name, intervals]) => ({
      name, intervals, category: 'major' as const
    })),
    ...Object.entries(MUSIC_DATA.minorScales as Record<string, number[]>).map(([name, intervals]) => ({
      name, intervals, category: 'minor' as const
    })),
  ];

  // 실제로 연주된 피치 클래스 수
  const playedPitchClasses = pitchClassCounts.filter(c => c > 0).length;

  for (let root = 0; root < 12; root++) {
    for (const { name, intervals, category } of allScales) {
      const scaleNotes = new Set(intervals.map(i => (root + i) % 12));

      // Purity: 연주된 음 중 스케일에 속하는 비율 (가중치: 등장 횟수)
      let inScaleCount = 0;
      let outScaleCount = 0;
      for (let pc = 0; pc < 12; pc++) {
        if (scaleNotes.has(pc)) {
          inScaleCount += pitchClassCounts[pc];
        } else {
          outScaleCount += pitchClassCounts[pc];
        }
      }
      const purityScore = Math.round((inScaleCount / totalNoteCount) * 100);

      // Coverage: 스케일 음 중 실제 연주된 비율
      const playedInScale = intervals.filter(i => pitchClassCounts[(root + i) % 12] > 0).length;
      const coverageScore = Math.round((playedInScale / intervals.length) * 100);

      // 스케일 외 음이 너무 많으면 패널티 적용
      const outsideRatio = outScaleCount / totalNoteCount;
      const penaltyFactor = outsideRatio > 0.3 ? 0.5 : 1.0;

      // 루트음이 많이 등장할수록 해당 스케일 점수 높임
      const maxCount = Math.max(...pitchClassCounts);
      const rootFactor = maxCount > 0 ? pitchClassCounts[root] / maxCount : 0;
      const rootScore = Math.round(rootFactor * 100);

      const coverageWeight = playedPitchClasses >= 4 ? 0.2 : 0.1;
      const purityWeight = 0.5;
      const rootWeight = 0.3;

      const rawConfidence = (purityScore * purityWeight + coverageScore * coverageWeight + rootScore * rootWeight) * penaltyFactor;
      const confidence = Math.min(100, Math.round(rawConfidence));

      results.push({
        rootNote: notes[root],
        rootIndex: root,
        scaleName: name,
        category,
        purityScore,
        coverageScore,
        confidence,
      });
    }
  }

  // 신뢰도 내림차순 정렬
  results.sort((a, b) => {
    if (b.confidence !== a.confidence) return b.confidence - a.confidence;
    // 동점이면 음수 (스케일 외 음) 적은 쪽 우선
    return b.purityScore - a.purityScore;
  });

  return results.slice(0, 20);
}

// ─── 공개 API ────────────────────────────────────────────────

/**
 * MIDI 파일을 분석하여 스케일을 탐지합니다.
 * @param file - 사용자가 업로드한 .mid / .midi 파일
 */
export async function analyzeMidiFile(file: File): Promise<MidiAnalysisResult> {
  const buffer = await file.arrayBuffer();
  const rawPitches = parseMidiPitches(buffer);

  if (rawPitches.length === 0) {
    throw new Error('MIDI 파일에서 음표를 찾을 수 없습니다.');
  }

  // 피치 클래스별 카운트 (0=C, 1=C#, ... 11=B)
  const pitchClassCounts = new Array<number>(12).fill(0);
  for (const pitch of rawPitches) {
    pitchClassCounts[pitch % 12]++;
  }

  const notes = MUSIC_DATA.notes as string[];
  const maxCount = Math.max(...pitchClassCounts);
  const dominantNoteIdx = pitchClassCounts.indexOf(maxCount);
  const dominantNote = notes[dominantNoteIdx];

  const matches = detectScales(pitchClassCounts);

  return {
    totalNotes: rawPitches.length,
    pitchClassCounts,
    matches,
    dominantNote,
  };
}
