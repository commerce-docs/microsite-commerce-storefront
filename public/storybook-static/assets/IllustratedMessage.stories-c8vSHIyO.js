/*! Copyright 2026 Adobe
All Rights Reserved. */
import{R as p,a as s,B as u,z as m,r as y}from"./iframe-BXfH8Ezb.js";import{I as o}from"./Icon.stories.helpers-CaF-J1Nd.js";import"./preload-helper-C1FmrZbK.js";const{expect:t}=__STORYBOOK_MODULE_TEST__,I={title:"Components/IllustratedMessage",component:p,argTypes:{icon:{description:"Icon to display in the IllustratedMessage.",table:{type:{summary:"FunctionComponent"}},options:Object.keys(o),mapping:o,control:{type:"select",defaultValue:"Placeholder"}},heading:{description:"Heading text to display in the IllustratedMessage.",control:{type:"text"},type:{name:"string",required:!1}},headingLevel:{description:"Heading level to display in the IllustratedMessage.",control:{type:"select",default:2},options:[1,2,3,4,5,6],type:{name:"string",required:!1}},message:{description:"Message to display in the IllustratedMessage.",options:["Short","Long"],mapping:{Short:s("div",{children:"Short message"}),Long:s("div",{children:"Illustrated message with an extremely extremely long message"})},control:{type:"select",labels:{Short:"Short message",Long:"Long message"}},table:{type:{summary:"FunctionComponent"}}},action:{description:"Action to display in the IllustratedMessage.",control:!1,table:{type:{summary:"FunctionComponent"}}},variant:{description:"Variant to display in the IllustratedMessage.",control:{type:"radio",default:"secondary"},options:["primary","secondary"],type:{name:"string",required:!1}}},parameters:{docs:{description:{component:"Use IllustratedMessages to display an illustration and a message, usually for an empty state or an error page."}}}},a={args:{icon:s(y,{source:m,size:"80"}),heading:"Illustrated Message heading",headingLevel:3,message:s("p",{children:"Illustrated Message text content"}),action:s(u,{children:"Illustrated Message action"}),variant:"secondary"},play:async()=>{const e=document.querySelector('div[class*="dropin-illustrated-message"]');await t(e).toBeVisible();const n=e.querySelector(".dropin-illustrated-message__icon");await t(n).toBeVisible();const d=e.querySelector(".dropin-illustrated-message__heading");await t(d).toBeVisible();const c=e.querySelector(".dropin-illustrated-message__message");await t(c).toBeVisible();const g=e.querySelector(".dropin-illustrated-message__action");await t(g).toBeVisible()}};var i,r,l;a.parameters={...a.parameters,docs:{...(i=a.parameters)==null?void 0:i.docs,source:{originalSource:`{
  args: {
    icon: <Icon source={Placeholder} size="80" />,
    heading: 'Illustrated Message heading',
    headingLevel: 3,
    message: <p>Illustrated Message text content</p>,
    action: <Button>Illustrated Message action</Button>,
    variant: 'secondary'
  },
  play: async () => {
    const illustratedMessage = document.querySelector('div[class*="dropin-illustrated-message"]') as HTMLElement;
    await expect(illustratedMessage).toBeVisible();
    const icon = illustratedMessage.querySelector('.dropin-illustrated-message__icon');
    await expect(icon).toBeVisible();
    const heading = illustratedMessage.querySelector('.dropin-illustrated-message__heading');
    await expect(heading).toBeVisible();
    const message = illustratedMessage.querySelector('.dropin-illustrated-message__message');
    await expect(message).toBeVisible();
    const action = illustratedMessage.querySelector('.dropin-illustrated-message__action');
    await expect(action).toBeVisible();
  }
}`,...(l=(r=a.parameters)==null?void 0:r.docs)==null?void 0:l.source}}};const S=["IllustratedMessage"];export{a as IllustratedMessage,S as __namedExportsOrder,I as default};
//# sourceMappingURL=IllustratedMessage.stories-c8vSHIyO.js.map
