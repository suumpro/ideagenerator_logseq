import '@logseq/libs';

export interface ValidationFramework {
  name: string;
  description: string;
  tests: ValidationTest[];
  criteria: ValidationCriteria;
}

export interface ValidationTest {
  id: string;
  name: string;
  description: string;
  type: 'survey' | 'interview' | 'prototype' | 'analytics' | 'experiment';
  timeRequired: string;
  sampleSize: string;
  questions: string[];
}

export interface ValidationCriteria {
  threshold: number;
  metrics: string[];
  successConditions: string[];
}

export class ValidationEngine {
  private frameworks: Map<string, ValidationFramework> = new Map();

  constructor() {
    this.initializeFrameworks();
  }

  private initializeFrameworks() {
    // Problem Validation
    this.frameworks.set('ProblemValidation', {
      name: '문제 검증',
      description: '실제 문제가 존재하는지 검증',
      tests: [
        {
          id: 'problem-interview',
          name: '문제 인터뷰',
          description: '타겟 사용자와 문제에 대해 직접 대화',
          type: 'interview',
          timeRequired: '2-3주',
          sampleSize: '5-10명',
          questions: [
            "이런 상황을 겪어본 적이 있나요?",
            "현재 어떻게 해결하고 있나요?",
            "가장 큰 불편함은 무엇인가요?",
            "이상적인 해결책은 어떤 모습일까요?"
          ]
        },
        {
          id: 'pain-survey',
          name: '고통점 설문',
          description: '문제의 심각성과 빈도 측정',
          type: 'survey',
          timeRequired: '1주',
          sampleSize: '50-100명',
          questions: [
            "이 문제를 얼마나 자주 겪나요? (1-5점)",
            "이 문제가 얼마나 심각한가요? (1-5점)",
            "해결을 위해 돈을 낼 의향이 있나요?",
            "현재 해결책에 얼마나 만족하나요?"
          ]
        }
      ],
      criteria: {
        threshold: 70,
        metrics: ['문제 빈도', '심각성', '지불 의향'],
        successConditions: [
          '80% 이상이 문제를 경험',
          '평균 심각성 3.5점 이상',
          '50% 이상이 지불 의향 표시'
        ]
      }
    });

    // Solution Validation
    this.frameworks.set('SolutionValidation', {
      name: '솔루션 검증',
      description: '제안한 솔루션이 문제를 해결하는지 검증',
      tests: [
        {
          id: 'concept-test',
          name: '컨셉 테스트',
          description: '솔루션 아이디어에 대한 초기 반응 측정',
          type: 'survey',
          timeRequired: '1-2주',
          sampleSize: '30-50명',
          questions: [
            "이 솔루션이 문제를 해결할 것 같나요?",
            "기존 해결책과 비교했을 때 어떤가요?",
            "사용해볼 의향이 있나요?",
            "어떤 부분이 가장 매력적인가요?"
          ]
        },
        {
          id: 'prototype-test',
          name: '프로토타입 테스트',
          description: '실제 사용 가능한 버전으로 테스트',
          type: 'prototype',
          timeRequired: '2-4주',
          sampleSize: '10-20명',
          questions: [
            "사용하기 쉬웠나요?",
            "기대했던 결과를 얻었나요?",
            "어떤 기능이 가장 유용했나요?",
            "개선이 필요한 부분은?"
          ]
        }
      ],
      criteria: {
        threshold: 60,
        metrics: ['이해도', '사용 의향', '만족도'],
        successConditions: [
          '70% 이상이 솔루션 이해',
          '60% 이상이 사용 의향 표시',
          '평균 만족도 3.5점 이상'
        ]
      }
    });

    // Market Validation
    this.frameworks.set('MarketValidation', {
      name: '시장 검증',
      description: '시장 기회와 수요 검증',
      tests: [
        {
          id: 'landing-page',
          name: '랜딩 페이지 테스트',
          description: '가짜 제품 페이지로 수요 측정',
          type: 'experiment',
          timeRequired: '1-2주',
          sampleSize: '100-500명',
          questions: [
            "전환율은 어떤가요?",
            "어떤 메시지가 가장 효과적인가요?",
            "타겟 오디언스가 맞나요?"
          ]
        },
        {
          id: 'competitor-analysis',
          name: '경쟁사 분석',
          description: '유사 솔루션들의 성과 분석',
          type: 'analytics',
          timeRequired: '1주',
          sampleSize: '5-10개 제품',
          questions: [
            "직접 경쟁사는 누구인가요?",
            "간접 경쟁사는?",
            "우리의 차별점은?",
            "시장 크기는 어느 정도인가요?"
          ]
        }
      ],
      criteria: {
        threshold: 50,
        metrics: ['시장 크기', '경쟁 강도', '차별화 가능성'],
        successConditions: [
          '충분한 시장 크기 확인',
          '명확한 차별화 요소 존재',
          '경쟁 우위 확보 가능'
        ]
      }
    });
  }

