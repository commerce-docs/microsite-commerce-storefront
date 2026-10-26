/*! Copyright 2026 Adobe
All Rights Reserved. */
import{V,a as i,o as z,p as d,q as M,L as j}from"./iframe-BXfH8Ezb.js";import{I as e}from"./Icon.stories.helpers-CaF-J1Nd.js";import"./preload-helper-C1FmrZbK.js";const{action:n}=__STORYBOOK_MODULE_ACTIONS__,G={title:"Components/InLineAlert",component:V,argTypes:{heading:{description:"Heading message",type:{name:"string",required:!0}},description:{description:"Alert description",type:{name:"string",required:!1}},type:{description:'Alert variant type (determines the border color).<br/>`"error"` | `"warning"` | `"success"`',defaultValue:{summary:"warning"},type:{name:"string",required:!1},options:["error","warning","success"],control:"radio"},variant:{description:'Changes the appearance of the notification. Disables the border and adds a background.<br/>`"primary"` | `"secondary"`',defaultValue:{summary:"primary"},type:{name:"string",required:!1},options:["primary","secondary"],control:"radio"},onDismiss:{description:"When set, the component renders a dismiss button and calls this function when clicked",type:{name:"function",required:!1},control:{disable:!0},action:"Dismiss clicked"},additionalActions:{description:"An array of additional action objects that must contain `label` and `onClick()` properties, and may optionally include an `'aria-label'` to give the rendered button a unique accessible name (falls back to `label` when omitted)"},icon:{description:"Icon `(FunctionComponent)`",type:{name:"symbol"},options:Object.keys(e),mapping:e,control:"select"},actionButtonPosition:{description:'Position of the action button.<br/>`"top"` | `"bottom"`',defaultValue:{summary:"bottom"},type:{name:"string",required:!1},options:["top","bottom"],control:"radio"},itemList:{description:"List of items to display in the alert",type:{name:"other",value:"VNode"},control:{disable:!0}}},parameters:{docs:{description:{component:"Use Inline Alerts to display messages or warnings to the user."}}}},t={args:{heading:"In Line Alert heading",description:"Description of the In Line Alert",type:"warning",icon:e.WarningFilled,additionalActions:[{label:"Action",onClick:n("Action clicked")}]}},o={args:{heading:"In Line Alert heading",type:"success",icon:e.CheckWithCircle,additionalActions:[{label:"Action",onClick:n("Action clicked")}]}},a={args:{heading:"In Line Alert heading",description:"Description of the In Line Alert",type:"error",icon:e.WarningFilled,additionalActions:[{label:"Action",onClick:n("Action clicked")}]}},r={args:{heading:"In Line Alert heading",description:"Description of the In Line Alert",type:"warning",icon:e.WarningFilled,additionalActions:[{label:"Action 1",onClick:n("Action 1 clicked")},{label:"Action 2",onClick:n("Action 2 clicked")}]}},c={args:{heading:"In Line Alert heading",description:"Description of the In Line Alert",type:"warning",additionalActions:[{label:"Action 1",onClick:n("Action 1 clicked")}],onDismiss:void 0}},s={args:{heading:'"Product A" was removed',description:"Changed your mind? You can undo this action.",type:"success",variant:"primary",actionButtonPosition:"bottom",additionalActions:[{label:"Undo",onClick:n("Undo clicked"),"aria-label":"Undo removal of Product A"},{label:"Dismiss",onClick:n("Dismiss clicked"),"aria-label":"Dismiss removal of Product A"}]}},l={args:{heading:"In Line Alert heading",description:"This is a short description of the In Line Alert",actionButtonPosition:"bottom",icon:e.OrderError,type:"warning",additionalActions:[{label:"Action 1",onClick:n("Action 1 clicked")}],onDismiss:void 0,itemList:i(j,{children:i(z,{name:"Product Name",quantity:1,sku:i("span",{children:"SKU: 59YK7"}),title:i("span",{children:"title"}),price:i(d,{amount:53.99,weight:"normal"}),image:i(M,{src:"https://picsum.photos/132/184",width:"132",height:"184",alt:"Some alternative text",loading:"lazy"}),total:i(d,{amount:53.99,weight:"normal"})})})}};var p,m,g,h,u;t.parameters={...t.parameters,docs:{...(p=t.parameters)==null?void 0:p.docs,source:{originalSource:`{
  args: {
    heading: 'In Line Alert heading',
    description: 'Description of the In Line Alert',
    type: 'warning',
    //@ts-ignore
    icon: IconsList.WarningFilled,
    additionalActions: [{
      label: 'Action',
      onClick: action('Action clicked')
    }]
  }
}`,...(g=(m=t.parameters)==null?void 0:m.docs)==null?void 0:g.source},description:{story:`\`\`\`ts
import { InLineAlert } from '@adobe-commerce/elsie/components/InLineAlert';
\`\`\`
\`\`\`tsx
<InLineAlert
 heading="In Line Alert heading"
 description="Description of the In Line Alert"
 type="warning"
 additionalActions={[
  {
   label: 'Action 1',
   onClick: ()=>{},
  },
 ]}
/>
\`\`\``,...(u=(h=t.parameters)==null?void 0:h.docs)==null?void 0:u.description}}};var A,b,L,I,y;o.parameters={...o.parameters,docs:{...(A=o.parameters)==null?void 0:A.docs,source:{originalSource:`{
  args: {
    heading: 'In Line Alert heading',
    type: 'success',
    //@ts-ignore
    icon: IconsList.CheckWithCircle,
    additionalActions: [{
      label: 'Action',
      onClick: action('Action clicked')
    }]
  }
}`,...(L=(b=o.parameters)==null?void 0:b.docs)==null?void 0:L.source},description:{story:`You can create the small variant by skipping the description prop.

\`\`\`tsx
<InLineAlert
 heading="In Line Alert heading"
 type="success"
 additionalActions={[
  {
    label: 'Action',
    onClick: ()=>{},
  },
 ]}
/>
\`\`\``,...(y=(I=o.parameters)==null?void 0:I.docs)==null?void 0:y.description}}};var k,C,f,D,v;a.parameters={...a.parameters,docs:{...(k=a.parameters)==null?void 0:k.docs,source:{originalSource:`{
  args: {
    heading: 'In Line Alert heading',
    description: 'Description of the In Line Alert',
    type: 'error',
    //@ts-ignore
    icon: IconsList.WarningFilled,
    additionalActions: [{
      label: 'Action',
      onClick: action('Action clicked')
    }]
  }
}`,...(f=(C=a.parameters)==null?void 0:C.docs)==null?void 0:f.source},description:{story:`You can create the medium variant by including the description prop.

\`\`\`tsx
<InLineAlert
 heading="In Line Alert heading"
 description="Description of the In Line Alert"
 type="error"
 additionalActions={[
  {
    label: 'Action',
    onClick: ()=>{},
  },
 ]}
/>
\`\`\``,...(v=(D=a.parameters)==null?void 0:D.docs)==null?void 0:v.description}}};var w,P,U,S,q;r.parameters={...r.parameters,docs:{...(w=r.parameters)==null?void 0:w.docs,source:{originalSource:`{
  args: {
    heading: 'In Line Alert heading',
    description: 'Description of the In Line Alert',
    type: 'warning',
    //@ts-ignore
    icon: IconsList.WarningFilled,
    additionalActions: [{
      label: 'Action 1',
      onClick: action('Action 1 clicked')
    }, {
      label: 'Action 2',
      onClick: action('Action 2 clicked')
    }]
  }
}`,...(U=(P=r.parameters)==null?void 0:P.docs)==null?void 0:U.source},description:{story:`You can create the large variant by including more than one additional actions.

\`\`\`tsx
<InLineAlert
 heading="In Line Alert heading"
 description="Description of the In Line Alert"
 type="warning"
 additionalActions={[
  {
    label: 'Action 1',
    onClick: ()=>{},
  },
  {
    label: 'Action 2',
    onClick: ()=>{},
  },
 ]}
/>
\`\`\``,...(q=(S=r.parameters)==null?void 0:S.docs)==null?void 0:q.description}}};var W,x,O;c.parameters={...c.parameters,docs:{...(W=c.parameters)==null?void 0:W.docs,source:{originalSource:`{
  args: {
    heading: 'In Line Alert heading',
    description: 'Description of the In Line Alert',
    type: 'warning',
    additionalActions: [{
      label: 'Action 1',
      onClick: action('Action 1 clicked')
    }],
    onDismiss: undefined
  }
}`,...(O=(x=c.parameters)==null?void 0:x.docs)==null?void 0:O.source}}};var Y,N,_,B,F;s.parameters={...s.parameters,docs:{...(Y=s.parameters)==null?void 0:Y.docs,source:{originalSource:`{
  args: {
    heading: '"Product A" was removed',
    description: 'Changed your mind? You can undo this action.',
    type: 'success',
    variant: 'primary',
    actionButtonPosition: 'bottom',
    additionalActions: [{
      label: 'Undo',
      onClick: action('Undo clicked'),
      'aria-label': 'Undo removal of Product A'
    }, {
      label: 'Dismiss',
      onClick: action('Dismiss clicked'),
      'aria-label': 'Dismiss removal of Product A'
    }]
  }
}`,...(_=(N=s.parameters)==null?void 0:N.docs)==null?void 0:_.source},description:{story:`You can create the large variant by including a list of items.

\`\`\`tsx
<InLineAlert
 heading="In Line Alert heading"
 description="This is a short description of the In Line Alert"
 icon: IconsList.OrderError,
 type: 'warning',
 onDismiss: undefined,
 additionalActions={[
  {
    label: 'Action 1',
    onClick: ()=>{},
  },
  {
    label: '',
    onClick: ()=>{},
  },
 ]},
    itemList: (
     <CartList>
       <CartItem
         name="Product Name"
         quantity={1}
         sku={<span>{'SKU: 59YK7'}</span>}
         title={<span>{'title'}</span>}
         price={<Price amount={53.99} weight="normal" />}
         image={
           <Image
             src="https://picsum.photos/132/184"
             width="132"
             height="184"
             alt="Some alternative text"
             loading="lazy"
           />
         }
         total={<Price amount={53.99} weight="normal" />}
       />
     </CartList>
  ),

/>
\`\`\`
When multiple alerts on the same page share visually identical action
labels (e.g. "Undo" / "Dismiss" on several removed-item banners), pass a
per-action \`'aria-label'\` so assistive technology announces a unique,
descriptive name for each button while the visible label stays short.

\`\`\`tsx
<InLineAlert
 heading='"Product A" was removed'
 actionButtonPosition="bottom"
 additionalActions={[
  {
    label: 'Undo',
    onClick: ()=>{},
    'aria-label': 'Undo removal of Product A',
  },
  {
    label: 'Dismiss',
    onClick: ()=>{},
    'aria-label': 'Dismiss removal of Product A',
  },
 ]}
/>
\`\`\``,...(F=(B=s.parameters)==null?void 0:B.docs)==null?void 0:F.description}}};var K,T,E;l.parameters={...l.parameters,docs:{...(K=l.parameters)==null?void 0:K.docs,source:{originalSource:`{
  args: {
    heading: 'In Line Alert heading',
    description: 'This is a short description of the In Line Alert',
    actionButtonPosition: 'bottom',
    //@ts-ignore
    icon: IconsList.OrderError,
    type: 'warning',
    additionalActions: [{
      label: 'Action 1',
      onClick: action('Action 1 clicked')
    }],
    onDismiss: undefined,
    itemList: <CartList>
        <CartItem name="Product Name" quantity={1} sku={<span>{'SKU: 59YK7'}</span>} title={<span>{'title'}</span>} price={<Price amount={53.99} weight="normal" />} image={<Image src="https://picsum.photos/132/184" width="132" height="184" alt="Some alternative text" loading="lazy" />} total={<Price amount={53.99} weight="normal" />} />
      </CartList>
  }
}`,...(E=(T=l.parameters)==null?void 0:T.docs)==null?void 0:E.source}}};const J=["InLineAlert","InLineAlertSmall","InLineAlertMedium","InLineAlertLarge","NoDismiss","UndoDismissWithUniqueAccessibleNames","WithItemList"];export{t as InLineAlert,r as InLineAlertLarge,a as InLineAlertMedium,o as InLineAlertSmall,c as NoDismiss,s as UndoDismissWithUniqueAccessibleNames,l as WithItemList,J as __namedExportsOrder,G as default};
//# sourceMappingURL=InLineAlert.stories-DkQwK8hm.js.map
