import React from 'react';
import { BlockCategory, BlockInstance, BlockType, ProjectData } from '../types/editor';

export interface RegisteredBlockDefinition {
  type: BlockType;
  category: BlockCategory;
  nameFa: string;
  nameEn: string;
  descriptionFa: string;
  descriptionEn: string;
  iconName: string;
  createDefault: () => Omit<BlockInstance, 'id'>;
}

export interface RegisteredPanelDefinition {
  id: string;
  titleFa: string;
  titleEn: string;
  iconName: string;
  render: () => React.ReactNode;
}

export interface RegisteredExporterDefinition {
  id: string;
  nameFa: string;
  nameEn: string;
  descriptionFa: string;
  descriptionEn: string;
  extension: string;
  execute: (project: ProjectData) => Promise<void>;
}

export interface ConnectorFieldSchema {
  key: string;
  labelFa: string;
  labelEn: string;
  placeholder: string;
  type: 'text' | 'url' | 'select';
  options?: { value: string; labelFa: string; labelEn: string }[];
}

export interface RegisteredConnectorDefinition {
  id: string;
  nameFa: string;
  nameEn: string;
  descriptionFa: string;
  descriptionEn: string;
  fields: ConnectorFieldSchema[];
  injectHeadHtml?: (values: Record<string, string>) => string;
  injectFormAttributes?: (values: Record<string, string>) => Record<string, string>;
}

class StudioPluginRegistry {
  private blocks = new Map<BlockType, RegisteredBlockDefinition>();
  private panels = new Map<string, RegisteredPanelDefinition>();
  private exporters = new Map<string, RegisteredExporterDefinition>();
  private connectors = new Map<string, RegisteredConnectorDefinition>();

  registerBlock(def: RegisteredBlockDefinition): void {
    this.blocks.set(def.type, def);
  }

  registerPanel(def: RegisteredPanelDefinition): void {
    this.panels.set(def.id, def);
  }

  registerExporter(def: RegisteredExporterDefinition): void {
    this.exporters.set(def.id, def);
  }

  registerConnector(def: RegisteredConnectorDefinition): void {
    this.connectors.set(def.id, def);
  }

  getBlocks(): RegisteredBlockDefinition[] {
    return Array.from(this.blocks.values());
  }

  getBlock(type: BlockType): RegisteredBlockDefinition | undefined {
    return this.blocks.get(type);
  }

  getPanels(): RegisteredPanelDefinition[] {
    return Array.from(this.panels.values());
  }

  getExporters(): RegisteredExporterDefinition[] {
    return Array.from(this.exporters.values());
  }

  getConnectors(): RegisteredConnectorDefinition[] {
    return Array.from(this.connectors.values());
  }
}

export const pluginRegistry = new StudioPluginRegistry();

export const registerBlock = (def: RegisteredBlockDefinition) => pluginRegistry.registerBlock(def);
export const registerPanel = (def: RegisteredPanelDefinition) => pluginRegistry.registerPanel(def);
export const registerExporter = (def: RegisteredExporterDefinition) => pluginRegistry.registerExporter(def);
export const registerConnector = (def: RegisteredConnectorDefinition) => pluginRegistry.registerConnector(def);
