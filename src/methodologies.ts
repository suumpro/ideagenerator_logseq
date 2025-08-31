import '@logseq/libs';

export interface Methodology {
  name: string;
  description: string;
  stages: string[];
  questions: QuestionSet;
  triggers: string[];
  onComplete?: (answers: string[]) => string;
}

export interface QuestionSet {
  stage: string;
  questions: string[] | ((context: any) => string[]);
  followUp?: (answer: string, context: any) => string[];
}

export class AdvancedMethodologies {
  private methodologies: Map<string, Methodology> = new Map();

  constructor() {
    this.initializeMethodologies();
  }

  private initializeMethodologies() {
    // TRIZ - 창의적 문제 해결
    this.methodologies.set('TRIZ', {
      name: 'TRIZ',
      description: '체계적 혁신 원리를 통한 창의적 문제 해결',
      stages: ['문제정의', '모순발견', '원리적용', '해결책검증'],
      triggers: ['기술적', '혁신', '개선', '최적화', '효율'],
      questions: {
        stage: 'progressive',
        questions: (context) => {
          const stage = context.currentStage || 0;
          const trizQuestions = [
            // Stage 1: 문제 정의
            [
              "해결하려는 핵심 문제는 무엇인가요?",
              "이상적인 결과는 어떤 모습인가요?",
              "현재 시스템의 제약 조건은 무엇인가요?"
            ],
            // Stage 2: 모순 발견
            [
              "개선하려는 요소와 악화되는 요소는 각각 무엇인가요?",
              "두 요구사항이 충돌하는 지점은 어디인가요?",
              "시간, 공간, 조건에 따라 모순이 달라지나요?"
            ],
            // Stage 3: 원리 적용
            [
              "분할/통합으로 해결할 수 있을까요?",
              "비대칭성을 활용할 수 있나요?",
              "중개자나 완충재를 사용할 수 있을까요?"
            ],
            // Stage 4: 검증
            [
              "이 해결책이 원래 문제를 정말 해결하나요?",
              "새로운 문제가 생기지는 않나요?",
              "실행 가능성은 어떤가요?"
            ]
          ];
          return trizQuestions[stage] || trizQuestions[0];
        }
      },
      onComplete: (answers) => `## TRIZ 분석 결과
### 문제 정의
${answers.slice(0, 3).map((a, i) => `${i + 1}. ${a}`).join('\n')}

### 모순 분석
${answers.slice(3, 6).map((a, i) => `${i + 1}. ${a}`).join('\n')}

### 적용 원리
${answers.slice(6, 9).map((a, i) => `${i + 1}. ${a}`).join('\n')}

### 검증 결과
${answers.slice(9, 12).map((a, i) => `${i + 1}. ${a}`).join('\n')}`
    });

    // Double Diamond - 디자인 사고
    this.methodologies.set('DoubleDiamond', {
      name: 'Double Diamond',
      description: '발산-수렴을 통한 체계적 디자인 사고',
      stages: ['Discover', 'Define', 'Develop', 'Deliver'],
      triggers: ['디자인', '사용자', '경험', 'UX', '서비스'],
      questions: {
        stage: 'diamond',
        questions: (context) => {
          const stage = context.currentStage || 0;
          const diamondQuestions = [
            // Discover (발산)
            [
              "사용자는 언제 이 문제를 겪나요?",
              "문제가 발생하는 다양한 상황들은?",
              "현재 사용자들은 어떻게 해결하고 있나요?",
              "숨겨진 니즈는 무엇일까요?"
            ],
            // Define (수렴)
            [
              "핵심 문제를 한 문장으로 정의하면?",
              "가장 중요한 사용자는 누구인가요?",
              "성공 지표를 어떻게 정의할까요?"
            ],
            // Develop (발산)
            [
              "가능한 모든 해결 방법을 나열해보세요",
              "기존과 완전히 다른 접근은?",
              "기술적 제약이 없다면?"
            ],
            // Deliver (수렴)
            [
              "가장 실현 가능한 해결책은?",
              "MVP는 어떻게 정의할까요?",
              "런칭 후 어떻게 측정할까요?"
            ]
          ];
          return diamondQuestions[stage] || diamondQuestions[0];
        }
      }
    });

    // Root Cause Analysis + Fishbone
    this.methodologies.set('RootCause', {
      name: 'Root Cause Analysis',
      description: '근본 원인 분석을 통한 문제 해결',
      stages: ['문제정의', '원인분류', '근본원인', '해결책'],
      triggers: ['문제', '버그', '실패', '개선', '분석'],
      questions: {
        stage: 'fishbone',
        questions: (context) => {
          const stage = context.currentStage || 0;
          const rcaQuestions = [
            // 문제 정의
            [
              "구체적으로 어떤 문제가 발생했나요?",
              "언제, 어디서, 얼마나 자주 발생하나요?",
              "이 문제의 영향은 무엇인가요?"
            ],
            // 원인 분류 (6M)
            [
              "사람(Man) 요인: 누구와 관련된 문제인가요?",
              "방법(Method) 요인: 프로세스상 문제는?",
              "기계(Machine) 요인: 도구나 시스템 문제는?",
              "재료(Material) 요인: 입력 데이터나 자원 문제는?",
              "측정(Measurement) 요인: 지표나 기준 문제는?",
              "환경(Environment) 요인: 외부 환경 요인은?"
            ],
            // 근본 원인
            [
              "가장 근본적인 원인은 무엇인가요?",
              "이 원인을 제거하면 문제가 해결되나요?",
              "다른 숨은 원인은 없나요?"
            ],
            // 해결책
            [
              "근본 원인에 대한 해결책은?",
              "예방 조치는 무엇인가요?",
              "효과를 어떻게 측정할까요?"
            ]
          ];
          return rcaQuestions[stage] || rcaQuestions[0];
        }
      }
    });

    // Lean Startup - Build-Measure-Learn
    this.methodologies.set('LeanStartup', {
      name: 'Lean Startup',
      description: 'Build-Measure-Learn 사이클을 통한 검증',
      stages: ['가설설정', 'MVP정의', '측정설계', '학습계획'],
      triggers: ['스타트업', '검증', '실험', 'MVP', '고객'],
      questions: {
        stage: 'lean',
        questions: (context) => {
          const stage = context.currentStage || 0;
          const leanQuestions = [
            // 가설 설정
            [
              "검증하고 싶은 핵심 가설은 무엇인가요?",
              "고객이 정말 이 문제를 가지고 있을까요?",
              "우리 솔루션이 이 문제를 해결할까요?",
              "고객이 돈을 낼 만큼 가치있을까요?"
            ],
            // MVP 정의
            [
              "가설을 검증하는 최소 기능은?",
              "어떤 기능을 제거해도 될까요?",
              "가장 빠르게 만들 수 있는 버전은?"
            ],
            // 측정 설계
            [
              "성공/실패를 어떻게 측정할까요?",
              "어떤 데이터를 수집해야 하나요?",
              "언제까지 결과를 봐야 하나요?"
            ],
            // 학습 계획
            [
              "가설이 맞다면 다음은 무엇인가요?",
              "가설이 틀렸다면 어떻게 피벗할까요?",
              "이 실험에서 배운 점은?"
            ]
          ];
          return leanQuestions[stage] || leanQuestions[0];
        }
      }
    });

    // Value Proposition Canvas
    this.methodologies.set('ValueProp', {
      name: 'Value Proposition',
      description: '고객 가치 제안 설계',
      stages: ['고객이해', '니즈분석', '가치설계', '적합성검증'],
      triggers: ['가치', '고객', '니즈', '제품', '서비스'],
      questions: {
        stage: 'value',
        questions: (context) => {
          const stage = context.currentStage || 0;
          const valueQuestions = [
            // 고객 이해
            [
              "타겟 고객의 일상은 어떤가요?",
              "그들의 역할과 책임은?",
              "중요하게 생각하는 가치는?"
            ],
            // 니즈 분석
            [
              "고객의 주요 업무(Jobs)는 무엇인가요?",
              "가장 큰 고통점(Pains)은?",
              "바라는 이득(Gains)은?"
            ],
            // 가치 설계
            [
              "우리 제품이 어떤 업무를 도와주나요?",
              "어떤 고통을 덜어주나요?",
              "어떤 이득을 만들어주나요?"
            ],
            // 적합성 검증
            [
              "우리 가치 제안이 고객 니즈와 맞나요?",
              "가장 중요한 가치 요소는?",
              "경쟁 우위는 무엇인가요?"
            ]
          ];
          return valueQuestions[stage] || valueQuestions[0];
        }
      }
    });
  }

