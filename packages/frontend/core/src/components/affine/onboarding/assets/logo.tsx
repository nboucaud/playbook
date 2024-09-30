import { memo } from 'react';

import logo from './logo.png';

export default memo(function Logo() {
  return <img src={logo} alt="Infogito logo" />;
});
