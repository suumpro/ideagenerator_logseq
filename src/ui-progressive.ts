import '@logseq/libs';

export class ProgressiveDisclosureUI {
  private readonly COMPLEXITY_LEVELS = {
    BEGINNER: 'beginner',
    INTERMEDIATE: 'intermediate', 
    ADVANCED: 'advanced'
  };

  async showMethodologySelector(seedUuid: string) {
    const userLevel = await this.detectUserLevel(seedUuid);
    const methodologies = this.getMethodologiesForLevel(userLevel);

    const selectorHTML = `
      <div id="methodology-selector" style="padding: 20px; max-width: 400px;">
        <h3>🧠 분석 방법 선택</h3>
        <p>아이디어를 어떻게 발전시킬까요?</p>
        
        ${methodologies.map(method => `
          <div class="method-option" style="margin: 10px 0; padding: 10px; border: 1px solid #ddd; border-radius: 5px; cursor: pointer;" 
               data-method="${method.id}" onclick="selectMethodology('${method.id}')">
            <div style="font-weight: bold;">${method.icon} ${method.name}</div>
            <div style="font-size: 0.9em; color: #666;">${method.description}</div>
            <div style="font-size: 0.8em; color: #999;">⏱️ ${method.timeEstimate}</div>
          </div>
        `).join('')}
        
        ${userLevel !== this.COMPLEXITY_LEVELS.ADVANCED ? `
          <details style="margin-top: 15px;">
            <summary style="cursor: pointer; color: #0066cc;">🔧 고급 옵션 보기</summary>
            <div style="margin-top: 10px;">
              ${this.getAdvancedOptions().map(option => `
                <div class="method-option" style="margin: 5px 0; padding: 8px; border: 1px solid #eee; border-radius: 3px; cursor: pointer;"
                     data-method="${option.id}" onclick="selectMethodology('${option.id}')">
                  <span style="font-weight: bold;">${option.name}</span>
                  <span style="font-size: 0.8em; color: #666;"> - ${option.description}</span>
                </div>
              `).join('')}
            </div>
          </details>
        ` : ''}
        
        <div style="margin-top: 15px; text-align: center;">
          <button onclick="createHybridApproach()" style="background: #f0f0f0; border: 1px solid #ccc; padding: 8px 16px; border-radius: 4px; cursor: pointer;">
            🔗 방법론 조합하기
          </button>
        </div>
      </div>
    `;

    await logseq.provideUI({
      key: 'methodology-selector',
      template: selectorHTML,
      style: {
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        background: 'white',
        'box-shadow': '0 4px 20px rgba(0,0,0,0.1)',
        'border-radius': '8px',
        'z-index': 1000
      }
    });

    // Register event handlers
    logseq.provideModel({
      selectMethodology: async (methodId: string) => {
        await this.startSelectedMethodology(seedUuid, methodId);
        logseq.hideMainUI();
      },
      createHybridApproach: () => {
        this.showHybridSelector(seedUuid);
      }
    });

    logseq.showMainUI();
  }

  private async detectUserLevel(_seedUuid: string): Promise<string> {
    // Analyze user's question answering patterns and complexity
    const userSeeds = await logseq.DB.q(`
      [:find (pull ?b [*])
       :where 
       [?b :block/properties ?props]
       [(get ?props :seed-status) ?status]]
    `);

    const totalSeeds = userSeeds.length;
    const completedAnalyses = userSeeds.filter(s => 
      s.properties?.['seed-analysis']
    ).length;

    const advancedMethodsUsed = new Set(
      userSeeds
        .map(s => s.properties?.['seed-methodology'])
        .filter(Boolean)
    ).size;

    // Scoring logic
    if (totalSeeds < 3) return this.COMPLEXITY_LEVELS.BEGINNER;
    if (completedAnalyses > 3 && advancedMethodsUsed > 1) return this.COMPLEXITY_LEVELS.ADVANCED;
    return this.COMPLEXITY_LEVELS.INTERMEDIATE;
  }

