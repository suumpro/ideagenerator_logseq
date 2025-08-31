# 🌱 LogSeq Seed Plugin

질문으로 키우는 아이디어 정원 - LogSeq plugin for idea cultivation through questioning

## ✨ 주요 기능

### 🚀 빠른 캡처
- **단축키 캡처**: `Cmd+Shift+S` (설정 가능)
- **Daily Note 통합**: 자동으로 오늘 일지에 저장
- **태그 시스템**: `#seed/idea`, `#seed/question`, `#seed/project`

### ⏰ 지능형 리마인더
- **무활동 감지**: 4시간 후 자동 알림
- **상황별 질문**: JTBD, 5 Whys, SCAMPER 프레임워크
- **개인화**: 사용자 설정에 따른 맞춤 질문

### 📊 프로젝트 생성
- **자동 템플릿**: 분석 결과 기반 프로젝트 페이지 생성
- **연결 관리**: 관련 아이디어 자동 링크
- **진행 추적**: 단계별 체크리스트

## 📦 설치 방법

1. LogSeq 플러그인 마켓플레이스에서 "Seed" 검색
2. 또는 수동 설치:
   ```bash
   cd /path/to/logseq/plugins
   git clone https://github.com/your-username/logseq-seed.git
   cd logseq-seed
   npm install
   npm run build
   ```

## 🔧 개발 환경 설정

```bash
git clone https://github.com/your-username/logseq-seed.git
cd logseq-seed
npm install
npm run dev  # Watch mode for development
```

## 🎯 사용법

### 1. 아이디어 캡처
- `Cmd+Shift+S` 누르기
- 아이디어 입력 후 Enter
- Daily Note에 자동 저장됨

### 2. 아이디어 발전
- 4시간 후 자동 알림 받기
- 질문에 답변하며 아이디어 구체화
- 블록 우클릭 → "Grow Seed" 선택

### 3. 프로젝트 생성
- 충분히 발전된 아이디어에서 `/Seed Project` 입력
- 자동으로 프로젝트 페이지 생성
- 템플릿 기반 구조화된 계획 수립

## ⚙️ 설정

LogSeq Settings → Plugin Settings → Seed에서 설정 가능:

- **빠른 캡처 단축키**: 기본값 `cmd+shift+s`
- **리마인더 간격**: 기본값 240분 (4시간)
- **자동 그룹핑**: 관련 아이디어 자동 연결
- **질문 프레임워크**: JTBD, FiveWhys, SCAMPER 중 선택

## 🏗️ 아키텍처

```
src/
├── index.ts        # 메인 플러그인 엔트리
├── capture.ts      # 빠른 캡처 시스템
├── reminder.ts     # 리마인더 엔진
├── questions.ts    # 질문 프레임워크
├── templates.ts    # 프로젝트 템플릿
└── export.ts       # 내보내기 기능
```

## 🧪 개발 로드맵

- [x] **Phase 1**: 기본 캡처 & 저장 시스템
- [x] **Phase 2**: 리마인더 & 질문 프레임워크  
- [x] **Phase 3**: 프로젝트 생성 & 문서 자동화
- [ ] **Phase 4**: AI 통합 & 스마트 추천
- [ ] **Phase 5**: 협업 기능 & 공유

## 🤝 기여

Issues와 Pull Requests를 환영합니다!

## 📄 라이선스

MIT License