  async createValidationPlan(seedUuid: string): Promise<string> {
    const seedBlock = await logseq.Editor.getBlock(seedUuid);
    const analysis = await this.analyzeValidationNeeds(seedBlock);
    
    const recommendedFrameworks = this.recommendValidationFramework(analysis);
    const plan = await this.generateValidationPlan(seedBlock, recommendedFrameworks);

    const planPageName = `Validation Plan: ${seedBlock.content.replace('#seed/idea', '').trim().slice(0, 30)}`;
    const planPage = await logseq.Editor.createPage(planPageName);

    await logseq.Editor.appendBlockInPage(planPage.name, plan);

    // Link back to original seed
    await logseq.Editor.upsertBlockProperty(seedUuid, 'seed-validation-plan', `[[${planPageName}]]`);
    await logseq.Editor.upsertBlockProperty(seedUuid, 'seed-status', 'validating');

    return planPageName;
  }

  private async analyzeValidationNeeds(seedBlock: any) {
    const content = seedBlock.content.toLowerCase();
    const tree = await logseq.Editor.getBlockTree(seedBlock.uuid);
    
    // Analyze what type of validation is most needed
    const needsProblemValidation = !tree?.children?.some((c: any) => 
      c.content.includes('사용자') || c.content.includes('고객')
    );
    
    const needsSolutionValidation = tree?.children?.some((c: any) => 
      c.content.includes('해결') || c.content.includes('방법')
    );
    
    const needsMarketValidation = tree?.children?.some((c: any) => 
      c.content.includes('비즈니스') || c.content.includes('수익')
    );

    return {
      needsProblemValidation,
      needsSolutionValidation,
      needsMarketValidation,
      maturity: this.assessMaturity(tree),
      riskLevel: this.assessRisk(content)
    };
  }

  private recommendValidationFramework(analysis: any): string[] {
    const recommendations = [];

    if (analysis.needsProblemValidation) {
      recommendations.push('ProblemValidation');
    }
    
    if (analysis.needsSolutionValidation && analysis.maturity > 3) {
      recommendations.push('SolutionValidation');
    }
    
    if (analysis.needsMarketValidation && analysis.maturity > 5) {
      recommendations.push('MarketValidation');
    }

    return recommendations.length > 0 ? recommendations : ['ProblemValidation'];
  }

