import { keyframes, style } from '@vanilla-extract/css';

const slideDown = keyframes({
  '0%': {
    height: '0px',
  },
  '100%': {
    height: '44px',
  },
});

export const browserWarningStyle = style({
  backgroundColor: 'var(--affine-background-warning-color)',
  color: 'var(--affine-warning-color)',
  height: '36px',
  fontSize: 'var(--affine-font-sm)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  position: 'relative',
});
export const closeButtonStyle = style({
  width: '36px',
  height: '36px',
  color: 'var(--affine-icon-color)',
  cursor: 'pointer',
  display: 'flex',
  justifyContent: 'flex-end',
  alignItems: 'center',
  position: 'absolute',
  right: '16px',
});
export const closeIconStyle = style({
  width: '15px',
  height: '15px',
  position: 'relative',
  zIndex: 1,
});
export const downloadTipContainerStyle = style({
  backgroundColor: 'rgba(253, 236, 235, 1)',
  color: 'rgb(235, 67, 53)',
  width: '100%',
  height: '44px',
  fontSize: 'var(--affine-font-base)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  position: 'relative',
  animation: `${slideDown} .3s ease-in-out forwards`,
});
export const downloadTipStyle = style({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
});
export const downloadTipIconStyle = style({
  color: 'rgb(235, 67, 53)',
  width: '24px',
  height: '24px',
  fontSize: '24px',
  position: 'relative',
  zIndex: 1,
});
export const downloadCloseButtonStyle = style({
  color: 'rgb(235, 67, 53)',
  cursor: 'pointer',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  position: 'absolute',
  right: '24px',
});
export const downloadMessageStyle = style({
  color: 'rgb(235, 67, 53)',
  marginLeft: '8px',
});
export const linkStyle = style({
  color: 'rgb(235, 67, 53)',
  marginLeft: '4px',
  textDecoration: 'underline',
  ':hover': {
    textDecoration: 'underline',
  },
  ':visited': {
    color: 'rgb(235, 67, 53)',
    textDecoration: 'underline',
  },
});
