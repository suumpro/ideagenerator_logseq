import '@logseq/libs';
import { QuickCapture } from './capture';
import { ReminderEngine } from './reminder';
import { QuestionFramework } from './questions';
import { ProjectTemplates } from './templates';
import { IdeaClustering } from './clustering';
import { ProgressiveDisclosureUI } from './ui-progressive';
import { ValidationEngine } from './validation';
import { AdvancedMethodologies } from './methodologies';

const main = () => {
  console.log('🌱 Seed Plugin Loaded');

  // Initialize core modules
  const quickCapture = new QuickCapture();
  const reminderEngine = new ReminderEngine();
  const questionFramework = new QuestionFramework();
  const projectTemplates = new ProjectTemplates();
  const ideaClustering = new IdeaClustering();
  const progressiveUI = new ProgressiveDisclosureUI();
  const validationEngine = new ValidationEngine();
  const advancedMethodologies = new AdvancedMethodologies();

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
      // Show methodology selector for existing seeds
      await progressiveUI.showMethodologySelector(uuid);
    } else {
      // Convert regular block to seed
      await logseq.Editor.upsertBlockProperty(uuid, 'seed-status', 'captured');
      await logseq.Editor.upsertBlockProperty(uuid, 'seed-stage', 'discover');
      await progressiveUI.showMethodologySelector(uuid);
    }
  });

  // Additional context menu items
  logseq.Editor.registerBlockContextMenuItem('Smart Suggestions', async ({ uuid }) => {
    await progressiveUI.showSmartSuggestions(uuid);
  });
  
  logseq.Editor.registerBlockContextMenuItem('Create Validation Plan', async ({ uuid }) => {
    await validationEngine.createValidationPlan(uuid);
  });

  // Register slash commands
  logseq.Editor.registerSlashCommand('Seed Idea', async () => {
    quickCapture.showCaptureDialog();
  });

  logseq.Editor.registerSlashCommand('Seed Project', async () => {
    projectTemplates.createProjectFromCurrentBlock();
  });
  
  logseq.Editor.registerSlashCommand('Seed Cluster', async () => {
    await ideaClustering.generateClusterMap();
  });
  
  logseq.Editor.registerSlashCommand('Seed Dashboard', async () => {
    await progressiveUI.showProgressDashboard();
  });
  
  logseq.Editor.registerSlashCommand('Seed Validation', async () => {
    const currentBlock = await logseq.Editor.getCurrentBlock();
    if (currentBlock) {
      await validationEngine.createValidationPlan(currentBlock.uuid);
    }
  });

  // Handle UI events
  logseq.provideModel({
    showSeedMenu: async () => {
      await progressiveUI.showProgressDashboard();
    },
    showMethodologySelector: async (seedUuid: string) => {
      await progressiveUI.showMethodologySelector(seedUuid);
    },
    clusterIdeas: async () => {
      await ideaClustering.generateClusterMap();
    },
    createValidationPlan: async (seedUuid: string) => {
      await validationEngine.createValidationPlan(seedUuid);
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