  private async generateValidationPlan(seedBlock: any, frameworks: string[]): Promise<string> {
    const ideaContent = seedBlock.content.replace('#seed/idea', '').trim();
    
    let plan = `# 🧪 검증 계획: ${ideaContent}

## 📋 검증 개요
**대상 아이디어**: ${ideaContent}
**계획 생성일**: ${new Date().toLocaleDateString('ko-KR')}
**예상 기간**: ${this.estimateTotalTime(frameworks)}
**권장 순서**: ${frameworks.join(' → ')}

---
`;

    for (const frameworkName of frameworks) {
      const framework = this.frameworks.get(frameworkName);
      if (!framework) continue;

      plan += `
## ${framework.name}
${framework.description}

### 📊 성공 기준
${framework.criteria.successConditions.map(condition => `- ${condition}`).join('\n')}

### 🧪 실행할 테스트
${framework.tests.map(test => `
#### ${test.name}
**목적**: ${test.description}
**방법**: ${test.type}
**기간**: ${test.timeRequired}
**대상**: ${test.sampleSize}

**질문 리스트**:
${test.questions.map(q => `- ${q}`).join('\n')}

**체크리스트**:
- [ ] 테스트 설계 완료
- [ ] 참가자 모집
- [ ] 테스트 실행
- [ ] 결과 분석
- [ ] 다음 단계 결정
`).join('\n')}

---
`;
    }

    plan += `
## 📈 진행 상황 추적

### 전체 진행률
- [ ] 검증 계획 수립
- [ ] 첫 번째 테스트 완료
- [ ] 중간 결과 분석
- [ ] 추가 검증 실행
- [ ] 최종 결론 도출

### 의사결정 기준
1. **Go**: 모든 기준 달성 → 다음 단계 진행
2. **Pivot**: 일부 기준 미달 → 아이디어 수정
3. **Stop**: 대부분 기준 미달 → 중단 고려

## 🔄 피드백 루프
각 테스트 후:
1. 결과 기록
2. 가설 업데이트  
3. 다음 테스트 계획 수정
4. 이해관계자 공유

#seed/validation #plan/validation`;

    return plan;
  }

  private estimateTotalTime(frameworks: string[]): string {
    const timeMap = {
      'ProblemValidation': '2-4주',
      'SolutionValidation': '3-5주',
      'MarketValidation': '2-3주'
    };

    if (frameworks.length === 1) {
      return timeMap[frameworks[0]] || '2-3주';
    } else {
      return `${frameworks.length * 3}-${frameworks.length * 5}주 (순차 진행시)`;
    }
  }

  private assessMaturity(tree: any): number {
    if (!tree?.children) return 1;
    
    const questions = tree.children.filter((c: any) => c.content.includes('#seed/question')).length;
    const answers = tree.children.filter((c: any) => c.content.includes('답변:')).length;
    const analyses = tree.children.filter((c: any) => 
      c.content.includes('Analysis') || c.content.includes('분석')
    ).length;

    return Math.min(10, questions + answers + (analyses * 2));
  }

  private assessRisk(content: string): 'low' | 'medium' | 'high' {
    const highRiskWords = ['혁신적', '새로운', '처음', '파괴적'];
    const lowRiskWords = ['개선', '최적화', '효율화', '기존'];

    const hasHighRisk = highRiskWords.some(word => content.includes(word));
    const hasLowRisk = lowRiskWords.some(word => content.includes(word));

    if (hasHighRisk && !hasLowRisk) return 'high';
    if (hasLowRisk && !hasHighRisk) return 'low';
    return 'medium';
  }

