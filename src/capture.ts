import '@logseq/libs';

export class QuickCapture {
  async showCaptureDialog() {
    const timestamp = new Date().toISOString();
    
    try {
      const input = await logseq.UI.showInputDialog(
        '🌱 새로운 아이디어를 입력하세요',
        '',
        {
          placeholder: '아이디어를 간단히 적어보세요... (예: 학습 애플리케이션)',
          submitLabel: '캡처',
          cancelLabel: '취소'
        }
      );

      if (!input || input.trim() === '') return;

      await this.saveSeed(input.trim(), timestamp);
    } catch (error) {
      console.error('Capture dialog error:', error);
      logseq.UI.showMsg('아이디어 캡처 중 오류가 발생했습니다.', 'error');
    }
  }

  async saveSeed(content: string, timestamp: string) {
    try {
      const useDaily = logseq.settings?.dailyNoteIntegration !== false;
      let targetUuid: string;
      
      if (useDaily) {
        const today = new Date().toISOString().split('T')[0];
        const journalPage = await logseq.Editor.getPage(today);
        
        if (journalPage) {
          targetUuid = await this.findOrCreateSeedsSection(journalPage.uuid);
        } else {
          const newPage = await logseq.Editor.createPage(today);
          targetUuid = await this.findOrCreateSeedsSection(newPage.uuid);
        }
      } else {
        targetUuid = await this.findOrCreateSeedsPage();
      }

      const seedBlock = await logseq.Editor.insertBlock(
        targetUuid,
        `#seed/idea ${content}`,
        {
          properties: {
            'seed-status': 'captured',
            'seed-stage': 'discover',
            'seed-created': timestamp,
            'seed-last-activity': timestamp,
            'seed-id': this.generateSeedId()
          },
          sibling: false
        }
      );

      logseq.UI.showMsg('🌱 아이디어가 성공적으로 캡처되었습니다!', 'success');

      const reminderInterval = (logseq.settings?.reminderInterval || 240) * 60 * 1000;
      this.scheduleReminder(seedBlock.uuid, reminderInterval);

      return seedBlock;
    } catch (error) {
      console.error('Failed to save seed:', error);
      logseq.UI.showMsg('아이디어 저장에 실패했습니다.', 'error');
      throw error;
    }
  }

  private async findOrCreateSeedsSection(pageUuid: string): Promise<string> {
    const page = await logseq.Editor.getPage(pageUuid);
    const blocks = await logseq.Editor.getPageBlocksTree(page.name);
    
    for (const block of blocks) {
      if (block.content.includes('🌱 Seeds') || block.content.includes('## Seeds')) {
        return block.uuid;
      }
    }
    
    const seedsSection = await logseq.Editor.appendBlockInPage(
      page.name,
      '## 🌱 Seeds',
      {
        properties: {
          'collapsed': false,
          'seed-section': 'true'
        }
      }
    );
    
    return seedsSection.uuid;
  }

  private async findOrCreateSeedsPage(): Promise<string> {
    const seedsPageName = 'Seeds Garden';
    let seedsPage = await logseq.Editor.getPage(seedsPageName);
    
    if (!seedsPage) {
      seedsPage = await logseq.Editor.createPage(seedsPageName);
      await logseq.Editor.appendBlockInPage(
        seedsPageName,
        '# 🌱 Seeds Garden\n\n여기에 모든 아이디어가 모입니다.\n\n## 🌱 Active Seeds',
        {
          properties: {
            'seed-garden': 'true'
          }
        }
      );
    }

    const blocks = await logseq.Editor.getPageBlocksTree(seedsPageName);
    const activeSection = blocks.find(b => b.content.includes('Active Seeds'));
    
    return activeSection ? activeSection.uuid : blocks[0].uuid;
  }

  private generateSeedId(): string {
    return `seed-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private scheduleReminder(blockUuid: string, delayMs: number) {
    setTimeout(async () => {
      try {
        const block = await logseq.Editor.getBlock(blockUuid);
        if (block?.properties?.['seed-status'] === 'captured') {
          window.dispatchEvent(new CustomEvent('seed-reminder', {
            detail: { blockUuid }
          }));
        }
      } catch (error) {
        console.error('Reminder scheduling error:', error);
      }
    }, delayMs);
  }

  async captureFromSelection() {
    const selection = await logseq.Editor.getSelectedText();
    if (selection) {
      await this.saveSeed(selection, new Date().toISOString());
    }
  }

  async captureFromClipboard() {
    try {
      const clipboardText = await navigator.clipboard.readText();
      if (clipboardText && clipboardText.trim()) {
        await this.saveSeed(clipboardText.trim(), new Date().toISOString());
      } else {
        logseq.UI.showMsg('클립보드가 비어있습니다.', 'warning');
      }
    } catch (error) {
      console.error('Clipboard access error:', error);
      logseq.UI.showMsg('클립보드 접근 권한이 필요합니다.', 'warning');
    }
  }

  async batchCapture(ideas: string[]) {
    const timestamp = new Date().toISOString();
    const results = [];
    
    for (const idea of ideas) {
      if (idea.trim()) {
        try {
          const result = await this.saveSeed(idea.trim(), timestamp);
          results.push(result);
        } catch (error) {
          console.error(`Failed to capture idea: ${idea}`, error);
        }
      }
    }
    
    logseq.UI.showMsg(`🌱 ${results.length}개 아이디어가 캡처되었습니다!`, 'success');
    return results;
  }
}