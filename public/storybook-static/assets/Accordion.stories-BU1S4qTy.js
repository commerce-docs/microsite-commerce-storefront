/*! Copyright 2026 Adobe
All Rights Reserved. */
import{S as d,d as $,e as Y,f as u,g as m,h as l,i as s,a as e,j as c,l as z,C as F,m as G,n as x,o as J,k as Q,p as h,q as X}from"./iframe-CKgIZA8l.js";import"./preload-helper-C1FmrZbK.js";const{expect:n,within:Z,userEvent:ee}=__STORYBOOK_MODULE_TEST__,ne={title:"Components/Accordion",component:s,tags:["autodocs"],parameters:{layout:"centered"},argTypes:{actionIconPosition:{description:"Position of the action icon",options:["left","right"],control:{type:"select"},defaultValue:"left"},iconOpen:{description:"Icon for open button (svg)",options:Object.keys(l),mapping:l,control:{type:"select"},defaultValue:"Minus"},iconClose:{description:"Icon for close button (svg)",options:Object.keys(l),mapping:l,control:{type:"select"},defaultValue:"Minus"},iconLeft:{description:"Optional icon on left side (svg)",options:Object.keys(l),mapping:l,control:{type:"select"},defaultValue:"Minus"},showIconLeft:{description:"Whether or not the display the leftIcon",type:"boolean",defaultValue:{summary:!1}},defaultOpen:{description:"The defaultOpen prop determines the initial state of the accordion, specifying whether it starts as open or closed. Default is false",type:"boolean",defaultValue:{summary:!1}},secondaryText:{description:"Add text to the button.",type:"string",defaultValue:"",control:"text"},ariaLabelTitle:{description:"Aria label for the title. Useful for screen readers when the title is not a string",type:"string",defaultValue:"",control:"text"},renderContentWhenClosed:{description:"Render content when closed",type:"boolean",defaultValue:{summary:!0}},onStateChange:{description:"Callback function when the state changes",action:"onStateChange"}}},p={args:{actionIconPosition:"right",iconOpen:m,iconClose:u},render:({actionIconPosition:t,iconOpen:o,iconClose:i})=>e("div",{children:[e("h2",{style:{font:"var(--type-body-1-strong-font)",color:"var(--color-neutral-800)",letterSpacing:"var(--type-body-1-strong-letter-spacing)"},children:"This is the Accordion Component, this title will be longer in order to increase width of the story"}),e(s,{actionIconPosition:t,iconOpen:o,iconClose:i,children:e(c,{title:"Title",children:e("p",{children:"Short product details should be kept to 6 lines maximum."})})})]}),play:async()=>{const t=document.querySelector("#storybook-root"),o=Z(t),i=document.querySelector('div[class*="dropin-accordion"]');await n(i).toBeVisible();const r=document.querySelector(".dropin-accordion-section__heading");await n(r).toHaveTextContent("Title"),await ee.click(o.getByRole("button"));const a=document.querySelector(".dropin-accordion-section__content-container");await n(a).toBeVisible()}},y={args:{actionIconPosition:"right",iconOpen:m,iconClose:u,iconLeft:d,showIconLeft:!0},render:({actionIconPosition:t,iconOpen:o,iconClose:i,iconLeft:r,showIconLeft:a})=>e("div",{children:[e("h2",{style:{font:"var(--type-body-1-strong-font)",color:"var(--color-neutral-800)",letterSpacing:"var(--type-body-1-strong-letter-spacing)"},children:"This is the Accordion Component, this title will be longer in order to increase width of the story"}),e(s,{actionIconPosition:t,iconOpen:o,iconClose:i,children:e(c,{title:"Title",secondaryText:"Optional Text",iconLeft:r,showIconLeft:a,children:e("p",{children:"Short product details should be kept to 6 lines maximum."})})})]}),play:async()=>{const t=document.querySelector('div[class*="dropin-accordion"]');await n(t).toBeVisible();const o=document.querySelector(".dropin-accordion-section__title-container");await n(o).toBeVisible(),await n(o).toContainHTML("<svg")}},f={args:{actionIconPosition:"right",iconOpen:m,iconClose:u,iconLeft:d,secondaryText:"Optional Text"},render:({actionIconPosition:t,iconOpen:o,iconClose:i,iconLeft:r,secondaryText:a})=>e("div",{children:[e("h2",{style:{font:"var(--type-body-1-strong-font)",color:"var(--color-neutral-800)",letterSpacing:"var(--type-body-1-strong-letter-spacing)"},children:"This is the Accordion Component, this title will be longer in order to increase width of the story"}),e(s,{actionIconPosition:t,iconOpen:o,iconClose:i,children:e(c,{title:"Title",secondaryText:a,iconLeft:r,children:e("p",{children:"Short product details should be kept to 6 lines maximum."})})})]}),play:async()=>{const t=document.querySelector('div[class*="dropin-accordion"]');await n(t).toBeVisible();const o=document.querySelector(".dropin-accordion-section__secondary-text");await n(o).toBeVisible(),await n(o).toHaveTextContent("Optional Text")}},g={args:{actionIconPosition:"right",iconOpen:m,iconClose:u,iconLeft:d},render:({actionIconPosition:t,iconOpen:o,iconClose:i,iconLeft:r})=>e("div",{children:[e("h2",{style:{font:"var(--type-body-1-strong-font)",color:"var(--color-neutral-800)",letterSpacing:"var(--type-body-1-strong-letter-spacing)"},children:"This is the Accordion Component, this title will be longer in order to increase width of the story"}),e(s,{actionIconPosition:t,iconOpen:o,iconClose:i,children:e(c,{title:"Title",iconLeft:r,secondaryText:e(h,{amount:9.99}),children:e("p",{children:"Short product details should be kept to 6 lines maximum."})})})]}),play:async()=>{const t=document.querySelector('div[class*="dropin-accordion"]');await n(t).toBeVisible();const o=document.querySelector(".dropin-accordion-section__secondary-text");await n(o).toBeVisible(),await n(o).toHaveTextContent("$9.99")}},S={args:{actionIconPosition:"left",iconOpen:Y,iconClose:$},render:({actionIconPosition:t,iconOpen:o,iconClose:i})=>e("div",{children:[e("h2",{style:{font:"var(--type-body-1-strong-font)",color:"var(--color-neutral-800)",letterSpacing:"var(--type-body-1-strong-letter-spacing)"},children:"This is the Accordion Component, this title will be longer in order to increase width of the story"}),e(s,{actionIconPosition:t,iconOpen:o,iconClose:i,children:e(c,{title:"Title",secondaryText:e("a",{rel:"noreferrer",href:"/cart",children:"Edit"}),children:e(J,{title:e("div",{children:"Short Name"}),description:e("div",{children:"Secondary product information such as brand name, description, etc."}),sku:e("div",{children:"SKU: 59YK7"}),quantity:1,image:e(X,{src:"https://picsum.photos/132/184",width:"132",height:"184",alt:"Some alternative text",loading:"lazy"}),price:e(h,{amount:53.99,style:{fontWeight:"inherit",color:"inherit"}}),total:e(Q,{children:[e(h,{amount:59.98,variant:"strikethrough"}),e(h,{amount:55.95,sale:!0})]})},"uuid")})})]}),play:async()=>{const t=document.querySelector(".dropin-accordion"),o=t.querySelector(".dropin-accordion a");await n(t).toBeVisible(),await n(o).toHaveTextContent("Edit"),await n(o).toHaveAttribute("href","/cart")}},v={args:{actionIconPosition:"right",iconOpen:Y,iconClose:$,iconLeft:d,showIconLeft:!1},argTypes:{showIconLeft:{table:{disable:!0}},iconLeft:{table:{disable:!0}}},render:({actionIconPosition:t,iconOpen:o,iconClose:i})=>e("div",{children:[e("h2",{style:{font:"var(--type-body-1-strong-font)",color:"var(--color-neutral-800)",letterSpacing:"var(--type-body-1-strong-letter-spacing)"},children:"This is the Accordion Component, this title will be longer in order to increase width of the story"}),e(s,{actionIconPosition:t,iconOpen:o,iconClose:i,children:[e(c,{title:"Cart summary",iconLeft:z,showIconLeft:!0,renderContentWhenClosed:!1,children:e(F,{children:[e("h2",{style:{font:"var(--type-headline-2-strong-font)"},children:"Title"}),e("p",{style:{font:"var(--type-body-2-default-font)"},children:"This is a short description of the item and should be kept to two or three lines as maximum."})]})}),e(c,{title:"Card info",iconLeft:d,showIconLeft:!0,secondaryText:"Optional Text",renderContentWhenClosed:!1,children:e("p",{children:["Short product details should be kept to 6 lines maximum.",e("br",{}),"Short product details should be kept to 6 lines maximum.",e("br",{}),"Short product details should be kept to 6 lines maximum.",e("br",{}),"Short product details should be kept to 6 lines maximum.",e("br",{}),"Short product details should be kept to 6 lines maximum.",e("br",{})]})}),e(c,{title:"Wallet",iconLeft:G,showIconLeft:!0,children:e("p",{children:"Short product details should be kept to 6 lines maximum."})}),e(c,{title:"Shipping",iconLeft:x,showIconLeft:!0,children:e("p",{children:"Short product details should be kept to 6 lines maximum."})}),e(c,{title:"Notes",iconLeft:x,showIconLeft:!1,children:e("p",{children:"Short product details should be kept to 6 lines maximum."})})]})]}),play:async()=>{const t=document.querySelector('div[class*="dropin-accordion"]');await n(t).toBeVisible();const o=document.querySelector(".dropin-accordion-section");await n(o).toBeVisible();const i=document.querySelector(".dropin-divider");await n(i).toBeVisible()}},b={args:{actionIconPosition:"right",iconOpen:m,iconClose:u,iconLeft:d,defaultOpen:!0},render:({actionIconPosition:t,iconOpen:o,iconClose:i,iconLeft:r,defaultOpen:a})=>e("div",{children:[e("h2",{style:{font:"var(--type-body-1-strong-font)",color:"var(--color-neutral-800)",letterSpacing:"var(--type-body-1-strong-letter-spacing)"},children:"This is the Accordion Component, this title will be longer in order to increase width of the story"}),e(s,{actionIconPosition:t,iconOpen:o,iconClose:i,children:e(c,{title:"Title",iconLeft:r,secondaryText:e(h,{amount:9.99}),renderContentWhenClosed:!1,defaultOpen:a,children:e("p",{children:"Short product details should be kept to 6 lines maximum."})})},a)]}),play:async()=>{const t=document.querySelector('div[class*="dropin-accordion"]');await n(t).toBeVisible();const o=document.querySelector(".dropin-accordion-section__secondary-text");await n(o).toBeVisible(),await n(o).toHaveTextContent("$9.99")}};var I,T,C,w,L;p.parameters={...p.parameters,docs:{...(I=p.parameters)==null?void 0:I.docs,source:{originalSource:`{
  args: {
    actionIconPosition: 'right',
    iconOpen: Icons.Add,
    iconClose: Icons.Minus
  },
  render: ({
    actionIconPosition,
    iconOpen,
    iconClose
  }) => <div>
      <h2 style={{
      font: 'var(--type-body-1-strong-font)',
      color: 'var(--color-neutral-800)',
      letterSpacing: 'var(--type-body-1-strong-letter-spacing)'
    }}>
        This is the Accordion Component, this title will be longer in order to
        increase width of the story
      </h2>

      <Accordion actionIconPosition={actionIconPosition} iconOpen={iconOpen} iconClose={iconClose}>
        <AccordionSection title={'Title'}>
          <p>Short product details should be kept to 6 lines maximum.</p>
        </AccordionSection>
      </Accordion>
    </div>,
  play: async () => {
    const canvasElement = document.querySelector('#storybook-root') as HTMLElement;
    const canvas = within(canvasElement);
    const loaderIcon = document.querySelector('div[class*="dropin-accordion"]') as HTMLElement;
    await expect(loaderIcon).toBeVisible();
    const header = document.querySelector('.dropin-accordion-section__heading') as HTMLElement;
    await expect(header).toHaveTextContent('Title');
    await userEvent.click(canvas.getByRole('button'));
    const content = document.querySelector('.dropin-accordion-section__content-container') as HTMLElement;
    await expect(content).toBeVisible();
  }
}`,...(C=(T=p.parameters)==null?void 0:T.docs)==null?void 0:C.source},description:{story:`\`\`\`ts
import { Accordion, AccordionSection } from '@adobe-commerce/elsie/components/Accordion';

<Accordion>
   <AccordionSection title={"Title"}><p>Short product details should be kept to 6 lines maximum.</p></AccordionSection>
</Accordion>

\`\`\``,...(L=(w=p.parameters)==null?void 0:w.docs)==null?void 0:L.description}}};var A,O,k;y.parameters={...y.parameters,docs:{...(A=y.parameters)==null?void 0:A.docs,source:{originalSource:`{
  args: {
    actionIconPosition: 'right',
    iconOpen: Icons.Add,
    iconClose: Icons.Minus,
    iconLeft: Icons.Card,
    showIconLeft: true
  },
  render: ({
    actionIconPosition,
    iconOpen,
    iconClose,
    iconLeft,
    showIconLeft
  }) => <div>
      <h2 style={{
      font: 'var(--type-body-1-strong-font)',
      color: 'var(--color-neutral-800)',
      letterSpacing: 'var(--type-body-1-strong-letter-spacing)'
    }}>
        This is the Accordion Component, this title will be longer in order to
        increase width of the story
      </h2>

      <Accordion actionIconPosition={actionIconPosition} iconOpen={iconOpen} iconClose={iconClose}>
        <AccordionSection title={'Title'} secondaryText={'Optional Text'} iconLeft={iconLeft} showIconLeft={showIconLeft}>
          <p>Short product details should be kept to 6 lines maximum.</p>
        </AccordionSection>
      </Accordion>
    </div>,
  play: async () => {
    const loaderIcon = document.querySelector('div[class*="dropin-accordion"]') as HTMLElement;
    await expect(loaderIcon).toBeVisible();
    const leftHeader = document.querySelector('.dropin-accordion-section__title-container') as HTMLElement;
    await expect(leftHeader).toBeVisible();
    await expect(leftHeader).toContainHTML('<svg');
  }
}`,...(k=(O=y.parameters)==null?void 0:O.docs)==null?void 0:k.source}}};var P,q,V;f.parameters={...f.parameters,docs:{...(P=f.parameters)==null?void 0:P.docs,source:{originalSource:`{
  args: {
    actionIconPosition: 'right',
    iconOpen: Icons.Add,
    iconClose: Icons.Minus,
    iconLeft: Icons.Card,
    secondaryText: 'Optional Text'
  },
  render: ({
    actionIconPosition,
    iconOpen,
    iconClose,
    iconLeft,
    secondaryText
  }) => <div>
      <h2 style={{
      font: 'var(--type-body-1-strong-font)',
      color: 'var(--color-neutral-800)',
      letterSpacing: 'var(--type-body-1-strong-letter-spacing)'
    }}>
        This is the Accordion Component, this title will be longer in order to
        increase width of the story
      </h2>

      <Accordion actionIconPosition={actionIconPosition} iconOpen={iconOpen} iconClose={iconClose}>
        <AccordionSection title={'Title'} secondaryText={secondaryText} iconLeft={iconLeft}>
          <p>Short product details should be kept to 6 lines maximum.</p>
        </AccordionSection>
      </Accordion>
    </div>,
  play: async () => {
    const loaderIcon = document.querySelector('div[class*="dropin-accordion"]') as HTMLElement;
    await expect(loaderIcon).toBeVisible();
    const secondaryText = document.querySelector('.dropin-accordion-section__secondary-text') as HTMLElement;
    await expect(secondaryText).toBeVisible();
    await expect(secondaryText).toHaveTextContent('Optional Text');
  }
}`,...(V=(q=f.parameters)==null?void 0:q.docs)==null?void 0:V.source}}};var H,_,B;g.parameters={...g.parameters,docs:{...(H=g.parameters)==null?void 0:H.docs,source:{originalSource:`{
  args: {
    actionIconPosition: 'right',
    iconOpen: Icons.Add,
    iconClose: Icons.Minus,
    iconLeft: Icons.Card
  },
  render: ({
    actionIconPosition,
    iconOpen,
    iconClose,
    iconLeft
  }) => <div>
      <h2 style={{
      font: 'var(--type-body-1-strong-font)',
      color: 'var(--color-neutral-800)',
      letterSpacing: 'var(--type-body-1-strong-letter-spacing)'
    }}>
        This is the Accordion Component, this title will be longer in order to
        increase width of the story
      </h2>

      <Accordion actionIconPosition={actionIconPosition} iconOpen={iconOpen} iconClose={iconClose}>
        <AccordionSection title={'Title'} iconLeft={iconLeft} secondaryText={<Price amount={9.99} />}>
          <p>Short product details should be kept to 6 lines maximum.</p>
        </AccordionSection>
      </Accordion>
    </div>,
  play: async () => {
    const loaderIcon = document.querySelector('div[class*="dropin-accordion"]') as HTMLElement;
    await expect(loaderIcon).toBeVisible();
    const secondaryText = document.querySelector('.dropin-accordion-section__secondary-text') as HTMLElement;
    await expect(secondaryText).toBeVisible();
    await expect(secondaryText).toHaveTextContent('$9.99');
  }
}`,...(B=(_=g.parameters)==null?void 0:_.docs)==null?void 0:B.source}}};var E,M,W;S.parameters={...S.parameters,docs:{...(E=S.parameters)==null?void 0:E.docs,source:{originalSource:`{
  args: {
    actionIconPosition: 'left',
    iconOpen: Icons.ChevronDown,
    iconClose: Icons.ChevronUp
  },
  render: ({
    actionIconPosition,
    iconOpen,
    iconClose
  }) => <div>
      <h2 style={{
      font: 'var(--type-body-1-strong-font)',
      color: 'var(--color-neutral-800)',
      letterSpacing: 'var(--type-body-1-strong-letter-spacing)'
    }}>
        This is the Accordion Component, this title will be longer in order to
        increase width of the story
      </h2>

      <Accordion actionIconPosition={actionIconPosition} iconOpen={iconOpen} iconClose={iconClose}>
        <AccordionSection title={'Title'} secondaryText={<a rel="noreferrer" href="/cart">
              Edit
            </a>}>
          <CartItem key={'uuid'} title={<div>Short Name</div>} description={<div>
                Secondary product information such as brand name, description,
                etc.
              </div>} sku={<div>SKU: 59YK7</div>} quantity={1} image={<Image src="https://picsum.photos/132/184" width="132" height="184" alt="Some alternative text" loading="lazy" />} price={<Price amount={53.99} style={{
          fontWeight: 'inherit',
          color: 'inherit'
        }} />} total={<>
                <Price amount={59.98} variant="strikethrough" />
                <Price amount={55.95} sale />
              </>} />
        </AccordionSection>
      </Accordion>
    </div>,
  play: async () => {
    const accordionElement = document.querySelector('.dropin-accordion') as HTMLElement;
    const link = accordionElement.querySelector('.dropin-accordion a');
    await expect(accordionElement).toBeVisible();
    await expect(link).toHaveTextContent('Edit');
    await expect(link).toHaveAttribute('href', '/cart');
  }
}`,...(W=(M=S.parameters)==null?void 0:M.docs)==null?void 0:W.source}}};var D,U,K;v.parameters={...v.parameters,docs:{...(D=v.parameters)==null?void 0:D.docs,source:{originalSource:`{
  args: {
    actionIconPosition: 'right',
    iconOpen: Icons.ChevronDown,
    iconClose: Icons.ChevronUp,
    iconLeft: Icons.Card,
    showIconLeft: false
  },
  argTypes: {
    showIconLeft: {
      table: {
        disable: true
      }
    },
    iconLeft: {
      table: {
        disable: true
      }
    }
  },
  render: ({
    actionIconPosition,
    iconOpen,
    iconClose
  }) => <div>
      <h2 style={{
      font: 'var(--type-body-1-strong-font)',
      color: 'var(--color-neutral-800)',
      letterSpacing: 'var(--type-body-1-strong-letter-spacing)'
    }}>
        This is the Accordion Component, this title will be longer in order to
        increase width of the story
      </h2>

      <Accordion actionIconPosition={actionIconPosition} iconOpen={iconOpen} iconClose={iconClose}>
        <AccordionSection title={'Cart summary'} iconLeft={Icons.Cart} showIconLeft={true} renderContentWhenClosed={false}>
          <Card>
            <h2 style={{
            font: 'var(--type-headline-2-strong-font)'
          }}>
              Title
            </h2>
            <p style={{
            font: 'var(--type-body-2-default-font)'
          }}>
              This is a short description of the item and should be kept to two
              or three lines as maximum.
            </p>
          </Card>
        </AccordionSection>
        <AccordionSection title={'Card info'} iconLeft={Icons.Card} showIconLeft={true} secondaryText={'Optional Text'} renderContentWhenClosed={false}>
          <p>
            Short product details should be kept to 6 lines maximum.
            <br />
            Short product details should be kept to 6 lines maximum.
            <br />
            Short product details should be kept to 6 lines maximum.
            <br />
            Short product details should be kept to 6 lines maximum.
            <br />
            Short product details should be kept to 6 lines maximum.
            <br />
          </p>
        </AccordionSection>
        <AccordionSection title={'Wallet'} iconLeft={Icons.Wallet} showIconLeft={true}>
          <p>Short product details should be kept to 6 lines maximum.</p>
        </AccordionSection>
        <AccordionSection title={'Shipping'} iconLeft={Icons.Delivery} showIconLeft={true}>
          <p>Short product details should be kept to 6 lines maximum.</p>
        </AccordionSection>
        <AccordionSection title={'Notes'} iconLeft={Icons.Delivery} showIconLeft={false}>
          <p>Short product details should be kept to 6 lines maximum.</p>
        </AccordionSection>
      </Accordion>
    </div>,
  play: async () => {
    const loaderIcon = document.querySelector('div[class*="dropin-accordion"]') as HTMLElement;
    await expect(loaderIcon).toBeVisible();
    const section = document.querySelector('.dropin-accordion-section') as HTMLElement;
    await expect(section).toBeVisible();
    const divider = document.querySelector('.dropin-divider') as HTMLElement;
    await expect(divider).toBeVisible();
  }
}`,...(K=(U=v.parameters)==null?void 0:U.docs)==null?void 0:K.source}}};var j,N,R;b.parameters={...b.parameters,docs:{...(j=b.parameters)==null?void 0:j.docs,source:{originalSource:`{
  args: {
    actionIconPosition: 'right',
    iconOpen: Icons.Add,
    iconClose: Icons.Minus,
    iconLeft: Icons.Card,
    defaultOpen: true
  },
  render: ({
    actionIconPosition,
    iconOpen,
    iconClose,
    iconLeft,
    defaultOpen
  }) => <div>
      <h2 style={{
      font: 'var(--type-body-1-strong-font)',
      color: 'var(--color-neutral-800)',
      letterSpacing: 'var(--type-body-1-strong-letter-spacing)'
    }}>
        This is the Accordion Component, this title will be longer in order to
        increase width of the story
      </h2>

      <Accordion key={defaultOpen} actionIconPosition={actionIconPosition} iconOpen={iconOpen} iconClose={iconClose}>
        <AccordionSection title={'Title'} iconLeft={iconLeft} secondaryText={<Price amount={9.99} />} renderContentWhenClosed={false} defaultOpen={defaultOpen}>
          <p>Short product details should be kept to 6 lines maximum.</p>
        </AccordionSection>
      </Accordion>
    </div>,
  play: async () => {
    const loaderIcon = document.querySelector('div[class*="dropin-accordion"]') as HTMLElement;
    await expect(loaderIcon).toBeVisible();
    const secondaryText = document.querySelector('.dropin-accordion-section__secondary-text') as HTMLElement;
    await expect(secondaryText).toBeVisible();
    await expect(secondaryText).toHaveTextContent('$9.99');
  }
}`,...(R=(N=b.parameters)==null?void 0:N.docs)==null?void 0:R.source}}};const ie=["SingleSection","SingleSectionWithLeftIcon","SingleSectionWithOptionalText","SingleSectionWithPrice","SingleSectionWithLinkAndCartItem","MultipleSection","SingleSection_ToggleBehavior"];export{v as MultipleSection,p as SingleSection,y as SingleSectionWithLeftIcon,S as SingleSectionWithLinkAndCartItem,f as SingleSectionWithOptionalText,g as SingleSectionWithPrice,b as SingleSection_ToggleBehavior,ie as __namedExportsOrder,ne as default};
//# sourceMappingURL=Accordion.stories-BU1S4qTy.js.map
