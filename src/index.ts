import '@logseq/libs';
import { QuickCapture } from './capture';
import { ReminderEngine } from './reminder';
import { QuestionFramework } from './questions';
import { ProjectTemplates } from './templates';

const main = () => {
  console.log('🌱 Seed Plugin Loaded');

  // Initialize core modules
  const quickCapture = new QuickCapture();
  const reminderEngine = new ReminderEngine();
  const questionFramework = new QuestionFramework();
  const projectTemplates = new ProjectTemplates();

  // Register keyboard shortcuts
  logseq.App.registerCommandPalette({
    key: 'seed-capture',
    label: 'Seed: Quick Capture',
    keybinding: {
      binding: logseq.settings?.captureShortcut || 'cmd+shift+s'
    }
  }, () => quickCapture.showCaptureDialog());

  // Register toolbar button
  logseq.App.registerUIItem('toolbar', {
    key: 'seed-toolbar',
    template: `
      <a class="button" data-on-click="showSeedMenu" title="Seed Ideas">
        🌱
      </a>
    `
  });

  // Start reminder engine
  reminderEngine.start();

  // Register block context menu
  logseq.Editor.registerBlockContextMenuItem('Grow Seed', async ({ uuid }) => {
    const block = await logseq.Editor.getBlock(uuid);
    if (block?.properties?.['seed-status']) {
      questionFramework.startQuestionFlow(block);
    } else {
      // Convert regular block to seed
      await logseq.Editor.upsertBlockProperty(uuid, 'seed-status', 'captured');
      await logseq.Editor.upsertBlockProperty(uuid, 'seed-stage', 'discover');
      questionFramework.startQuestionFlow(block);
    }
  });

  // Register slash commands
  logseq.Editor.registerSlashCommand('Seed Idea', async () => {
    quickCapture.showCaptureDialog();
  });

  logseq.Editor.registerSlashCommand('Seed Project', async () => {
    projectTemplates.createProjectFromCurrentBlock();
  });

  // Handle UI events
  logseq.provideModel({
    showSeedMenu: () => {
      logseq.showMainUI();
    }
  });

  // Main UI
  logseq.provideUI({
    key: 'seed-main',
    path: '#/seed',
    template: `
      <div id="seed-dashboard">
        <h2>🌱 Seed Dashboard</h2>
        <div id="seed-stats"></div>
        <div id="recent-seeds"></div>
        <div id="growing-seeds"></div>
      </div>
    `
  });
};

logseq.ready(main).catch(console.error);