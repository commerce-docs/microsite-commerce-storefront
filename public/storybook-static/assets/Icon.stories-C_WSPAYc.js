/*! Copyright 2026 Adobe
All Rights Reserved. */
import{l as R,h as c,r as n,a as e,k as U}from"./iframe-BXfH8Ezb.js";import"./preload-helper-C1FmrZbK.js";const z={title:"Components/Icon",component:n,argTypes:{source:{options:Object.keys(c),mapping:c,control:{type:"select"},description:"Select a built-in icon"},url:{control:{type:"text"},description:"Or enter a URL to an external SVG (this takes priority over icon selection)"},size:{control:"select",options:["12","16","24","32","64","80"]},stroke:{control:"select",options:["1","2","3","4"],description:"Stroke width. Works only for stroke-based icons."},title:{control:"text",description:"Title for the icon"}},parameters:{docs:{description:{component:`Use Icons as symbols or metaphors to communicate and enhance the user experience.

The Icon component supports three source types:
- Direct component imports
- Icon names from the built-in icon set
- SVGs from URLs (supports URLs that match the host domain)`}}}},s={render:({url:r,source:o,...l})=>e(n,{...l,source:r||o}),args:{source:R}},t={render:({url:r,source:o,...l})=>e(n,{...l,source:r||o}),args:{source:"Cart"}},a={argTypes:{style:Object,url:{table:{disable:!0}},source:{table:{disable:!0}},title:{table:{disable:!0}}},args:{style:{color:"blue"}},render:r=>e("div",{style:{display:"grid",gridTemplateColumns:"repeat(4, 1fr)",gap:"1rem"},children:Object.keys(c).map(o=>e(U,{children:[e("span",{children:o},o),e(n,{...r,source:c[o]})]}))})},i={argTypes:{source:{table:{disable:!0}},title:{table:{disable:!0}}},render:({url:r,...o})=>e("div",{style:{display:"grid",gridTemplateColumns:"repeat(auto-fit, minmax(200px, 1fr))",gap:"2rem",padding:"1rem"},children:[e("div",{style:{border:"1px solid #e1e5e9",borderRadius:"8px",padding:"1.5rem",textAlign:"center",backgroundColor:"#f8f9fa"},children:[e("h3",{style:{margin:"0 0 1rem 0",color:"#2c3e50"},children:"✅ Valid URL"}),e(n,{source:r||`${window.location.origin}/favicon.svg`,size:"12",title:"logo icon from common domain","aria-label":"Star icon loaded from external URL",...o}),e("p",{style:{fontSize:"12px",color:"#495057",margin:"0.5rem 0 0 0",wordBreak:"break-all"},children:r?`Displays icon from: ${r}`:`Displays icon from ${window.location.origin}/favicon.svg`})]}),e("div",{style:{border:"1px solid #f8d7da",borderRadius:"8px",padding:"1.5rem",textAlign:"center",backgroundColor:"#f8d7da"},children:[e("h3",{style:{margin:"0 0 1rem 0",color:"#721c24"},children:"❌ Invalid URL"}),e(n,{source:"https://invalid-url.com/icon.svg",size:"32",title:"Failed to load icon","aria-label":"Icon that failed to load"}),e("p",{style:{fontSize:"12px",color:"#721c24",margin:"0.5rem 0 0 0",wordBreak:"break-all"},children:"Shows empty SVG"})]})]}),parameters:{docs:{description:{story:"Examples of different URL formats supported by the Icon component."}}}};var d,p,m,u,g;s.parameters={...s.parameters,docs:{...(d=s.parameters)==null?void 0:d.docs,source:{originalSource:`{
  render: ({
    url,
    source,
    ...args
  }: StoryIconProps) => {
    const iconSource = url || source;
    return <Icon {...args} source={iconSource as any} />;
  },
  args: {
    source: Cart
  }
}`,...(m=(p=s.parameters)==null?void 0:p.docs)==null?void 0:m.source},description:{story:"```ts\nimport { Icon } from '@adobe-commerce/elsie/components/Icon';\n```",...(g=(u=s.parameters)==null?void 0:u.docs)==null?void 0:g.description}}};var y,b,f;t.parameters={...t.parameters,docs:{...(y=t.parameters)==null?void 0:y.docs,source:{originalSource:`{
  render: ({
    url,
    source,
    ...args
  }: StoryIconProps) => {
    const iconSource = url || source;
    return <Icon {...args} source={iconSource as any} />;
  },
  args: {
    source: 'Cart'
  }
}`,...(f=(b=t.parameters)==null?void 0:b.docs)==null?void 0:f.source}}};var h,x,S;a.parameters={...a.parameters,docs:{...(h=a.parameters)==null?void 0:h.docs,source:{originalSource:`{
  argTypes: {
    style: Object,
    url: {
      table: {
        disable: true
      }
    },
    source: {
      table: {
        disable: true
      }
    },
    title: {
      table: {
        disable: true
      }
    }
  },
  args: {
    style: {
      color: 'blue'
    }
  },
  render: props => <div style={{
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '1rem'
  }}>
      {Object.keys(Icons).map(icon =>
    // eslint-disable-next-line
    <>
          <span key={icon}>{icon}</span>
          {/* @ts-ignore */}
          <Icon {...props} source={Icons[icon]} />
        </>)}
    </div>
}`,...(S=(x=a.parameters)==null?void 0:x.docs)==null?void 0:S.source}}};var v,I,k;i.parameters={...i.parameters,docs:{...(v=i.parameters)==null?void 0:v.docs,source:{originalSource:`{
  argTypes: {
    source: {
      table: {
        disable: true
      }
    },
    title: {
      table: {
        disable: true
      }
    }
  },
  render: ({
    url,
    ...args
  }: StoryIconProps) => <div style={{
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '2rem',
    padding: '1rem'
  }}>
      <div style={{
      border: '1px solid #e1e5e9',
      borderRadius: '8px',
      padding: '1.5rem',
      textAlign: 'center',
      backgroundColor: '#f8f9fa'
    }}>
        <h3 style={{
        margin: '0 0 1rem 0',
        color: '#2c3e50'
      }}>✅ Valid URL</h3>
        <Icon source={url || \`\${window.location.origin}/favicon.svg\`} size="12" title="logo icon from common domain" aria-label="Star icon loaded from external URL" {...args} />
        <p style={{
        fontSize: '12px',
        color: '#495057',
        margin: '0.5rem 0 0 0',
        wordBreak: 'break-all'
      }}>
          {url ? \`Displays icon from: \${url}\` : \`Displays icon from \${window.location.origin}/favicon.svg\`}
        </p>
      </div>

      <div style={{
      border: '1px solid #f8d7da',
      borderRadius: '8px',
      padding: '1.5rem',
      textAlign: 'center',
      backgroundColor: '#f8d7da'
    }}>
        <h3 style={{
        margin: '0 0 1rem 0',
        color: '#721c24'
      }}>
          ❌ Invalid URL
        </h3>
        <Icon source="https://invalid-url.com/icon.svg" size="32" title="Failed to load icon" aria-label="Icon that failed to load" />
        <p style={{
        fontSize: '12px',
        color: '#721c24',
        margin: '0.5rem 0 0 0',
        wordBreak: 'break-all'
      }}>
          Shows empty SVG
        </p>
      </div>
    </div>,
  parameters: {
    docs: {
      description: {
        story: 'Examples of different URL formats supported by the Icon component.'
      }
    }
  }
}`,...(k=(I=i.parameters)==null?void 0:I.docs)==null?void 0:k.source}}};const T=["Primary","Lazy","AllBuiltInIcons","UrlExamples"];export{a as AllBuiltInIcons,t as Lazy,s as Primary,i as UrlExamples,T as __namedExportsOrder,z as default};
//# sourceMappingURL=Icon.stories-C_WSPAYc.js.map
