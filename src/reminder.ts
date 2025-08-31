import '@logseq/libs';

export class ReminderEngine {
  private reminders: Map<string, NodeJS.Timeout> = new Map();
  private checkInterval: number;
  private isRunning: boolean = false;

  constructor() {
    this.checkInterval = (logseq.settings?.reminderInterval || 240) * 60 * 1000; // minutes to ms
    this.setupEventListeners();
  }

  start() {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.schedulePeriodicCheck();
    console.log('🌱 Reminder engine started');
  }

  stop() {
    this.isRunning = false;
    this.reminders.forEach(timer => clearTimeout(timer));
    this.reminders.clear();
  }

  private setupEventListeners() {
    // Listen for seed reminder events
    window.addEventListener('seed-reminder', (event: CustomEvent) => {
      this.handleReminder(event.detail.blockUuid);
    });

    // Listen for block updates to reset reminder timers
    logseq.DB.onChanged(async (e) => {
      if (e.blocks) {
        for (const block of e.blocks) {
          if (block.properties?.['seed-status']) {
            await this.updateActivityTimestamp(block.uuid);
          }
        }
      }
    });
  }

  private schedulePeriodicCheck() {
    if (!this.isRunning) return;

    setTimeout(async () => {
      await this.checkIdleIdeas();
      this.schedulePeriodicCheck();
    }, this.checkInterval);
  }

  private async checkIdleIdeas() {
    try {
      // Query for captured seeds that haven't been active
      const idleSeeds = await logseq.DB.q(`
        [:find (pull ?b [*])
         :where 
         [?b :block/properties ?props]
         [(get ?props :seed-status) ?status]
         [(= ?status "captured")]]
      `);

      for (const seed of idleSeeds) {
        const lastActivity = seed.properties?.['seed-last-activity'];
        if (lastActivity) {
          const hoursSince = (Date.now() - new Date(lastActivity).getTime()) / (1000 * 60 * 60);
          
          if (hoursSince >= 4) {
            await this.showGrowthPrompt(seed);
          }
        }
      }
    } catch (error) {
      console.error('Error checking idle ideas:', error);
    }
  }

  private async showGrowthPrompt(block: any) {
    const questions = this.getContextualQuestions(block);
    const question = questions[0];

    // Update block to show it's being prompted
    await logseq.Editor.upsertBlockProperty(block.uuid, 'seed-status', 'prompted');

    // Show notification with action
    logseq.UI.showMsg(
      `💡 "${block.content.replace('#seed/idea', '').trim()}" 아이디어를 발전시켜보세요:\n\n${question}`,
      'info',
      {
        timeout: 0,
        actions: [{
          label: '답변하기',
          onClick: () => this.openQuestionFlow(block, questions)
        }, {
          label: '나중에',
          onClick: () => this.snoozeReminder(block.uuid, 2 * 60 * 60 * 1000) // 2 hours
        }]
      }
    );
  }

  private getContextualQuestions(block: any): string[] {
    const content = block.content.toLowerCase();
    const framework = logseq.settings?.questionFramework || 'JTBD';

    switch (framework) {
      case 'JTBD':
        return [
          "이 아이디어는 누구를 위한 건가요?",
          "어떤 상황에서 필요한 건가요?",
          "성공은 어떻게 측정할 수 있을까요?"
        ];
      
      case 'FiveWhys':
        return [
          "왜 이 문제가 중요한가요?",
          "왜 기존 해결책으로는 충분하지 않나요?",
          "왜 지금 해결해야 하나요?"
        ];
      
      case 'SCAMPER':
        if (content.includes('개선') || content.includes('향상')) {
          return ["무엇을 대체할 수 있을까요?", "어떻게 수정할 수 있을까요?"];
        } else if (content.includes('새로운') || content.includes('창조')) {
          return ["무엇과 결합할 수 있을까요?", "다른 용도는 무엇일까요?"];
        }
        return ["무엇을 단순화할 수 있을까요?"];
      
      default:
        return [
          "이 아이디어는 누구를 위한 건가요?",
          "어떤 문제를 해결하려는 건가요?",
          "어떻게 검증할 수 있을까요?"
        ];
    }
  }

  private async openQuestionFlow(block: any, questions: string[]) {
    // Navigate to the block
    await logseq.Editor.scrollToBlockInPage(block.page.name, block.uuid);
    
    // Create question as child block
    const questionBlock = await logseq.Editor.insertBlock(
      block.uuid,
      `#seed/question ${questions[0]}`,
      {
        properties: {
          'seed-question-type': logseq.settings?.questionFramework || 'JTBD',
          'seed-question-index': '0'
        },
        sibling: false
      }
    );

    // Create empty answer block
    await logseq.Editor.insertBlock(
      questionBlock.uuid,
      '답변: ',
      { sibling: false }
    );

    // Update parent block status
    await logseq.Editor.upsertBlockProperty(block.uuid, 'seed-status', 'questioning');
    await this.updateActivityTimestamp(block.uuid);
  }

  private async updateActivityTimestamp(blockUuid: string) {
    await logseq.Editor.upsertBlockProperty(
      blockUuid, 
      'seed-last-activity', 
      new Date().toISOString()
    );
  }

  private async snoozeReminder(blockUuid: string, delayMs: number) {
    // Clear existing reminder
    const existingTimer = this.reminders.get(blockUuid);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    // Schedule new reminder
    const timer = setTimeout(() => {
      window.dispatchEvent(new CustomEvent('seed-reminder', {
        detail: { blockUuid }
      }));
    }, delayMs);

    this.reminders.set(blockUuid, timer);
  }

  async handleReminder(blockUuid: string) {
    const block = await logseq.Editor.getBlock(blockUuid);
    if (block && block.properties?.['seed-status'] === 'captured') {
      await this.showGrowthPrompt(block);
    }
  }
}