import '@logseq/libs';

export class ProjectTemplates {
  async createProjectFromCurrentBlock() {
    const currentBlock = await logseq.Editor.getCurrentBlock();
    if (!currentBlock) {
      logseq.UI.showMsg('현재 블록을 찾을 수 없습니다.', 'error');
      return;
    }

    await this.createProjectFromSeed(currentBlock.uuid);
  }

  async createProjectFromSeed(seedUuid: string) {
    const seedBlock = await logseq.Editor.getBlock(seedUuid);
    if (!seedBlock) {
      logseq.UI.showMsg('시드 블록을 찾을 수 없습니다.', 'error');
      return;
    }

    const ideaContent = seedBlock.content.replace('#seed/idea', '').trim();
    const projectName = `Project: ${ideaContent.slice(0, 50)}${ideaContent.length > 50 ? '...' : ''}`;
    
    // Create project page
    const projectPage = await logseq.Editor.createPage(
      projectName,
      {},
      {
        redirect: true
      }
    );

    // Generate project template
    const template = await this.generateProjectTemplate(seedBlock);
    
    // Add template content to the page
    await logseq.Editor.appendBlockInPage(
      projectPage.name,
      template
    );

    // Update original seed block
    await logseq.Editor.upsertBlockProperty(seedUuid, 'seed-status', 'project');
    await logseq.Editor.upsertBlockProperty(seedUuid, 'seed-project-page', `[[${projectPage.name}]]`);

    // Add reference to original seed in project
    await logseq.Editor.appendBlockInPage(
      projectPage.name,
      `## 원본 Seed\n((${seedUuid}))`
    );

    logseq.UI.showMsg(`✅ 프로젝트 "${projectName}"이 생성되었습니다!`, 'success');
  }

  private async generateProjectTemplate(seedBlock: any): Promise<string> {
    const ideaContent = seedBlock.content.replace('#seed/idea', '').trim();
    const analysis = await this.extractAnalysisFromSeed(seedBlock);
    
    return `# 🎯 ${ideaContent}

## 📋 Project Overview
**Status**: Planning
**Created**: ${new Date().toLocaleDateString('ko-KR')}
**Stage**: Discover → Define

---

## 🎯 Problem & Opportunity
${analysis.problem || '### What problem are we solving?\n- \n\n### Why is this important?\n- '}

---

## 👥 Target & Jobs-to-be-Done
${analysis.jtbd || '### Who is this for?\n- \n\n### When do they need this?\n- \n\n### How will we measure success?\n- '}

---

## 💡 Ideas & Solutions
### Current Ideas
${analysis.ideas || '- ' + ideaContent}

### Additional Ideas
- 

---

## 🧪 Hypotheses
### Key Assumptions
- 

### Testable Hypotheses
- [ ] 

---

## 🔬 Experiments & Validation
### Quick Tests
- [ ] 

### Metrics to Track
- 

---

## 📊 Progress Tracking
- [x] Initial idea captured
- [ ] Problem defined
- [ ] Target identified  
- [ ] Solution designed
- [ ] Prototype created
- [ ] Tested & validated
- [ ] Decision made

---

## 🔗 Related Ideas
{{query (and (tag #seed/idea) (not (page [[${seedBlock.page?.name || 'unknown'}]])))}}

---

## 📝 Notes & Insights


#seed/project #project/active`;
  }

  private async extractAnalysisFromSeed(seedBlock: any): Promise<{
    problem?: string;
    jtbd?: string;
    ideas?: string;
  }> {
    const analysis: any = {};
    
    // Get child blocks (questions and answers)
    const children = await logseq.Editor.getBlockTree(seedBlock.uuid);
    
    if (children && children.children) {
      let currentSection = '';
      
      for (const child of children.children) {
        const content = child.content;
        
        if (content.includes('#seed/question')) {
          currentSection = this.categorizeQuestion(content);
        } else if (content.startsWith('답변:') && currentSection) {
          const answer = content.replace('답변:', '').trim();
          
          if (!analysis[currentSection]) {
            analysis[currentSection] = '';
          }
          analysis[currentSection] += `- ${answer}\n`;
        } else if (content.includes('Jobs to be Done') || content.includes('Five Whys') || content.includes('SCAMPER')) {
          // Extract completed analysis
          analysis.jtbd = content;
        }
      }
    }
    
    return analysis;
  }

