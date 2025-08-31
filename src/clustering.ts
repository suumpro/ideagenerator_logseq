import '@logseq/libs';

export interface IdeaCluster {
  id: string;
  theme: string;
  ideas: any[];
  strength: number;
  commonKeywords: string[];
}

export class IdeaClustering {
  private readonly SIMILARITY_THRESHOLD = 0.3;
  private readonly MIN_CLUSTER_SIZE = 2;

  async clusterAllSeeds(): Promise<IdeaCluster[]> {
    const allSeeds = await this.getAllSeeds();
    return this.performClustering(allSeeds);
  }

  async clusterSeedsInPage(pageName: string): Promise<IdeaCluster[]> {
    const seeds = await this.getSeedsInPage(pageName);
    return this.performClustering(seeds);
  }

  private async performClustering(seeds: any[]): Promise<IdeaCluster[]> {
    const clusters: IdeaCluster[] = [];
    const processed = new Set<string>();

    for (const seed of seeds) {
      if (processed.has(seed.uuid)) continue;

      const cluster = await this.findSimilarSeeds(seed, seeds, processed);
      if (cluster.ideas.length >= this.MIN_CLUSTER_SIZE) {
        clusters.push(cluster);
        cluster.ideas.forEach(idea => processed.add(idea.uuid));
      }
    }

    return clusters.sort((a, b) => b.strength - a.strength);
  }

