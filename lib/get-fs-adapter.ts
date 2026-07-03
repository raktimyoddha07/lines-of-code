import { isDesktop } from './fs-adapter';
import { webFsAdapter } from './fs-adapter-web';
import { desktopFsAdapter } from './fs-adapter-desktop';

export function getFsAdapter() {
  return isDesktop() ? desktopFsAdapter : webFsAdapter;
}
