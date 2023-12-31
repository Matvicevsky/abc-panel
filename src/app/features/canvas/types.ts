import { LinkModel } from '@grafana/data';
import { ColorDimensionConfig, TextDimensionConfig } from '@grafana/schema';
import {
  BackgroundConfig,
  BackgroundImageSize,
  Constraint,
  HorizontalConstraint,
  LineConfig,
  Placement,
  VerticalConstraint,
} from 'panelcfg.gen';

export enum QuickPlacement {
  Top = 'top',
  Bottom = 'bottom',
  Left = 'left',
  Right = 'right',
  HorizontalCenter = 'hcenter',
  VerticalCenter = 'vcenter',
}

export enum Align {
  Left = 'left',
  Center = 'center',
  Right = 'right',
}

export enum VAlign {
  Top = 'top',
  Middle = 'middle',
  Bottom = 'bottom',
}

export interface TextData {
  text?: string;
  color?: string;
  size?: number; // 0 or missing will "auto size"
  align: Align;
  valign: VAlign;
  links?: LinkModel[];
}

export interface TextConfig {
  text?: TextDimensionConfig;
  color?: ColorDimensionConfig;
  size?: number; // 0 or missing will "auto size"
  align: Align;
  valign: VAlign;
}

export interface EllipseConfig extends TextConfig {
  backgroundColor?: ColorDimensionConfig;
  borderColor?: ColorDimensionConfig;
  width?: number;
}

export interface EllipseData extends TextData {
  backgroundColor?: string;
  borderColor?: string;
  width?: number;
}

export {
  Placement,
  Constraint,
  HorizontalConstraint,
  VerticalConstraint,
  BackgroundImageSize,
  LineConfig,
  BackgroundConfig,
};
