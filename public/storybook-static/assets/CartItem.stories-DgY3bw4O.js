/*! Copyright 2026 Adobe
All Rights Reserved. */
import{o as K,a as e,p as a,J as U,r as u,B as Y,K as $,k as d,q as X}from"./iframe-CKgIZA8l.js";import"./preload-helper-C1FmrZbK.js";const{expect:t,within:j,userEvent:p}=__STORYBOOK_MODULE_TEST__,Z={title:"Components/CartItem",component:K,parameters:{layout:"padded",docs:{description:{component:"Use CartItems to display a product item in Cart."}}},argTypes:{image:{control:{type:"select",labels:{Image:"Image"}},description:"Product image.",options:["Image","None"],mapping:{Image:e(X,{src:"https://picsum.photos/132/184",width:"132",height:"184",alt:"Some alternative text",loading:"lazy"}),None:void 0},table:{defaultValue:{summary:"null"}}},title:{control:{type:"select",labels:{Short:"Short Name",Long:"Long Name"}},description:"A title of the product.",options:["Short","Long","None"],mapping:{Short:e("div",{children:"Short Name"}),Long:e("div",{children:"Product with an extremely extremely long name"}),None:void 0},table:{defaultValue:{summary:"null"}}},description:{control:{type:"select",labels:{Description:"Description"}},description:"Description of the product.",options:["Description","None"],mapping:{Description:e("div",{children:"Secondary product information such as brand name, description, etc."}),None:void 0},table:{defaultValue:{summary:"null"}}},sku:{control:{type:"select",labels:{none:"none",Sku:"SKU: 59YK7"}},description:"A sku of the product.",options:["None","Sku"],mapping:{None:void 0,Sku:e("div",{children:"SKU: 59YK7"})},table:{defaultValue:{summary:"null"}}},attributes:{control:{type:"select",labels:{Attributes:"Attributes"}},description:"Product attributes.",options:["Attributes","none"],mapping:{Attributes:e("div",{children:[e("div",{children:"Activity: Gym, Hiking, Overnight, School, Trail, Travel, Urban"}),e("div",{children:"Material: Nylon, Polyester"})]}),none:void 0},table:{defaultValue:{summary:"null"}}},quantity:{control:{type:"select"},description:"The quantity of the product.",options:["1","3","10","100","None"],mapping:{1:1,10:10,100:100,None:void 0},table:{defaultValue:{summary:"1"}}},price:{control:{type:"select",labels:{Price:"Item Price"}},description:"The price of each item.",options:["Price","None"],mapping:{Price:e(a,{amount:53.99,weight:"normal"}),None:void 0},table:{defaultValue:{summary:"null"}}},total:{control:{type:"select",labels:{Total:"Total",Final:"Final Only"}},description:"The total price of the product.",options:["Total","Final","None"],mapping:{Total:e(d,{children:[e(a,{amount:59.98,variant:"strikethrough"}),e(a,{amount:55.95,sale:!0})]}),Final:e(a,{amount:55.95,sale:!0}),None:void 0},table:{defaultValue:{summary:"null"}}},totalExcludingTax:{control:{type:"select",labels:{totalExcludingTax:"totalExcludingTax"}},description:"The total price excluding tax of the product.",options:["totalExcludingTax","None"],mapping:{totalExcludingTax:e(d,{children:e(a,{amount:53.99,weight:"normal"})}),None:void 0},table:{defaultValue:{summary:"null"}}},taxIncluded:{control:{type:"boolean"},description:"Render tax included message.",table:{defaultValue:{summary:"false"}}},taxExcluded:{control:{type:"boolean"},description:"Render tax excluded message.",table:{defaultValue:{summary:"false"}}},configurations:{},discount:{control:{type:"select",labels:{none:"none",discount:"50% off"}},description:"A discount message.",options:["none","discount"],mapping:{none:null,discount:e("div",{children:"50% off"})},table:{defaultValue:{summary:"null"}}},savings:{control:{type:"select",labels:{none:"none",savings:"$25 Savings"}},description:"A savings message.",options:["none","savings"],mapping:{none:null,savings:e("div",{children:"$25 Savings"})},table:{defaultValue:{summary:"null"}}},warning:{control:{type:"select",labels:{none:"none",RunningOut:"Only 1 left in stock"}},description:"A warning message.",options:["none","RunningOut"],mapping:{none:null,RunningOut:e("span",{children:" Only 5 left!"})},table:{defaultValue:{summary:"null"}}},alert:{control:{type:"select",labels:{none:"none",RunningOut:"Out of stock"}},description:"Alert message.",options:["none","RunningOut"],mapping:{none:null,RunningOut:e("span",{children:[e(u,{source:$,size:"16","aria-hidden":!0})," ","Out of stock!"]})},table:{defaultValue:{summary:"null"}}},loading:{control:{type:"boolean"},description:"Loading state.",table:{defaultValue:{summary:"false"}}},updating:{control:{type:"boolean"},description:"Updating state.",table:{defaultValue:{summary:"false"}}},onQuantity:{description:"Quantity update handler.",table:{type:{summary:"function"}},action:"onQuantity"},onRemove:{description:"Add a remove handler.",table:{type:{summary:"function"}},action:"onRemove"},ariaLabel:{control:{type:"text"},description:"Name for the component.",table:{defaultValue:{summary:"null"}}},actions:{control:{type:"select",labels:{Button:"Button",None:"None"}},description:"Wishlist control.",options:["Button","None"],mapping:{Button:e(Y,{size:"medium",type:"submit",icon:e(u,{source:"Heart"}),variant:"tertiary",children:"Move to wishlist"}),None:void 0},table:{defaultValue:{summary:"null"}}},rowTotalFooter:{control:{type:"check",labels:["Super Offer Badge"]},description:"Content displayed right below the total row price.",options:["SuperOffer"],mapping:{SuperOffer:e("div",{style:{color:"var(--color-alert-800)",fontWeight:"bold"},children:"Super offer"})},table:{defaultValue:{summary:"null"}}},footer:{control:{type:"check",labels:["Promotions","Delivery Terms","Final Sales and Returns Policy"]},description:"Footer content displayed at the bottom of the cart item.",options:["Promotions","Delivery","Returns"],mapping:{Promotions:e("div",{children:"Extra 20% Off Clearance with Code: EXTRA20"}),Delivery:e("div",{children:[e("div",{children:"Free Shipping"}),e("div",{children:["Delivery Estimate",e("p",{children:"Order now for delivery Aug 26 - Aug 28 to ZIP code: 80201"})]})]}),Returns:e("div",{children:"Final-sale items, identified by a price ending in .99 or .97, cannot be canceled or returned."})},table:{defaultValue:{summary:"null"}}},quantityType:{control:{type:"select"},description:"Quantity input type.",options:["stepper","dropdown"],table:{defaultValue:{summary:"stepper"}}},dropdownOptions:{control:{type:"object"},description:"Quantity dropdown options.",table:{defaultValue:{summary:"null"}}}}},o={args:{ariaLabel:"Short Name",image:"Image",title:"Short",price:"Price",total:"Total",totalExcludingTax:"totalExcludingTax",sku:"Sku",attributes:"none",quantity:1,description:"Description",discount:"none",savings:"none",actions:"Button",warning:"none",alert:"none",loading:!1,updating:!1,configurations:{Color:"Blue",Size:"L",Multiple:"1, 2, 3"}},play:async()=>{const c=document.querySelector("#storybook-root"),n=j(c),I=document.querySelector(".dropin-cart-item__image");t(I).toBeVisible();const O=document.querySelector(".dropin-cart-item__title");t(O).toBeVisible();const R=document.querySelector(".dropin-cart-item__sku");t(R).toBeVisible();const D=document.querySelector(".dropin-cart-item__configurations");t(D).toBeVisible();const M=document.querySelector(".dropin-cart-item__price");t(M).toBeVisible();const z=document.querySelector(".dropin-cart-item__quantity");t(z).toBeVisible();const A=document.querySelector(".dropin-cart-item__total");t(A).toBeVisible();const Q=document.querySelector(".dropin-cart-item__buttons");t(Q).toBeVisible();const F=document.querySelector('button[aria-label="Increase Quantity"]'),H=document.querySelector('button[aria-label="Decrease Quantity"]');await new Promise(W=>setTimeout(W,500)),await p.click(F),await t(await n.findByDisplayValue("2")).toBeTruthy(),await p.click(H),await t(await n.findByDisplayValue("1")).toBeTruthy()}},i={args:{ariaLabel:"Short Name",image:"Image",title:"Short",price:"Price",total:"Total",sku:"Sku",attributes:"none",quantity:1,description:"Description",warning:"none",alert:"none",discount:"none",savings:"none",loading:!1,updating:!1,configurations:{Color:"Blue",Size:"L"},onQuantity:void 0,onRemove:void 0,taxExcluded:!1,totalExcludingTax:e(a,{amount:53.99,weight:"normal"})}},l={render:()=>e(U,{})},r={args:{ariaLabel:"Short Name",image:"Image",title:"Short",price:"Price",total:"Total",totalExcludingTax:"totalExcludingTax",sku:"Sku",quantity:1,description:"Description",discount:"none",savings:"none",warning:"none",alert:"none",loading:!1,updating:!1,configurations:{Color:"Blue",Size:"L",Multiple:"1, 2, 3"},dropdownOptions:[{value:"1",text:"1"},{value:"2",text:"2"},{value:"3",text:"3"}],quantityType:"dropdown"}},s={args:{ariaLabel:"Short Name",image:"Image",title:"Short",price:"Price",rowTotalFooter:"SuperOffer",total:"Final",sku:"Sku",quantity:1,warning:"none",alert:"none",discount:"none",savings:"none",loading:!1,updating:!1,configurations:{Color:"Blue",Size:"L"}},play:async({canvasElement:c})=>{const n=c.querySelector(".dropin-cart-item__row-total-footer");t(n).toBeTruthy(),t(n==null?void 0:n.textContent).toContain("Super offer")}};var m,y,g,v,f;o.parameters={...o.parameters,docs:{...(m=o.parameters)==null?void 0:m.docs,source:{originalSource:`{
  args: {
    ariaLabel: 'Short Name',
    image: 'Image' as any,
    title: 'Short' as any,
    price: 'Price' as any,
    total: 'Total' as any,
    totalExcludingTax: 'totalExcludingTax' as any,
    sku: 'Sku' as any,
    attributes: 'none' as any,
    quantity: 1,
    description: 'Description' as any,
    discount: 'none' as any,
    savings: 'none' as any,
    actions: 'Button' as any,
    warning: 'none' as any,
    alert: 'none' as any,
    loading: false,
    updating: false,
    configurations: {
      Color: 'Blue',
      Size: 'L',
      Multiple: '1, 2, 3'
    }
  },
  play: async () => {
    const canvasElement = document.querySelector('#storybook-root') as HTMLElement;
    const canvas = within(canvasElement);
    const itemImage = document.querySelector('.dropin-cart-item__image') as HTMLElement;
    expect(itemImage).toBeVisible();
    const itemTitle = document.querySelector('.dropin-cart-item__title') as HTMLElement;
    expect(itemTitle).toBeVisible();
    const itemSku = document.querySelector('.dropin-cart-item__sku') as HTMLElement;
    expect(itemSku).toBeVisible();
    const itemConfigurations = document.querySelector('.dropin-cart-item__configurations') as HTMLElement;
    expect(itemConfigurations).toBeVisible();
    const itemPrice = document.querySelector('.dropin-cart-item__price') as HTMLElement;
    expect(itemPrice).toBeVisible();
    const quantityStepper = document.querySelector('.dropin-cart-item__quantity') as HTMLElement;
    expect(quantityStepper).toBeVisible();
    const itemTotal = document.querySelector('.dropin-cart-item__total') as HTMLElement;
    expect(itemTotal).toBeVisible();
    const actions = document.querySelector('.dropin-cart-item__buttons') as HTMLElement;
    expect(actions).toBeVisible();
    const increaseButton = document.querySelector('button[aria-label="Increase Quantity"]') as HTMLElement;
    const decreaseButton = document.querySelector('button[aria-label="Decrease Quantity"]') as HTMLElement;

    // Without this wait test failing intermittently as click event is triggering before even element fully loaded
    await new Promise(resolve => setTimeout(resolve, 500));
    await userEvent.click(increaseButton);
    await expect(await canvas.findByDisplayValue('2')).toBeTruthy();
    await userEvent.click(decreaseButton);
    await expect(await canvas.findByDisplayValue('1')).toBeTruthy();
  }
}`,...(g=(y=o.parameters)==null?void 0:y.docs)==null?void 0:g.source},description:{story:`\`\`\`tsx
<CartItem
 ariaLabel="Short Name"
 image={<Image src="https://picsum.photos/132/184" width="132" height="184" alt="Some alternative text" loading="lazy" />}
 title={<div>Product Name</div>}
 description={<div>Secondary product information such as brand name, description, etc.</div>}
 footer={<div>Extra 20% Off Clearance with Code: EXTRA20</div>}
 sku={<div>SKU: 59YK7</div>}
 attributes={<div>Material: Nylon, Polyester</div>}
 quantity={1}
 price={<Price amount={53.99} weight="normal" />}
 total={<>
   <Price amount={59.98} variant="strikethrough" />
   <Price amount={55.95} sale />
 </>}
 warning={<span> Only 5 left!</span>}
 alert={<span><Icon source={WarningWithCircle} size={'16'} /> Out of stock!</span>}
 discount={<div>50% off</div>}
 savings={<div>$25 Savings</div>}
 actions={<div>Wishlist</div>}
 configurations={{ Color: 'Blue', Size: 'L' }}
 onRemove={() => console.log('onRemove')}
 onQuantity={(value) => console.log('onQuantity', value)}
/>
\`\`\``,...(f=(v=o.parameters)==null?void 0:v.docs)==null?void 0:f.description}}};var h,S,b,x,T;i.parameters={...i.parameters,docs:{...(h=i.parameters)==null?void 0:h.docs,source:{originalSource:`{
  args: {
    ariaLabel: 'Short Name',
    image: 'Image' as any,
    title: 'Short' as any,
    price: 'Price' as any,
    total: 'Total' as any,
    sku: 'Sku' as any,
    attributes: 'none' as any,
    quantity: 1,
    description: 'Description' as any,
    warning: 'none' as any,
    alert: 'none' as any,
    discount: 'none' as any,
    savings: 'none' as any,
    loading: false,
    updating: false,
    configurations: {
      Color: 'Blue',
      Size: 'L'
    },
    onQuantity: undefined,
    onRemove: undefined,
    taxExcluded: false,
    totalExcludingTax: <Price amount={53.99} weight="normal" />
  }
}`,...(b=(S=i.parameters)==null?void 0:S.docs)==null?void 0:b.source},description:{story:`\`\`\`tsx
<CartItem
 ariaLabel="Short Name"
 image={<Image src="https://picsum.photos/132/184" width="132" height="184" alt="Some alternative text" loading="lazy" />}
 title={<div>Product Name</div>}
 description={<div>Secondary product information such as brand name, description, etc.</div>}
 footer={<div>Extra 20% Off Clearance with Code: EXTRA20</div>}
 sku={<div>SKU: 59YK7</div>}
 attributes={<div>Material: Nylon, Polyester</div>}
 quantity={1}
 price={<Price amount={53.99} weight="normal" />}
 total={<>
   <Price amount={59.98} variant="strikethrough" />
   <Price amount={55.95} sale />
 </>}
 warning={<span> Only 5 left!</span>}
 alert={<span><Icon source={WarningWithCircle} size={'16'} /> Out of stock!</span>}
 discount={<div>50% off</div>}
 savings={<div>$25 Savings</div>}
 configurations={{ Color: 'Blue', Size: 'L' }}
/>
\`\`\``,...(T=(x=i.parameters)==null?void 0:x.docs)==null?void 0:T.description}}};var w,B,k;l.parameters={...l.parameters,docs:{...(w=l.parameters)==null?void 0:w.docs,source:{originalSource:`{
  render: () => <CartItemSkeleton />
}`,...(k=(B=l.parameters)==null?void 0:B.docs)==null?void 0:k.source}}};var E,q,P,V,_;r.parameters={...r.parameters,docs:{...(E=r.parameters)==null?void 0:E.docs,source:{originalSource:`{
  args: {
    ariaLabel: 'Short Name',
    image: 'Image' as any,
    title: 'Short' as any,
    price: 'Price' as any,
    total: 'Total' as any,
    totalExcludingTax: 'totalExcludingTax' as any,
    sku: 'Sku' as any,
    quantity: 1,
    description: 'Description' as any,
    discount: 'none' as any,
    savings: 'none' as any,
    warning: 'none' as any,
    alert: 'none' as any,
    loading: false,
    updating: false,
    configurations: {
      Color: 'Blue',
      Size: 'L',
      Multiple: '1, 2, 3'
    },
    dropdownOptions: [{
      value: '1',
      text: '1'
    }, {
      value: '2',
      text: '2'
    }, {
      value: '3',
      text: '3'
    }],
    quantityType: 'dropdown'
  }
}`,...(P=(q=r.parameters)==null?void 0:q.docs)==null?void 0:P.source},description:{story:`\`\`\`tsx
<CartItem
 ariaLabel="Short Name"
 image={<Image src="https://picsum.photos/132/184" width="132" height="184" alt="Some alternative text" loading="lazy" />}
 title={<div>Product Name</div>}
 description={<div>Secondary product information such as brand name, description, etc.</div>}
 sku={<div>SKU: 59YK7</div>}
 quantity={1}
 price={<Price amount={53.99} weight="normal" />}
 total={<>
   <Price amount={59.98} variant="strikethrough" />
   <Price amount={55.95} sale />
 </>}
 warning={<span> Only 5 left!</span>}
 alert={<span><Icon source={WarningWithCircle} size={'16'} /> Out of stock!</span>}
 discount={<div>50% off</div>}
 savings={<div>$25 Savings</div>}
 configurations={{ Color: 'Blue', Size: 'L', Multiple: '1, 2, 3' }}
 quantityType="dropdown"
 dropdownOptions={[
  { value: '1', text: '1' },
  { value: '2', text: '2' },
  { value: '3', text: '3' },
 ]}
 onRemove={() => console.log('onRemove')}
 onQuantity={(value) => console.log('onQuantity', value)}
/>
\`\`\``,...(_=(V=r.parameters)==null?void 0:V.docs)==null?void 0:_.description}}};var C,L,N;s.parameters={...s.parameters,docs:{...(C=s.parameters)==null?void 0:C.docs,source:{originalSource:`{
  args: {
    ariaLabel: 'Short Name',
    image: 'Image' as any,
    title: 'Short' as any,
    price: 'Price' as any,
    rowTotalFooter: 'SuperOffer' as any,
    total: 'Final' as any,
    sku: 'Sku' as any,
    quantity: 1,
    warning: 'none' as any,
    alert: 'none' as any,
    discount: 'none' as any,
    savings: 'none' as any,
    loading: false,
    updating: false,
    configurations: {
      Color: 'Blue',
      Size: 'L'
    }
  },
  play: async ({
    canvasElement
  }) => {
    // Verify row total footer is rendered below the total
    const rowTotalFooter = canvasElement.querySelector('.dropin-cart-item__row-total-footer') as HTMLElement;
    expect(rowTotalFooter).toBeTruthy();
    expect(rowTotalFooter?.textContent).toContain('Super offer');
  }
}`,...(N=(L=s.parameters)==null?void 0:L.docs)==null?void 0:N.source}}};const ee=["CartItem","ReadOnly","Skeleton","DropdownQuantity","WithPromotionalBadge"];export{o as CartItem,r as DropdownQuantity,i as ReadOnly,l as Skeleton,s as WithPromotionalBadge,ee as __namedExportsOrder,Z as default};
//# sourceMappingURL=CartItem.stories-DgY3bw4O.js.map