  private getMethodologiesForLevel(level: string) {
    const base = [
      {
        id: 'JTBD',
        name: 'Jobs to be Done',
        icon: '🎯',
        description: '사용자 관점에서 문제 이해',
        timeEstimate: '5분'
      },
      {
        id: 'FiveWhys',
        name: '5 Whys',
        icon: '🤔',
        description: '근본 원인 찾기',
        timeEstimate: '7분'
      }
    ];

    const intermediate = [
      ...base,
      {
        id: 'DoubleDiamond',
        name: 'Double Diamond',
        icon: '💎',
        description: '체계적 디자인 사고',
        timeEstimate: '15분'
      },
      {
        id: 'LeanStartup',
        name: 'Lean Startup',
        icon: '🚀',
        description: '가설 검증 중심',
        timeEstimate: '12분'
      }
    ];

    const advanced = [
      ...intermediate,
      {
        id: 'TRIZ',
        name: 'TRIZ',
        icon: '⚡',
        description: '혁신 원리 기반 문제 해결',
        timeEstimate: '20분'
      },
      {
        id: 'ValueProp',
        name: 'Value Proposition',
        icon: '💰',
        description: '고객 가치 제안 설계',
        timeEstimate: '18분'
      }
    ];

    switch (level) {
      case this.COMPLEXITY_LEVELS.BEGINNER: return base;
      case this.COMPLEXITY_LEVELS.INTERMEDIATE: return intermediate;
      case this.COMPLEXITY_LEVELS.ADVANCED: return advanced;
      default: return base;
    }
  }

  private getAdvancedOptions() {
    return [
      {
        id: 'TRIZ',
        name: 'TRIZ',
        description: '체계적 혁신 원리'
      },
      {
        id: 'RootCause',
        name: 'Root Cause Analysis',
        description: '근본 원인 분석'
      },
      {
        id: 'ValueProp',
        name: 'Value Proposition',
        description: '가치 제안 설계'
      }
    ];
  }

  private async startSelectedMethodology(seedUuid: string, methodId: string) {
    const { QuestionFramework } = await import('./questions');
    const questionFramework = new QuestionFramework();
    
    // Update settings temporarily for this session
    const originalSetting = logseq.settings?.questionFramework;
    await logseq.updateSettings({ questionFramework: methodId });
    
    const block = await logseq.Editor.getBlock(seedUuid);
    await questionFramework.startQuestionFlow(block);
    
    // Restore original setting
    if (originalSetting) {
      await logseq.updateSettings({ questionFramework: originalSetting });
    }
  }

  private async showHybridSelector(seedUuid: string) {
    const allMethods = this.getMethodologiesForLevel(this.COMPLEXITY_LEVELS.ADVANCED);
    
    const hybridHTML = `
      <div id="hybrid-selector" style="padding: 20px; max-width: 500px;">
        <h3>🔗 방법론 조합</h3>
        <p>2-3개 방법론을 선택해서 조합해보세요:</p>
        
        <div id="method-checkboxes">
          ${allMethods.map(method => `
            <label style="display: block; margin: 8px 0; cursor: pointer;">
              <input type="checkbox" value="${method.id}" style="margin-right: 8px;">
              ${method.icon} ${method.name} - ${method.description}
            </label>
          `).join('')}
        </div>
        
        <div style="margin-top: 15px; text-align: center;">
          <button onclick="createHybrid()" style="background: #0066cc; color: white; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer;">
            조합 만들기
          </button>
          <button onclick="cancelHybrid()" style="background: #ccc; color: black; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer; margin-left: 10px;">
            취소
          </button>
        </div>
      </div>
    `;

    await logseq.provideUI({
      key: 'hybrid-selector',
      template: hybridHTML
    });

    logseq.provideModel({
      createHybrid: async () => {
        const checkboxes = document.querySelectorAll('#method-checkboxes input:checked');
        const selectedMethods = Array.from(checkboxes).map((cb: any) => cb.value);
        
        if (selectedMethods.length < 2) {
          logseq.UI.showMsg('최소 2개 방법론을 선택해주세요.', 'warning');
          return;
        }

        await this.createHybridMethodology(seedUuid, selectedMethods);
        logseq.hideMainUI();
      },
      cancelHybrid: () => {
        logseq.hideMainUI();
      }
    });

    logseq.showMainUI();
  }

