/*! Copyright 2026 Adobe
All Rights Reserved. */
import{Q as L,a as e,B as P}from"./iframe-CKgIZA8l.js";import"./preload-helper-C1FmrZbK.js";const{expect:d,userEvent:O,within:_}=__STORYBOOK_MODULE_TEST__,H={title:"Components/Header",component:L,parameters:{layout:"fullscreen"},args:{title:"Your Message",size:"medium",divider:!0},argTypes:{title:{control:"text",description:"Enter the title name. Without this title, it will not be displayed."},size:{description:"Size of the style",control:{type:"radio"},type:"string",defaultValue:{summary:"medium"},options:["medium","large"]},divider:{control:"boolean",description:"Show or hide Divider."},cta:{description:"A VNode component used to render a custom UI element, allowing for flexible content integration.",options:["Button","Link"],mapping:{Button:e("button",{children:"Button"}),Link:e("a",{href:"#",children:"Link"})},control:{type:"select",labels:{Button:"Button element",Link:"Link element"}},defaultValue:{summary:"<empty string>"}},level:{description:"Set the heading level",options:[1,2,3,4,5,6],control:{type:"select",labels:{1:"h1",2:"h2",3:"h3",4:"h4",5:"h5",6:"h6"}},defaultValue:{summary:2}}}},t={render:l=>e("div",{style:{maxWidth:"1200px",padding:"40px"},children:e(L,{...l})})},r={...t,parameters:{layout:"fullscreen"},args:{title:"Shipping info",size:"medium",divider:!0,cta:e(P,{variant:"tertiary",style:{paddingRight:0},children:"Print order details"}),level:2},play:async({canvasElement:l})=>{const o=_(l);await d(o.getByText("Print order details")).toBeInTheDocument();const w=o.getByRole("button",{name:/Print order details/i});await O.click(w),await d(o.getByText("Shipping info")).toBeInTheDocument()}},a={...t,parameters:{layout:"fullscreen"},args:{title:"Order A202405230825",size:"large",divider:!0,cta:e("a",{href:"#",children:"Print order details"}),level:2}},n={...t,parameters:{layout:"fullscreen"},args:{title:"Medium Size",size:"medium",divider:!1,cta:e("button",{children:"Print order details"}),level:2}},i={...t,parameters:{layout:"fullscreen"},args:{title:"Order complete",size:"medium",divider:!1,cta:null,level:2}},s={...t,parameters:{layout:"fullscreen"},args:{title:"Heading Levels",size:"medium",divider:!0,level:1},argTypes:{level:{control:{type:"select",options:[1,2,3,4,5,6]},description:"Set the heading level"}}};var c,u,m;r.parameters={...r.parameters,docs:{...(c=r.parameters)==null?void 0:c.docs,source:{originalSource:`{
  ...Template,
  parameters: {
    layout: 'fullscreen'
  },
  args: {
    title: 'Shipping info',
    size: 'medium',
    divider: true,
    cta: <Button variant="tertiary" style={{
      paddingRight: 0
    }}>
        Print order details
      </Button>,
    level: 2
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Print order details')).toBeInTheDocument();
    const button = canvas.getByRole('button', {
      name: /Print order details/i
    });
    await userEvent.click(button);
    await expect(canvas.getByText('Shipping info')).toBeInTheDocument();
  }
}`,...(m=(u=r.parameters)==null?void 0:u.docs)==null?void 0:m.source}}};var p,g,v;a.parameters={...a.parameters,docs:{...(p=a.parameters)==null?void 0:p.docs,source:{originalSource:`{
  ...Template,
  parameters: {
    layout: 'fullscreen'
  },
  args: {
    title: 'Order A202405230825',
    size: 'large',
    divider: true,
    cta: <a href="#">Print order details</a>,
    level: 2
  }
}`,...(v=(g=a.parameters)==null?void 0:g.docs)==null?void 0:v.source}}};var h,y,f;n.parameters={...n.parameters,docs:{...(h=n.parameters)==null?void 0:h.docs,source:{originalSource:`{
  ...Template,
  parameters: {
    layout: 'fullscreen'
  },
  args: {
    title: 'Medium Size',
    size: 'medium',
    divider: false,
    cta: <button>Print order details</button>,
    level: 2
  }
}`,...(f=(y=n.parameters)==null?void 0:y.docs)==null?void 0:f.source}}};var S,B,T;i.parameters={...i.parameters,docs:{...(S=i.parameters)==null?void 0:S.docs,source:{originalSource:`{
  ...Template,
  parameters: {
    layout: 'fullscreen'
  },
  args: {
    title: 'Order complete',
    size: 'medium',
    divider: false,
    cta: null,
    level: 2
  }
}`,...(T=(B=i.parameters)==null?void 0:B.docs)==null?void 0:T.source}}};var z,b,x;s.parameters={...s.parameters,docs:{...(z=s.parameters)==null?void 0:z.docs,source:{originalSource:`{
  ...Template,
  parameters: {
    layout: 'fullscreen'
  },
  args: {
    title: 'Heading Levels',
    size: 'medium',
    divider: true,
    level: 1
  },
  argTypes: {
    level: {
      control: {
        type: 'select',
        options: [1, 2, 3, 4, 5, 6]
      },
      description: 'Set the heading level'
    }
  }
}`,...(x=(b=s.parameters)==null?void 0:b.docs)==null?void 0:x.source}}};const D=["MediumSize","LargeSize","WithoutLine","WithoutActions","HeadingLevels"];export{s as HeadingLevels,a as LargeSize,r as MediumSize,i as WithoutActions,n as WithoutLine,D as __namedExportsOrder,H as default};
//# sourceMappingURL=Header.stories-Bd4m6Gnc.js.map
