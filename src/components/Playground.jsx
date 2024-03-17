import React, { useEffect } from 'react';
import sdk from '@stackblitz/sdk';

const Playground = (props) => {
  useEffect(() => {
    sdk.embedProjectId('embed', props.projectId, {
      forceEmbedLayout: true,
      openFile: props.openFile,
      theme: 'dark',
      hideExplorer: true,
      // hideNavigation: true,
      hideDevTools: true,
      height: 500,
    });
  }, []);

  return <div id="embed"></div>;
};

export default Playground;
