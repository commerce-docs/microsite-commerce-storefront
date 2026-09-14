/*! Copyright 2026 Adobe
All Rights Reserved. */
import{D as s,a as t}from"./iframe-CKgIZA8l.js";import"./preload-helper-C1FmrZbK.js";const{expect:y,within:m}=__STORYBOOK_MODULE_TEST__,w={title:"Components/Divider",component:s,argTypes:{variant:{description:"Divider variant: `primary` or `secondary`",defaultValue:{summary:"primary"},options:["primary","secondary"],control:{type:"radio"}}},parameters:{docs:{description:{component:"Use Dividers to separate and group content or build rhythm and structure."}}}},r={args:{variant:"primary"},render:({variant:a})=>t("div",{style:"width: 400px",children:t(s,{variant:a})}),play:async({canvasElement:a})=>{const i=m(a);await y(await i.findByRole("separator")).toBeVisible()}},e={args:{variant:"secondary"},render:({variant:a})=>t("div",{style:"width: 400px",children:t(s,{variant:a})}),play:async({canvasElement:a})=>{const i=m(a);await y(await i.findByRole("separator")).toBeVisible()}};var n,o,c;r.parameters={...r.parameters,docs:{...(n=r.parameters)==null?void 0:n.docs,source:{originalSource:`{
  args: {
    variant: 'primary'
  },
  render: ({
    variant
  }) => <div style="width: 400px">
      <Divider variant={variant} />
    </div>,
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByRole('separator')).toBeVisible();
  }
}`,...(c=(o=r.parameters)==null?void 0:o.docs)==null?void 0:c.source}}};var d,p,v;e.parameters={...e.parameters,docs:{...(d=e.parameters)==null?void 0:d.docs,source:{originalSource:`{
  args: {
    variant: 'secondary'
  },
  render: ({
    variant
  }) => <div style="width: 400px">
      <Divider variant={variant} />
    </div>,
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByRole('separator')).toBeVisible();
  }
}`,...(v=(p=e.parameters)==null?void 0:p.docs)==null?void 0:v.source}}};const h=["Primary","Secondary"];export{r as Primary,e as Secondary,h as __namedExportsOrder,w as default};
//# sourceMappingURL=Divider.stories-DVUuTdL9.js.map
