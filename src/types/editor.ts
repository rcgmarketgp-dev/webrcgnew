export type DeviceMode = 'desktop' | 'tablet' | 'mobile';
export type EditorThemeMode = 'dark' | 'light';
export type Language = 'fa' | 'en';
export type NumeralMode = 'fa' | 'en';

export type LeftSidebarTab =
  | 'pages'
  | 'blocks'
  | 'layers'
  | 'assets'
  | 'theme'
  | 'history'
  | 'plugins'
  | 'ai'
  | 'gmail'
  | 'templates';

export type RightInspectorTab = 'content' | 'style' | 'layout' | 'animation';

export type BlockType =
  | 'navbar'
  | 'hero'
  | 'features'
  | 'products'
  | 'gallery'
  | 'testimonials'
  | 'pricing'
  | 'stats'
  | 'faq'
  | 'contact'
  | 'map'
  | 'cta'
  | 'richtext'
  | 'footer';

export type BlockCategory = 'navigation' | 'hero' | 'content' | 'showcase' | 'conversion';

export type BackgroundType = 'solid' | 'gradient' | 'image';
export type ShadowLevel = 'none' | 'sm' | 'md' | 'lg';
export type MaxWidthOption = 'full' | 'xl' | 'lg' | 'md';
export type TextAlignOption = 'start' | 'center' | 'end';

export interface BlockStyleProps {
  backgroundType: BackgroundType;
  backgroundColor: string;
  gradientFrom: string;
  gradientTo: string;
  backgroundImage: string;
  backgroundOverlayOpacity: number;
  textColor: string;
  accentColor?: string;
  paddingY: number;
  paddingX: number;
  marginY: number;
  borderRadius: number;
  shadow: ShadowLevel;
  maxWidth: MaxWidthOption;
  textAlign: TextAlignOption;
  borderWidth: number;
  borderColor: string;
  headingScale: number;
  bodyScale: number;
  gap: number;
}

export type AnimationType = 'none' | 'fade' | 'slide-up' | 'slide-start' | 'scale' | 'stagger';

export interface BlockAnimationProps {
  type: AnimationType;
  duration: number;
  delay: number;
}

export interface BlockInstance {
  id: string;
  type: BlockType;
  variant: 'a' | 'b';
  label: string;
  locked: boolean;
  hidden: boolean;
  content: Record<string, any>;
  style: BlockStyleProps;
  responsiveOverrides?: {
    tablet?: Partial<BlockStyleProps>;
    mobile?: Partial<BlockStyleProps>;
  };
  animation: BlockAnimationProps;
}

export interface PageSEO {
  title: string;
  description: string;
  ogImage: string;
}

export interface PageData {
  id: string;
  slug: string;
  title: string;
  isHome: boolean;
  seo: PageSEO;
  blocks: BlockInstance[];
}

export type LinkKind = 'page' | 'section' | 'external';

export interface LinkTarget {
  kind: LinkKind;
  pageId?: string;
  blockId?: string;
  url?: string;
  openInNewTab?: boolean;
  labelSnapshot?: string;
}

export type ActionButtonStyle = 'primary' | 'secondary' | 'outline';

export interface ActionButtonItem {
  id: string;
  label: string;
  style: ActionButtonStyle;
  link: LinkTarget;
}

export interface NavMenuItem {
  id: string;
  label: string;
  pageId: string;
  externalUrl?: string;
  link?: LinkTarget;
}

export interface AssetItem {
  id: string;
  name: string;
  url: string;
  tags: string[];
  createdAt: number;
  kind: 'uploaded' | 'url' | 'placeholder';
}

export interface UploadedFont {
  id: string;
  family: string;
  weight: string;
  dataUrl: string;
  fileName: string;
}

export interface GlobalThemeTokens {
  primary: string;
  primaryHover: string;
  primaryDark: string;
  accent: string;
  accentHover: string;
  accentPressed: string;
  bg: string;
  surface: string;
  text: string;
  muted: string;
  border: string;
  headingFont: string;
  bodyFont: string;
  baseRadius: number;
  spacingScale: number;
  siteMode: 'dark' | 'light';
}

export type CloudSyncStatus = 'guest' | 'loading' | 'saving' | 'synced' | 'error';

export interface VersionSnapshot {
  id: string;
  timestamp: number;
  label: string;
  projectJson?: string;
  projectData?: ProjectData;
}

export interface ConnectorConfig {
  enabled: boolean;
  values: Record<string, string>;
}

export interface ProjectData {
  projectName: string;
  pages: PageData[];
  navMenu: NavMenuItem[];
  theme: GlobalThemeTokens;
  assets: AssetItem[];
  uploadedFonts: UploadedFont[];
  connectors: Record<string, ConnectorConfig>;
}

export interface ToastItem {
  id: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  canUndo?: boolean;
}

export type TemplateCategory = 'all' | 'landing' | 'catalog' | 'corporate' | 'service' | 'external';

export interface PageTemplate {
  id: string;
  nameFa: string;
  nameEn: string;
  sourceFa: string;
  sourceEn: string;
  category: Exclude<TemplateCategory, 'all'>;
  descriptionFa: string;
  descriptionEn: string;
  themePatch?: Partial<GlobalThemeTokens>;
  blocks: Omit<BlockInstance, 'id'>[];
  isExternalImported?: boolean;
  sourceUrl?: string;
}