  private async createHybridMethodology(seedUuid: string, methodIds: string[]) {
    const { AdvancedMethodologies } = await import('./methodologies');
    const methodologies = new AdvancedMethodologies();
    
    const hybridMethod = methodologies.createHybridApproach(methodIds);
    
    // Start hybrid questioning
    const block = await logseq.Editor.getBlock(seedUuid);
    await logseq.Editor.upsertBlockProperty(block.uuid, 'seed-methodology', hybridMethod.name);
    
    logseq.UI.showMsg(
      `🔗 ${hybridMethod.name} 조합이 시작됩니다!`,
      'success'
    );

    // Start the hybrid flow (simplified for now)
    const { QuestionFramework } = await import('./questions');
    const questionFramework = new QuestionFramework();
    await questionFramework.startQuestionFlow(block);
  }

  async showProgressDashboard(seedUuid?: string) {
    const allSeeds = await this.getAllSeeds();
    const stats = this.calculateStats(allSeeds);
    
    const dashboardHTML = `
      <div id="seed-dashboard" style="padding: 20px; max-width: 600px; max-height: 80vh; overflow-y: auto;">
        <h2>🌱 Seed Dashboard</h2>
        
        <div class="stats-grid" style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin: 20px 0;">
          <div class="stat-card" style="padding: 15px; background: #f8f9fa; border-radius: 8px; text-align: center;">
            <div style="font-size: 2em;">${stats.total}</div>
            <div>총 아이디어</div>
          </div>
          <div class="stat-card" style="padding: 15px; background: #e8f5e8; border-radius: 8px; text-align: center;">
            <div style="font-size: 2em;">${stats.developed}</div>
            <div>발전된 아이디어</div>
          </div>
          <div class="stat-card" style="padding: 15px; background: #e3f2fd; border-radius: 8px; text-align: center;">
            <div style="font-size: 2em;">${stats.projects}</div>
            <div>프로젝트</div>
          </div>
          <div class="stat-card" style="padding: 15px; background: #fff3e0; border-radius: 8px; text-align: center;">
            <div style="font-size: 2em;">${stats.clusters}</div>
            <div>클러스터</div>
          </div>
        </div>

        <div class="progress-section" style="margin: 20px 0;">
          <h3>📊 발전 단계별 분포</h3>
          <div class="progress-bar" style="background: #f0f0f0; border-radius: 10px; overflow: hidden;">
            <div style="display: flex; height: 30px;">
              <div style="background: #ff9800; width: ${(stats.captured/stats.total)*100}%; display: flex; align-items: center; justify-content: center; color: white; font-size: 0.8em;">
                캡처됨 ${stats.captured}
              </div>
              <div style="background: #2196f3; width: ${(stats.questioning/stats.total)*100}%; display: flex; align-items: center; justify-content: center; color: white; font-size: 0.8em;">
                질문중 ${stats.questioning}
              </div>
              <div style="background: #4caf50; width: ${(stats.developed/stats.total)*100}%; display: flex; align-items: center; justify-content: center; color: white; font-size: 0.8em;">
                발전됨 ${stats.developed}
              </div>
            </div>
          </div>
        </div>

        <div class="actions-section" style="margin: 20px 0;">
          <h3>🚀 추천 액션</h3>
          ${this.generateActionRecommendations(stats).map(action => `
            <button onclick="executeAction('${action.id}')" 
                    style="display: block; width: 100%; margin: 5px 0; padding: 10px; background: ${action.color}; color: white; border: none; border-radius: 4px; cursor: pointer;">
              ${action.icon} ${action.title}
            </button>
          `).join('')}
        </div>

        <div class="recent-activity" style="margin: 20px 0;">
          <h3>⏰ 최근 활동</h3>
          <div style="max-height: 200px; overflow-y: auto;">
            {{query (and (tag #seed) (between [[3 days ago]] [[tomorrow]]))}}
          </div>
        </div>
      </div>
    `;

    await logseq.provideUI({
      key: 'seed-dashboard',
      template: dashboardHTML
    });

    logseq.provideModel({
      executeAction: async (actionId: string) => {
        await this.executeRecommendedAction(actionId, seedUuid);
      }
    });

    logseq.showMainUI();
  }

