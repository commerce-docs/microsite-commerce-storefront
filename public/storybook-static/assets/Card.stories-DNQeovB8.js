/*! Copyright 2026 Adobe
All Rights Reserved. */
import{C as h,a as r}from"./iframe-BXfH8Ezb.js";import"./preload-helper-C1FmrZbK.js";const{expect:o,within:u}=__STORYBOOK_MODULE_TEST__,T={title:"Components/Card",component:h,argTypes:{variant:{options:["primary","secondary"],control:{type:"radio"}},children:{description:"The content of the Card.",control:!1,type:{name:"other",value:"VNode[]"}}},parameters:{docs:{description:{component:"Use Cards to group content into a single container."}}}},e={name:"Primary Card",args:{variant:"primary"},render:({variant:t})=>r(h,{variant:t,children:[r("h2",{style:{font:"var(--type-headline-2-strong-font)"},children:"Title"}),r("p",{style:{font:"var(--type-body-2-default-font)"},children:"This is a short description of the item and should be kept to two or three lines as maximum."})]}),play:async({canvasElement:t})=>{const n=u(t);await o(await n.getByText("Title")).toBeVisible(),await o(await n.getByText("This is a short description of the item and should be kept to two or three lines as maximum.")).toBeVisible()}},a={name:"Secondary Card",args:{variant:"secondary"},render:e.render};var s,i,d,c,m;e.parameters={...e.parameters,docs:{...(s=e.parameters)==null?void 0:s.docs,source:{originalSource:`{
  name: 'Primary Card',
  args: {
    variant: 'primary'
  },
  render: ({
    variant
  }) => <Card variant={variant}>
      <h2 style={{
      font: 'var(--type-headline-2-strong-font)'
    }}>Title</h2>
      <p style={{
      font: 'var(--type-body-2-default-font)'
    }}>
        This is a short description of the item and should be kept to two or
        three lines as maximum.
      </p>
    </Card>,
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.getByText('Title')).toBeVisible();
    await expect(await canvas.getByText('This is a short description of the item and should be kept to two or three lines as maximum.')).toBeVisible();
  }
}`,...(d=(i=e.parameters)==null?void 0:i.docs)==null?void 0:d.source},description:{story:"```ts\nimport { Card } from '@adobe-commerce/elsie/components/Card';\n```",...(m=(c=e.parameters)==null?void 0:c.docs)==null?void 0:m.description}}};var p,l,y;a.parameters={...a.parameters,docs:{...(p=a.parameters)==null?void 0:p.docs,source:{originalSource:`{
  name: 'Secondary Card',
  args: {
    variant: 'secondary'
  },
  render: Primary.render
}`,...(y=(l=a.parameters)==null?void 0:l.docs)==null?void 0:y.source}}};const g=["Primary","Secondary"];export{e as Primary,a as Secondary,g as __namedExportsOrder,T as default};
//# sourceMappingURL=Card.stories-DNQeovB8.js.map
