import { keyframes, style, styleVariants } from '@vanilla-extract/css';

const slideToLeft = keyframes({
  '0%': {
    transform: 'translateX(300px)',
    opacity: 0,
  },
  '100%': {
    transform: 'translateX(0px)',
    opacity: 1,
  },
});
const slideToRight = keyframes({
  '0%': {
    transform: 'translateX(0px)',
    opacity: 1,
  },
  '100%': {
    transform: 'translateX(300px)',
    opacity: 0,
  },
});
export const formSlideToLeftStyle = style({
  animation: `${slideToLeft} 0.3s ease-in-out forwards`,
});
export const formSlideToRightStyle = style({
  animation: `${slideToRight} 0.3s ease-in-out forwards`,
});

export const notificationCenterViewportStyle = style({
  position: 'fixed',
  bottom: '18px',
  right: '20px',
  display: 'flex',
  flexDirection: 'column',
  width: '380px',
  margin: 0,
  zIndex: 2147483647,
  outline: 'none',
});

export const notificationStyle = style({
  position: 'relative',
  display: 'flex',
  borderRadius: '10px',
});
export const notificationIconStyle = style({
  fontSize: '24px',
  marginLeft: '18px',
  marginRight: '12px',
  color: 'var(--affine-processing-color)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
});
export const notificationContentStyle = style({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  padding: '16px 0',
  width: '100%',
  borderRadius: '8px',
  boxShadow: 'var(--affine-shadow-1)',
  border: '1px solid var(--affine-border-color)',
  background: 'var(--affine-white)',
});
export const notificationTitleContactStyle = style({
  marginRight: '22px',
  width: '200px',
  whiteSpace: 'nowrap',
  textOverflow: 'ellipsis',
  overflow: 'hidden',
  lineHeight: '1.5',
});
export const notificationTitleStyle = style({
  display: 'flex',
  alignItems: 'center',
  width: '100%',
  justifyContent: 'flex-start',
});
export const notificationDescriptionStyle = style({
  fontSize: 'var(--affine-font-sm)',
  color: 'var(--affine-text-secondary-color)',
  marginBottom: '4px',
});
export const notificationTimeStyle = style({
  fontSize: 'var(--affine-font-sm)',
  color: 'var(--affine-text-secondary-color)',
  marginBottom: '4px',
});
export const closeButtonStyle = style({
  fontSize: '22px',
  marginRight: '19px',
  marginLeft: '16px',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
});
export const closeButtonWithoutUndoStyle = style({
  marginLeft: '92px',
});
export const undoButtonStyle = style({
  fontSize: 'var(--affine-font-sm)',
  background: 'var(--affine-hover-color)',
  padding: '3px 6px',
  borderRadius: '4px',
  color: 'var(--affine-processing-color)',
  cursor: 'pointer',
});
export const messageStyle = style({
  fontSize: 'var(--affine-font-sm)',
  width: '200px',
  marginLeft: '50px',
  lineHeight: '18px',
});
export const progressBarStyle = style({
  fontSize: 'var(--affine-font-sm)',
  width: '100%',
  height: '10px',
  marginTop: '10px',
  padding: '0 16px',
  borderRadius: '2px',
  marginBottom: '16px',
});
export const darkSuccessStyle = style({
  background: 'var(--affine-success-color)',
  borderRadius: '8px',
});
export const darkInfoStyle = style({
  background: 'var(--affine-processing-color)',
  borderRadius: '8px',
});
export const darkErrorStyle = style({
  background: 'var(--affine-error-color)',
  borderRadius: '8px',
});
export const darkWarningStyle = style({
  background: 'var(--affine-warning-color)',
  borderRadius: '8px',
});
export const lightSuccessStyle = style({
  background: 'var(--affine-background-success-color)',
  borderRadius: '8px',
});
export const lightInfoStyle = style({
  background: 'var(--affine-background-processing-color)',
  borderRadius: '8px',
});
export const lightErrorStyle = style({
  background: 'var(--affine-background-error-color)',
  borderRadius: '8px',
});
export const lightWarningStyle = style({
  background: 'var(--affine-background-warning-color)',
  borderRadius: '8px',
});
export const darkColorStyle = style({
  color: 'var(--affine-white)',
});
export const lightInfoIconStyle = style({
  color: 'var(--affine-processing-color)',
});
export const mixBlendStyle = styleVariants({
  secondary: {
    mixBlendMode: 'darken',
  },
  tertiary: {
    mixBlendMode: 'overlay',
  },
});