  private async getAllSeeds() {
    return await logseq.DB.q(`
      [:find (pull ?b [*])
       :where 
       [?b :block/properties ?props]
       [(get ?props :seed-status) ?status]]
    `);
  }

  private calculateStats(seeds: any[]) {
    const total = seeds.length;
    const captured = seeds.filter(s => s.properties?.['seed-status'] === 'captured').length;
    const questioning = seeds.filter(s => s.properties?.['seed-status'] === 'questioning').length;
    const developed = seeds.filter(s => s.properties?.['seed-status'] === 'developed').length;
    const projects = seeds.filter(s => s.properties?.['seed-status'] === 'project').length;
    
    // Estimate clusters (simplified)
    const clusters = Math.floor(total / 5);

    return { total, captured, questioning, developed, projects, clusters };
  }

  private generateActionRecommendations(stats: any) {
    const actions = [];

    if (stats.captured > 3) {
      actions.push({
        id: 'cluster-ideas',
        title: '아이디어 클러스터링 실행',
        icon: '🔗',
        color: '#2196f3'
      });
    }

    if (stats.questioning > 0) {
      actions.push({
        id: 'continue-questioning',
        title: '미완료 질문 계속하기',
        icon: '❓',
        color: '#ff9800'
      });
    }

    if (stats.developed > 1) {
      actions.push({
        id: 'create-project',
        title: '프로젝트 생성하기',
        icon: '🚀',
        color: '#4caf50'
      });
    }

    if (stats.total > 10) {
      actions.push({
        id: 'generate-report',
        title: '전체 보고서 생성',
        icon: '📊',
        color: '#9c27b0'
      });
    }

    // Always available actions
    actions.push({
      id: 'quick-capture',
      title: '새 아이디어 캡처',
      icon: '➕',
      color: '#607d8b'
    });

    return actions;
  }

  private async executeRecommendedAction(actionId: string, seedUuid?: string) {
    switch (actionId) {
      case 'cluster-ideas': {
        const { IdeaClustering } = await import('./clustering');
        const clustering = new IdeaClustering();
        await clustering.generateClusterMap();
        break;
      }

      case 'continue-questioning':
        await this.findAndContinueQuestioning();
        break;

      case 'create-project': {
        if (seedUuid) {
          const { ProjectTemplates } = await import('./templates');
          const templates = new ProjectTemplates();
          await templates.createProjectFromSeed(seedUuid);
        }
        break;
      }

      case 'generate-report': {
        const { SeedExporter } = await import('./export');
        const exporter = new SeedExporter();
        await exporter.exportGardenOverview();
        break;
      }

      case 'quick-capture': {
        const { QuickCapture } = await import('./capture');
        const capture = new QuickCapture();
        await capture.showCaptureDialog();
        break;
      }
    }

    logseq.hideMainUI();
  }

  private async findAndContinueQuestioning() {
    const questioningSeeds = await logseq.DB.q(`
      [:find (pull ?b [*])
       :where 
       [?b :block/properties ?props]
       [(get ?props :seed-status) "questioning"]]
    `);

    if (questioningSeeds.length > 0) {
      const seed = questioningSeeds[0];
      await logseq.Editor.scrollToBlockInPage(seed.page.name, seed.uuid);
      logseq.UI.showMsg('🔄 질문 진행을 계속해보세요!', 'info');
    } else {
      logseq.UI.showMsg('진행 중인 질문이 없습니다.', 'info');
    }
  }

