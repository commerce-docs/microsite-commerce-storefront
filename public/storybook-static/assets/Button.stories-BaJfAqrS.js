/*! Copyright 2026 Adobe
All Rights Reserved. */
import{B as _e,a as B,E as Le,r as b,G as Oe,l as Re,H as Pe}from"./iframe-BXfH8Ezb.js";import{I as S}from"./Icon.stories.helpers-CaF-J1Nd.js";const{expect:t,within:g}=__STORYBOOK_MODULE_TEST__,{action:Me}=__STORYBOOK_MODULE_ACTIONS__,He={title:"Components/Button",component:_e,argTypes:{value:{description:"Add string to pass to the clickHandler.",table:{type:{summary:"string"}}},children:{description:"Add text to the button.",table:{type:{summary:"ComponentChildren"}},control:"text"},variant:{description:"Change the button style.",table:{type:{summary:"string"},defaultValue:{summary:"primary"}},options:["primary","secondary","tertiary"],control:"radio"},size:{description:"Change the button size.",table:{type:{summary:"string"},defaultValue:{summary:"medium"}},options:["medium","large"],control:"radio"},icon:{description:"Add Icon component to the button.",table:{type:{summary:"FunctionComponent"}},options:Object.keys(S),mapping:S,control:"select"},disabled:{description:"Disable the button.",table:{type:{summary:"boolean"},defaultValue:{summary:"false"}},control:{type:"boolean"}},active:{description:"Activate the button.",table:{type:{summary:"boolean"},defaultValue:{summary:"false"}},control:{type:"boolean"}},activeChildren:{description:"Replace value of children prop when button is active.",table:{type:{summary:"ComponentChildren"}},control:"text"},activeIcon:{description:"Replace value of icon prop when when button is active.",table:{type:{summary:"FunctionComponent"}},options:Object.keys(S),mapping:S,control:"select"},onClick:{description:"Add a click handler.",table:{type:{summary:"function"}},action:"onClick"},href:{description:"Set this value to render the component as a link",table:{type:{summary:"string"}},control:"text"}},parameters:{docs:{description:{component:"Use Buttons to highlight or guide user actions."}}}},r={tags:["isHidden"],args:{active:!1,activeChildren:"Active",activeIcon:B(b,{source:Pe,size:"24"}),children:"Button",disabled:!1,icon:B(b,{source:Re,size:"24"}),onClick:Me("onClick"),size:"medium",value:void 0,variant:"primary"}},i={tags:["isHidden"],args:{children:"Button"}},a={args:{...r.args,activeIcon:void 0,icon:void 0,children:"Primary",variant:"primary"},play:async({canvasElement:n})=>{const e=g(n);await t(await e.findByRole("button")).toBeVisible()}},c={args:{...a.args,children:"Secondary",variant:"secondary"}},d={args:{...a.args,children:"Tertiary",variant:"tertiary"}},l={args:{...a.args,children:"Large",size:"large",value:"123"}},u={args:{...a.args,children:"Medium",size:"medium"}},s={args:{...a.args,children:void 0,icon:B(b,{source:Le,size:"24",stroke:"2",viewBox:"0 0 24 24","aria-label":"Search"})},play:async({canvasElement:n})=>{const e=g(n),h=document.querySelector('g[data-name="Search icon"]');await t(await e.findByRole("button")).toBeVisible(),await t(h).toBeVisible()}},m={args:{...s.args,children:"Search"},play:async({canvasElement:n})=>{const e=g(n),h=document.querySelector('g[data-name="Search icon"]');await t(await e.findByRole("button")).toBeVisible(),await t(h).toBeVisible(),await t(e.getByText("Search")).toBeVisible()}},p={args:{...a.args,children:"Button",disabled:!0},play:async({canvasElement:n})=>{const e=g(n);await t(await e.findByRole("button")).toBeDisabled(),await t(e.getByText("Button")).toBeVisible()}},o={args:{...a.args,active:!0,activeChildren:"Active",activeIcon:B(b,{source:Oe,size:"24",stroke:"2",viewBox:"0 0 24 24"}),children:"Not Active",icon:B(b,{source:Le,size:"24",stroke:"2",viewBox:"0 0 24 24"})},play:async({canvasElement:n})=>{const e=g(n),h=document.querySelector('[data-name="Search icon filled"]');await t(await e.findByRole("button")).toBeVisible(),await t(e.getByText("Active")).toBeVisible(),await t(h).toBeVisible()}},y={args:{...o.args,active:!1}},v={args:{...a.args,href:"https://google.com",children:"Link",icon:void 0,onClick:void 0},play:async({canvasElement:n})=>{const e=g(n);await t(await e.findByRole("link")).toBeVisible(),await t(e.getByText("Link")).toBeVisible()}};var w,x,f,I,C;r.parameters={...r.parameters,docs:{...(w=r.parameters)==null?void 0:w.docs,source:{originalSource:`{
  tags: ['isHidden'],
  // Hide from direct access/navigation
  args: {
    active: false,
    activeChildren: 'Active',
    activeIcon: <Icon source={Check} size="24" />,
    children: 'Button',
    disabled: false,
    icon: <Icon source={Cart} size="24" />,
    onClick: action('onClick'),
    size: 'medium',
    value: undefined,
    variant: 'primary'
  }
}`,...(f=(x=r.parameters)==null?void 0:x.docs)==null?void 0:f.source},description:{story:`\`\`\`tsx
<Button
 active={false}
 activeChildren="Active"
 activeIcon={<Icon source={Check} size="24" />}
 children="Button"
 disabled={false}
 icon={<Icon source={Cart} size="24" />}
 onClick={handleAddToCart}
 size="medium"
 value={undefined}
 variant="primary"
/>
\`\`\``,...(C=(I=r.parameters)==null?void 0:I.docs)==null?void 0:C.description}}};var k,z,A,V,T;i.parameters={...i.parameters,docs:{...(k=i.parameters)==null?void 0:k.docs,source:{originalSource:`{
  tags: ['isHidden'],
  args: {
    children: 'Button'
  }
}`,...(A=(z=i.parameters)==null?void 0:z.docs)==null?void 0:A.source},description:{story:'```tsx\n<Button>Button</Button>\n```\n```tsx\n<Button children="Button" />\n```',...(T=(V=i.parameters)==null?void 0:V.docs)==null?void 0:T.description}}};var E,L,_,O,R;a.parameters={...a.parameters,docs:{...(E=a.parameters)==null?void 0:E.docs,source:{originalSource:`{
  args: {
    ...Button.args,
    activeIcon: undefined,
    icon: undefined,
    children: 'Primary',
    variant: 'primary'
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByRole('button')).toBeVisible();
  }
}`,...(_=(L=a.parameters)==null?void 0:L.docs)==null?void 0:_.source},description:{story:'```tsx\n<Button variant="primary">Primary</Button>\n```',...(R=(O=a.parameters)==null?void 0:O.docs)==null?void 0:R.description}}};var P,M,H,D,N;c.parameters={...c.parameters,docs:{...(P=c.parameters)==null?void 0:P.docs,source:{originalSource:`{
  args: {
    ...Primary.args,
    children: 'Secondary',
    variant: 'secondary'
  }
}`,...(H=(M=c.parameters)==null?void 0:M.docs)==null?void 0:H.source},description:{story:"```tsx\n<Button variant='secondary'>Secondary</Button>\n```",...(N=(D=c.parameters)==null?void 0:D.docs)==null?void 0:N.description}}};var q,F,j,U,K;d.parameters={...d.parameters,docs:{...(q=d.parameters)==null?void 0:q.docs,source:{originalSource:`{
  args: {
    ...Primary.args,
    children: 'Tertiary',
    variant: 'tertiary'
  }
}`,...(j=(F=d.parameters)==null?void 0:F.docs)==null?void 0:j.source},description:{story:"```tsx\n<Button variant='tertiary'>Tertiary</Button>\n```",...(K=(U=d.parameters)==null?void 0:U.docs)==null?void 0:K.description}}};var Y,G,$,J,Q;l.parameters={...l.parameters,docs:{...(Y=l.parameters)==null?void 0:Y.docs,source:{originalSource:`{
  args: {
    ...Primary.args,
    children: 'Large',
    size: 'large',
    value: '123'
  }
}`,...($=(G=l.parameters)==null?void 0:G.docs)==null?void 0:$.source},description:{story:"```tsx\n<Button size='large'>Large</Button>\n```",...(Q=(J=l.parameters)==null?void 0:J.docs)==null?void 0:Q.description}}};var W,X,Z,ee,ae;u.parameters={...u.parameters,docs:{...(W=u.parameters)==null?void 0:W.docs,source:{originalSource:`{
  args: {
    ...Primary.args,
    children: 'Medium',
    size: 'medium'
  }
}`,...(Z=(X=u.parameters)==null?void 0:X.docs)==null?void 0:Z.source},description:{story:"```tsx\n<Button size='medium'>Medium</Button>\n```",...(ae=(ee=u.parameters)==null?void 0:ee.docs)==null?void 0:ae.description}}};var te,ne,re,se,oe;s.parameters={...s.parameters,docs:{...(te=s.parameters)==null?void 0:te.docs,source:{originalSource:`{
  args: {
    ...Primary.args,
    children: undefined,
    icon: <Icon source={Search} size="24" stroke="2" viewBox="0 0 24 24" aria-label="Search" />
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    const searchIcon = document.querySelector('g[data-name="Search icon"]') as HTMLElement;
    await expect(await canvas.findByRole('button')).toBeVisible();
    await expect(searchIcon).toBeVisible();
  }
}`,...(re=(ne=s.parameters)==null?void 0:ne.docs)==null?void 0:re.source},description:{story:`\`\`\`tsx
<Button
 icon={<Icon
   source={Cart}
   size="24"
   stroke="2"
   viewBox="0 0 24 24"
   aria-label="Search" />}
/>
\`\`\``,...(oe=(se=s.parameters)==null?void 0:se.docs)==null?void 0:oe.description}}};var ie,ce,de,le,ue;m.parameters={...m.parameters,docs:{...(ie=m.parameters)==null?void 0:ie.docs,source:{originalSource:`{
  args: {
    ...IconOnly.args,
    children: 'Search'
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    const searchIcon = document.querySelector('g[data-name="Search icon"]') as HTMLElement;
    await expect(await canvas.findByRole('button')).toBeVisible();
    await expect(searchIcon).toBeVisible();
    await expect(canvas.getByText('Search')).toBeVisible();
  }
}`,...(de=(ce=m.parameters)==null?void 0:ce.docs)==null?void 0:de.source},description:{story:`\`\`\`tsx
<Button
 icon={<Icon
   source={Cart}
   size="24"
   stroke="2"
   viewBox="0 0 24 24"
   aria-label="Search" />}
>
 Search
</Button>
\`\`\``,...(ue=(le=m.parameters)==null?void 0:le.docs)==null?void 0:ue.description}}};var me,pe,ye,ve,ge;p.parameters={...p.parameters,docs:{...(me=p.parameters)==null?void 0:me.docs,source:{originalSource:`{
  args: {
    ...Primary.args,
    children: 'Button',
    disabled: true
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByRole('button')).toBeDisabled();
    await expect(canvas.getByText('Button')).toBeVisible();
  }
}`,...(ye=(pe=p.parameters)==null?void 0:pe.docs)==null?void 0:ye.source},description:{story:"```tsx\n<Button disabled>Button</Button>\n```\n```tsx\n<Button disabled={true}>Button</Button>\n```\n```tsx\n<Button disabled={loop ? false : current < 1}>Button</Button>\n```",...(ge=(ve=p.parameters)==null?void 0:ve.docs)==null?void 0:ge.description}}};var he,Be,be,Se,we;o.parameters={...o.parameters,docs:{...(he=o.parameters)==null?void 0:he.docs,source:{originalSource:`{
  args: {
    ...Primary.args,
    active: true,
    activeChildren: 'Active',
    activeIcon: <Icon source={SearchFilled} size="24" stroke="2" viewBox="0 0 24 24" />,
    children: 'Not Active',
    icon: <Icon source={Search} size="24" stroke="2" viewBox="0 0 24 24" />
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    const searchIcon = document.querySelector('[data-name="Search icon filled"]') as HTMLElement;
    await expect(await canvas.findByRole('button')).toBeVisible();
    await expect(canvas.getByText('Active')).toBeVisible();
    await expect(searchIcon).toBeVisible();
  }
}`,...(be=(Be=o.parameters)==null?void 0:Be.docs)==null?void 0:be.source},description:{story:`\`\`\`tsx
<Button
 active={true}
 activeChildren="Active"
 activeIcon={<Icon source={SearchFilled} />}
 children="Not Active"
 icon={<Icon source={Search} />}
/>
\`\`\``,...(we=(Se=o.parameters)==null?void 0:Se.docs)==null?void 0:we.description}}};var xe,fe,Ie,Ce,ke;y.parameters={...y.parameters,docs:{...(xe=y.parameters)==null?void 0:xe.docs,source:{originalSource:`{
  args: {
    ...Active.args,
    active: false
  }
}`,...(Ie=(fe=y.parameters)==null?void 0:fe.docs)==null?void 0:Ie.source},description:{story:`\`\`\`tsx
<Button
 active={false}
 activeChildren="Active"
 activeIcon={<Icon source={SearchFilled} />}
 children="Not Active"
 icon={<Icon source={Search} />}
/>
\`\`\``,...(ke=(Ce=y.parameters)==null?void 0:Ce.docs)==null?void 0:ke.description}}};var ze,Ae,Ve,Te,Ee;v.parameters={...v.parameters,docs:{...(ze=v.parameters)==null?void 0:ze.docs,source:{originalSource:`{
  args: {
    ...Primary.args,
    href: 'https://google.com',
    children: 'Link',
    icon: undefined,
    onClick: undefined
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByRole('link')).toBeVisible();
    await expect(canvas.getByText('Link')).toBeVisible();
  }
}`,...(Ve=(Ae=v.parameters)==null?void 0:Ae.docs)==null?void 0:Ve.source},description:{story:'```tsx\n<Button href="https://google.com">Link</Button>\n```',...(Ee=(Te=v.parameters)==null?void 0:Te.docs)==null?void 0:Ee.description}}};const De=["Button","Children","Primary","Secondary","Tertiary","LargeSize","MediumSize","IconOnly","TextAndIcon","Disabled","Active","NotActive","AsLink"],Fe=Object.freeze(Object.defineProperty({__proto__:null,Active:o,AsLink:v,Button:r,Children:i,Disabled:p,IconOnly:s,LargeSize:l,MediumSize:u,NotActive:y,Primary:a,Secondary:c,Tertiary:d,TextAndIcon:m,__namedExportsOrder:De,default:He},Symbol.toStringTag,{value:"Module"}));export{o as A,Fe as B,i as C,p as D,s as I,l as L,u as M,y as N,a as P,c as S,m as T,r as a,d as b,v as c};
//# sourceMappingURL=Button.stories-BaJfAqrS.js.map
