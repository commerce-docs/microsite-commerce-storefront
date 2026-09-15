/*! Copyright 2026 Adobe
All Rights Reserved. */
import{q as g}from"./iframe-BXfH8Ezb.js";import"./preload-helper-C1FmrZbK.js";const p=""+new URL("example-BGnipD4n.jpg",import.meta.url).href,{expect:i,waitFor:h}=__STORYBOOK_MODULE_TEST__,t=384,c=288,w={title:"Components/Image",component:g,argTypes:{width:{description:"Image width",type:"number"},height:{description:"Image height",type:"number"},loading:{description:"Loading strategy",type:"string",table:{defaultValue:{summary:"lazy"}},options:["lazy","eager"]},params:{description:"Parameters appened to the image URL",type:{name:"other",value:"object"}},onLoad:{description:"Callback when image is loaded",action:"loaded"},src:{description:"Image URL",type:"string"}},parameters:{docs:{description:{component:"Use Images to display visual content like photos and illustrations."}}}},e={args:{src:p,alt:"Some alternative text",loading:"eager",width:t,height:c},play:async()=>{const r=document.querySelector(".dropin-image");await i(r).toBeVisible(),await h(()=>i(r).toHaveClass("dropin-image--loaded"))}},a={args:{src:p,params:{width:t},alt:"Some alternative text",loading:"lazy",width:t,height:c}};var n,o,s;e.parameters={...e.parameters,docs:{...(n=e.parameters)==null?void 0:n.docs,source:{originalSource:`{
  args: {
    src: ExampleImage,
    alt: 'Some alternative text',
    loading: 'eager',
    width: defaultWidth,
    height: defaultHeight
  },
  play: async () => {
    const elem = document.querySelector('.dropin-image') as HTMLElement;
    await expect(elem).toBeVisible();
    await waitFor(() => expect(elem).toHaveClass('dropin-image--loaded'));
  }
}`,...(s=(o=e.parameters)==null?void 0:o.docs)==null?void 0:s.source}}};var m,d,l;a.parameters={...a.parameters,docs:{...(m=a.parameters)==null?void 0:m.docs,source:{originalSource:`{
  args: {
    src: ExampleImage,
    params: {
      width: defaultWidth
    },
    alt: 'Some alternative text',
    loading: 'lazy',
    width: defaultWidth,
    height: defaultHeight
  }
}`,...(l=(d=a.parameters)==null?void 0:d.docs)==null?void 0:l.source}}};const x=["Primary","WithParams"];export{e as Primary,a as WithParams,x as __namedExportsOrder,w as default};
//# sourceMappingURL=Image.stories-B57h0GIt.js.map
