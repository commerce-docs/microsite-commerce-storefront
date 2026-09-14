/*! Copyright 2026 Adobe
All Rights Reserved. */
import{a0 as l,a as e,B as n}from"./iframe-CKgIZA8l.js";import{P as p}from"./Portal-DjFhuEro.js";import"./preload-helper-C1FmrZbK.js";const y={title:"Components/Portal",component:p,parameters:{layout:"centered"},tags:["autodocs"]},a={render:()=>{const[t,r]=l(!1),[o,s]=l(0);return e("div",{style:{border:"2px dashed #ccc",padding:"20px"},children:[e(n,{onClick:()=>r(!t),children:t?"Close Portal":"Open Portal"}),t&&e(p,{children:e("div",{style:{position:"fixed",top:"50%",left:"50%",transform:"translate(-50%, -50%)",background:"white",padding:"20px",border:"1px solid #ccc",boxShadow:"0 2px 4px rgba(0,0,0,0.1)"},children:[e("p",{children:["Portal content with counter: ",o]}),e(n,{onClick:()=>s(m=>m+1),children:"Increment Counter"}),e(n,{variant:"tertiary",onClick:()=>r(!1),style:{marginLeft:"8px"},children:"Close"})]})})]})}},i={render:()=>{const[t,r]=l(!1),[o,s]=l(!1);return e("div",{style:{border:"2px dashed #ccc",padding:"20px"},children:[e(n,{onClick:()=>r(!t),children:t?"Close Outer Portal":"Open Outer Portal"}),t&&e(p,{children:e("div",{style:{position:"fixed",top:"50%",left:"50%",transform:"translate(-50%, -50%)",background:"white",padding:"20px",border:"1px solid #ccc",boxShadow:"0 2px 4px rgba(0,0,0,0.1)"},children:[e("p",{children:"Outer Portal Content"}),e(n,{onClick:()=>s(!o),children:o?"Close Inner Portal":"Open Inner Portal"}),o&&e(p,{children:e("div",{style:{position:"fixed",top:"60%",left:"50%",transform:"translate(-50%, -50%)",background:"white",padding:"20px",border:"1px solid #ccc",boxShadow:"0 2px 4px rgba(0,0,0,0.1)"},children:[e("p",{children:"Inner Portal Content"}),e(n,{variant:"tertiary",onClick:()=>s(!1),children:"Close Inner Portal"})]})}),e(n,{variant:"tertiary",onClick:()=>r(!1),style:{marginLeft:"8px"},children:"Close Outer Portal"})]})})]})}};var d,c,u,O,x;a.parameters={...a.parameters,docs:{...(d=a.parameters)==null?void 0:d.docs,source:{originalSource:`{
  render: () => {
    const [isOpen, setIsOpen] = useState(false);
    const [count, setCount] = useState(0);
    return <div style={{
      border: '2px dashed #ccc',
      padding: '20px'
    }}>
        <Button onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? 'Close Portal' : 'Open Portal'}
        </Button>
        
        {isOpen && <Portal>
            <div style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'white',
          padding: '20px',
          border: '1px solid #ccc',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
              <p>Portal content with counter: {count}</p>
              <Button onClick={() => setCount(c => c + 1)}>
                Increment Counter
              </Button>
              <Button variant="tertiary" onClick={() => setIsOpen(false)} style={{
            marginLeft: '8px'
          }}>
                Close
              </Button>
            </div>
          </Portal>}
      </div>;
  }
}`,...(u=(c=a.parameters)==null?void 0:c.docs)==null?void 0:u.source},description:{story:"```ts\nimport { Portal } from '@/elsie/components/Portal';\n\n<Portal>\n     <div>👋 Howdy, I'm Howdy!</div>\n</Portal>\n```",...(x=(O=a.parameters)==null?void 0:O.docs)==null?void 0:x.description}}};var f,C,h;i.parameters={...i.parameters,docs:{...(f=i.parameters)==null?void 0:f.docs,source:{originalSource:`{
  render: () => {
    const [isOuterOpen, setOuterOpen] = useState(false);
    const [isInnerOpen, setInnerOpen] = useState(false);
    return <div style={{
      border: '2px dashed #ccc',
      padding: '20px'
    }}>
        <Button onClick={() => setOuterOpen(!isOuterOpen)}>
          {isOuterOpen ? 'Close Outer Portal' : 'Open Outer Portal'}
        </Button>
        
        {isOuterOpen && <Portal>
            <div style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'white',
          padding: '20px',
          border: '1px solid #ccc',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
              <p>Outer Portal Content</p>
              <Button onClick={() => setInnerOpen(!isInnerOpen)}>
                {isInnerOpen ? 'Close Inner Portal' : 'Open Inner Portal'}
              </Button>
              
              {isInnerOpen && <Portal>
                  <div style={{
              position: 'fixed',
              top: '60%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              background: 'white',
              padding: '20px',
              border: '1px solid #ccc',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
                    <p>Inner Portal Content</p>
                    <Button variant="tertiary" onClick={() => setInnerOpen(false)}>
                      Close Inner Portal
                    </Button>
                  </div>
                </Portal>}
              
              <Button variant="tertiary" onClick={() => setOuterOpen(false)} style={{
            marginLeft: '8px'
          }}>
                Close Outer Portal
              </Button>
            </div>
          </Portal>}
      </div>;
  }
}`,...(h=(C=i.parameters)==null?void 0:C.docs)==null?void 0:h.source}}};const I=["DynamicContent","NestedPortals"];export{a as DynamicContent,i as NestedPortals,I as __namedExportsOrder,y as default};
//# sourceMappingURL=Portal.stories-CetyLHBW.js.map
