import { cssVar } from '@toeverything/theme';
import { createVar, globalStyle, keyframes, style } from '@vanilla-extract/css';

export const progressColorVar = createVar();

export const workspaceAndUserWrapper = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 8,
});

export const workspaceWrapper = style({
  width: 0,
  flex: 1,
});

export const workspaceCardViewTransition = style({
  selectors: {
    '&:not([data-state="open"])': {
      viewTransitionName: 'workspace-card',
    },
  },
});

const circleClip = keyframes({
  '0%': {
    clipPath: 'circle(10% at 100px 70px)',
    opacity: 0,
  },
  '30%': {
    opacity: 1,
  },
  '100%': {
    clipPath: 'circle(150% at 100px 70px)',
  },
});

const darker = keyframes({
  '0%': {
    filter: 'brightness(1)',
  },
  '100%': {
    filter: 'brightness(0.5)',
  },
});

globalStyle(`::view-transition-new(root),::view-transition-old(root)`, {
  animationDuration: '1000ms',
  animationTimingFunction: 'ease-in',
});

globalStyle(
  `::view-transition-new(workspace-card),::view-transition-old(workspace-card)`,
  {
    height: '100%',
    animationDuration: '500ms',
    animationTimingFunction: 'ease-in',
  }
);

globalStyle('::view-transition-old(workspace-card)', {
  width: '284px',
});

globalStyle('::view-transition-old(root)', {
  animationName: darker,
});

globalStyle('::view-transition-new(root)', {
  animationName: circleClip,
  background: cssVar('backgroundPrimaryColor'),
});

export const userInfoWrapper = style({
  flexShrink: 0,
  width: 'auto',
  height: 'auto',
  padding: '4px 0',
});

// TODO(@catsjuice):
globalStyle(`button.${userInfoWrapper} > span`, {
  lineHeight: 0,
});

export const operationMenu = style({
  display: 'flex',
  flexDirection: 'column',
  gap: 4,
});
// TODO: refactor menu, use `gap` to replace `margin`
globalStyle(`.${operationMenu} > div:not([data-divider])`, {
  marginBottom: '0 !important',
  marginTop: '0 !important',
});

export const usageBlock = style({
  display: 'flex',
  flexDirection: 'column',
  gap: 4,
  borderRadius: 4,
});
export const aiUsageBlock = style({
  padding: 12,
  cursor: 'pointer',
  ':hover': {
    background: cssVar('hoverColor'),
  },
  selectors: {
    '&[data-pro]': {
      padding: '12px 12px 2px 12px',
    },
  },
});
export const cloudUsageBlock = style({
  padding: '4px 12px',
});

export const usageLabel = style({
  fontWeight: 400,
  lineHeight: '20px',
  fontSize: cssVar('fontXs'),
  color: cssVar('textSecondaryColor'),
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
});
export const usageLabelTitle = style({
  color: cssVar('textPrimaryColor'),
  marginRight: '0.5em',
});

export const cloudUsageBar = style({
  height: 10,
  borderRadius: 5,
  overflow: 'hidden',
  position: 'relative',
  minWidth: 260,

  '::before': {
    position: 'absolute',
    inset: 0,
    content: '""',
    backgroundColor: cssVar('black'),
    opacity: 0.04,
  },
});
export const cloudUsageBarInner = style({
  height: '100%',
  borderRadius: 'inherit',
  backgroundColor: progressColorVar,
});
export const freeTag = style({
  height: 20,
  padding: '0px 4px',
  borderRadius: 4,
  fontWeight: 500,
  fontSize: cssVar('fontXs'),
  lineHeight: '20px',
  color: cssVar('pureWhite'),
  background: cssVar('primaryColor'),
});
