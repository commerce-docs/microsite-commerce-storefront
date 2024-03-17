import { component$, useVisibleTask$ } from '@builder.io/qwik';
import type { UiThemeOption, UiViewOption } from '@stackblitz/sdk';

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
    view = null,
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
        view: view as UiViewOption | undefined, // Fix: Update the type of 'view' to include 'undefined'
        hideExplorer: hideExplorer,
        hideNavigation: true,
        height: height,
        theme: theme as UiThemeOption | undefined, // Fix: Update the type of 'theme' to include 'undefined'
        clickToLoad: clickToLoad,
      });
    });

    return <div id="stackblitz-embed" />;
  }
);

export default StackBlitz;
