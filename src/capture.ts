import '@logseq/libs';

export class QuickCapture {
  async showCaptureDialog() {
    const timestamp = new Date().toISOString();
    
    // Show input dialog
    const input = await logseq.UI.showInputDialog(
      '🌱 새로운 아이디어를 입력하세요',
      '',
      {
        placeholder: '아이디어를 간단히 적어보세요...',
        submitLabel: '캡처',
        cancelLabel: '취소'
      }
    );

    if (!input || input.trim() === '') return;

    await this.saveSeed(input.trim(), timestamp);
  }

  async saveSeed(content: string, timestamp: string) {
    try {
      // Get today's journal page
      const today = new Date().toISOString().split('T')[0];
      const journalPage = await logseq.Editor.getPage(today);
      
      let targetUuid: string;
      
      if (journalPage) {
        // Find or create Seeds section in daily note
        targetUuid = await this.findOrCreateSeedsSection(journalPage.uuid);
      } else {
        // Create today's journal page
        const newPage = await logseq.Editor.createPage(today);
        targetUuid = await this.findOrCreateSeedsSection(newPage.uuid);
      }

      // Insert the seed block
      const seedBlock = await logseq.Editor.insertBlock(
        targetUuid,
        `#seed/idea ${content}`,
        {
          properties: {
            'seed-status': 'captured',
            'seed-stage': 'discover',
            'seed-created': timestamp,
            'seed-last-activity': timestamp
          },
          sibling: false
        }
      );

      // Show success message
      logseq.UI.showMsg('🌱 아이디어가 성공적으로 캡처되었습니다!', 'success');

      // Schedule first reminder
      this.scheduleReminder(seedBlock.uuid, 4 * 60 * 60 * 1000); // 4 hours

      return seedBlock;
    } catch (error) {
      console.error('Failed to save seed:', error);
      logseq.UI.showMsg('아이디어 저장에 실패했습니다.', 'error');
    }
  }

  private async findOrCreateSeedsSection(pageUuid: string): Promise<string> {
    const page = await logseq.Editor.getPage(pageUuid);
    const blocks = await logseq.Editor.getPageBlocksTree(page.name);
    
    // Look for existing Seeds section
    for (const block of blocks) {
      if (block.content.includes('🌱 Seeds') || block.content.includes('## Seeds')) {
        return block.uuid;
      }
    }
    
    // Create new Seeds section
    const seedsSection = await logseq.Editor.appendBlockInPage(
      page.name,
      '## 🌱 Seeds',
      {
        properties: {
          'collapsed': false
        }
      }
    );
    
    return seedsSection.uuid;
  }

  private scheduleReminder(blockUuid: string, delayMs: number) {
    setTimeout(async () => {
      const block = await logseq.Editor.getBlock(blockUuid);
      if (block?.properties?.['seed-status'] === 'captured') {
        // Trigger reminder
        window.dispatchEvent(new CustomEvent('seed-reminder', {
          detail: { blockUuid }
        }));
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
      }
    } catch (error) {
      logseq.UI.showMsg('클립보드 접근 권한이 필요합니다.', 'warning');
    }
  }
}