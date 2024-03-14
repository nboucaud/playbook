import { cssVar } from '@toeverything/theme';
import { globalStyle, style } from '@vanilla-extract/css';

export const settingWrapper = style({
  flexGrow: 1,
  display: 'flex',
  justifyContent: 'flex-end',
  minWidth: '150px',
  maxWidth: '250px',
});

export const editorPreviewContainer = style({
  position: 'relative',
  border: `1px solid ${cssVar('borderColor')}`,
  borderRadius: '4px',
  height: '180px',
  maxHeight: '180px',
  padding: 1,
  marginBottom: 25,
});

globalStyle(`${editorPreviewContainer} .affine-edgeless-viewport`, {
  height: '171px',
});

globalStyle(`${editorPreviewContainer} affine-edgeless-zoom-toolbar-widget`, {
  display: 'none',
});

globalStyle(`${editorPreviewContainer} edgeless-toolbar`, {
  display: 'none',
});

export const editorPreviewMask = style({
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  zIndex: 1,
  backgroundColor: 'transparent',
});

export const editorPreviewTip = style({
  position: 'absolute',
  top: '80%',
  left: '50%',
  transform: 'translate(-50%, 0)',
  zIndex: 1,
  color: cssVar('textSecondaryColor'),
  background: cssVar('hoverColorFilled'),
  width: '61px',
  height: '24px',
  padding: '2px 8px',
  borderRadius: '4px',
  fontSize: 12,
});

export const previewTitle = style({
  fontSize: 12,
  fontWeight: 600,
  color: cssVar('textSecondaryColor'),
  marginTop: 8,
  marginBottom: 8,
});

export const optionText = style({
  color: cssVar('textPrimaryColor'),
  fontSize: 12,
  fontWeight: 500,
});
