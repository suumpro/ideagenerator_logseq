# 🛠️ Development Guide

## 📋 개발 계획 요약

LogSeq Seed 플러그인은 3단계로 개발됩니다:

### Phase 1: 기본 캡처 시스템 ✅
- [x] 키보드 단축키 캡처 (`Cmd+Shift+S`)
- [x] Daily Note 자동 통합
- [x] `#seed` 태그 시스템
- [x] 기본 속성 관리 (`seed-status`, `seed-stage`)

### Phase 2: 리마인더 & 질문 시스템 ✅
- [x] 4시간 무활동 감지
- [x] 팝업 알림 시스템
- [x] JTBD 3문 자동화
- [x] 5 Whys 체인
- [x] SCAMPER 창의적 사고

### Phase 3: 문서 자동화 ✅
- [x] 프로젝트 템플릿 자동 생성
- [x] 블록 자동 연결
- [x] 진행률 트래킹
- [x] Markdown/JSON 내보내기

## 🏗️ 아키텍처 상세

### 핵심 모듈
1. **QuickCapture** (`src/capture.ts`)
   - 키보드 단축키 처리
   - Daily Note 통합
   - 시드 블록 생성 및 속성 설정

2. **ReminderEngine** (`src/reminder.ts`)
   - 주기적 무활동 감지
   - 상황별 질문 생성
   - 리마인더 스케줄링

3. **QuestionFramework** (`src/questions.ts`)
   - JTBD, 5 Whys, SCAMPER 구현
   - 질문 체인 관리
   - 답변 분석 및 다음 단계 제안

4. **ProjectTemplates** (`src/templates.ts`)
   - 프로젝트 페이지 자동 생성
   - Canvas 템플릿
   - 상태 보고서 생성

5. **SeedExporter** (`src/export.ts`)
   - Markdown 내보내기
   - JSON 백업
   - 정원 개요 생성

### 데이터 모델

```typescript
// Seed Block Properties
{
  'seed-status': 'captured' | 'prompted' | 'questioning' | 'developed' | 'project'
  'seed-stage': 'discover' | 'define' | 'develop' | 'deliver'
  'seed-created': ISO timestamp
  'seed-last-activity': ISO timestamp
  'seed-framework': 'JTBD' | 'FiveWhys' | 'SCAMPER'
  'seed-project-page': '[[Project Page Name]]'
}
```

## 🚀 빌드 & 실행

### 개발 환경
```bash
npm install
npm run dev    # Watch mode
```

### 프로덕션 빌드
```bash
npm run build  # Creates dist/index.js
```

### 테스트
```bash
npm run lint   # ESLint 검사
npm test       # Jest 테스트 (TODO)
```

## 🔧 LogSeq 플러그인 통합

### 플러그인 로딩
```javascript
// LogSeq Plugin API 사용
logseq.ready(main).catch(console.error);
```

### 주요 API 활용
- `logseq.App.registerCommandPalette()` - 명령어 팔레트
- `logseq.Editor.insertBlock()` - 블록 생성
- `logseq.DB.q()` - DataScript 쿼리
- `logseq.UI.showMsg()` - 알림 표시

## 🎯 다음 개발 계획

### Phase 4: AI 통합 (예정)
- OpenAI/Claude API 연동
- 스마트 질문 생성
- 아이디어 자동 분류
- 유사도 기반 추천

### Phase 5: 협업 기능 (예정)
- 팀 워크스페이스
- 아이디어 공유
- 피드백 시스템
- 투표 및 우선순위

## 🐛 알려진 이슈

1. **타이머 정확도**: 브라우저 백그라운드에서 setTimeout 제한
   - **해결방안**: Service Worker 또는 LogSeq 자체 스케줄러 활용

2. **검색 성능**: 대량 시드 데이터에서 쿼리 속도
   - **해결방안**: 인덱싱 및 캐싱 전략

3. **모바일 호환성**: 키보드 단축키 제한
   - **해결방안**: 터치 제스처 및 음성 입력 추가

## 📚 참고 자료

- [LogSeq Plugin API](https://plugins-doc.logseq.com/)
- [Jobs-to-be-Done Framework](https://hbr.org/2016/09/know-your-customers-jobs-to-be-done)
- [Five Whys Technique](https://en.wikipedia.org/wiki/Five_whys)
- [SCAMPER Method](https://en.wikipedia.org/wiki/SCAMPER)