  private async findSimilarSeeds(
    baseSeed: any, 
    allSeeds: any[], 
    processed: Set<string>
  ): Promise<IdeaCluster> {
    const baseKeywords = this.extractKeywords(baseSeed.content);
    const similarSeeds = [baseSeed];
    const commonKeywords = [...baseKeywords];

    for (const seed of allSeeds) {
      if (seed.uuid === baseSeed.uuid || processed.has(seed.uuid)) continue;

      const seedKeywords = this.extractKeywords(seed.content);
      const similarity = this.calculateSimilarity(baseKeywords, seedKeywords);

      if (similarity >= this.SIMILARITY_THRESHOLD) {
        similarSeeds.push(seed);
        
        // Update common keywords
        const intersection = baseKeywords.filter(kw => 
          seedKeywords.some(skw => skw.includes(kw) || kw.includes(skw))
        );
        commonKeywords.push(...intersection);
      }
    }

    // Generate cluster theme
    const theme = this.generateClusterTheme(commonKeywords, similarSeeds);
    const strength = this.calculateClusterStrength(similarSeeds, commonKeywords);

    return {
      id: `cluster-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      theme,
      ideas: similarSeeds,
      strength,
      commonKeywords: [...new Set(commonKeywords)].slice(0, 5)
    };
  }

  private extractKeywords(content: string): string[] {
    return content
      .replace(/#\w+/g, '') // Remove tags
      .replace(/[^\w\s가-힣]/g, ' ') // Keep only words and Korean
      .toLowerCase()
      .split(/\s+/)
      .filter(word => word.length > 2 && !this.isStopWord(word))
      .slice(0, 10);
  }

  private isStopWord(word: string): boolean {
    const stopWords = ['아이디어', '생각', '방법', '도구', '시스템', '서비스', '앱', '웹'];
    return stopWords.includes(word);
  }

  private calculateSimilarity(keywords1: string[], keywords2: string[]): number {
    const set1 = new Set(keywords1.map(kw => kw.toLowerCase()));
    const set2 = new Set(keywords2.map(kw => kw.toLowerCase()));
    
    const intersection = new Set([...set1].filter(x => set2.has(x)));
    const union = new Set([...set1, ...set2]);
    
    return intersection.size / union.size; // Jaccard similarity
  }

  private generateClusterTheme(keywords: string[], ideas: any[]): string {
    // 가장 빈번한 키워드를 테마로 사용
    const keywordFreq: Record<string, number> = {};
    keywords.forEach(kw => {
      keywordFreq[kw] = (keywordFreq[kw] || 0) + 1;
    });

    const topKeywords = Object.entries(keywordFreq)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 2)
      .map(([kw]) => kw);

    if (topKeywords.length === 0) {
      return `아이디어 그룹 ${ideas.length}개`;
    } else if (topKeywords.length === 1) {
      return `${topKeywords[0]} 관련`;
    } else {
      return `${topKeywords[0]} & ${topKeywords[1]}`;
    }
  }

  private calculateClusterStrength(ideas: any[], keywords: string[]): number {
    // 아이디어 수 + 공통 키워드 수 + 최신성
    const ideaScore = Math.min(ideas.length * 10, 50);
    const keywordScore = Math.min(keywords.length * 5, 30);
    
    // 최신성 점수 (최근 아이디어일수록 높은 점수)
    const recentScore = ideas.reduce((score, idea) => {
      const created = idea.properties?.['seed-created'];
      if (created) {
        const daysSince = (Date.now() - new Date(created).getTime()) / (1000 * 60 * 60 * 24);
        return score + Math.max(0, 20 - daysSince);
      }
      return score;
    }, 0) / ideas.length;

    return Math.round(ideaScore + keywordScore + recentScore);
  }

  async createClusterPage(cluster: IdeaCluster): Promise<string> {
    const pageName = `Cluster: ${cluster.theme}`;
    
    // Check if page already exists
    const existingPage = await logseq.Editor.getPage(pageName);
    if (existingPage) {
      return existingPage.name;
    }

    const page = await logseq.Editor.createPage(pageName);
    
    const content = `# 💡 ${cluster.theme} 아이디어 클러스터

## 📊 클러스터 정보
- **아이디어 수**: ${cluster.ideas.length}개
- **클러스터 강도**: ${cluster.strength}/100
- **공통 키워드**: ${cluster.commonKeywords.join(', ')}
- **생성일**: ${new Date().toLocaleDateString('ko-KR')}

## 🌱 포함된 아이디어들
${cluster.ideas.map(idea => `- ((${idea.uuid}))`).join('\n')}

## 🔍 패턴 분석
### 공통 요소
- 

### 차이점
- 

### 발전 방향
- 

## 🎯 다음 단계
- [ ] 공통 문제 정의
- [ ] 솔루션 방향 설정
- [ ] 우선순위 결정
- [ ] 실험 계획 수립

## 🤔 심화 질문
1. 이 아이디어들이 해결하려는 핵심 문제는?
2. 가장 임팩트가 클 것 같은 아이디어는?
3. 어떻게 하나의 솔루션으로 통합할 수 있을까?

#seed/cluster #cluster/${cluster.theme.replace(/\s+/g, '-')}`;

    await logseq.Editor.appendBlockInPage(page.name, content);

    // Update original seeds with cluster reference
    for (const idea of cluster.ideas) {
      await logseq.Editor.upsertBlockProperty(
        idea.uuid, 
        'seed-cluster', 
        `[[${pageName}]]`
      );
    }

    return page.name;
  }

  async generateClusterMap(): Promise<string> {
    const clusters = await this.clusterAllSeeds();
    
    const mapContent = `# 🗺️ 아이디어 클러스터 맵

## 📊 전체 개요
- **총 클러스터**: ${clusters.length}개
- **총 아이디어**: ${clusters.reduce((sum, c) => sum + c.ideas.length, 0)}개
- **평균 클러스터 크기**: ${Math.round(clusters.reduce((sum, c) => sum + c.ideas.length, 0) / clusters.length)}개

## 🏆 주요 클러스터들 (강도순)
${clusters.slice(0, 5).map((cluster, index) => 
  `${index + 1}. **${cluster.theme}** (${cluster.ideas.length}개, 강도: ${cluster.strength})`
).join('\n')}

## 📈 클러스터 상세
${clusters.map(cluster => `
### ${cluster.theme}
- **아이디어 수**: ${cluster.ideas.length}개
- **강도**: ${cluster.strength}/100
- **키워드**: ${cluster.commonKeywords.slice(0, 3).join(', ')}
- **페이지**: [[Cluster: ${cluster.theme}]]
`).join('\n')}

## 🔗 클러스터 간 연결
{{query (and (tag #seed/cluster) (not (page [[${new Date().toLocaleDateString('ko-KR')}]])))}}

#seed/map #analysis/cluster`;

    const mapPage = await logseq.Editor.createPage(
      `Cluster Map ${new Date().toISOString().split('T')[0]}`,
      {},
      { redirect: true }
    );

    await logseq.Editor.appendBlockInPage(mapPage.name, mapContent);
    
    return mapPage.name;
  }

  private async getAllSeeds() {
    return await logseq.DB.q(`
      [:find (pull ?b [*])
       :where 
       [?b :block/properties ?props]
       [(get ?props :seed-status) ?status]
       [(not= ?status "project")]]
    `);
  }

  private async getSeedsInPage(pageName: string) {
    return await logseq.DB.q(`
      [:find (pull ?b [*])
       :where 
       [?b :block/page ?page]
       [?page :block/name "${pageName}"]
       [?b :block/properties ?props]
       [(get ?props :seed-status) ?status]]
    `);
  }

  async suggestMergeOpportunities(): Promise<{seed1: string, seed2: string, reason: string}[]> {
    const allSeeds = await this.getAllSeeds();
    const opportunities: {seed1: string, seed2: string, reason: string}[] = [];

    for (let i = 0; i < allSeeds.length; i++) {
      for (let j = i + 1; j < allSeeds.length; j++) {
        const seed1 = allSeeds[i];
        const seed2 = allSeeds[j];
        
        const keywords1 = this.extractKeywords(seed1.content);
        const keywords2 = this.extractKeywords(seed2.content);
        const similarity = this.calculateSimilarity(keywords1, keywords2);

        if (similarity > 0.6) { // High similarity threshold for merge suggestions
          opportunities.push({
            seed1: seed1.uuid,
            seed2: seed2.uuid,
            reason: `공통 키워드: ${keywords1.filter(kw => keywords2.includes(kw)).join(', ')}`
          });
        }
      }
    }

    return opportunities.slice(0, 5); // Top 5 opportunities
  }
}