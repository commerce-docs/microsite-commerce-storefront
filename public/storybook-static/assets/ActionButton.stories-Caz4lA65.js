/*! Copyright 2026 Adobe
All Rights Reserved. */
import{A as M,a as O,g as H,r as L}from"./iframe-CKgIZA8l.js";import{I as p}from"./Icon.stories.helpers-BjapTuwK.js";import"./preload-helper-C1FmrZbK.js";const{expect:t,within:s}=__STORYBOOK_MODULE_TEST__,U={title:"Components/ActionButton",component:M,argTypes:{icon:{options:Object.keys(p),mapping:p,control:{type:"select"}}},parameters:{docs:{description:{component:"Use Action Buttons to let users complete actions or select items in a workflow."}}}},e={name:"Action Button",args:{children:"Action",active:!1,disabled:!1},play:async({canvasElement:n})=>{const a=s(n);await t(await a.findByRole("button")).toBeVisible(),await t(await a.findByRole("button")).toHaveClass("dropin-action-button")}},c={name:"Icon Action Button",args:{...e.args,children:"","aria-label":"Action Button",icon:O(L,{source:H,size:"32",className:"storybook_icon",stroke:"1",viewBox:"0 0 24 24"})},play:async({canvasElement:n})=>{const a=s(n),u=document.querySelector(".dropin-action-button-icon"),m=document.querySelector('g[data-name="Add icon"]');await t(await a.findByRole("button")).toBeVisible(),await t(await u).toBeVisible(),await t(await m).toBeVisible()}},o={name:"Action Button With Icon",args:{...e.args,icon:O(L,{source:H,size:"32",className:"storybook_icon",stroke:"1",viewBox:"0 0 24 24"})},play:async({canvasElement:n})=>{const a=s(n),u=document.querySelector(".dropin-action-button-icon"),m=document.querySelector('g[data-name="Add icon"]');await t(await a.findByRole("button")).toBeVisible(),await t(await u).toBeVisible(),await t(await m).toBeVisible(),await t(await a.getByText("Action")).toBeVisible()}},i={name:"Disabled Action Button",parameters:{a11y:{config:{rules:[{id:"color-contrast",enabled:!1}]}}},args:{...e.args,disabled:!0},play:async({canvasElement:n})=>{const a=s(n);await t(await a.findByRole("button")).toBeDisabled()}},r={name:"Active Action Button",args:{...e.args,active:!0}},l={name:"Disabled Action Button With Icon",parameters:{a11y:{config:{rules:[{id:"color-contrast",enabled:!1}]}}},args:{...o.args,disabled:!0},play:async({canvasElement:n})=>{const a=s(n);await t(await a.findByRole("button")).toBeDisabled()}},d={name:"Active Action Button With Icon",args:{...o.args,active:!0}};var b,B,w;e.parameters={...e.parameters,docs:{...(b=e.parameters)==null?void 0:b.docs,source:{originalSource:`{
  name: 'Action Button',
  args: {
    children: 'Action',
    active: false,
    disabled: false
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByRole('button')).toBeVisible();
    await expect(await canvas.findByRole('button')).toHaveClass('dropin-action-button');
  }
}`,...(w=(B=e.parameters)==null?void 0:B.docs)==null?void 0:w.source}}};var y,v,g;c.parameters={...c.parameters,docs:{...(y=c.parameters)==null?void 0:y.docs,source:{originalSource:`{
  name: 'Icon Action Button',
  args: {
    ...Default.args,
    children: '',
    'aria-label': 'Action Button',
    icon: <Icon source={Add} size="32" className="storybook_icon" stroke="1" viewBox="0 0 24 24" />
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    const buttonIcon = document.querySelector('.dropin-action-button-icon') as HTMLElement;
    const addIcon = document.querySelector('g[data-name="Add icon"]') as HTMLElement;
    await expect(await canvas.findByRole('button')).toBeVisible();
    await expect(await buttonIcon).toBeVisible();
    await expect(await addIcon).toBeVisible();
  }
}`,...(g=(v=c.parameters)==null?void 0:v.docs)==null?void 0:g.source}}};var A,I,f;o.parameters={...o.parameters,docs:{...(A=o.parameters)==null?void 0:A.docs,source:{originalSource:`{
  name: 'Action Button With Icon',
  args: {
    ...Default.args,
    icon: <Icon source={Add} size="32" className="storybook_icon" stroke="1" viewBox="0 0 24 24" />
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    const buttonIcon = document.querySelector('.dropin-action-button-icon') as HTMLElement;
    const addIcon = document.querySelector('g[data-name="Add icon"]') as HTMLElement;
    await expect(await canvas.findByRole('button')).toBeVisible();
    await expect(await buttonIcon).toBeVisible();
    await expect(await addIcon).toBeVisible();
    await expect(await canvas.getByText('Action')).toBeVisible();
  }
}`,...(f=(I=o.parameters)==null?void 0:I.docs)==null?void 0:f.source}}};var h,x,D;i.parameters={...i.parameters,docs:{...(h=i.parameters)==null?void 0:h.docs,source:{originalSource:`{
  name: 'Disabled Action Button',
  parameters: {
    a11y: {
      config: {
        rules: [{
          id: 'color-contrast',
          enabled: false
        }]
      }
    }
  },
  args: {
    ...Default.args,
    disabled: true
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByRole('button')).toBeDisabled();
  }
}`,...(D=(x=i.parameters)==null?void 0:x.docs)==null?void 0:D.source}}};var S,E,V;r.parameters={...r.parameters,docs:{...(S=r.parameters)==null?void 0:S.docs,source:{originalSource:`{
  name: 'Active Action Button',
  args: {
    ...Default.args,
    active: true
  }
}`,...(V=(E=r.parameters)==null?void 0:E.docs)==null?void 0:V.source}}};var R,_,k;l.parameters={...l.parameters,docs:{...(R=l.parameters)==null?void 0:R.docs,source:{originalSource:`{
  name: 'Disabled Action Button With Icon',
  parameters: {
    a11y: {
      config: {
        rules: [{
          id: 'color-contrast',
          enabled: false
        }]
      }
    }
  },
  args: {
    ...WithIcon.args,
    disabled: true
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByRole('button')).toBeDisabled();
  }
}`,...(k=(_=l.parameters)==null?void 0:_.docs)==null?void 0:k.source}}};var T,W,q;d.parameters={...d.parameters,docs:{...(T=d.parameters)==null?void 0:T.docs,source:{originalSource:`{
  name: 'Active Action Button With Icon',
  args: {
    ...WithIcon.args,
    active: true
  }
}`,...(q=(W=d.parameters)==null?void 0:W.docs)==null?void 0:q.source}}};const j=["Default","IconOnly","WithIcon","Disabled","Active","DisabledIcon","ActiveIcon"];export{r as Active,d as ActiveIcon,e as Default,i as Disabled,l as DisabledIcon,c as IconOnly,o as WithIcon,j as __namedExportsOrder,U as default};
//# sourceMappingURL=ActionButton.stories-Caz4lA65.js.map
