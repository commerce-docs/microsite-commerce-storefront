import React, { useEffect } from 'react';
import sdk from '@stackblitz/sdk';
import styles from './Playground.module.css';

const Playground = () => {
  useEffect(() => {
    sdk.embedProjectId('embed', 'Starlight', {
      forceEmbedLayout: true,
      view: 'editor',
      openFile: 'README.md',
      theme: 'light',
    });
  }, []);

  return (
    <div className={styles.playground}>
      <div id="embed">
        <p>Embed will go here</p>
      </div>
    </div>
  );
};

export default Playground;
