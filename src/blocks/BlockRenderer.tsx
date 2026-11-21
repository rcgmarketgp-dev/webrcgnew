import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { ChevronDown, MapPin, Phone, Clock, Mail, ImageOff, Check, Menu, X, ExternalLink, Upload } from 'lucide-react';
import {
  ActionButtonItem,
  BlockInstance,
  BlockStyleProps,
  DeviceMode,
  GlobalThemeTokens,
  Language,
  LinkTarget,
  NavMenuItem,
  NumeralMode,
  RightInspectorTab,
} from '../types/editor';
import { formatNumerals } from '../i18n/translations';
import { InlineText } from './InlineText';
import { normalizeLegacyLink, resolveNavItemLink, sanitizeExternalUrl } from '../utils/linkResolver';

export function resolveEffectiveStyle(block: BlockInstance, device: DeviceMode): BlockStyleProps {
  if (device === 'desktop') return block.style;
  if (device === 'tablet') {
    return { ...block.style, ...(block.responsiveOverrides?.tablet ?? {}) };
  }
  return {
    ...block.style,
    ...(block.responsiveOverrides?.tablet ?? {}),
    ...(block.responsiveOverrides?.mobile ?? {}),
  };
}

interface SafeImageProps {
  src?: string;
  alt: string;
  className?: string;
  style?: React.CSSProperties;
  editable?: boolean;
  compactOverlay?: boolean;
  uploadLabel?: string;
  emptyImageLabel?: string;
  onSelectImage?: (e: React.MouseEvent) => void;
  onUploadFile?: (file: File) => void;
}

const SafeImage: React.FC<SafeImageProps> = ({
  src,
  alt,
  className = '',
  style,
  editable = false,
  compactOverlay = false,
  uploadLabel,
  emptyImageLabel,
  onSelectImage,
  onUploadFile,
}) => {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [src]);

  const mediaNode =
    !src || failed ? (
      <div
        className={`flex flex-col items-center justify-center gap-2 bg-[#12284A] text-slate-300 ${className}`}
        style={style}
      >
        <ImageOff className="h-7 w-7 opacity-60" />
        <span className="text-xs opacity-70 px-3 text-center">{alt || emptyImageLabel || 'تصویر'}</span>
      </div>
    ) : (
      <img
        src={src}
        alt={alt}
        referrerPolicy="no-referrer"
        onError={() => setFailed(true)}
        className={className}
        style={style}
      />
    );

  if (!editable) {
    return mediaNode;
  }

  if (compactOverlay) {
    return (
      <div
        data-interactive-content="true"
        onClick={onSelectImage}
        className="relative group/media inline-flex shrink-0 items-center cursor-pointer rounded transition-shadow hover:ring-1 hover:ring-[#F26A1B]"
      >
        {mediaNode}
        {onUploadFile && (
          <label
            onClick={(e) => e.stopPropagation()}
            title={uploadLabel || 'آپلود عکس'}
            className="absolute -bottom-1 -end-1 z-10 cursor-pointer rounded-full bg-[#F26A1B] p-1 text-white shadow-md opacity-0 group-hover/media:opacity-100 focus-within:opacity-100 transition-opacity hover:bg-[#FF8A3D]"
          >
            <Upload className="h-2.5 w-2.5" />
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) onUploadFile(file);
                e.target.value = '';
              }}
            />
          </label>
        )}
      </div>
    );
  }

  return (
    <div
      data-interactive-content="true"
      onClick={onSelectImage}
      className="relative group/media h-full w-full cursor-pointer"
    >
      {mediaNode}
      {onUploadFile && (
        <label
          onClick={(e) => e.stopPropagation()}
          className={`absolute bottom-2 end-2 z-10 inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-[#071429]/85 px-2.5 py-1.5 text-[11px] font-semibold text-white border border-white/15 shadow-lg backdrop-blur-sm transition-all hover:bg-[#F26A1B] hover:border-[#F26A1B] ${
            !src || failed ? 'opacity-100' : 'opacity-0 group-hover/media:opacity-100 focus-within:opacity-100'
          }`}
        >
          <Upload className="h-3.5 w-3.5" />
          <span>{uploadLabel || 'آپلود عکس'}</span>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onUploadFile(file);
              e.target.value = '';
            }}
          />
        </label>
      )}
    </div>
  );
};

interface BlockRendererProps {
  block: BlockInstance;
  theme: GlobalThemeTokens;
  deviceMode: DeviceMode;
  navMenu: NavMenuItem[];
  numerals: NumeralMode;
  lang?: Language;
  editable: boolean;
  isSelected?: boolean;
  uploadHintLabel?: string;
  replayKey: number;
  onUpdateContent: (patch: Record<string, any>) => void;
  onNavigatePage?: (pageId: string) => void;
  onNavigateLink?: (link: LinkTarget) => void;
  onActivateElement?: (target: {
    tab?: RightInspectorTab;
    fieldKey?: string;
    itemIndex?: number;
    forceOpen?: boolean;
  }) => void;
  onQuickUploadImage?: (fieldKey: string, file: File, itemIndex?: number) => void;
}

