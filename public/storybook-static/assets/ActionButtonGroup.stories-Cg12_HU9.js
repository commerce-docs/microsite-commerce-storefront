/*! Copyright 2026 Adobe
All Rights Reserved. */
import{s as m,a as o,A as n,r as i,t as v,v as y,l as A}from"./iframe-BXfH8Ezb.js";import"./preload-helper-C1FmrZbK.js";const f={title:"Components/ActionButtonGroup",component:m,argTypes:{variant:{description:"Action Button Group variant",options:["primary","secondary"],control:{type:"radio"}},disabled:{description:"Whether or not the field is disabled",type:{name:"boolean",required:!1},defaultValue:!1},dividers:{description:"Whether or not to show dividers between options",type:{name:"boolean",required:!1},defaultValue:!0},handleSelect:{description:"Callback function for when an option is selected",type:"function",defaultValue:{summary:"() => {}"},action:"Value Selected"}},parameters:{docs:{description:{component:"Use Action Button Groups to group related actions."}}}},t={args:{variant:"primary",children:[o(n,{value:"option1",children:"Option1"},"option1"),o(n,{value:"option2",children:"Option2"},"option2")]}},e={args:{variant:"secondary",activeOption:"option2",children:[o(n,{value:"option1",icon:o(i,{source:v}),children:"Option1"},"option1"),o(n,{value:"option2",icon:o(i,{source:y}),children:"Option2"},"option2"),o(n,{value:"option3",icon:o(i,{source:A}),children:"Option3"},"option3")]}};var r,a,c,s,p;t.parameters={...t.parameters,docs:{...(r=t.parameters)==null?void 0:r.docs,source:{originalSource:`{
  args: {
    variant: 'primary',
    children: [<ActionButton key="option1" value="option1">
        Option1
      </ActionButton>, <ActionButton key="option2" value="option2">
        Option2
      </ActionButton>]
  }
}`,...(c=(a=t.parameters)==null?void 0:a.docs)==null?void 0:c.source},description:{story:"```ts\nimport { ActionButtonGroup } from '@adobe-commerce/elsie/components/ActionButtonGroup';\n```",...(p=(s=t.parameters)==null?void 0:s.docs)==null?void 0:p.description}}};var u,d,l;e.parameters={...e.parameters,docs:{...(u=e.parameters)==null?void 0:u.docs,source:{originalSource:`{
  args: {
    variant: 'secondary',
    activeOption: 'option2',
    children: [<ActionButton key="option1" value="option1" icon={<Icon source={Heart} />}>
        Option1
      </ActionButton>, <ActionButton key="option2" value="option2" icon={<Icon source={Star} />}>
        Option2
      </ActionButton>, <ActionButton key="option3" value="option3" icon={<Icon source={Cart} />}>
        Option3
      </ActionButton>]
  }
}`,...(l=(d=e.parameters)==null?void 0:d.docs)==null?void 0:l.source}}};const O=["Primary","Secondary"];export{t as Primary,e as Secondary,O as __namedExportsOrder,f as default};
//# sourceMappingURL=ActionButtonGroup.stories-Cg12_HU9.js.map
