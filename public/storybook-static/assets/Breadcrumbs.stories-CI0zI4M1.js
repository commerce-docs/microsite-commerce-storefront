/*! Copyright 2026 Adobe
All Rights Reserved. */
import{x as q,a as o,y as T,r as l,z as H}from"./iframe-BXfH8Ezb.js";import{I as b}from"./Icon.stories.helpers-CaF-J1Nd.js";import"./preload-helper-C1FmrZbK.js";const{expect:e}=__STORYBOOK_MODULE_TEST__,L={title:"Components/Breadcrumbs",component:q,tags:["autodocs"],parameters:{layout:"centered"},argTypes:{categories:{description:"List of categories to display on the Breadcrumbs.",type:{name:"other",value:"VNode[]"},control:"object"},separator:{description:"Icon used to separate the Breadcrumbs items.",type:{name:"symbol"},options:Object.keys(b),mapping:b,control:"select"}}},a={args:{categories:[o("a",{href:"#",children:"One"},"1"),o("a",{href:"/two",children:"Two"},"2"),o("a",{children:"Three"},"3")]},play:async()=>{const r=document.querySelector(".dropin-breadcrumbs__container"),t=r.querySelectorAll(".dropin-breadcrumbs__item a");await e(r).toBeVisible(),await e(t[0]).toHaveTextContent("One"),await e(t[1]).toHaveAttribute("href","/two")}},c={args:{categories:[o(l,{source:H,size:"16",className:"storybook_icon",stroke:"1",viewBox:"0 0 24 24","aria-label":"One",style:{cursor:"pointer"},onClick:()=>console.log("Go to Homepage")},0),o("a",{href:"/two",children:"Two"},"2"),o("a",{children:"Three"},"3")]},play:async()=>{const r=document.querySelector(".dropin-breadcrumbs__container"),t=r.querySelector(".dropin-breadcrumbs__item svg"),s=r.querySelectorAll(".dropin-breadcrumbs__item a");await e(r).toBeVisible(),await e(t).toBeVisible(),await e(s[0]).toHaveAttribute("href","/two"),await e(s[1]).toHaveTextContent("Three")}},i={args:{...a.args,separator:o(l,{source:T,size:"16",className:"storybook_icon",stroke:"1",viewBox:"0 0 24 24"})},play:async()=>{const r=document.querySelector(".dropin-breadcrumbs__container"),t=r.querySelectorAll(".dropin-breadcrumbs__separator--icon");await e(r).toBeVisible(),await e(t).toHaveLength(2),await e(t[0]).toBeVisible(),await e(t[1]).toBeVisible()}},n={args:{categories:[o(l,{source:H,size:"16",className:"storybook_icon",stroke:"1",viewBox:"0 0 24 24","aria-label":"One",style:{cursor:"pointer"},onClick:()=>console.log("Go to Homepage")},0),o("a",{href:"/two",children:"Two"},"2"),o("a",{children:"Three"},"3")],separator:o(l,{source:T,size:"16",className:"storybook_icon",stroke:"1",viewBox:"0 0 24 24"})},play:async()=>{const r=document.querySelector(".dropin-breadcrumbs__container"),t=r.querySelector(".dropin-breadcrumbs__item svg"),s=r.querySelectorAll(".dropin-breadcrumbs__item a"),m=r.querySelectorAll(".dropin-breadcrumbs__separator--icon");await e(r).toBeVisible(),await e(t).toBeVisible(),await e(s[0]).toHaveAttribute("href","/two"),await e(m).toHaveLength(2),await e(m[1]).toBeVisible()}};var d,u,p,y,_;a.parameters={...a.parameters,docs:{...(d=a.parameters)==null?void 0:d.docs,source:{originalSource:`{
  args: {
    categories: [<a href="#" key="1">
        One
      </a>, <a href="/two" key="2">
        Two
      </a>, <a key="3">Three</a>]
  },
  play: async () => {
    const breadcrumbsElement = document.querySelector('.dropin-breadcrumbs__container') as HTMLElement;
    const categories = breadcrumbsElement.querySelectorAll('.dropin-breadcrumbs__item a');
    await expect(breadcrumbsElement).toBeVisible();
    await expect(categories[0]).toHaveTextContent('One');
    await expect(categories[1]).toHaveAttribute('href', '/two');
  }
}`,...(p=(u=a.parameters)==null?void 0:u.docs)==null?void 0:p.source},description:{story:"```ts\nimport { Breadcrumbs } from '@adobe-commerce/elsie/components/Breadcrumbs';\n```",...(_=(y=a.parameters)==null?void 0:y.docs)==null?void 0:_.description}}};var g,w,h;c.parameters={...c.parameters,docs:{...(g=c.parameters)==null?void 0:g.docs,source:{originalSource:`{
  args: {
    categories: [<Icon key={0} source={Placeholder} size="16" className="storybook_icon" stroke="1" viewBox="0 0 24 24" aria-label="One" style={{
      cursor: 'pointer'
    }} onClick={() => console.log('Go to Homepage')} />, <a href="/two" key="2">
        Two
      </a>, <a key="3">Three</a>]
  },
  play: async () => {
    const breadcrumbsElement = document.querySelector('.dropin-breadcrumbs__container') as HTMLElement;
    const icon = breadcrumbsElement.querySelector('.dropin-breadcrumbs__item svg') as HTMLElement;
    const categories = breadcrumbsElement.querySelectorAll('.dropin-breadcrumbs__item a');
    await expect(breadcrumbsElement).toBeVisible();
    await expect(icon).toBeVisible();
    await expect(categories[0]).toHaveAttribute('href', '/two');
    await expect(categories[1]).toHaveTextContent('Three');
  }
}`,...(h=(w=c.parameters)==null?void 0:w.docs)==null?void 0:h.source}}};var B,v,x;i.parameters={...i.parameters,docs:{...(B=i.parameters)==null?void 0:B.docs,source:{originalSource:`{
  args: {
    ...Breadcrumbs.args,
    separator: <Icon source={ChevronRight} size="16" className="storybook_icon" stroke="1" viewBox="0 0 24 24" />
  },
  play: async () => {
    const breadcrumbsElement = document.querySelector('.dropin-breadcrumbs__container') as HTMLElement;
    const separators = breadcrumbsElement.querySelectorAll('.dropin-breadcrumbs__separator--icon');
    await expect(breadcrumbsElement).toBeVisible();
    await expect(separators).toHaveLength(2);
    await expect(separators[0]).toBeVisible();
    await expect(separators[1]).toBeVisible();
  }
}`,...(x=(v=i.parameters)==null?void 0:v.docs)==null?void 0:x.source}}};var S,k,E;n.parameters={...n.parameters,docs:{...(S=n.parameters)==null?void 0:S.docs,source:{originalSource:`{
  args: {
    categories: [<Icon key={0} source={Placeholder} size="16" className="storybook_icon" stroke="1" viewBox="0 0 24 24" aria-label="One" style={{
      cursor: 'pointer'
    }} onClick={() => console.log('Go to Homepage')} />, <a href="/two" key="2">
        Two
      </a>, <a key="3">Three</a>],
    separator: <Icon source={ChevronRight} size="16" className="storybook_icon" stroke="1" viewBox="0 0 24 24" />
  },
  play: async () => {
    const breadcrumbsElement = document.querySelector('.dropin-breadcrumbs__container') as HTMLElement;
    const icon = breadcrumbsElement.querySelector('.dropin-breadcrumbs__item svg') as HTMLElement;
    const categories = breadcrumbsElement.querySelectorAll('.dropin-breadcrumbs__item a');
    const separators = breadcrumbsElement.querySelectorAll('.dropin-breadcrumbs__separator--icon');
    await expect(breadcrumbsElement).toBeVisible();
    await expect(icon).toBeVisible();
    await expect(categories[0]).toHaveAttribute('href', '/two');
    await expect(separators).toHaveLength(2);
    await expect(separators[1]).toBeVisible();
  }
}`,...(E=(k=n.parameters)==null?void 0:k.docs)==null?void 0:E.source}}};const O=["Breadcrumbs","BreadcrumbsWithLeadingIcon","BreadcrumbsWithSeparator","BreadcrumbsWithIcons"];export{a as Breadcrumbs,n as BreadcrumbsWithIcons,c as BreadcrumbsWithLeadingIcon,i as BreadcrumbsWithSeparator,O as __namedExportsOrder,L as default};
//# sourceMappingURL=Breadcrumbs.stories-CI0zI4M1.js.map
