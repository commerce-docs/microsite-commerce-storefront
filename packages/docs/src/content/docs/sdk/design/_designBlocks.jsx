export const Block = ({ style, children }) => (
  // Renders content in a block that has a light background
  <div
    style={{
      background: 'var(--color-neutral-50)',
      color: 'black',
      display: 'grid',
      gridGap: 'var(--spacing-sm)',
      padding: 'var(--spacing-sm)',
      ...style,
    }}
  >
    {children}
  </div>
);

export const DesignSwatchGroup = ({
  property,
  prefix,
  tokens,
  swatchStyles,
  groupStyles,
  children,
}) => {
  // Renders a group of token swatches
  const group = prefix
    ? tokens.filter((entry) => entry.startsWith(prefix))
    : tokens;
  return group.map((entry) => {
    const styleOverride = {};
    styleOverride[property] = `var(${entry})`;
    return (
      <div
        key={entry}
        style={{
          display: 'flex',
          alignItems: 'center',
          font: 'var(--type-body-1-strong-font)',
          letterSpacing: 'var(--type-body-1-strong-spacing)',
          margin: 'var(--spacing-xxsmall)',
          ...groupStyles,
        }}
      >
        <DesignSwatch style={{ ...swatchStyles, ...styleOverride }}>
          {children}
        </DesignSwatch>
        <pre style={{ marginLeft: 'var(--spacing-small)' }}>var({entry});</pre>
      </div>
    );
  });
};

export const DesignSwatch = ({ style, children, ...restProps }) => {
  // Renders a token swatch
  return (
    <div
      style={{
        width: '3rem',
        height: '3rem',
        background: 'var(--color-informational-200)',
        border: '1px solid var(--color-neutral-400)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        ...style,
      }}
    >
      {children}
    </div>
  );
};

export const TokenDefinitions = ({ tokenData }) => {
  const tokenDefinitions = tokenData.map((token) => {
    const { name, value, comment } = token;
    return `${name}: ${value}; ${comment ? `/* ${comment} */` : ''}`;
  });
  return (`${tokenDefinitions.join('\n  ')}\n`);
};