  async showSmartSuggestions(seedUuid: string) {
    const block = await logseq.Editor.getBlock(seedUuid);
    const tree = await logseq.Editor.getBlockTree(seedUuid);
    
    // Analyze current state and suggest next best action
    const analysis = this.analyzeCurrentState(block, tree);
    const suggestions = this.generateSmartSuggestions(analysis);

    const suggestionsHTML = `
      <div style="padding: 15px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 8px; margin: 10px 0;">
        <h4 style="margin: 0 0 10px 0;">🧠 AI 추천</h4>
        <div style="font-size: 0.9em; opacity: 0.9;">${analysis.insight}</div>
      </div>
      
      <div class="suggestions">
        ${suggestions.map(suggestion => `
          <div onclick="executeSuggestion('${suggestion.id}')" 
               style="padding: 12px; margin: 8px 0; background: white; border: 1px solid #ddd; border-radius: 6px; cursor: pointer; transition: all 0.2s;">
            <div style="font-weight: bold;">${suggestion.icon} ${suggestion.title}</div>
            <div style="font-size: 0.8em; color: #666; margin-top: 4px;">${suggestion.description}</div>
            <div style="font-size: 0.7em; color: #999; margin-top: 4px;">예상 시간: ${suggestion.timeEstimate}</div>
          </div>
        `).join('')}
      </div>
    `;

    await logseq.Editor.insertBlock(
      seedUuid,
      `## 🤖 스마트 추천
${suggestionsHTML}

#seed/suggestions`,
      { sibling: false }
    );
  }

  private analyzeCurrentState(block: any, tree: any) {
    const status = block.properties?.['seed-status'] || 'captured';
    const hasQuestions = tree?.children?.some((c: any) => c.content.includes('#seed/question'));
    const answerCount = tree?.children?.filter((c: any) => c.content.includes('답변:')).length || 0;
    const ideaCount = tree?.children?.filter((c: any) => c.content.includes('#seed/idea')).length || 0;

    let insight = '';
    if (status === 'captured' && !hasQuestions) {
      insight = '새로운 아이디어입니다. 구체화를 위한 질문이 필요해 보입니다.';
    } else if (answerCount > 5) {
      insight = '충분한 분석이 완료되었습니다. 프로젝트 단계로 진행을 고려해보세요.';
    } else if (ideaCount > 3) {
      insight = '여러 아이디어가 모였습니다. 클러스터링으로 패턴을 찾아보세요.';
    } else {
      insight = '지속적인 발전이 필요합니다. 추가 질문을 통해 깊이를 더해보세요.';
    }

    return {
      status,
      hasQuestions,
      answerCount,
      ideaCount,
      insight
    };
  }

  private generateSmartSuggestions(analysis: any) {
    const suggestions = [];

    if (analysis.answerCount < 3) {
      suggestions.push({
        id: 'deep-dive',
        title: '심화 질문하기',
        icon: '🔍',
        description: '더 구체적인 질문으로 아이디어를 발전시키세요',
        timeEstimate: '10분'
      });
    }

    if (analysis.ideaCount > 2) {
      suggestions.push({
        id: 'cluster-analysis',
        title: '아이디어 클러스터링',
        icon: '🔗',
        description: '관련 아이디어들을 묶어서 패턴을 찾아보세요',
        timeEstimate: '5분'
      });
    }

    if (analysis.answerCount >= 5) {
      suggestions.push({
        id: 'project-creation',
        title: '프로젝트 생성',
        icon: '🚀',
        description: '충분한 분석이 완료되었습니다. 프로젝트로 발전시켜보세요',
        timeEstimate: '3분'
      });
    }

    suggestions.push({
      id: 'methodology-switch',
      title: '다른 관점으로 보기',
      icon: '🔄',
      description: '다른 방법론으로 새로운 시각을 얻어보세요',
      timeEstimate: '15분'
    });

    return suggestions.slice(0, 4); // Maximum 4 suggestions
  }
}