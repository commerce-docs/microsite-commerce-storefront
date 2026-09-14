/*! Copyright 2026 Adobe
All Rights Reserved. */
import{$ as M,a as l}from"./iframe-BXfH8Ezb.js";const{expect:t}=__STORYBOOK_MODULE_TEST__,O={title:"Components/LiveRegion",component:M,decorators:[a=>l("div",{children:[l("p",{style:{fontSize:"0.875rem",color:"#666",marginBottom:"1rem"},children:"The live region is visually hidden. The dashed outline below is for demonstration only."}),l("div",{style:{outline:"2px dashed #6e6e6e",padding:"0.5rem",position:"relative",minHeight:"2rem"},children:l(a,{})})]})],argTypes:{message:{description:"The text announced to screen readers. Pass an empty string to clear a previous announcement without unmounting the element.",table:{type:{summary:"string"},defaultValue:{summary:'""'}},control:"text"},politeness:{description:'Controls announcement urgency. `"polite"` waits for the user to finish; `"assertive"` interrupts immediately.',table:{type:{summary:'"polite" | "assertive"'},defaultValue:{summary:'"polite"'}},options:["polite","assertive"],control:"radio"},className:{description:"Additional CSS class merged with `dropin-live-region`.",table:{type:{summary:"string"}},control:"text"}},parameters:{docs:{description:{component:`\`LiveRegion\` renders a visually-hidden, always-mounted live region element
that announces content changes to screen readers without requiring focus movement.

It uses \`aria-live\` and \`aria-atomic\` exclusively — no explicit \`role\` is set,
avoiding the double-announcement issue that arises when both a semantic role
and \`aria-live\` are present on the same element.

Use it alongside loading indicators or whenever content updates dynamically,
to satisfy **WCAG 4.1.3 Status Messages**.

The element is visually hidden — the Storybook preview renders
it with a visible outline for demonstration purposes only.`}}}},i={tags:["isHidden"],args:{message:"Loading order summary",politeness:"polite"}},s={args:{message:""},play:async({canvasElement:a})=>{const e=a.querySelector('[aria-live="polite"]');await t(e).toBeInTheDocument(),await t(e).toHaveAttribute("aria-live","polite"),await t(e).toHaveAttribute("aria-atomic","true"),await t(e.textContent).toBe("")}},n={args:{message:"3 items added to cart",politeness:"polite"},play:async({canvasElement:a})=>{const e=a.querySelector('[aria-live="polite"]');await t(e).toHaveAttribute("aria-live","polite"),await t(e.textContent).toBe("3 items added to cart")}},o={args:{message:"Payment failed. Please try again.",politeness:"assertive"},play:async({canvasElement:a})=>{const e=a.querySelector('[aria-live="assertive"]');await t(e).toHaveAttribute("aria-live","assertive"),await t(e).toHaveAttribute("aria-atomic","true"),await t(e.textContent).toBe("Payment failed. Please try again.")}},r={args:{message:"Loading shipping methods",politeness:"polite"},play:async({canvasElement:a})=>{const e=a.querySelector('[aria-live="polite"]');await t(e).toBeInTheDocument(),await t(e.textContent).toBe("Loading shipping methods")}};var c,m,d,p,g;i.parameters={...i.parameters,docs:{...(c=i.parameters)==null?void 0:c.docs,source:{originalSource:`{
  tags: ['isHidden'],
  args: {
    message: 'Loading order summary',
    politeness: 'polite'
  }
}`,...(d=(m=i.parameters)==null?void 0:m.docs)==null?void 0:d.source},description:{story:'```tsx\n<LiveRegion message="Loading order summary" />\n```',...(g=(p=i.parameters)==null?void 0:p.docs)==null?void 0:g.description}}};var u,v,y,h,w;s.parameters={...s.parameters,docs:{...(u=s.parameters)==null?void 0:u.docs,source:{originalSource:`{
  args: {
    message: ''
  },
  play: async ({
    canvasElement
  }) => {
    const region = canvasElement.querySelector<HTMLElement>('[aria-live="polite"]')!;
    await expect(region).toBeInTheDocument();
    await expect(region).toHaveAttribute('aria-live', 'polite');
    await expect(region).toHaveAttribute('aria-atomic', 'true');
    await expect(region.textContent).toBe('');
  }
}`,...(y=(v=s.parameters)==null?void 0:v.docs)==null?void 0:y.source},description:{story:"Default state — empty message. The region is mounted but silent.\nBrowsers and AT will announce nothing until `message` changes to a non-empty string.\n\n```tsx\n<LiveRegion />\n```",...(w=(h=s.parameters)==null?void 0:h.docs)==null?void 0:w.description}}};var x,L,S,b,f;n.parameters={...n.parameters,docs:{...(x=n.parameters)==null?void 0:x.docs,source:{originalSource:`{
  args: {
    message: '3 items added to cart',
    politeness: 'polite'
  },
  play: async ({
    canvasElement
  }) => {
    const region = canvasElement.querySelector<HTMLElement>('[aria-live="polite"]')!;
    await expect(region).toHaveAttribute('aria-live', 'polite');
    await expect(region.textContent).toBe('3 items added to cart');
  }
}`,...(S=(L=n.parameters)==null?void 0:L.docs)==null?void 0:S.source},description:{story:'Polite announcement — the default. Screen readers finish the current sentence\nbefore reading the status message.\n\n```tsx\n<LiveRegion message="3 items added to cart" />\n```',...(f=(b=n.parameters)==null?void 0:b.docs)==null?void 0:f.description}}};var T,P,E,A,H;o.parameters={...o.parameters,docs:{...(T=o.parameters)==null?void 0:T.docs,source:{originalSource:`{
  args: {
    message: 'Payment failed. Please try again.',
    politeness: 'assertive'
  },
  play: async ({
    canvasElement
  }) => {
    const region = canvasElement.querySelector<HTMLElement>('[aria-live="assertive"]')!;
    await expect(region).toHaveAttribute('aria-live', 'assertive');
    await expect(region).toHaveAttribute('aria-atomic', 'true');
    await expect(region.textContent).toBe('Payment failed. Please try again.');
  }
}`,...(E=(P=o.parameters)==null?void 0:P.docs)==null?void 0:E.source},description:{story:'Assertive announcement — interrupts the screen reader immediately.\nReserve for time-sensitive errors or critical state changes.\n\n```tsx\n<LiveRegion message="Payment failed. Please try again." politeness="assertive" />\n```',...(H=(A=o.parameters)==null?void 0:A.docs)==null?void 0:H.description}}};var B,R,C,_,q;r.parameters={...r.parameters,docs:{...(B=r.parameters)==null?void 0:B.docs,source:{originalSource:`{
  args: {
    message: 'Loading shipping methods',
    politeness: 'polite'
  },
  play: async ({
    canvasElement
  }) => {
    const region = canvasElement.querySelector<HTMLElement>('[aria-live="polite"]')!;
    await expect(region).toBeInTheDocument();
    await expect(region.textContent).toBe('Loading shipping methods');
  }
}`,...(C=(R=r.parameters)==null?void 0:R.docs)==null?void 0:C.source},description:{story:"Loading state pattern — pair a `LiveRegion` with a visual loading indicator.\nThe `LiveRegion` is always mounted; only its `message` changes.\n\n```tsx\n<LiveRegion message={loading ? 'Loading shipping methods' : ''} />\n{loading && <ProgressSpinner />}\n```",...(q=(_=r.parameters)==null?void 0:_.docs)==null?void 0:q.description}}};const D=["LiveRegion","Empty","Polite","Assertive","LoadingPattern"],j=Object.freeze(Object.defineProperty({__proto__:null,Assertive:o,Empty:s,LiveRegion:i,LoadingPattern:r,Polite:n,__namedExportsOrder:D,default:O},Symbol.toStringTag,{value:"Module"}));export{o as A,s as E,j as L,n as P,i as a,r as b};
//# sourceMappingURL=LiveRegion.stories-Bic5e-tm.js.map
