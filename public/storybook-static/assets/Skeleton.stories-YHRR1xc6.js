/*! Copyright 2026 Adobe
All Rights Reserved. */
import{a8 as o,a as i,a9 as t}from"./iframe-CKgIZA8l.js";import"./preload-helper-C1FmrZbK.js";const{expect:s}=__STORYBOOK_MODULE_TEST__,L={title:"Components/Skeleton",component:o,argTypes:{size:{type:"string",options:["xsmall","small","medium","large","xlarge"],control:{type:"radio"},defaultValue:{summary:"small"},description:"Size of the skeleton"},variant:{type:"string",options:["row","heading","empty"],control:{type:"radio"},defaultValue:{summary:"row"},description:"Variant of the skeleton"},fullWidth:{type:"boolean",defaultValue:{summary:"false"},description:"Stretch the skeleton to full width"},lines:{type:"number",defaultValue:{summary:"1"},description:"No. of times to repeat the row"},multilineGap:{type:"string",options:["xsmall","small","medium","big","xbig"],control:{type:"radio"},defaultValue:{summary:"medium"},description:"Vertical gap between multiline items"},rowGap:{type:"string",options:["xsmall","small","medium","big","xbig"],control:{type:"radio"},defaultValue:{summary:"medium"},description:"Horizontal and vertical gap between SkeletonRows"}},decorators:[e=>i("div",{style:{width:"400px"},children:e()})],parameters:{docs:{description:{component:"Use Skeletons to display content placeholders while content is loading."}}}},n={args:{children:`<svg width="450" height="400">
        <rect x="43" y="304" rx="4" ry="4" width="271" height="9" />
        <rect x="44" y="323" rx="3" ry="3" width="119" height="6" />
        <rect x="42" y="77" rx="10" ry="10" width="388" height="217" />
      </svg>`},render:e=>i(o,{children:i(t,{children:e.children})}),play:async()=>{const e=document.querySelector(".dropin-skeleton"),H=document.querySelector(".dropin-skeleton-row");await s(e).toBeVisible(),await s(H).toBeVisible()}},l={args:{size:"medium",variant:"row",multilineGap:"medium",rowGap:"medium"},render:e=>i(o,{rowGap:e.rowGap,children:[i(t,{variant:e.variant,size:e.size,fullWidth:e.fullWidth,lines:e.lines,multilineGap:e.multilineGap}),i(t,{variant:e.variant,size:e.size,fullWidth:e.fullWidth,lines:e.lines,multilineGap:e.multilineGap}),i(t,{variant:e.variant,size:e.size,fullWidth:e.fullWidth,lines:e.lines,multilineGap:e.multilineGap})]})},r={args:{size:"medium",variant:"heading",multilineGap:"medium",rowGap:"medium"},render:e=>i(o,{rowGap:e.rowGap,children:i(t,{variant:e.variant,size:e.size,fullWidth:e.fullWidth,lines:e.lines,multilineGap:e.multilineGap})})},a={args:{size:"medium",multilineGap:"medium",rowGap:"medium"},render:e=>i(o,{rowGap:e.rowGap,children:[i(t,{variant:"heading",size:e.size,multilineGap:e.multilineGap}),i(t,{variant:"empty",size:e.size,multilineGap:e.multilineGap}),i(t,{size:e.size,fullWidth:!0,multilineGap:e.multilineGap}),i(t,{size:e.size,fullWidth:!0,lines:3,multilineGap:e.multilineGap}),i(t,{size:e.size,multilineGap:e.multilineGap}),i(t,{size:e.size,multilineGap:e.multilineGap})]})};var m,u,d,p,c;n.parameters={...n.parameters,docs:{...(m=n.parameters)==null?void 0:m.docs,source:{originalSource:`{
  args: {
    children: \`<svg width="450" height="400">
        <rect x="43" y="304" rx="4" ry="4" width="271" height="9" />
        <rect x="44" y="323" rx="3" ry="3" width="119" height="6" />
        <rect x="42" y="77" rx="10" ry="10" width="388" height="217" />
      </svg>\`
  },
  render: args => {
    return <Skeleton>
        <SkeletonRow>{args.children}</SkeletonRow>
      </Skeleton>;
  },
  play: async () => {
    const skeleton = document.querySelector('.dropin-skeleton') as HTMLElement;
    const skeletonRow = document.querySelector('.dropin-skeleton-row') as HTMLElement;
    await expect(skeleton).toBeVisible();
    await expect(skeletonRow).toBeVisible();
  }
}`,...(d=(u=n.parameters)==null?void 0:u.docs)==null?void 0:d.source},description:{story:`Import the component to use in your components:

\`\`\`ts
import { Skeleton, SkeletonRow } from '@adobe-commerce/elsie/components';
\`\`\`
Pass in an SVG element as a child to render a shimmering skeleton version of it.

\`\`\`tsx
<Skeleton>
   <SkeletonRow>
    \`<svg width="450" height="400">
       <rect x="43" y="304" rx="4" ry="4" width="271" height="9" />
       <rect x="44" y="323" rx="3" ry="3" width="119" height="6" />
       <rect x="42" y="77" rx="10" ry="10" width="388" height="217" />
    </svg>\`
   </SkeletonRow>
</Skeleton>
\`\`\``,...(c=(p=n.parameters)==null?void 0:p.docs)==null?void 0:c.description}}};var h,w,G,g,S;l.parameters={...l.parameters,docs:{...(h=l.parameters)==null?void 0:h.docs,source:{originalSource:`{
  args: {
    size: 'medium',
    variant: 'row',
    multilineGap: 'medium',
    rowGap: 'medium'
  },
  render: args => {
    return <Skeleton rowGap={args.rowGap}>
        <SkeletonRow variant={args.variant} size={args.size} fullWidth={args.fullWidth} lines={args.lines} multilineGap={args.multilineGap} />
        <SkeletonRow variant={args.variant} size={args.size} fullWidth={args.fullWidth} lines={args.lines} multilineGap={args.multilineGap} />
        <SkeletonRow variant={args.variant} size={args.size} fullWidth={args.fullWidth} lines={args.lines} multilineGap={args.multilineGap} />
      </Skeleton>;
  }
}`,...(G=(w=l.parameters)==null?void 0:w.docs)==null?void 0:G.source},description:{story:`Use a Row HTML element

\`\`\`tsx
<Skeleton>
 <SkeletonRow variant="row" size="medium" />
 <SkeletonRow variant="row" size="medium" />
 <SkeletonRow variant="row" size="medium" />
</Skeleton>
\`\`\``,...(S=(g=l.parameters)==null?void 0:g.docs)==null?void 0:S.description}}};var k,z,y,v,f;r.parameters={...r.parameters,docs:{...(k=r.parameters)==null?void 0:k.docs,source:{originalSource:`{
  args: {
    size: 'medium',
    variant: 'heading',
    multilineGap: 'medium',
    rowGap: 'medium'
  },
  render: args => {
    return <Skeleton rowGap={args.rowGap}>
        <SkeletonRow variant={args.variant} size={args.size} fullWidth={args.fullWidth} lines={args.lines} multilineGap={args.multilineGap} />
      </Skeleton>;
  }
}`,...(y=(z=r.parameters)==null?void 0:z.docs)==null?void 0:y.source},description:{story:'Use a Heading HTML element\n\n```tsx\n<Skeleton>\n <SkeletonRow variant="heading" size="medium" />\n</Skeleton>\n```',...(f=(v=r.parameters)==null?void 0:v.docs)==null?void 0:f.description}}};var x,R,W,V,b;a.parameters={...a.parameters,docs:{...(x=a.parameters)==null?void 0:x.docs,source:{originalSource:`{
  args: {
    size: 'medium',
    multilineGap: 'medium',
    rowGap: 'medium'
  },
  render: args => {
    return <Skeleton rowGap={args.rowGap}>
        <SkeletonRow variant={'heading'} size={args.size} multilineGap={args.multilineGap} />
        <SkeletonRow variant={'empty'} size={args.size} multilineGap={args.multilineGap} />
        <SkeletonRow size={args.size} fullWidth={true} multilineGap={args.multilineGap} />
        <SkeletonRow size={args.size} fullWidth={true} lines={3} multilineGap={args.multilineGap} />
        <SkeletonRow size={args.size} multilineGap={args.multilineGap} />
        <SkeletonRow size={args.size} multilineGap={args.multilineGap} />
      </Skeleton>;
  }
}`,...(W=(R=a.parameters)==null?void 0:R.docs)==null?void 0:W.source},description:{story:`HTML Example

\`\`\`tsx
<Skeleton>
 <SkeletonRow variant="heading" size="medium" />
 <SkeletonRow variant="empty" size="medium" />
 <SkeletonRow size="medium" fullWidth={true} />
 <SkeletonRow size="medium" fullWidth={true} lines={3} />
</Skeleton>
\`\`\``,...(b=(V=a.parameters)==null?void 0:V.docs)==null?void 0:b.description}}};const M=["SVG","Rows","Headings","HTMLExample"];export{a as HTMLExample,r as Headings,l as Rows,n as SVG,M as __namedExportsOrder,L as default};
//# sourceMappingURL=Skeleton.stories-YHRR1xc6.js.map