  getMethodologyForContext(content: string, existingAnalysis?: any): string {
    const lowerContent = content.toLowerCase();
    
    // 키워드 기반 방법론 추천
    for (const [name, methodology] of this.methodologies) {
      const hasKeyword = methodology.triggers.some(trigger => 
        lowerContent.includes(trigger)
      );
      if (hasKeyword) return name;
    }

    // 기존 분석 기반 추천
    if (existingAnalysis?.jtbd) return 'ValueProp';
    if (existingAnalysis?.problems) return 'RootCause';
    
    // 디폴트는 Double Diamond (범용성)
    return 'DoubleDiamond';
  }

  getMethodology(name: string): Methodology | undefined {
    return this.methodologies.get(name);
  }

  getAllMethodologies(): Methodology[] {
    return Array.from(this.methodologies.values());
  }

  async suggestNextMethodology(currentMethod: string, seedBlock: any): Promise<string[]> {
    const suggestions: string[] = [];
    
    // 현재 방법론에 따른 추천
    switch (currentMethod) {
      case 'JTBD':
        suggestions.push('ValueProp', 'LeanStartup');
        break;
      case 'TRIZ':
        suggestions.push('RootCause', 'DoubleDiamond');
        break;
      case 'DoubleDiamond':
        suggestions.push('LeanStartup', 'ValueProp');
        break;
      case 'RootCause':
        suggestions.push('TRIZ', 'LeanStartup');
        break;
      case 'LeanStartup':
        suggestions.push('ValueProp', 'TRIZ');
        break;
      case 'ValueProp':
        suggestions.push('DoubleDiamond', 'LeanStartup');
        break;
    }

    // 시드 내용 기반 추가 추천
    const content = seedBlock.content.toLowerCase();
    if (content.includes('문제') && !suggestions.includes('RootCause')) {
      suggestions.push('RootCause');
    }
    if (content.includes('사용자') && !suggestions.includes('DoubleDiamond')) {
      suggestions.push('DoubleDiamond');
    }

    return suggestions.slice(0, 2); // 최대 2개 추천
  }

