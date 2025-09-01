import '@logseq/libs';
import { QuickCapture } from './capture';
import { ReminderEngine } from './reminder';
import { QuestionFramework } from './questions';
import { ProjectTemplates } from './templates';
import { IdeaClustering } from './clustering';
import { ProgressiveDisclosureUI } from './ui-progressive';
import { ValidationEngine } from './validation';
import { AdvancedMethodologies } from './methodologies';
import { SeedExporter } from './export';

interface SeedPluginState {
  isInitialized: boolean;
  modules: Map<string, any>;
  settings: any;
}

class SeedPlugin {
  private state: SeedPluginState;
  private modules: {
    quickCapture: QuickCapture;
    reminderEngine: ReminderEngine;
    questionFramework: QuestionFramework;
    projectTemplates: ProjectTemplates;
    ideaClustering: IdeaClustering;
    progressiveUI: ProgressiveDisclosureUI;
    validationEngine: ValidationEngine;
    advancedMethodologies: AdvancedMethodologies;
    exporter: SeedExporter;
  };

  constructor() {
    this.state = {
      isInitialized: false,
      modules: new Map(),
      settings: {}
    };
    this.initializeModules();
  }

  private initializeModules() {
    this.modules = {
      quickCapture: new QuickCapture(),
      reminderEngine: new ReminderEngine(),
      questionFramework: new QuestionFramework(),
      projectTemplates: new ProjectTemplates(),
      ideaClustering: new IdeaClustering(),
      progressiveUI: new ProgressiveDisclosureUI(),
      validationEngine: new ValidationEngine(),
      advancedMethodologies: new AdvancedMethodologies(),
      exporter: new SeedExporter()
    };
  }

  async initialize() {
    if (this.state.isInitialized) return;

    console.log('🌱 Seed Plugin Loading...');
    
    try {
      await this.registerCommands();
      await this.registerUI();
      await this.registerEventHandlers();
      await this.startServices();
      
      this.state.isInitialized = true;
      console.log('🌱 Seed Plugin Loaded Successfully');
      
      logseq.UI.showMsg('🌱 Seed Plugin이 활성화되었습니다!', 'success', { timeout: 3000 });
    } catch (error) {
      console.error('Failed to initialize Seed Plugin:', error);
      logseq.UI.showMsg('Seed Plugin 초기화 실패', 'error');
    }
  }

  private async registerCommands() {
    logseq.App.registerCommandPalette({
      key: 'seed-capture',
      label: 'Seed: Quick Capture',
      keybinding: {
        binding: logseq.settings?.captureShortcut || 'cmd+shift+s'
      }
    }, () => this.modules.quickCapture.showCaptureDialog());

    logseq.App.registerCommandPalette({
      key: 'seed-dashboard',
      label: 'Seed: Show Dashboard',
      keybinding: {
        binding: 'cmd+shift+d'
      }
    }, () => this.modules.progressiveUI.showProgressDashboard());
  }

  private async registerUI() {
    logseq.App.registerUIItem('toolbar', {
      key: 'seed-toolbar',
      template: `
        <a class="button" data-on-click="showSeedDashboard" title="Seed Dashboard">
          🌱
        </a>
      `
    });

    logseq.provideUI({
      key: 'seed-main',
      path: '#/seed',
      template: `
        <div id="seed-main-ui" class="seed-plugin-ui">
          <div id="seed-dashboard-container"></div>
        </div>
      `
    });
  }

  private async registerEventHandlers() {
    logseq.Editor.registerBlockContextMenuItem('🌱 Grow Seed', async ({ uuid }) => {
      const block = await logseq.Editor.getBlock(uuid);
      if (block?.properties?.['seed-status']) {
        await this.modules.progressiveUI.showMethodologySelector(uuid);
      } else {
        await logseq.Editor.upsertBlockProperty(uuid, 'seed-status', 'captured');
        await logseq.Editor.upsertBlockProperty(uuid, 'seed-stage', 'discover');
        await logseq.Editor.upsertBlockProperty(uuid, 'seed-created', new Date().toISOString());
        await this.modules.progressiveUI.showMethodologySelector(uuid);
      }
    });

    logseq.Editor.registerBlockContextMenuItem('🤖 Smart Suggestions', async ({ uuid }) => {
      await this.modules.progressiveUI.showSmartSuggestions(uuid);
    });
    
    logseq.Editor.registerBlockContextMenuItem('🧪 Create Validation Plan', async ({ uuid }) => {
      await this.modules.validationEngine.createValidationPlan(uuid);
    });

    logseq.Editor.registerBlockContextMenuItem('📊 Export Seed', async ({ uuid }) => {
      const markdown = await this.modules.exporter.exportToMarkdown(uuid);
      await navigator.clipboard.writeText(markdown);
      logseq.UI.showMsg('📋 마크다운으로 복사되었습니다!', 'success');
    });
  }

  private async registerSlashCommands() {
    const commands = [
      {
        name: 'Seed Idea',
        handler: () => this.modules.quickCapture.showCaptureDialog()
      },
      {
        name: 'Seed Project', 
        handler: () => this.modules.projectTemplates.createProjectFromCurrentBlock()
      },
      {
        name: 'Seed Cluster',
        handler: () => this.modules.ideaClustering.generateClusterMap()
      },
      {
        name: 'Seed Dashboard',
        handler: () => this.modules.progressiveUI.showProgressDashboard()
      },
      {
        name: 'Seed Validation',
        handler: async () => {
          const currentBlock = await logseq.Editor.getCurrentBlock();
          if (currentBlock) {
            await this.modules.validationEngine.createValidationPlan(currentBlock.uuid);
          }
        }
      },
      {
        name: 'Seed Export',
        handler: () => this.modules.exporter.createBackup()
      }
    ];

    for (const cmd of commands) {
      logseq.Editor.registerSlashCommand(cmd.name, cmd.handler);
    }
  }

  private async startServices() {
    this.modules.reminderEngine.start();
    await this.registerSlashCommands();
  }

  getModule<T>(name: keyof typeof this.modules): T {
    return this.modules[name] as T;
  }
}

const plugin = new SeedPlugin();

logseq.provideModel({
  showSeedDashboard: async () => {
    await plugin.modules.progressiveUI.showProgressDashboard();
  },
  showMethodologySelector: async (seedUuid: string) => {
    await plugin.modules.progressiveUI.showMethodologySelector(seedUuid);
  },
  clusterIdeas: async () => {
    await plugin.modules.ideaClustering.generateClusterMap();
  },
  createValidationPlan: async (seedUuid: string) => {
    await plugin.modules.validationEngine.createValidationPlan(seedUuid);
  },
  exportSeed: async (seedUuid: string) => {
    const markdown = await plugin.modules.exporter.exportToMarkdown(seedUuid);
    await navigator.clipboard.writeText(markdown);
    logseq.UI.showMsg('📋 마크다운으로 복사되었습니다!', 'success');
  }
});

logseq.ready(() => plugin.initialize()).catch(console.error);