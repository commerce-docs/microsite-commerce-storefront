import { createContext, memo, useCallback, useContext, useState } from 'react';

const ctx = createContext(0);

function useIndent() {
  return useContext(ctx);
}

const Tree = ({ children }) => (
  <div
    style={{
      marginTop: '0.5rem',
      userSelect: 'none',
      fontSize: '14px',
      color: '#333333',
    }}
  >
    <div
      style={{
        display: 'inline-flex',
        flexDirection: 'column',
        borderRadius: '0.375rem',
        border: '1px solid',
        padding: '0.5rem 1rem 0.5rem .25rem',
        borderColor: 'rgb(229, 231, 235)',
      }}
    >
      {children}
    </div>
  </div>
);

function Indent() {
  const indent = useIndent();

  return (
    <>
      {[...Array(indent)].map((_, i) => (
        <span style={{ display: 'inline-block', width: '0' }} key={i} />
      ))}
    </>
  );
}

const Folder = memo(
  ({
    label,
    name,
    description = null,
    open,
    children,
    defaultOpen = false,
    onToggle,
  }) => {
    const indent = useIndent();
    const [isOpen, setIsOpen] = useState(defaultOpen);

    const toggle = useCallback(() => {
      onToggle?.(!isOpen);
      setIsOpen(!isOpen);
    }, [isOpen, onToggle]);

    const isFolderOpen = open === undefined ? isOpen : open;

    return (
      <li
        style={{
          display: 'flex',
          listStyleType: 'none',
          flexDirection: 'column',
        }}
      >
        <a
          onClick={toggle}
          title={name}
          style={{
            display: 'inline-flex',
            cursor: 'pointer',
            alignItems: 'center',
            padding: '0',
            fontSize: '0.875rem',
            color: '#333333',
            textDecoration: 'none',
            backgroundColor: 'transparent',
            border: 'none',
            outline: 'none',
            transition: 'opacity 0.2s ease-in-out',
          }}
        >
          <Indent />
          <svg
            width="1.5em"
            height="1.5em"
            viewBox="0 0 24 24"
            style={{
              marginLeft: '0.25rem',
              marginRight: '0',
              fill: 'none',
              stroke: 'currentColor',
              strokeLinecap: 'round',
              strokeLinejoin: 'round',
              strokeWidth: 1,
            }}
          >
            <path
              d={
                isFolderOpen
                  ? 'M5 19a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h4l2 2h4a2 2 0 0 1 2 2v1M5 19h14a2 2 0 0 0 2-2v-5a2 2 0 0 0-2-2H9a2 2 0 0 0-2 2v5a2 2 0 0 1-2 2Z'
                  : 'M3 7v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-6l-2-2H5a2 2 0 0 0-2 2Z'
              }
            />
          </svg>
          <span style={{ marginLeft: '0.25rem', fontSize: '14px' }}>
            {label ?? name} {description}
          </span>
        </a>
        {isFolderOpen && (
          <ul
            style={{
              paddingLeft: '1.25rem',
              marginTop: 'auto',
              marginBottom: 'auto',
            }}
          >
            <ctx.Provider value={indent + 1}>{children}</ctx.Provider>
          </ul>
        )}
      </li>
    );
  }
);
Folder.displayName = 'Folder';

const File = memo(({ label, name, description }) => (
  <li
    style={{ display: 'flex', listStyleType: 'none', flexDirection: 'column' }}
  >
    <a
      style={{
        display: 'inline-flex',
        cursor: 'default',
        alignItems: 'center',
        padding: '0 0 0 .25rem',
        fontSize: '0.875rem',
        color: '#333333',
        textDecoration: 'none',
        backgroundColor: 'transparent',
        border: 'none',
        outline: 'none',
      }}
    >
      <Indent />
      <svg
        width="1.3em"
        height="1.3em"
        viewBox="0 0 24 24"
        style={{
          marginLeft: '0',
          marginRight: '0',
          fill: 'none',
          stroke: 'currentcolor',
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
          strokeWidth: 1,
        }}
      >
        <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5.586a1 1 0 0 1 .707.293l5.414 5.414a1 1 0 0 1 .293.707V19a2 2 0 0 1-2 2Z" />
      </svg>
      <span
        style={{
          marginLeft: '0.25rem',
          marginBottom: '-1px',
          fontSize: '14px',
        }}
      >
        {label ?? name} {description}
      </span>
    </a>
  </li>
));
File.displayName = 'File';

export const FileTree = Object.assign(Tree, { Folder, File });