  createHybridApproach(methodologies: string[]): Methodology {
    const selectedMethods = methodologies.map(name => this.methodologies.get(name))
                                        .filter(Boolean) as Methodology[];
    
    return {
      name: `Hybrid: ${methodologies.join(' + ')}`,
      description: `${selectedMethods.map(m => m.description).join(' + ')}`,
      stages: selectedMethods.flatMap(m => m.stages),
      triggers: selectedMethods.flatMap(m => m.triggers),
      questions: {
        stage: 'hybrid',
        questions: (context) => {
          // 단계별로 다른 방법론 질문 사용
          const stage = context.currentStage || 0;
          const methodIndex = stage % selectedMethods.length;
          const method = selectedMethods[methodIndex];
          
          if (typeof method.questions.questions === 'function') {
            return method.questions.questions(context);
          }
          return method.questions.questions as string[];
        }
      }
    };
  }
}

export class QuantityToQuality {
  private ideaThreshold = 5; // 5개 아이디어마다 질적 분석
  private questionThreshold = 10; // 10개 질문답변마다 종합

  async checkForQualityUpgrade(seedUuid: string): Promise<boolean> {
    const seedBlock = await logseq.Editor.getBlock(seedUuid);
    const children = await logseq.Editor.getBlockTree(seedUuid);
    
    if (!children?.children) return false;

    const ideas = children.children.filter(c => c.content.includes('#seed/idea'));
    const questions = children.children.filter(c => c.content.includes('#seed/question'));
    
    // 아이디어 수량 체크
    if (ideas.length >= this.ideaThreshold) {
      await this.triggerIdeaCluster(seedUuid, ideas);
      return true;
    }

    // 질문답변 수량 체크  
    if (questions.length >= this.questionThreshold) {
      await this.triggerDeepAnalysis(seedUuid, questions);
      return true;
    }

    return false;
  }