  async createTestTemplate(testId: string, seedUuid: string): Promise<string> {
    const allTests = Array.from(this.frameworks.values()).flatMap(f => f.tests);
    const test = allTests.find(t => t.id === testId);
    
    if (!test) {
      throw new Error(`Test template not found: ${testId}`);
    }

    const template = `# 🧪 ${test.name} 실행 계획

## 📋 테스트 개요
**목적**: ${test.description}
**유형**: ${test.type}
**예상 기간**: ${test.timeRequired}
**타겟 샘플**: ${test.sampleSize}

## ❓ 검증할 질문들
${test.questions.map((q, i) => `${i + 1}. ${q}`).join('\n')}

## 📝 실행 계획

### 1단계: 준비 (1-2일)
- [ ] 테스트 설계 상세화
- [ ] 참가자 모집 기준 설정
- [ ] 질문지 또는 인터뷰 가이드 작성
- [ ] 테스트 환경 준비

### 2단계: 모집 (3-5일)
- [ ] 참가자 모집 시작
- [ ] 스크리닝 진행
- [ ] 일정 조율
- [ ] 사전 안내

### 3단계: 실행 (${test.timeRequired})
${test.type === 'interview' ? `
- [ ] 인터뷰 세션 진행
- [ ] 대화 내용 기록
- [ ] 후속 질문 정리
- [ ] 패턴 초기 분석
` : test.type === 'survey' ? `
- [ ] 설문 배포
- [ ] 응답 수집 모니터링
- [ ] 중간 결과 체크
- [ ] 추가 홍보 (필요시)
` : `
- [ ] 테스트 실행
- [ ] 데이터 수집
- [ ] 사용자 행동 관찰
- [ ] 피드백 수집
`}

### 4단계: 분석 (2-3일)
- [ ] 정량 데이터 분석
- [ ] 정성 데이터 패턴 분석
- [ ] 인사이트 도출
- [ ] 다음 단계 결정

## 📊 측정 지표
${test.type === 'survey' ? `
- **응답률**: 목표 ${test.sampleSize}의 80% 이상
- **완료율**: 시작한 응답의 90% 이상 완료
- **점수 평균**: 핵심 질문 3.5점 이상
` : test.type === 'interview' ? `
- **인터뷰 완료**: 목표 ${test.sampleSize} 달성
- **인사이트 수**: 세션당 평균 3개 이상
- **패턴 발견**: 전체의 70% 이상에서 공통 패턴
` : `
- **참여율**: 초대 대비 실제 참여
- **완료율**: 테스트 완주율
- **만족도**: 테스트 경험 만족도
`}

## 🎯 성공/실패 기준
### ✅ 성공 조건
${test.questions.map(q => `- ${q.replace('?', '')}에 대해 긍정적 답변 70% 이상`).join('\n')}

### ❌ 실패 조건  
- 핵심 지표 50% 미만
- 심각한 부정적 피드백 30% 이상
- 기술적/실행적 불가능성 발견

### 🔄 피벗 조건
- 부분적 성공 (50-70%)
- 다른 방향성 제시
- 새로운 기회 발견

## 📝 결과 기록 템플릿

### 정량 결과
- 

### 정성 결과  
- 

### 핵심 인사이트
1. 
2. 
3. 

### 다음 액션
- [ ] 

## 🔗 연결된 시드
- 원본: ((${seedUuid}))

#seed/test #validation/${test.id}`;

    const testPageName = `Test: ${test.name} - ${new Date().toISOString().split('T')[0]}`;
    const testPage = await logseq.Editor.createPage(testPageName);
    await logseq.Editor.appendBlockInPage(testPage.name, template);

    return testPageName;
  }

  async trackValidationProgress(seedUuid: string): Promise<{
    completed: number;
    total: number;
    status: string;
    nextActions: string[];
  }> {
    const seedBlock = await logseq.Editor.getBlock(seedUuid);
    const validationPlan = seedBlock.properties?.['seed-validation-plan'];
    
    if (!validationPlan) {
      return {
        completed: 0,
        total: 0,
        status: 'no-plan',
        nextActions: ['검증 계획 수립하기']
      };
    }

    // Find validation plan page and analyze progress
    const planPageName = validationPlan.replace(/\[\[|\]\]/g, '');
    const planPage = await logseq.Editor.getPage(planPageName);
    
    if (!planPage) {
      return {
        completed: 0,
        total: 0,
        status: 'plan-missing',
        nextActions: ['검증 계획 재생성']
      };
    }

    // Count completed checkboxes in plan
    const blocks = await logseq.Editor.getPageBlocksTree(planPageName);
    const allCheckboxes = this.extractCheckboxes(blocks);
    const completedCheckboxes = allCheckboxes.filter(cb => cb.completed);

    const progress = allCheckboxes.length > 0 ? 
      Math.round((completedCheckboxes.length / allCheckboxes.length) * 100) : 0;

    let status = 'in-progress';
    if (progress === 0) status = 'not-started';
    if (progress === 100) status = 'completed';

    const nextActions = this.generateNextActions(progress, allCheckboxes);

    return {
      completed: completedCheckboxes.length,
      total: allCheckboxes.length,
      status,
      nextActions
    };
  }