export const BlockRenderer: React.FC<BlockRendererProps> = ({
  block,
  theme,
  deviceMode,
  navMenu,
  numerals,
  lang = 'fa',
  editable,
  isSelected = false,
  uploadHintLabel,
  replayKey,
  onUpdateContent,
  onNavigatePage,
  onNavigateLink,
  onActivateElement,
  onQuickUploadImage,
}) => {
  const [openFaqIdx, setOpenFaqIdx] = useState<number | null>(0);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isMobile = deviceMode === 'mobile';
  const isTabletOrLess = deviceMode === 'mobile' || deviceMode === 'tablet';

  const s = resolveEffectiveStyle(block, deviceMode);
  const c = block.content;
  const fmt = (val: string) => formatNumerals(val, numerals);
  const effectiveUploadLabel = uploadHintLabel || (lang === 'en' ? 'Upload Image' : 'آپلود عکس');
  const emptyImageLabel = lang === 'en' ? 'Image' : 'تصویر';

  const maxWMap: Record<BlockStyleProps['maxWidth'], string> = {
    full: '100%',
    xl: '1200px',
    lg: '1024px',
    md: '768px',
  };

  const shadowMap: Record<BlockStyleProps['shadow'], string> = {
    none: 'none',
    sm: '0 2px 8px rgba(4, 12, 28, 0.25)',
    md: '0 10px 26px rgba(4, 12, 28, 0.35)',
    lg: '0 20px 48px rgba(4, 12, 28, 0.45)',
  };

  const bgStyle: React.CSSProperties =
    s.backgroundType === 'gradient'
      ? { background: `linear-gradient(135deg, ${s.gradientFrom}, ${s.gradientTo})` }
      : s.backgroundType === 'image' && s.backgroundImage
      ? {
          backgroundImage: `linear-gradient(rgba(7,20,41,${s.backgroundOverlayOpacity}), rgba(7,20,41,${s.backgroundOverlayOpacity})), url('${s.backgroundImage}')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }
      : {
          backgroundColor:
            s.backgroundColor && s.backgroundColor !== 'transparent' ? s.backgroundColor : 'transparent',
        };

  const spacingMult = theme.spacingScale || 1;
  const effectivePadY =
    isMobile && block.responsiveOverrides?.mobile?.paddingY === undefined
      ? Math.min(s.paddingY, block.type === 'navbar' ? 12 : 36)
      : s.paddingY;
  const effectivePadX =
    isMobile && block.responsiveOverrides?.mobile?.paddingX === undefined
      ? Math.min(s.paddingX, 16)
      : s.paddingX;

  const sectionStyle: React.CSSProperties = {
    ...bgStyle,
    color: s.textColor || theme.text,
    paddingTop: `${Math.round(effectivePadY * spacingMult)}px`,
    paddingBottom: `${Math.round(effectivePadY * spacingMult)}px`,
    paddingInline: `${Math.round(effectivePadX * spacingMult)}px`,
    marginTop: `${s.marginY}px`,
    marginBottom: `${s.marginY}px`,
    borderRadius: `${s.borderRadius}px`,
    boxShadow: shadowMap[s.shadow],
    borderWidth: s.borderWidth > 0 ? `${s.borderWidth}px` : undefined,
    borderStyle: s.borderWidth > 0 ? 'solid' : undefined,
    borderColor: s.borderWidth > 0 ? s.borderColor || theme.border : undefined,
    textAlign: s.textAlign === 'center' ? 'center' : s.textAlign === 'end' ? 'end' : 'start',
    fontFamily: `'${theme.bodyFont}', 'Vazirmatn', Tahoma, sans-serif`,
  };

  const headingStyle: React.CSSProperties = {
    fontFamily: `'${theme.headingFont}', 'Vazirmatn', Tahoma, sans-serif`,
  };

  const cardStyle: React.CSSProperties = {
    backgroundColor: theme.surface,
    borderColor: theme.border,
    borderRadius: `${theme.baseRadius}px`,
  };

  const updateArrayItem = (field: string, index: number, patch: Record<string, any>) => {
    const arr = Array.isArray(c[field]) ? [...c[field]] : [];
    arr[index] = { ...arr[index], ...patch };
    onUpdateContent({ [field]: arr });
  };

  const animType = block.animation?.type ?? 'none';
  const animDuration = (block.animation?.duration ?? 280) / 1000;
  const animDelay = (block.animation?.delay ?? 0) / 1000;

  const initialVariant =
    animType === 'fade'
      ? { opacity: 0 }
      : animType === 'slide-up'
      ? { opacity: 0, y: 18 }
      : animType === 'slide-start'
      ? { opacity: 0, x: 20 }
      : animType === 'scale'
      ? { opacity: 0, scale: 0.96 }
      : animType === 'stagger'
      ? { opacity: 0, y: 12 }
      : { opacity: 1 };

  const customButtons: ActionButtonItem[] = Array.isArray(c.buttons) ? c.buttons : [];

  const activateField = (
    e: React.MouseEvent,
    fieldKey: string,
    itemIndex?: number,
    tab: RightInspectorTab = 'content'
  ) => {
    if (!editable || !onActivateElement) return;
    if (e.detail === 2) return;
    e.stopPropagation();
    onActivateElement({
      tab,
      fieldKey,
      itemIndex,
      forceOpen: Boolean(isSelected),
    });
  };

  const handleLinkNavigation = (
    e: React.MouseEvent,
    link?: LinkTarget,
    editableTarget?: { fieldKey: string; itemIndex?: number; tab?: RightInspectorTab }
  ) => {
    if (editable) {
      if (editableTarget) {
        activateField(e, editableTarget.fieldKey, editableTarget.itemIndex, editableTarget.tab ?? 'content');
      }
      return;
    }
    if (!link) return;
    if (link.kind === 'external' && link.url !== '#top') {
      e.stopPropagation();
      return;
    }
    e.preventDefault();
    e.stopPropagation();
    if (onNavigateLink) {
      onNavigateLink(link);
    } else if (link.kind === 'page' && link.pageId && onNavigatePage) {
      onNavigatePage(link.pageId);
    }
  };

  const renderLinkedAction = (
    link: LinkTarget | undefined,
    className: string,
    style: React.CSSProperties,
    children: React.ReactNode,
    key?: React.Key,
    editableTarget?: { fieldKey: string; itemIndex?: number; tab?: RightInspectorTab }
  ) => {
    const isExternalAnchor = !editable && link?.kind === 'external' && link.url !== '#top';
    if (isExternalAnchor) {
      const href = sanitizeExternalUrl(link.url);
      const isHttp = href.startsWith('http://') || href.startsWith('https://');
      return (
        <a
          key={key}
          href={href}
          target={link.openInNewTab && isHttp ? '_blank' : undefined}
          rel={link.openInNewTab && isHttp ? 'noopener noreferrer' : undefined}
          onClick={(e) => e.stopPropagation()}
          className={className}
          style={style}
        >
          {children}
        </a>
      );
    }
    return (
      <button
        key={key}
        type="button"
        onClick={(e) => handleLinkNavigation(e, link, editableTarget)}
        className={className}
        style={style}
      >
        {children}
      </button>
    );
  };

  const renderCustomButtonsRow = (buttons: ActionButtonItem[], alignCenter = false) => {
    if (!buttons.length) return null;
    return (
      <div
        className={`flex flex-wrap gap-2.5 pt-4 ${
          alignCenter || s.textAlign === 'center'
            ? 'justify-center'
            : s.textAlign === 'end'
            ? 'justify-end'
            : 'justify-start'
        }`}
        style={{ maxWidth: maxWMap[s.maxWidth], marginInline: 'auto' }}
      >
        {buttons.map((btn, idx) => {
          const btnStyle: React.CSSProperties =
            btn.style === 'primary'
              ? {
                  backgroundColor: theme.accent,
                  color: '#ffffff',
                  borderRadius: `${theme.baseRadius}px`,
                }
              : btn.style === 'secondary'
              ? {
                  backgroundColor: theme.primary,
                  color: '#ffffff',
                  borderRadius: `${theme.baseRadius}px`,
                }
              : {
                  backgroundColor: 'transparent',
                  color: s.textColor || theme.text,
                  borderColor: theme.border,
                  borderWidth: '1px',
                  borderStyle: 'solid',
                  borderRadius: `${theme.baseRadius}px`,
                };
          return renderLinkedAction(
            btn.link,
            `${isMobile ? 'w-full justify-center' : ''} inline-flex items-center gap-1.5 px-5 py-2.5 text-sm font-semibold transition-transform active:scale-95`,
            btnStyle,
            <>
              <InlineText
                value={btn.label}
                onChange={(v) => {
                  const next = [...buttons];
                  next[idx] = { ...next[idx], label: v };
                  onUpdateContent({ buttons: next });
                }}
                editable={editable}
              />
              {btn.link?.kind === 'external' && btn.link.openInNewTab && (
                <ExternalLink className="h-3.5 w-3.5 opacity-80" />
              )}
            </>,
            btn.id || idx,
            { fieldKey: 'buttons', itemIndex: idx }
          );
        })}
      </div>
    );
  };

  const renderInner = () => {
    switch (block.type) {
      case 'navbar':
        return (
          <header
            className="space-y-3"
            style={{ maxWidth: maxWMap[s.maxWidth], margin: '0 auto' }}
          >
            <div className="flex items-center justify-between gap-2.5">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                {c.logoUrl && (
                  <SafeImage
                    src={c.logoUrl}
                    alt={c.brandName || 'Logo'}
                    editable={editable}
                    compactOverlay
                    uploadLabel={effectiveUploadLabel}
                    emptyImageLabel={emptyImageLabel}
                    onSelectImage={(e) => activateField(e, 'logoUrl')}
                    onUploadFile={(file) => onQuickUploadImage?.('logoUrl', file)}
                    className={`${isMobile ? 'h-7' : 'h-8 sm:h-9'} w-auto shrink-0 object-contain`}
                  />
                )}
                <div onClick={(e) => activateField(e, 'brandName')} className="min-w-0">
                  <InlineText
                    value={c.brandName || ''}
                    onChange={(v) => onUpdateContent({ brandName: v })}
                    editable={editable}
                    as="span"
                    className={`${isMobile ? 'text-sm' : 'text-sm sm:text-base'} font-bold truncate`}
                    style={headingStyle}
                  />
                </div>
              </div>

              {!isMobile && (
                <nav
                  className={`hidden md:flex items-center gap-5 lg:gap-6 text-sm font-medium ${
                    block.variant === 'b' ? 'mx-auto' : ''
                  }`}
                >
                  {navMenu.map((item) => {
                    const itemLink = resolveNavItemLink(item);
                    return renderLinkedAction(
                      itemLink,
                      'whitespace-nowrap opacity-85 transition-colors hover:opacity-100',
                      { color: 'inherit' },
                      item.label,
                      item.id
                    );
                  })}
                </nav>
              )}

              <div className="flex items-center gap-1.5 shrink-0">
                {renderLinkedAction(
                  normalizeLegacyLink(c.ctaLink, c.ctaPageId),
                  `shrink-0 whitespace-nowrap ${
                    isMobile ? 'px-3 py-1.5 text-[11px]' : 'px-3.5 sm:px-4 py-2 text-xs'
                  } font-semibold text-white transition-transform active:scale-95`,
                  {
                    backgroundColor: block.variant === 'b' ? theme.primary : theme.accent,
                    borderRadius: `${theme.baseRadius}px`,
                  },
                  <InlineText
                    value={c.ctaLabel || ''}
                    onChange={(v) => onUpdateContent({ ctaLabel: v })}
                    editable={editable}
                  />,
                  'navbar-cta',
                  { fieldKey: 'ctaLabel' }
                )}

                {!isMobile &&
                  customButtons.map((btn, idx) =>
                    renderLinkedAction(
                      btn.link,
                      'hidden sm:inline-flex items-center gap-1 shrink-0 whitespace-nowrap border px-3 py-2 text-xs font-semibold transition-transform active:scale-95',
                      btn.style === 'primary'
                        ? {
                            backgroundColor: theme.accent,
                            borderColor: theme.accent,
                            color: '#ffffff',
                            borderRadius: `${theme.baseRadius}px`,
                          }
                        : btn.style === 'secondary'
                        ? {
                            backgroundColor: theme.primary,
                            borderColor: theme.primary,
                            color: '#ffffff',
                            borderRadius: `${theme.baseRadius}px`,
                          }
                        : {
                            borderColor: theme.border,
                            color: 'inherit',
                            borderRadius: `${theme.baseRadius}px`,
                          },
                      btn.label,
                      btn.id || idx,
                      { fieldKey: 'buttons', itemIndex: idx }
                    )
                  )}

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setMobileMenuOpen((v) => !v);
                  }}
                  aria-label="Menu"
                  className={`${
                    isMobile ? 'inline-flex' : 'inline-flex md:hidden'
                  } items-center justify-center rounded-lg border p-1.5`}
                  style={{ borderColor: theme.border }}
                >
                  {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {mobileMenuOpen && (
              <nav
                className={`${
                  isMobile ? 'flex' : 'flex md:hidden'
                } flex-col gap-1 border-t pt-2.5 text-xs font-medium`}
                style={{ borderColor: theme.border }}
              >
                {navMenu.map((item) => {
                  const itemLink = resolveNavItemLink(item);
                  return (
                    <div
                      key={item.id}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {renderLinkedAction(
                        itemLink,
                        'block w-full rounded-lg px-2.5 py-2 text-start hover:bg-white/5',
                        { color: 'inherit' },
                        item.label
                      )}
                    </div>
                  );
                })}
                {customButtons.map((btn, idx) => (
                  <div key={btn.id || idx} onClick={() => setMobileMenuOpen(false)}>
                    {renderLinkedAction(
                      btn.link,
                      'block w-full rounded-lg px-2.5 py-2 text-start font-semibold hover:bg-white/5',
                      { color: theme.accent },
                      btn.label
                    )}
                  </div>
                ))}
              </nav>
            )}
          </header>
        );

      case 'hero': {
        const isCentered = block.variant === 'b';
        const stackHero = isCentered || isTabletOrLess;
        return (
          <div
            className={
              stackHero
                ? 'mx-auto flex flex-col items-center gap-6 sm:gap-8 text-center'
                : 'mx-auto grid grid-cols-1 lg:grid-cols-12 items-center gap-8 lg:gap-10'
            }
            style={{ maxWidth: maxWMap[s.maxWidth] }}
          >
            <div className={stackHero ? 'max-w-2xl space-y-4 sm:space-y-5' : 'lg:col-span-6 space-y-5'}>
              {c.kicker && (
                <div onClick={(e) => activateField(e, 'kicker')}>
                  <InlineText
                    value={fmt(c.kicker)}
                    onChange={(v) => onUpdateContent({ kicker: v })}
                    editable={editable}
                    as="p"
                    className="text-xs font-semibold tracking-wide"
                    style={{ color: theme.accent }}
                  />
                </div>
              )}
              <div onClick={(e) => activateField(e, 'headline')}>
                <InlineText
                  value={fmt(c.headline || '')}
                  onChange={(v) => onUpdateContent({ headline: v })}
                  editable={editable}
                  as="h1"
                  className="font-extrabold leading-tight text-balance"
                  style={{
                    ...headingStyle,
                    fontSize: `calc(${isMobile ? '1.65rem' : isTabletOrLess ? '2.1rem' : '2.5rem'} * ${s.headingScale})`,
                  }}
                />
              </div>
              <div onClick={(e) => activateField(e, 'subheadline')}>
                <InlineText
                  value={fmt(c.subheadline || '')}
                  onChange={(v) => onUpdateContent({ subheadline: v })}
                  editable={editable}
                  as="p"
                  multiline
                  className="leading-relaxed"
                  style={{
                    color: theme.muted,
                    fontSize: `calc(${isMobile ? '0.92rem' : '1rem'} * ${s.bodyScale})`,
                  }}
                />
              </div>
              <div
                className={`flex flex-wrap gap-2.5 sm:gap-3 pt-1 sm:pt-2 ${
                  stackHero ? 'justify-center' : 'justify-start'
                }`}
              >
                {c.primaryCta &&
                  renderLinkedAction(
                    c.primaryLink as LinkTarget | undefined,
                    `${isMobile ? 'w-full justify-center' : ''} inline-flex items-center gap-1.5 px-5 sm:px-6 py-2.5 sm:py-3 text-sm font-semibold text-white transition-colors`,
                    {
                      backgroundColor: theme.accent,
                      borderRadius: `${theme.baseRadius}px`,
                    },
                    <InlineText
                      value={c.primaryCta}
                      onChange={(v) => onUpdateContent({ primaryCta: v })}
                      editable={editable}
                    />,
                    'hero-primary-cta',
                    { fieldKey: 'primaryCta' }
                  )}
                {c.secondaryCta &&
                  renderLinkedAction(
                    c.secondaryLink as LinkTarget | undefined,
                    `${isMobile ? 'w-full justify-center' : ''} inline-flex items-center gap-1.5 border px-5 sm:px-6 py-2.5 sm:py-3 text-sm font-semibold transition-colors`,
                    {
                      borderColor: theme.border,
                      borderRadius: `${theme.baseRadius}px`,
                    },
                    <InlineText
                      value={c.secondaryCta}
                      onChange={(v) => onUpdateContent({ secondaryCta: v })}
                      editable={editable}
                    />,
                    'hero-secondary-cta',
                    { fieldKey: 'secondaryCta' }
                  )}
                {customButtons.map((btn, idx) =>
                  renderLinkedAction(
                    btn.link,
                    `${isMobile ? 'w-full justify-center' : ''} inline-flex items-center gap-1.5 px-5 sm:px-6 py-2.5 sm:py-3 text-sm font-semibold transition-transform active:scale-95`,
                    btn.style === 'primary'
                      ? {
                          backgroundColor: theme.accent,
                          color: '#ffffff',
                          borderRadius: `${theme.baseRadius}px`,
                        }
                      : btn.style === 'secondary'
                      ? {
                          backgroundColor: theme.primary,
                          color: '#ffffff',
                          borderRadius: `${theme.baseRadius}px`,
                        }
                      : {
                          borderColor: theme.border,
                          borderWidth: '1px',
                          borderStyle: 'solid',
                          color: s.textColor || theme.text,
                          borderRadius: `${theme.baseRadius}px`,
                        },
                    <InlineText
                      value={btn.label}
                      onChange={(v) => {
                        const next = [...customButtons];
                        next[idx] = { ...next[idx], label: v };
                        onUpdateContent({ buttons: next });
                      }}
                      editable={editable}
                    />,
                    btn.id || idx,
                    { fieldKey: 'buttons', itemIndex: idx }
                  )
                )}
              </div>
            </div>

            {c.imageUrl && (
              <div
                className={stackHero ? 'w-full max-w-3xl overflow-hidden' : 'lg:col-span-6 overflow-hidden'}
                style={{
                  borderRadius: `${theme.baseRadius}px`,
                  border: `1px solid ${theme.border}`,
                }}
              >
                <SafeImage
                  src={c.imageUrl}
                  alt={c.imageAlt || ''}
                  editable={editable}
                  uploadLabel={effectiveUploadLabel}
                  emptyImageLabel={emptyImageLabel}
                  onSelectImage={(e) => activateField(e, 'imageUrl')}
                  onUploadFile={(file) => onQuickUploadImage?.('imageUrl', file)}
                  className={`${isMobile ? 'h-52' : 'h-64 md:h-80'} w-full object-cover`}
                />
              </div>
            )}
          </div>
        );
      }

      case 'stats': {
        const items = Array.isArray(c.items) ? c.items : [];
        const colsClass = isMobile
          ? 'grid-cols-2'
          : block.variant === 'b' || isTabletOrLess
          ? 'grid-cols-2'
          : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4';
        return (
          <div className="mx-auto space-y-5 sm:space-y-6" style={{ maxWidth: maxWMap[s.maxWidth] }}>
            {c.heading && (
              <div onClick={(e) => activateField(e, 'heading')}>
                <InlineText
                  value={fmt(c.heading)}
                  onChange={(v) => onUpdateContent({ heading: v })}
                  editable={editable}
                  as="h2"
                  className="text-base sm:text-lg font-bold"
                  style={headingStyle}
                />
              </div>
            )}
            <div className={`grid ${colsClass}`} style={{ gap: `${isMobile ? Math.min(s.gap, 12) : s.gap}px` }}>
              {items.map((item: { value: string; label: string }, idx: number) => (
                <div
                  key={idx}
                  data-interactive-content="true"
                  onClick={(e) => activateField(e, 'value', idx)}
                  className={`border ${isMobile ? 'p-3.5' : 'p-5'} ${editable ? 'cursor-pointer hover:border-[#F26A1B]/70 transition-colors' : ''}`}
                  style={cardStyle}
                >
                  <InlineText
                    value={fmt(item.value)}
                    onChange={(v) => updateArrayItem('items', idx, { value: v })}
                    editable={editable}
                    as="div"
                    className={`${isMobile ? 'text-lg' : 'text-2xl'} font-extrabold tabular-nums`}
                    style={{ ...headingStyle, color: theme.accent }}
                  />
                  <InlineText
                    value={fmt(item.label)}
                    onChange={(v) => updateArrayItem('items', idx, { label: v })}
                    editable={editable}
                    as="p"
                    className="mt-1 text-xs sm:text-sm"
                    style={{ color: theme.muted }}
                  />
                </div>
              ))}
            </div>
          </div>
        );
      }

      case 'features': {
        const items = Array.isArray(c.items) ? c.items : [];
        const colsClass =
          isMobile || block.variant === 'b' ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2';
        return (
          <div className="mx-auto space-y-6 sm:space-y-8" style={{ maxWidth: maxWMap[s.maxWidth] }}>
            <div className="space-y-2 max-w-2xl">
              <div onClick={(e) => activateField(e, 'heading')}>
                <InlineText
                  value={fmt(c.heading || '')}
                  onChange={(v) => onUpdateContent({ heading: v })}
                  editable={editable}
                  as="h2"
                  className="font-bold"
                  style={{
                    ...headingStyle,
                    fontSize: `calc(${isMobile ? '1.3rem' : '1.6rem'} * ${s.headingScale})`,
                  }}
                />
              </div>
              {c.subheading && (
                <div onClick={(e) => activateField(e, 'subheading')}>
                  <InlineText
                    value={fmt(c.subheading)}
                    onChange={(v) => onUpdateContent({ subheading: v })}
                    editable={editable}
                    as="p"
                    className="text-xs sm:text-sm"
                    style={{ color: theme.muted }}
                  />
                </div>
              )}
            </div>
            <div className={`grid ${colsClass}`} style={{ gap: `${isMobile ? Math.min(s.gap, 14) : s.gap}px` }}>
              {items.map((item: { index?: string; title: string; description: string }, idx: number) => (
                <div
                  key={idx}
                  data-interactive-content="true"
                  onClick={(e) => activateField(e, 'title', idx)}
                  className={`border ${isMobile ? 'p-4' : 'p-6'} ${
                    editable ? 'cursor-pointer hover:border-[#F26A1B]/70 transition-colors' : ''
                  } ${
                    block.variant === 'b'
                      ? isMobile
                        ? 'flex flex-col gap-3'
                        : 'flex flex-col md:flex-row md:items-center gap-4'
                      : ''
                  }`}
                  style={cardStyle}
                >
                  {item.index && (
                    <span
                      className="text-sm font-extrabold tabular-nums shrink-0"
                      style={{ color: theme.accent }}
                    >
                      {fmt(item.index)}
                    </span>
                  )}
                  <div className="space-y-1.5">
                    <InlineText
                      value={fmt(item.title)}
                      onChange={(v) => updateArrayItem('items', idx, { title: v })}
                      editable={editable}
                      as="h3"
                      className="text-base font-bold"
                      style={headingStyle}
                    />
                    <InlineText
                      value={fmt(item.description)}
                      onChange={(v) => updateArrayItem('items', idx, { description: v })}
                      editable={editable}
                      as="p"
                      multiline
                      className="text-sm leading-relaxed"
                      style={{ color: theme.muted }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      }

      case 'products': {
        const items = Array.isArray(c.items) ? c.items : [];
        const isRowVariant = block.variant === 'b';
        const colsClass =
          isRowVariant || isMobile
            ? 'grid-cols-1'
            : isTabletOrLess
            ? 'grid-cols-2'
            : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';
        return (
          <div className="mx-auto space-y-8" style={{ maxWidth: maxWMap[s.maxWidth] }}>
            <div className="space-y-2 max-w-2xl">
              <div onClick={(e) => activateField(e, 'heading')}>
                <InlineText
                  value={fmt(c.heading || '')}
                  onChange={(v) => onUpdateContent({ heading: v })}
                  editable={editable}
                  as="h2"
                  className="font-bold"
                  style={{ ...headingStyle, fontSize: `calc(1.6rem * ${s.headingScale})` }}
                />
              </div>
              {c.subheading && (
                <div onClick={(e) => activateField(e, 'subheading')}>
                  <InlineText
                    value={fmt(c.subheading)}
                    onChange={(v) => onUpdateContent({ subheading: v })}
                    editable={editable}
                    as="p"
                    className="text-sm"
                    style={{ color: theme.muted }}
                  />
                </div>
              )}
            </div>
            <div className={`grid ${colsClass}`} style={{ gap: `${s.gap}px` }}>
              {items.map(
                (
                  item: {
                    category?: string;
                    title: string;
                    description: string;
                    imageUrl?: string;
                    ctaLabel?: string;
                    ctaLink?: LinkTarget;
                  },
                  idx: number
                ) => (
                  <article
                    key={idx}
                    data-interactive-content="true"
                    onClick={(e) => activateField(e, 'title', idx)}
                    className={`border overflow-hidden ${
                      editable ? 'cursor-pointer hover:border-[#F26A1B]/70 transition-colors' : ''
                    } ${
                      isRowVariant && !isMobile ? 'grid grid-cols-12 items-center' : 'flex flex-col'
                    }`}
                    style={cardStyle}
                  >
                    <div className={isRowVariant && !isMobile ? 'col-span-4 h-full' : 'h-48 w-full'}>
                      <SafeImage
                        src={item.imageUrl}
                        alt={item.title}
                        editable={editable}
                        uploadLabel={effectiveUploadLabel}
                        emptyImageLabel={emptyImageLabel}
                        onSelectImage={(e) => activateField(e, 'imageUrl', idx)}
                        onUploadFile={(file) => onQuickUploadImage?.('imageUrl', file, idx)}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className={`p-5 space-y-2.5 ${isRowVariant && !isMobile ? 'col-span-8' : 'flex-1 flex flex-col justify-between'}`}>
                      <div className="space-y-1.5">
                        {item.category && (
                          <InlineText
                            value={fmt(item.category)}
                            onChange={(v) => updateArrayItem('items', idx, { category: v })}
                            editable={editable}
                            as="span"
                            className="text-xs font-semibold block"
                            style={{ color: theme.accent }}
                          />
                        )}
                        <InlineText
                          value={fmt(item.title)}
                          onChange={(v) => updateArrayItem('items', idx, { title: v })}
                          editable={editable}
                          as="h3"
                          className="text-base font-bold"
                          style={headingStyle}
                        />
                        <InlineText
                          value={fmt(item.description)}
                          onChange={(v) => updateArrayItem('items', idx, { description: v })}
                          editable={editable}
                          as="p"
                          multiline
                          className="text-sm leading-relaxed"
                          style={{ color: theme.muted }}
                        />
                      </div>
                      {item.ctaLabel && (
                        <div className="pt-2">
                          {renderLinkedAction(
                            item.ctaLink,
                            'inline-flex items-center gap-1 text-xs font-semibold hover:underline',
                            { color: theme.accent },
                            <InlineText
                              value={item.ctaLabel}
                              onChange={(v) => updateArrayItem('items', idx, { ctaLabel: v })}
                              editable={editable}
                            />,
                            'item-cta',
                            { fieldKey: 'ctaLabel', itemIndex: idx }
                          )}
                        </div>
                      )}
                    </div>
                  </article>
                )
              )}
            </div>
          </div>
        );
      }

      case 'gallery': {
        const items = Array.isArray(c.items) ? c.items : [];
        return (
          <div className="mx-auto space-y-6" style={{ maxWidth: maxWMap[s.maxWidth] }}>
            <div onClick={(e) => activateField(e, 'heading')}>
              <InlineText
                value={fmt(c.heading || '')}
                onChange={(v) => onUpdateContent({ heading: v })}
                editable={editable}
                as="h2"
                className="text-xl font-bold"
                style={headingStyle}
              />
            </div>
            <div
              className={`grid ${
                isMobile
                  ? 'grid-cols-1'
                  : block.variant === 'b'
                  ? 'grid-cols-3'
                  : isTabletOrLess
                  ? 'grid-cols-2'
                  : 'grid-cols-4'
              }`}
              style={{ gap: `${s.gap}px` }}
            >
              {items.map((item: { url: string; caption?: string }, idx: number) => (
                <figure
                  key={idx}
                  data-interactive-content="true"
                  onClick={(e) => activateField(e, 'url', idx)}
                  className={`border overflow-hidden ${
                    editable ? 'cursor-pointer hover:border-[#F26A1B]/70 transition-colors' : ''
                  } ${
                    block.variant === 'b' && idx === 0 && !isMobile ? 'col-span-2 row-span-2' : ''
                  }`}
                  style={cardStyle}
                >
                  <div className={block.variant === 'b' && idx === 0 && !isMobile ? 'h-80' : 'h-44'}>
                    <SafeImage
                      src={item.url}
                      alt={item.caption || ''}
                      editable={editable}
                      uploadLabel={effectiveUploadLabel}
                      emptyImageLabel={emptyImageLabel}
                      onSelectImage={(e) => activateField(e, 'url', idx)}
                      onUploadFile={(file) => onQuickUploadImage?.('url', file, idx)}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  {item.caption && (
                    <figcaption className="p-3 text-xs" style={{ color: theme.muted }}>
                      <InlineText
                        value={fmt(item.caption)}
                        onChange={(v) => updateArrayItem('items', idx, { caption: v })}
                        editable={editable}
                      />
                    </figcaption>
                  )}
                </figure>
              ))}
            </div>
          </div>
        );
      }

      case 'testimonials': {
        const items = Array.isArray(c.items) ? c.items : [];
        return (
          <div className="mx-auto space-y-6" style={{ maxWidth: maxWMap[s.maxWidth] }}>
            <div onClick={(e) => activateField(e, 'heading')}>
              <InlineText
                value={fmt(c.heading || '')}
                onChange={(v) => onUpdateContent({ heading: v })}
                editable={editable}
                as="h2"
                className="text-lg sm:text-xl font-bold"
                style={headingStyle}
              />
            </div>
            <div
              className={`grid ${
                isMobile || block.variant === 'b' ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'
              }`}
              style={{ gap: `${isMobile ? Math.min(s.gap, 14) : s.gap}px` }}
            >
              {items.map((item: { quote: string; author: string; role?: string }, idx: number) => (
                <blockquote
                  key={idx}
                  data-interactive-content="true"
                  onClick={(e) => activateField(e, 'quote', idx)}
                  className={`border ${isMobile ? 'p-4' : 'p-6'} space-y-4 ${
                    editable ? 'cursor-pointer hover:border-[#F26A1B]/70 transition-colors' : ''
                  }`}
                  style={cardStyle}
                >
                  <InlineText
                    value={fmt(item.quote)}
                    onChange={(v) => updateArrayItem('items', idx, { quote: v })}
                    editable={editable}
                    as="p"
                    multiline
                    className="text-sm leading-relaxed"
                  />
                  <footer className="text-xs flex items-center gap-2" style={{ color: theme.muted }}>
                    <InlineText
                      value={fmt(item.author)}
                      onChange={(v) => updateArrayItem('items', idx, { author: v })}
                      editable={editable}
                      as="strong"
                      className="font-bold"
                      style={{ color: theme.text }}
                    />
                    {item.role && (
                      <>
                        <span>·</span>
                        <InlineText
                          value={fmt(item.role)}
                          onChange={(v) => updateArrayItem('items', idx, { role: v })}
                          editable={editable}
                        />
                      </>
                    )}
                  </footer>
                </blockquote>
              ))}
            </div>
          </div>
        );
      }

      case 'pricing': {
        const plans = Array.isArray(c.plans) ? c.plans : [];
        return (
          <div className="mx-auto space-y-6 sm:space-y-8" style={{ maxWidth: maxWMap[s.maxWidth] }}>
            <div className="space-y-2 max-w-2xl">
              <div onClick={(e) => activateField(e, 'heading')}>
                <InlineText
                  value={fmt(c.heading || '')}
                  onChange={(v) => onUpdateContent({ heading: v })}
                  editable={editable}
                  as="h2"
                  className="text-xl sm:text-2xl font-bold"
                  style={headingStyle}
                />
              </div>
              {c.subheading && (
                <div onClick={(e) => activateField(e, 'subheading')}>
                  <InlineText
                    value={fmt(c.subheading)}
                    onChange={(v) => onUpdateContent({ subheading: v })}
                    editable={editable}
                    as="p"
                    className="text-xs sm:text-sm"
                    style={{ color: theme.muted }}
                  />
                </div>
              )}
            </div>
            <div
              className={`grid ${
                isMobile || block.variant === 'b'
                  ? 'grid-cols-1'
                  : isTabletOrLess
                  ? 'grid-cols-1 sm:grid-cols-2'
                  : 'grid-cols-1 md:grid-cols-3'
              }`}
              style={{ gap: `${isMobile ? Math.min(s.gap, 14) : s.gap}px` }}
            >
              {plans.map(
                (
                  plan: {
                    name: string;
                    price: string;
                    description: string;
                    features: string[];
                    ctaLabel: string;
                    ctaLink?: LinkTarget;
                    highlighted?: boolean;
                  },
                  idx: number
                ) => (
                  <div
                    key={idx}
                    data-interactive-content="true"
                    onClick={(e) => activateField(e, 'plans', idx)}
                    className={`border p-6 flex flex-col justify-between gap-5 ${
                      editable ? 'cursor-pointer hover:border-[#F26A1B]/70 transition-colors' : ''
                    } ${
                      block.variant === 'b' && !isMobile ? 'md:flex-row md:items-center' : ''
                    }`}
                    style={{
                      ...cardStyle,
                      borderColor: plan.highlighted ? theme.accent : theme.border,
                    }}
                  >
                    <div className="space-y-3">
                      <InlineText
                        value={fmt(plan.name)}
                        onChange={(v) => updateArrayItem('plans', idx, { name: v })}
                        editable={editable}
                        as="h3"
                        className="text-lg font-bold"
                        style={headingStyle}
                      />
                      <InlineText
                        value={fmt(plan.price)}
                        onChange={(v) => updateArrayItem('plans', idx, { price: v })}
                        editable={editable}
                        as="div"
                        className="text-xl font-extrabold tabular-nums"
                        style={{ color: theme.accent }}
                      />
                      <InlineText
                        value={fmt(plan.description)}
                        onChange={(v) => updateArrayItem('plans', idx, { description: v })}
                        editable={editable}
                        as="p"
                        className="text-xs"
                        style={{ color: theme.muted }}
                      />
                      <ul className="space-y-1.5 pt-2 text-sm" style={{ color: theme.muted }}>
                        {(plan.features || []).map((f, fIdx) => (
                          <li key={fIdx} className="flex items-center gap-2">
                            <Check className="h-3.5 w-3.5 shrink-0" style={{ color: theme.accent }} />
                            <span>{fmt(f)}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    {renderLinkedAction(
                      plan.ctaLink,
                      'inline-flex items-center justify-center px-4 py-2.5 text-xs font-semibold text-white shrink-0',
                      {
                        backgroundColor: plan.highlighted ? theme.accent : theme.primary,
                        borderRadius: `${theme.baseRadius}px`,
                      },
                      <InlineText
                        value={plan.ctaLabel}
                        onChange={(v) => updateArrayItem('plans', idx, { ctaLabel: v })}
                        editable={editable}
                      />,
                      'plan-cta',
                      { fieldKey: 'plans', itemIndex: idx }
                    )}
                  </div>
                )
              )}
            </div>
          </div>
        );
      }

      case 'faq': {
        const items = Array.isArray(c.items) ? c.items : [];
        return (
          <div className="mx-auto space-y-6" style={{ maxWidth: maxWMap[s.maxWidth] }}>
            <div onClick={(e) => activateField(e, 'heading')}>
              <InlineText
                value={fmt(c.heading || '')}
                onChange={(v) => onUpdateContent({ heading: v })}
                editable={editable}
                as="h2"
                className="text-xl font-bold"
                style={headingStyle}
              />
            </div>
            <div className={block.variant === 'b' && !isMobile ? 'grid grid-cols-2 gap-4' : 'space-y-3'}>
              {items.map((item: { question: string; answer: string }, idx: number) => {
                const isOpen = block.variant === 'b' || openFaqIdx === idx;
                return (
                  <div
                    key={idx}
                    data-interactive-content="true"
                    onClick={(e) => activateField(e, 'question', idx)}
                    className={`border p-4 ${editable ? 'cursor-pointer hover:border-[#F26A1B]/70 transition-colors' : ''}`}
                    style={cardStyle}
                  >
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenFaqIdx(openFaqIdx === idx ? null : idx);
                        if (editable) activateField(e, 'question', idx);
                      }}
                      className="flex w-full items-center justify-between gap-3 text-start font-semibold text-sm"
                    >
                      <InlineText
                        value={fmt(item.question)}
                        onChange={(v) => updateArrayItem('items', idx, { question: v })}
                        editable={editable}
                      />
                      {block.variant === 'a' && (
                        <ChevronDown
                          className={`h-4 w-4 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                        />
                      )}
                    </button>
                    {isOpen && (
                      <div className="mt-3 text-sm leading-relaxed" style={{ color: theme.muted }}>
                        <InlineText
                          value={fmt(item.answer)}
                          onChange={(v) => updateArrayItem('items', idx, { answer: v })}
                          editable={editable}
                          as="p"
                          multiline
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      }

      case 'contact': {
        const isCentered = block.variant === 'b';
        const stackContact = isCentered || isTabletOrLess;
        return (
          <div
            className={`mx-auto ${
              stackContact ? 'max-w-xl space-y-6' : 'grid grid-cols-1 lg:grid-cols-12 gap-8'
            }`}
            style={{ maxWidth: isCentered ? '640px' : maxWMap[s.maxWidth] }}
          >
            <div className={stackContact ? 'space-y-3' : 'lg:col-span-5 space-y-4'}>
              <div onClick={(e) => activateField(e, 'heading')}>
                <InlineText
                  value={fmt(c.heading || '')}
                  onChange={(v) => onUpdateContent({ heading: v })}
                  editable={editable}
                  as="h2"
                  className="text-xl sm:text-2xl font-bold"
                  style={headingStyle}
                />
              </div>
              <div onClick={(e) => activateField(e, 'subheading')}>
                <InlineText
                  value={fmt(c.subheading || '')}
                  onChange={(v) => onUpdateContent({ subheading: v })}
                  editable={editable}
                  as="p"
                  multiline
                  className="text-xs sm:text-sm"
                  style={{ color: theme.muted }}
                />
              </div>
              {!isCentered && (
                <div className={`border ${isMobile ? 'p-4' : 'p-5'} space-y-3 text-xs sm:text-sm`} style={cardStyle}>
                  <div className="flex items-start gap-2.5" onClick={(e) => activateField(e, 'addressValue')}>
                    <MapPin className="h-4 w-4 shrink-0 mt-0.5" style={{ color: theme.accent }} />
                    <div>
                      <span className="font-semibold">{c.addressLabel}: </span>
                      <InlineText
                        value={fmt(c.addressValue || '')}
                        onChange={(v) => onUpdateContent({ addressValue: v })}
                        editable={editable}
                        style={{ color: theme.muted }}
                      />
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5" onClick={(e) => activateField(e, 'phoneValue')}>
                    <Phone className="h-4 w-4 shrink-0 mt-0.5" style={{ color: theme.accent }} />
                    <div>
                      <span className="font-semibold">{c.phoneLabel}: </span>
                      <InlineText
                        value={fmt(c.phoneValue || '')}
                        onChange={(v) => onUpdateContent({ phoneValue: v })}
                        editable={editable}
                        className="tabular-nums"
                        style={{ color: theme.muted }}
                      />
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5" onClick={(e) => activateField(e, 'hoursValue')}>
                    <Clock className="h-4 w-4 shrink-0 mt-0.5" style={{ color: theme.accent }} />
                    <div>
                      <span className="font-semibold">{c.hoursLabel}: </span>
                      <InlineText
                        value={fmt(c.hoursValue || '')}
                        onChange={(v) => onUpdateContent({ hoursValue: v })}
                        editable={editable}
                        style={{ color: theme.muted }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setFormSubmitted(true);
                setTimeout(() => setFormSubmitted(false), 3000);
              }}
              className={`border ${isMobile ? 'p-4' : 'p-6'} space-y-4 ${stackContact ? '' : 'lg:col-span-7'}`}
              style={cardStyle}
            >
              <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'} gap-3 sm:gap-4`}>
                <input
                  type="text"
                  required
                  placeholder={lang === 'en' ? 'Full Name / Company' : 'نام و نام کارگاه'}
                  className="w-full rounded-lg border px-3.5 py-2.5 text-sm bg-black/15 outline-none focus:ring-2 focus:ring-[#F26A1B]"
                  style={{ borderColor: theme.border }}
                  onClick={(e) => e.stopPropagation()}
                />
                <input
                  type="tel"
                  required
                  placeholder={lang === 'en' ? 'Phone Number' : 'شماره تماس'}
                  className="w-full rounded-lg border px-3.5 py-2.5 text-sm bg-black/15 outline-none focus:ring-2 focus:ring-[#F26A1B]"
                  style={{ borderColor: theme.border }}
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
              <textarea
                rows={4}
                placeholder={
                  lang === 'en'
                    ? 'Describe your inquiry, machine model, or technical service needs...'
                    : 'شرح درخواست، مدل دستگاه یا خدمات مورد نیاز...'
                }
                className="w-full rounded-lg border px-3.5 py-2.5 text-sm bg-black/15 outline-none focus:ring-2 focus:ring-[#F26A1B]"
                style={{ borderColor: theme.border }}
                onClick={(e) => e.stopPropagation()}
              />
              <div className="flex items-center justify-between gap-3">
                <button
                  type="submit"
                  onClick={(e) => {
                    if (editable) {
                      e.preventDefault();
                      activateField(e, 'submitLabel');
                    }
                  }}
                  className="px-6 py-2.5 text-sm font-semibold text-white"
                  style={{ backgroundColor: theme.accent, borderRadius: `${theme.baseRadius}px` }}
                >
                  {c.submitLabel || (lang === 'en' ? 'Send Message' : 'ارسال پیام')}
                </button>
                {formSubmitted && (
                  <span className="text-xs font-medium text-emerald-400">
                    {lang === 'en'
                      ? 'Sample inquiry captured (connects to webhook in live export)'
                      : 'پیام نمونه ثبت شد (در خروجی واقعی به وب‌هوک متصل می‌شود)'}
                  </span>
                )}
              </div>
            </form>
          </div>
        );
      }

      case 'map':
        return (
          <div className="mx-auto space-y-4" style={{ maxWidth: maxWMap[s.maxWidth] }}>
            <div className={block.variant === 'b' && !isMobile ? 'grid grid-cols-12 gap-6 items-center' : 'space-y-4'}>
              <div className={block.variant === 'b' && !isMobile ? 'col-span-4 space-y-2' : 'space-y-1.5'}>
                <div onClick={(e) => activateField(e, 'heading')}>
                  <InlineText
                    value={fmt(c.heading || '')}
                    onChange={(v) => onUpdateContent({ heading: v })}
                    editable={editable}
                    as="h2"
                    className="text-lg font-bold"
                    style={headingStyle}
                  />
                </div>
                <div onClick={(e) => activateField(e, 'caption')}>
                  <InlineText
                    value={fmt(c.caption || '')}
                    onChange={(v) => onUpdateContent({ caption: v })}
                    editable={editable}
                    as="p"
                    className="text-sm"
                    style={{ color: theme.muted }}
                  />
                </div>
                <p
                  onClick={(e) => activateField(e, 'coordinates')}
                  className="text-xs tabular-nums"
                  style={{ color: theme.accent }}
                >
                  {fmt(c.coordinates || '')}
                </p>
              </div>
              <div
                className={`overflow-hidden border h-64 ${block.variant === 'b' && !isMobile ? 'col-span-8' : ''}`}
                style={{ borderColor: theme.border, borderRadius: `${theme.baseRadius}px` }}
              >
                <SafeImage
                  src={c.imageUrl}
                  alt={c.heading || 'Map'}
                  editable={editable}
                  uploadLabel={effectiveUploadLabel}
                  emptyImageLabel={emptyImageLabel}
                  onSelectImage={(e) => activateField(e, 'imageUrl')}
                  onUploadFile={(file) => onQuickUploadImage?.('imageUrl', file)}
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
          </div>
        );

      case 'cta':
        return (
          <div
            className={`mx-auto flex flex-col gap-6 ${
              block.variant === 'a' && !isMobile ? 'md:flex-row md:items-center md:justify-between' : 'items-center text-center'
            }`}
            style={{ maxWidth: maxWMap[s.maxWidth] }}
          >
            <div className="space-y-2 max-w-2xl">
              <div onClick={(e) => activateField(e, 'headline')}>
                <InlineText
                  value={fmt(c.headline || '')}
                  onChange={(v) => onUpdateContent({ headline: v })}
                  editable={editable}
                  as="h2"
                  className="text-2xl font-bold"
                  style={headingStyle}
                />
              </div>
              <div onClick={(e) => activateField(e, 'description')}>
                <InlineText
                  value={fmt(c.description || '')}
                  onChange={(v) => onUpdateContent({ description: v })}
                  editable={editable}
                  as="p"
                  className="text-sm"
                  style={{ color: theme.muted }}
                />
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2.5 shrink-0">
              {renderLinkedAction(
                normalizeLegacyLink(c.ctaLink as LinkTarget | undefined, 'page-contact'),
                'inline-flex items-center gap-1.5 shrink-0 px-6 py-3 text-sm font-semibold text-white',
                { backgroundColor: theme.accent, borderRadius: `${theme.baseRadius}px` },
                <InlineText
                  value={c.ctaLabel || ''}
                  onChange={(v) => onUpdateContent({ ctaLabel: v })}
                  editable={editable}
                />,
                'cta-main-btn',
                { fieldKey: 'ctaLabel' }
              )}
              {customButtons.map((btn, idx) =>
                renderLinkedAction(
                  btn.link,
                  'inline-flex items-center gap-1.5 shrink-0 px-5 py-3 text-sm font-semibold',
                  btn.style === 'primary'
                    ? {
                        backgroundColor: theme.accent,
                        color: '#ffffff',
                        borderRadius: `${theme.baseRadius}px`,
                      }
                    : btn.style === 'secondary'
                    ? {
                        backgroundColor: theme.primary,
                        color: '#ffffff',
                        borderRadius: `${theme.baseRadius}px`,
                      }
                    : {
                        borderColor: theme.border,
                        borderWidth: '1px',
                        borderStyle: 'solid',
                        color: s.textColor || theme.text,
                        borderRadius: `${theme.baseRadius}px`,
                      },
                  <InlineText
                    value={btn.label}
                    onChange={(v) => {
                      const next = [...customButtons];
                      next[idx] = { ...next[idx], label: v };
                      onUpdateContent({ buttons: next });
                    }}
                    editable={editable}
                  />,
                  btn.id || idx,
                  { fieldKey: 'buttons', itemIndex: idx }
                )
              )}
            </div>
          </div>
        );

      case 'richtext':
        return (
          <div className="mx-auto space-y-4" style={{ maxWidth: maxWMap[s.maxWidth] }}>
            <div onClick={(e) => activateField(e, 'heading')}>
              <InlineText
                value={fmt(c.heading || '')}
                onChange={(v) => onUpdateContent({ heading: v })}
                editable={editable}
                as="h2"
                className="text-xl font-bold"
                style={headingStyle}
              />
            </div>
            <div
              onClick={(e) => activateField(e, 'body')}
              className={block.variant === 'b' && !isMobile ? 'columns-2 gap-8' : 'space-y-3'}
            >
              <InlineText
                value={fmt(c.body || '')}
                onChange={(v) => onUpdateContent({ body: v })}
                editable={editable}
                as="div"
                multiline
                className="whitespace-pre-line text-sm leading-relaxed"
                style={{ color: theme.muted }}
              />
            </div>
          </div>
        );

      case 'footer':
        return (
          <footer className="mx-auto" style={{ maxWidth: maxWMap[s.maxWidth] }}>
            {block.variant === 'b' ? (
              <div className="flex flex-wrap items-center justify-between gap-4 text-xs">
                <div className="flex items-center gap-3">
                  {c.logoUrl && (
                    <SafeImage
                      src={c.logoUrl}
                      alt={c.brandName || ''}
                      editable={editable}
                      compactOverlay
                      uploadLabel={effectiveUploadLabel}
                      emptyImageLabel={emptyImageLabel}
                      onSelectImage={(e) => activateField(e, 'logoUrl')}
                      onUploadFile={(file) => onQuickUploadImage?.('logoUrl', file)}
                      className="h-7 w-auto object-contain"
                    />
                  )}
                  <span onClick={(e) => activateField(e, 'brandName')} className="font-bold">
                    {c.brandName}
                  </span>
                </div>
                <span onClick={(e) => activateField(e, 'copyright')} style={{ color: theme.muted }}>
                  {fmt(c.copyright || '')}
                </span>
              </div>
            ) : (
              <div
                className={`grid ${
                  isMobile ? 'grid-cols-1 gap-5' : isTabletOrLess ? 'grid-cols-2 gap-6' : 'grid-cols-1 md:grid-cols-3 gap-8'
                } text-sm`}
              >
                <div className="space-y-3">
                  {c.logoUrl && (
                    <SafeImage
                      src={c.logoUrl}
                      alt={c.brandName || ''}
                      editable={editable}
                      compactOverlay
                      uploadLabel={effectiveUploadLabel}
                      emptyImageLabel={emptyImageLabel}
                      onSelectImage={(e) => activateField(e, 'logoUrl')}
                      onUploadFile={(file) => onQuickUploadImage?.('logoUrl', file)}
                      className="h-8 w-auto object-contain"
                    />
                  )}
                  <div onClick={(e) => activateField(e, 'summary')}>
                    <InlineText
                      value={fmt(c.summary || '')}
                      onChange={(v) => onUpdateContent({ summary: v })}
                      editable={editable}
                      as="p"
                      multiline
                      className="text-xs leading-relaxed"
                      style={{ color: theme.muted }}
                    />
                  </div>
                </div>
                <div className="space-y-2 text-xs" style={{ color: theme.muted }}>
                  <div className="flex items-center gap-2" onClick={(e) => activateField(e, 'address')}>
                    <MapPin className="h-3.5 w-3.5 shrink-0" style={{ color: theme.accent }} />
                    <InlineText
                      value={fmt(c.address || '')}
                      onChange={(v) => onUpdateContent({ address: v })}
                      editable={editable}
                    />
                  </div>
                  <div className="flex items-center gap-2" onClick={(e) => activateField(e, 'phone')}>
                    <Phone className="h-3.5 w-3.5 shrink-0" style={{ color: theme.accent }} />
                    <InlineText
                      value={fmt(c.phone || '')}
                      onChange={(v) => onUpdateContent({ phone: v })}
                      editable={editable}
                      className="tabular-nums"
                    />
                  </div>
                  <div className="flex items-center gap-2" onClick={(e) => activateField(e, 'email')}>
                    <Mail className="h-3.5 w-3.5 shrink-0" style={{ color: theme.accent }} />
                    <InlineText
                      value={c.email || ''}
                      onChange={(v) => onUpdateContent({ email: v })}
                      editable={editable}
                    />
                  </div>
                </div>
                <div
                  onClick={(e) => activateField(e, 'copyright')}
                  className="flex flex-col justify-end text-xs"
                  style={{ color: theme.muted }}
                >
                  <InlineText
                    value={fmt(c.copyright || '')}
                    onChange={(v) => onUpdateContent({ copyright: v })}
                    editable={editable}
                  />
                </div>
              </div>
            )}
          </footer>
        );
    }
  };

  const rendersInlineButtons =
    block.type === 'navbar' || block.type === 'hero' || block.type === 'cta';

  return (
    <motion.div
      id={`section-${block.id}`}
      key={`${block.id}-${replayKey}-${animType}`}
      initial={animType === 'none' ? false : initialVariant}
      animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
      transition={{
        duration: animType === 'none' ? 0 : animDuration,
        delay: animType === 'none' ? 0 : animDelay,
        ease: [0.16, 1, 0.3, 1],
      }}
      onClick={(e) => {
        if (editable && isSelected && s.backgroundType === 'image' && e.target === e.currentTarget) {
          activateField(e, 'backgroundImage', undefined, 'style');
        }
      }}
      style={sectionStyle}
      className={block.hidden ? 'opacity-35 grayscale' : ''}
    >
      {renderInner()}
      {!rendersInlineButtons && renderCustomButtonsRow(customButtons)}
    </motion.div>
  );
};