  private categorizeQuestion(questionContent: string): string {
    const content = questionContent.toLowerCase();
    
    if (content.includes('누구') || content.includes('타겟') || content.includes('사용자')) {
      return 'jtbd';
    } else if (content.includes('문제') || content.includes('왜')) {
      return 'problem';
    } else if (content.includes('아이디어') || content.includes('해결') || content.includes('방법')) {
      return 'ideas';
    }
    
    return 'jtbd'; // Default
  }

  async createCanvasTemplate(seedUuid: string) {
    const seedBlock = await logseq.Editor.getBlock(seedUuid);
    const ideaContent = seedBlock.content.replace('#seed/idea', '').trim();
    
    const canvasTemplate = `## 🎨 ${ideaContent} - Canvas

### 💭 Core Idea
${ideaContent}

### 🎯 Problem Space
| **Problem** | **Impact** | **Frequency** |
|-------------|------------|---------------|
|             |            |               |

### 👥 User Personas  
| **Who** | **Context** | **Goal** | **Pain Points** |
|---------|-------------|----------|-----------------|
|         |             |          |                 |

### 💡 Solution Space
| **Idea** | **Effort** | **Impact** | **Risk** |
|----------|------------|------------|----------|
|          |            |            |          |

### 🧪 Experiments
- [ ] 
- [ ] 
- [ ] 

### 📈 Success Metrics
- 
- 
- 

---
*Canvas created from seed: ((${seedUuid}))*
#seed/canvas`;

    const canvasPage = await logseq.Editor.createPage(
      `Canvas: ${ideaContent.slice(0, 40)}`,
      {},
      { redirect: true }
    );

    await logseq.Editor.appendBlockInPage(canvasPage.name, canvasTemplate);
    
    // Link back to original seed
    await logseq.Editor.upsertBlockProperty(seedUuid, 'seed-canvas', `[[${canvasPage.name}]]`);
    
    return canvasPage;
  }

  async createQuickTemplate(type: 'problem' | 'solution' | 'experiment') {
    const templates = {
      problem: `#seed/problem 
**Problem**: 
**Who affects**: 
**Impact**: 
**Current solutions**: 
**Gaps**: `,

      solution: `#seed/solution
**Solution**: 
**How it works**: 
**Benefits**: 
**Drawbacks**: 
**Effort required**: `,

      experiment: `#seed/experiment
**Hypothesis**: 
**Test method**: 
**Success criteria**: 
**Timeline**: 
**Resources needed**: 
- [ ] Execute
- [ ] Analyze
- [ ] Decide`
    };

    const currentBlock = await logseq.Editor.getCurrentBlock();
    if (currentBlock) {
      await logseq.Editor.insertBlock(
        currentBlock.uuid,
        templates[type],
        { sibling: true }
      );
    }
  }

  async generateStatusReport() {
    const seeds = await this.getAllSeeds();
    
    const stats = {
      captured: seeds.filter(s => s.properties?.['seed-status'] === 'captured').length,
      questioning: seeds.filter(s => s.properties?.['seed-status'] === 'questioning').length,
      developed: seeds.filter(s => s.properties?.['seed-status'] === 'developed').length,
      project: seeds.filter(s => s.properties?.['seed-status'] === 'project').length
    };

    const report = `## 🌱 Seed Garden Status Report
**Generated**: ${new Date().toLocaleString('ko-KR')}

### 📊 Overview
- **Total Seeds**: ${seeds.length}
- **Captured**: ${stats.captured}
- **In Questioning**: ${stats.questioning}  
- **Developed**: ${stats.developed}
- **Projects**: ${stats.project}

### 🎯 Recent Activity
{{query (and (tag #seed) (between [[7 days ago]] [[tomorrow]]))}}

### 🚀 Ready for Development
{{query (and (property :seed-status "developed") (not (property :seed-project-page)))}}

### 📈 Growth Rate
- Seeds this week: {{query (and (tag #seed/idea) (between [[7 days ago]] [[tomorrow]]))}}
- Projects launched: {{query (and (tag #seed/project) (between [[30 days ago]] [[tomorrow]]))}}

#seed/report`;

    const reportPage = await logseq.Editor.createPage(
      `Seed Report ${new Date().toISOString().split('T')[0]}`,
      {},
      { redirect: true }
    );

    await logseq.Editor.appendBlockInPage(reportPage.name, report);
    
    return reportPage;
  }

  private async getAllSeeds() {
    return await logseq.DB.q(`
      [:find (pull ?b [*])
       :where 
       [?b :block/properties ?props]
       [(get ?props :seed-status) ?status]]
    `);
  }
}