  private extractCheckboxes(blocks: any[]): {task: string, completed: boolean}[] {
    const checkboxes: {task: string, completed: boolean}[] = [];
    
    const extractFromBlock = (block: any) => {
      const content = block.content;
      const checkboxRegex = /- \[([ x])\] (.+)/g;
      let match;
      
      while ((match = checkboxRegex.exec(content)) !== null) {
        checkboxes.push({
          task: match[2],
          completed: match[1] === 'x'
        });
      }
      
      if (block.children) {
        block.children.forEach(extractFromBlock);
      }
    };

    blocks.forEach(extractFromBlock);
    return checkboxes;
  }

  private generateNextActions(progress: number, checkboxes: {task: string, completed: boolean}[]): string[] {
    const nextActions = [];
    
    if (progress === 0) {
      nextActions.push('첫 번째 테스트 시작하기');
    } else if (progress < 30) {
      const nextIncomplete = checkboxes.find(cb => !cb.completed);
      if (nextIncomplete) {
        nextActions.push(`진행: ${nextIncomplete.task}`);
      }
    } else if (progress < 70) {
      nextActions.push('중간 결과 분석하기');
      nextActions.push('다음 테스트 준비하기');
    } else if (progress < 100) {
      nextActions.push('최종 테스트 완료하기');
      nextActions.push('전체 결과 종합하기');
    } else {
      nextActions.push('검증 결과 기반 의사결정');
      nextActions.push('다음 단계 계획 수립');
    }

    return nextActions;
  }

  async generateValidationReport(seedUuid: string): Promise<string> {
    const progress = await this.trackValidationProgress(seedUuid);
    const seedBlock = await logseq.Editor.getBlock(seedUuid);
    
    const report = `# 📊 검증 결과 보고서

## 기본 정보
**아이디어**: ${seedBlock.content.replace('#seed/idea', '').trim()}
**보고서 생성**: ${new Date().toLocaleDateString('ko-KR')}
**검증 진행률**: ${Math.round((progress.completed / progress.total) * 100)}%

## 🎯 검증 결과 요약
### 완료된 검증
- 총 ${progress.completed}개 테스트 완료

### 주요 발견사항
- 

### 검증된 가설
- 

### 기각된 가설
- 

## 📋 의사결정 추천
${progress.completed / progress.total > 0.7 ? `
### ✅ Go Decision 권장
검증 결과가 긍정적입니다. 다음 단계로 진행하세요.

**다음 액션**:
- [ ] MVP 기능 정의
- [ ] 개발 계획 수립
- [ ] 리소스 확보
` : progress.completed / progress.total > 0.3 ? `
### 🔄 Pivot 고려
부분적 성공입니다. 방향 수정을 고려해보세요.

**수정 사항**:
- 
- 
- 
` : `
### ❌ Stop 고려
검증 결과가 부정적입니다. 중단을 고려해보세요.

**이유**:
- 
- 
`}

## 🔗 참조
- 원본 시드: ((${seedUuid}))
- 검증 계획: ${seedBlock.properties?.['seed-validation-plan'] || '없음'}

#seed/validation-report #decision/validation`;

    const reportPageName = `Validation Report: ${seedBlock.content.replace('#seed/idea', '').trim().slice(0, 30)}`;
    const reportPage = await logseq.Editor.createPage(reportPageName);
    await logseq.Editor.appendBlockInPage(reportPage.name, report);

    return reportPageName;
  }
}