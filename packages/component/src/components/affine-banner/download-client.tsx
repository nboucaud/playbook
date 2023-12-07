import { AffineLogoSimCBlue1_1Icon, CloseIcon } from '@blocksuite/icons';

import {
  downloadCloseButtonStyle,
  downloadMessageStyle,
  downloadTipContainerStyle,
  downloadTipIconStyle,
  downloadTipStyle,
  linkStyle,
} from './index.css';

export const DownloadTips = ({ onClose }: { onClose: () => void }) => {
  return (
    <div
      className={downloadTipContainerStyle}
      data-testid="download-client-tip"
    >
      <div className={downloadTipStyle}>
        <AffineLogoSimCBlue1_1Icon className={downloadTipIconStyle} />
        <div className={downloadMessageStyle}>
          This is an older version of AFFiNE, backup your data before
          <strong> Dec 14 </strong> to avoid data loss -
          <a
            className={linkStyle}
            href="https://affine.pro/blog/affine-web-version-upgrade-12-2023"
            target="_blank"
            rel="noreferrer"
          >
            Read More
          </a>
          .
        </div>
      </div>
      <div
        className={downloadCloseButtonStyle}
        onClick={onClose}
        data-testid="download-client-tip-close-button"
      >
        <CloseIcon className={downloadTipIconStyle} />
      </div>
    </div>
  );
};

export default DownloadTips;