  private async triggerIdeaCluster(parentUuid: string, ideas: any[]) {
    // 아이디어들을 주제별로 클러스터링
    const clusters = await this.clusterIdeas(ideas);
    
    // 클러스터별 요약 생성
    for (const [theme, clusterIdeas] of Object.entries(clusters)) {
      await logseq.Editor.insertBlock(
        parentUuid,
        `## 💡 ${theme} 관련 아이디어들`,
        { sibling: false }
      );

      for (const idea of clusterIdeas) {
        await logseq.Editor.insertBlock(
          parentUuid,
          `- ((${idea.uuid}))`,
          { sibling: false }
        );
      }
      
      // 종합 질문 추가
      await logseq.Editor.insertBlock(
        parentUuid,
        `#seed/question 이 ${theme} 아이디어들의 공통점은 무엇인가요?`,
        { sibling: false }
      );
    }

    await logseq.Editor.upsertBlockProperty(parentUuid, 'seed-clustered', 'true');
    logseq.UI.showMsg(`💡 ${Object.keys(clusters).length}개 주제로 아이디어가 정리되었습니다!`, 'success');
  }

  private async triggerDeepAnalysis(parentUuid: string, questions: any[]) {
    // 질문답변들을 분석해서 패턴 찾기
    const patterns = await this.analyzeQuestionPatterns(questions);
    
    await logseq.Editor.insertBlock(
      parentUuid,
      `## 🔍 심화 분석 결과
### 발견된 패턴
${patterns.themes.map(theme => `- ${theme}`).join('\n')}

### 미해결 영역
${patterns.gaps.map(gap => `- ${gap}`).join('\n')}

### 다음 단계 제안
${patterns.nextSteps.map(step => `- [ ] ${step}`).join('\n')}`,
      { sibling: false }
    );

    await logseq.Editor.upsertBlockProperty(parentUuid, 'seed-deep-analyzed', 'true');
  }

  private async clusterIdeas(ideas: any[]): Promise<Record<string, any[]>> {
    // 간단한 키워드 기반 클러스터링
    const clusters: Record<string, any[]> = {};
    
    for (const idea of ideas) {
      const keywords = this.extractKeywords(idea.content);
      const primaryKeyword = keywords[0] || '기타';
      
      if (!clusters[primaryKeyword]) {
        clusters[primaryKeyword] = [];
      }
      clusters[primaryKeyword].push(idea);
    }

    return clusters;
  }

  private async analyzeQuestionPatterns(questions: any[]): Promise<{
    themes: string[];
    gaps: string[];
    nextSteps: string[];
  }> {
    // 질문 답변에서 패턴 분석 (향후 AI로 고도화)
    const themes = ['사용자 중심 사고', '기술적 실현가능성', '비즈니스 가치'];
    const gaps = ['구체적 검증 방법', '경쟁사 분석', '수익 모델'];
    const nextSteps = ['프로토타입 제작', '사용자 인터뷰', '시장 조사'];

    return { themes, gaps, nextSteps };
  }

  private extractKeywords(content: string): string[] {
    return content
      .replace(/#\w+/g, '')
      .replace(/[^\w\s가-힣]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2)
      .slice(0, 3);
  }

  async generateProgressReport(seedUuid: string): Promise<string> {
    const seedBlock = await logseq.Editor.getBlock(seedUuid);
    const tree = await logseq.Editor.getBlockTree(seedUuid);
    
    if (!tree?.children) return "진행 상황을 파악할 수 없습니다.";

    const metrics = {
      totalBlocks: tree.children.length,
      ideas: tree.children.filter(c => c.content.includes('#seed/idea')).length,
      questions: tree.children.filter(c => c.content.includes('#seed/question')).length,
      answers: tree.children.filter(c => c.content.includes('답변:')).length,
      methodologies: new Set(tree.children
        .filter(c => c.properties?.['seed-question-type'])
        .map(c => c.properties['seed-question-type'])
      ).size
    };

    const completeness = Math.min(100, Math.floor(
      (metrics.answers / Math.max(1, metrics.questions)) * 100
    ));

    return `## 📊 진행 상황 (${completeness}% 완성)
- **아이디어**: ${metrics.ideas}개
- **질문**: ${metrics.questions}개  
- **답변**: ${metrics.answers}개
- **적용 방법론**: ${metrics.methodologies}개

### 다음 추천 작업
${completeness < 50 ? '- 더 많은 질문에 답변하기' : ''}
${metrics.ideas >= 5 ? '- 아이디어 클러스터링 진행' : ''}
${completeness >= 70 ? '- 프로젝트 페이지 생성 고려' : ''}`;
  }
}