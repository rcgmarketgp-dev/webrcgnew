import React from 'react';
import {
  FileText,
  History,
  Image,
  Layers,
  LayoutGrid,
  LayoutTemplate,
  Mail,
  Palette,
  PanelLeftClose,
  PanelRightClose,
  Plug,
  Sparkles,
} from 'lucide-react';
import { useEditorStore } from '../../store/useEditorStore';
import { getTranslator } from '../../i18n/translations';
import { LeftSidebarTab } from '../../types/editor';
import { PagesPanel } from '../panels/PagesPanel';
import { BlocksPanel } from '../panels/BlocksPanel';
import { LayersPanel } from '../panels/LayersPanel';
import { AssetsPanel } from '../panels/AssetsPanel';
import { ThemePanel } from '../panels/ThemePanel';
import { AiAssistantPanel, HistoryPanel, PluginsPanel } from '../panels/HistoryAndPluginsPanels';
import { GmailAndCloudPanel } from '../panels/GmailAndCloudPanel';
import { TemplatesPanel } from '../panels/TemplatesPanel';

export const LeftSidebar: React.FC = () => {
  const { leftTab, lang, setLeftTab, toggleLeftSidebar } = useEditorStore();
  const t = getTranslator(lang);

  const railItems: { id: LeftSidebarTab; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'pages', label: t('tabPages'), icon: FileText },
    { id: 'blocks', label: t('tabBlocks'), icon: LayoutGrid },
    { id: 'templates', label: t('tabTemplates'), icon: LayoutTemplate },
    { id: 'layers', label: t('tabLayers'), icon: Layers },
    { id: 'assets', label: t('tabAssets'), icon: Image },
    { id: 'theme', label: t('tabTheme'), icon: Palette },
    { id: 'history', label: t('tabHistory'), icon: History },
    { id: 'plugins', label: t('tabPlugins'), icon: Plug },
    { id: 'ai', label: t('tabAi'), icon: Sparkles },
    { id: 'gmail', label: t('tabGmail'), icon: Mail },
  ];

  const activeLabel = railItems.find((i) => i.id === leftTab)?.label ?? '';
  const CloseIcon = lang === 'fa' ? PanelRightClose : PanelLeftClose;

  return (
    <aside className="fixed top-14 bottom-0 start-0 z-40 flex max-w-[92vw] shrink-0 border-e border-slate-200 dark:border-slate-800/90 bg-white dark:bg-[#0E2547] shadow-2xl lg:static lg:z-auto lg:h-full lg:max-w-none lg:shadow-none">
      {/* Icon Rail */}
      <nav
        aria-label="Editor Tools"
        className="flex w-12 sm:w-14 flex-col items-center gap-1.5 border-e border-slate-200 dark:border-slate-800/90 bg-slate-50 dark:bg-[#071429] py-2.5 overflow-y-auto"
      >
        {railItems.map((item) => {
          const Icon = item.icon;
          const active = leftTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setLeftTab(item.id)}
              title={item.label}
              aria-label={item.label}
              className={`flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 flex-col items-center justify-center rounded-xl transition-colors ${
                active
                  ? 'bg-[#F26A1B] text-white shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-200/70 dark:hover:bg-[#12315F] hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Icon className="h-4 w-4" />
            </button>
          );
        })}
      </nav>

      {/* Active Drawer Panel */}
      <div
        className={`flex h-full flex-col overflow-hidden transition-[width] duration-200 ${
          leftTab === 'templates' ? 'w-[min(20rem,78vw)] sm:w-80' : 'w-[min(17rem,74vw)] sm:w-68'
        }`}
      >
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800/90 px-3.5 py-2.5">
          <h2 className="text-xs font-bold">{activeLabel}</h2>
          <button
            type="button"
            onClick={toggleLeftSidebar}
            title={t('hideToolsMenu')}
            aria-label={t('hideToolsMenu')}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-200/70 dark:hover:bg-[#12315F] hover:text-[#F26A1B] transition-colors"
          >
            <CloseIcon className="h-4 w-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {leftTab === 'pages' && <PagesPanel />}
          {leftTab === 'blocks' && <BlocksPanel />}
          {leftTab === 'templates' && <TemplatesPanel />}
          {leftTab === 'layers' && <LayersPanel />}
          {leftTab === 'assets' && <AssetsPanel />}
          {leftTab === 'theme' && <ThemePanel />}
          {leftTab === 'history' && <HistoryPanel />}
          {leftTab === 'plugins' && <PluginsPanel />}
          {leftTab === 'ai' && <AiAssistantPanel />}
          {leftTab === 'gmail' && <GmailAndCloudPanel />}
        </div>
      </div>
    </aside>
  );
};
