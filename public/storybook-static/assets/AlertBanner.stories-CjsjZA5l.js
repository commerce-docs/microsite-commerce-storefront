/*! Copyright 2026 Adobe
All Rights Reserved. */
import{w as x,a}from"./iframe-BXfH8Ezb.js";import{I as t}from"./Icon.stories.helpers-CaF-J1Nd.js";import"./preload-helper-C1FmrZbK.js";const{action:r}=__STORYBOOK_MODULE_ACTIONS__,{expect:n}=__STORYBOOK_MODULE_TEST__,q={title:"Components/AlertBanner",component:x,argTypes:{variant:{description:"The AlertBanner variant.",table:{type:{summary:"string"}},options:["brand","neutral","success","warning"],control:"radio"},icon:{description:"The AlertBanner icon.",table:{type:{summary:"FunctionComponent"}},options:Object.keys(t),mapping:t,control:{type:"select"}},message:{control:{type:"select",labels:{Short:"Short message",Long:"Long message"}},description:"The AlertBanner message.",options:["Short","Long"],mapping:{Short:a("div",{children:"Short message"}),Long:a("div",{children:"Alert banner with an extremely extremely long message"})}},onDismiss:{description:"The AlertBanner dismiss handler.",table:{type:{summary:"function"}},action:"onDismiss"},action:{description:"Optional action that must contain `label` and `onClick()` properties",control:!1}},parameters:{docs:{description:{component:"Use AlertBanners to notify and prompt users to take action."}}}},i={args:{variant:"neutral",icon:t.InfoFilled,message:a("span",{children:"Hello from your new AlertBanner!"}),onDismiss:r("Dismiss clicked"),action:{label:"Action",onClick:r("Action clicked")}},play:async()=>{const s=document.querySelector('div[class*="dropin-alert-banner"]');await n(s).toBeVisible();const e=s.querySelector(".dropin-alert-banner__dismiss-button");await n(e).toBeVisible(),await n(e==null?void 0:e.ariaLabel).toBe("Dismiss Alert");const L=s.querySelector(".dropin-alert-banner__icon");await n(L).toBeVisible()}},o={args:{variant:"brand",message:a("span",{children:"Hello from your new AlertBanner!"}),onDismiss:r("Dismiss clicked")}},c={args:{variant:"success",icon:t.CheckWithCircle,message:a("span",{children:"Hello from your new AlertBanner!"}),onDismiss:r("Dismiss clicked")}},l={args:{variant:"warning",icon:t.WarningFilled,message:a("span",{children:"Hello from your new AlertBanner!"}),onDismiss:r("Dismiss clicked")}},m={args:{variant:"warning",icon:t.WarningFilled,message:a("span",{children:"Hello from your new AlertBanner!"}),onDismiss:r("Dismiss clicked"),action:{label:"Action",onClick:r("Action clicked")}},play:async()=>{const s=document.querySelector('div[class*="dropin-alert-banner"]');await n(s).toBeVisible();const e=s.querySelector(".dropin-alert-banner__action");await n(e).toBeVisible(),await n(e).toHaveTextContent("Action")}};var p,d,u,g,B;i.parameters={...i.parameters,docs:{...(p=i.parameters)==null?void 0:p.docs,source:{originalSource:`{
  args: {
    variant: 'neutral',
    //@ts-ignore
    icon: IconsList.InfoFilled,
    message: <span>Hello from your new AlertBanner!</span>,
    onDismiss: action('Dismiss clicked'),
    action: {
      label: 'Action',
      onClick: action('Action clicked')
    }
  },
  play: async () => {
    const alertBanner = document.querySelector('div[class*="dropin-alert-banner"]') as HTMLElement;
    await expect(alertBanner).toBeVisible();
    const link = alertBanner.querySelector('.dropin-alert-banner__dismiss-button');
    await expect(link).toBeVisible();
    await expect(link?.ariaLabel).toBe('Dismiss Alert');
    const icon = alertBanner.querySelector('.dropin-alert-banner__icon');
    await expect(icon).toBeVisible();
  }
}`,...(u=(d=i.parameters)==null?void 0:d.docs)==null?void 0:u.source},description:{story:"<AlertBanner>👋 Hello from your new AlertBanner story!</AlertBanner>",...(B=(g=i.parameters)==null?void 0:g.docs)==null?void 0:B.description}}};var y,b,A;o.parameters={...o.parameters,docs:{...(y=o.parameters)==null?void 0:y.docs,source:{originalSource:`{
  args: {
    variant: 'brand',
    message: <span>Hello from your new AlertBanner!</span>,
    onDismiss: action('Dismiss clicked')
  }
}`,...(A=(b=o.parameters)==null?void 0:b.docs)==null?void 0:A.source}}};var w,D,S;c.parameters={...c.parameters,docs:{...(w=c.parameters)==null?void 0:w.docs,source:{originalSource:`{
  args: {
    variant: 'success',
    //@ts-ignore
    icon: IconsList.CheckWithCircle,
    message: <span>Hello from your new AlertBanner!</span>,
    onDismiss: action('Dismiss clicked')
  }
}`,...(S=(D=c.parameters)==null?void 0:D.docs)==null?void 0:S.source}}};var _,k,h;l.parameters={...l.parameters,docs:{...(_=l.parameters)==null?void 0:_.docs,source:{originalSource:`{
  args: {
    variant: 'warning',
    //@ts-ignore
    icon: IconsList.WarningFilled,
    message: <span>Hello from your new AlertBanner!</span>,
    onDismiss: action('Dismiss clicked')
  }
}`,...(h=(k=l.parameters)==null?void 0:k.docs)==null?void 0:h.source}}};var v,f,H;m.parameters={...m.parameters,docs:{...(v=m.parameters)==null?void 0:v.docs,source:{originalSource:`{
  args: {
    variant: 'warning',
    //@ts-ignore
    icon: IconsList.WarningFilled,
    message: <span>Hello from your new AlertBanner!</span>,
    onDismiss: action('Dismiss clicked'),
    action: {
      label: 'Action',
      onClick: action('Action clicked')
    }
  },
  play: async () => {
    const alertBanner = document.querySelector('div[class*="dropin-alert-banner"]') as HTMLElement;
    await expect(alertBanner).toBeVisible();
    const action = alertBanner.querySelector('.dropin-alert-banner__action');
    await expect(action).toBeVisible();
    await expect(action).toHaveTextContent('Action');
  }
}`,...(H=(f=m.parameters)==null?void 0:f.docs)==null?void 0:H.source}}};const V=["Neutral","Brand","Success","Warning","Action"];export{m as Action,o as Brand,i as Neutral,c as Success,l as Warning,V as __namedExportsOrder,q as default};
//# sourceMappingURL=AlertBanner.stories-CjsjZA5l.js.map
