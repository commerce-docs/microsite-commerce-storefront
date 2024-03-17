import { component$, useVisibleTask$ } from '@builder.io/qwik';
import type { UiThemeOption, UiViewOption } from '@stackblitz/sdk';
import styles from './stackblitz.module.css';

interface Props {
  id: string;
  file: string;
  view?: 'editor' | 'preview' | null;
  hideExplorer?: boolean;
  height?: number;
  theme?: 'dark' | 'light' | 'default' | null;
  clickToLoad?: boolean;
}

const StackBlitz = component$<Props>(
  ({
    id,
    file,
    view = 'default',
    hideExplorer = true,
    height = 500,
    theme = 'dark',
    clickToLoad = true,
  }) => {
    useVisibleTask$(async () => {
      const sdk = (await import('@stackblitz/sdk')).default;

      sdk.embedProjectId('stackblitz-embed', id, {
        forceEmbedLayout: true,
        openFile: file,
        view: view as UiViewOption,
        hideExplorer: hideExplorer,
        hideNavigation: false,
        height: height,
        theme: theme as UiThemeOption,
        clickToLoad: clickToLoad,
      });
    });

    return <div id="stackblitz-embed" style="border: 1px solid #ccc;" />;
  }
);

export default StackBlitz;
