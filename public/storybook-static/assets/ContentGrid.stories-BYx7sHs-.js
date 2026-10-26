/*! Copyright 2026 Adobe
All Rights Reserved. */
import{O as G,a as r,k as w}from"./iframe-BXfH8Ezb.js";import"./preload-helper-C1FmrZbK.js";const E={title:"Components/ContentGrid",component:G,argTypes:{emptyGridContent:{description:"The content to display when the grid is empty.",control:!1},children:{description:"The content to display in the grid. Each child will be displayed in a grid cell.",control:!1},maxColumns:{description:"The maximum number of columns to display in the grid. If this is not set, this component will act like a flex container that wraps its children.",control:{type:"number"},columnWidth:{description:"The width of each column in the grid. This is a CSS value, such as `1fr` or `100px`.",control:{type:"text"}}}},parameters:{layout:"fullscreen",docs:{description:{component:"Used to display a grid of content, such as products or images, with a maximum number of columns."}}}},i={emptyGridContent:r("div",{"data-testid":"empty-grid-content",children:"Empty Grid"}),maxColumns:6,columnWidth:"1fr"},v=o=>Array.from({length:o}).map((W,s)=>r("div",{style:{width:"100px",height:"100px",border:"1px solid black",display:"grid",placeItems:"center"},children:["Product ",s+1]},s)),t={args:{...i}},e={args:{...i,children:v(30),maxColumns:6,columnWidth:"1fr"}},n={args:{...i,children:r(w,{children:v(12)}),maxColumns:6,columnWidth:"1fr"},parameters:{layout:"centered"},decorators:[o=>r("div",{style:{width:"50vw",maxWidth:"800px",maxHeight:"100vh"},children:o()})]};var d,a,c,m,l;t.parameters={...t.parameters,docs:{...(d=t.parameters)==null?void 0:d.docs,source:{originalSource:`{
  args: {
    ...defaultProps
  }
}`,...(c=(a=t.parameters)==null?void 0:a.docs)==null?void 0:c.source},description:{story:"```tsx\n<ContentGrid emptyGridContent={<div>Empty Grid</div>} />\n```",...(l=(m=t.parameters)==null?void 0:m.docs)==null?void 0:l.description}}};var p,u,h,y,g;e.parameters={...e.parameters,docs:{...(p=e.parameters)==null?void 0:p.docs,source:{originalSource:`{
  args: {
    ...defaultProps,
    children: generateSampleContent(30),
    maxColumns: 6,
    columnWidth: '1fr'
  }
}`,...(h=(u=e.parameters)==null?void 0:u.docs)==null?void 0:h.source},description:{story:`\`\`\`tsx
<ContentGrid emptyGridContent={<div>Empty Grid</div>} />
   <div>Product 1</div>,
   <div>Product 2</div>,
   //...
   <div>Product 29</div>
   <div>Product 30</div>
</ContentGrid>
\`\`\``,...(g=(y=e.parameters)==null?void 0:y.docs)==null?void 0:g.description}}};var C,x,f;n.parameters={...n.parameters,docs:{...(C=n.parameters)==null?void 0:C.docs,source:{originalSource:`{
  args: {
    ...defaultProps,
    children: <>{generateSampleContent(12)}</>,
    maxColumns: 6,
    columnWidth: '1fr'
  },
  parameters: {
    layout: 'centered'
  },
  decorators: [story => {
    return <div style={{
      width: '50vw',
      maxWidth: '800px',
      maxHeight: '100vh'
    }}>
          {story()}
        </div>;
  }]
}`,...(f=(x=n.parameters)==null?void 0:x.docs)==null?void 0:f.source}}};const b=["EmptyGrid","WithContent","InsideContainer"];export{t as EmptyGrid,n as InsideContainer,e as WithContent,b as __namedExportsOrder,E as default};
//# sourceMappingURL=ContentGrid.stories-BYx7sHs-.js.map
