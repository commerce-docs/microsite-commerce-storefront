/*! Copyright 2026 Adobe
All Rights Reserved. */
import{aa as D,a as e,A as n,a0 as x,s as B,k as p,a3 as Pe,P as Re}from"./iframe-CKgIZA8l.js";import"./preload-helper-C1FmrZbK.js";const Ie={title:"Components/Table",component:D,parameters:{layout:"padded",docs:{description:{component:"Use the `Table` component to render data in a structured table.\n\n## Column Structure\nEach column in the `columns` array defines a table column with:\n- **`key`**: Unique identifier that matches the property names in `rowData` objects\n- **`label`**: Display text shown in the column header\n- **`sortBy`**: Optional sorting state (`true` for sortable but neutral, `'asc'` for ascending, `'desc'` for descending)\n\n## Row Data Structure\nEach object in the `rowData` array represents a table row where:\n- **Keys** must match the `key` values from the `columns` array\n- **Values** can be:\n  - **Strings**: Plain text content\n  - **Numbers**: Numeric values (automatically converted to strings for display)\n  - **VNode**: Preact `VNode` for complex content (buttons, icons, formatted text, etc.)\n\n## Mobile Layout & Container Queries\nThe table uses **container queries** instead of media queries for responsive behavior:\n- **`mobileLayout`**: Optional prop that controls mobile behavior\n  - `'none'` (default): No special mobile layout\n  - `'stacked'`: Stacks cells vertically when container width ≤ 600px\n- **Container Query Breakpoint**: 600px - triggers when the table's container becomes narrow\n- **`data-label`**: Automatically added to cells for accessibility in stacked layout\n- **Responsive Behavior**: Table adapts to its container width, not viewport width\n\n## All props\nThe table below shows all the props for the `Table` component."}}},argTypes:{columns:{description:"Array of column definitions for the table. Each column defines the structure and behavior of a table column.",table:{type:{summary:"Column[]"}},control:"object"},rowData:{description:"Array of data objects to display in table rows. Each object represents a table row where keys match column keys and values contain the cell content.",table:{type:{summary:"RowData[]"}},control:"object"},mobileLayout:{description:'Controls responsive layout behavior using container queries. When set to "stacked", cells stack vertically when the table container width ≤ 600px. The `data-label` attribute is automatically added to cells for accessibility.',table:{type:{summary:"none | stacked"}},control:"select",options:["none","stacked"],mapping:{none:"none",stacked:"stacked"}},caption:{description:"Optional table caption that provides context and description. Displays above the table and is announced by screen readers.",table:{type:{summary:"string"}},control:"text"},onSortChange:{description:"Callback function triggered when column sorting changes.",table:{type:{summary:"(columnKey: string, direction: Sortable) => void"}},action:"onSortChange"},expandedRows:{description:"Set of row indices that are currently expanded. Used to control which rows are shown in expanded state. Row details will only render for rows that have `_rowDetails` content and are included in this set.",table:{type:{summary:"Set<number>"}},control:"object"},loading:{description:"When true, renders skeleton rows instead of actual data. Useful for showing loading state while data is being fetched.",table:{type:{summary:"boolean"}},control:"boolean"},skeletonRowCount:{description:"Number of skeleton rows to render when loading is true. Defaults to 10 rows.",table:{type:{summary:"number"}},control:"number"}}},je=s=>{const[t,l]=x(s.columns);return e(D,{...s,columns:t,onSortChange:(c,i)=>{var r;(r=s.onSortChange)==null||r.call(s,c,i),l(o=>o.map(d=>d.key===c?{...d,sortBy:i}:d.sortBy==="asc"||d.sortBy==="desc"?{...d,sortBy:!0}:d))}})},u={args:{columns:[{key:"name",label:"Name"},{key:"email",label:"Email"},{key:"age",label:"Age"},{key:"actions",label:"Actions"}],rowData:[{name:"John",email:"john@example.com",age:20,actions:e(n,{children:"Edit"})},{name:"Jane",email:"jane@example.com",age:21,actions:e(n,{children:"Edit"})},{name:"Jim",email:"jim@example.com",age:22,actions:e(n,{children:"Edit"})},{name:"Jill",email:"jill@example.com",age:23,actions:e(n,{children:"Edit"})}]}},h={render:je,args:{columns:[{key:"name",label:"Name",sortBy:!0},{key:"email",label:"Email",sortBy:!0},{key:"age",label:"Age",sortBy:!0},{key:"actions",label:"Actions"}],rowData:[{name:"John",email:"john@example.com",age:20,actions:e(n,{children:"Edit"})},{name:"Jane",email:"jane@example.com",age:21,actions:e(n,{children:"Edit"})},{name:"Jim",email:"jim@example.com",age:22,actions:e(n,{children:"Edit"})},{name:"Jill",email:"jill@example.com",age:23,actions:e(n,{children:"Edit"})},{name:"Jack",email:"jack@example.com",age:24,actions:e(n,{children:"Edit"})}]}},g={args:{columns:[{key:"id",label:"ID"},{key:"name",label:"Full Name"},{key:"email",label:"Email Address"},{key:"phone",label:"Phone Number"},{key:"department",label:"Department"},{key:"position",label:"Position"},{key:"salary",label:"Salary"},{key:"startDate",label:"Start Date"},{key:"status",label:"Status"},{key:"actions",label:"Actions"}],rowData:[{id:1,name:"John Doe",email:"john.doe@company.com",phone:"+1-555-0123",department:"Engineering",position:"Senior Developer",salary:"$95,000",startDate:"2022-01-15",status:"Active",actions:e(n,{children:"Edit"})},{id:2,name:"Jane Smith",email:"jane.smith@company.com",phone:"+1-555-0124",department:"Marketing",position:"Marketing Manager",salary:"$78,000",startDate:"2021-06-20",status:"Active",actions:e(n,{children:"Edit"})},{id:3,name:"Bob Johnson",email:"bob.johnson@company.com",phone:"+1-555-0125",department:"Sales",position:"Sales Director",salary:"$110,000",startDate:"2020-03-10",status:"Active",actions:e(n,{children:"Edit"})},{id:4,name:"Alice Brown",email:"alice.brown@company.com",phone:"+1-555-0126",department:"HR",position:"HR Specialist",salary:"$65,000",startDate:"2023-02-28",status:"Pending",actions:e(n,{children:"Edit"})},{id:5,name:"Charlie Wilson",email:"charlie.wilson@company.com",phone:"+1-555-0127",department:"Finance",position:"Financial Analyst",salary:"$72,000",startDate:"2022-09-12",status:"Active",actions:e(n,{children:"Edit"})}]}},b={args:{columns:[{key:"user",label:"User Info"},{key:"description",label:"Description"},{key:"status",label:"Status"},{key:"actions",label:"Actions"}],rowData:[{user:e("div",{children:[e("strong",{children:"John Doe"}),e("br",{}),"john.doe@company.com",e("br",{}),e("em",{children:"Senior Developer"})]}),description:e("div",{children:["Lead developer for the",e("br",{}),"e-commerce platform",e("br",{}),e("small",{children:"with 5+ years experience"})]}),status:e("span",{children:"Active"}),actions:e(B,{children:[e(n,{value:"edit",children:"Edit"}),e(n,{value:"delete",children:"Delete"}),e(n,{value:"view",children:"View"})]})},{user:e("div",{children:[e("strong",{children:"Jane Smith"}),e("br",{}),"jane.smith@company.com",e("br",{}),e("em",{children:"Product Manager"})]}),description:e("div",{children:["Manages product roadmap",e("br",{}),"and feature planning",e("br",{}),e("small",{children:"3+ years in product"})]}),status:e("span",{children:"Pending"}),actions:e(B,{children:[e(n,{value:"edit",children:"Edit"}),e(n,{value:"approve",children:"Approve"}),e(n,{value:"reject",children:"Reject"})]})},{user:e("div",{children:[e("strong",{children:"Bob Johnson"}),e("br",{}),"bob.johnson@company.com",e("br",{}),e("em",{children:"UX Designer"})]}),description:e("div",{children:["Designs user interfaces",e("br",{}),"and user experiences",e("br",{}),e("small",{children:"Expert in Figma & Sketch"})]}),status:e("span",{children:"Inactive"}),actions:e(B,{children:[e(n,{value:"edit",children:"Edit"}),e(n,{value:"activate",children:"Activate"}),e(n,{value:"archive",children:"Archive"})]})}]}},y={args:{mobileLayout:"stacked",columns:[{key:"name",label:"Name"},{key:"email",label:"Email"},{key:"age",label:"Age"},{key:"status",label:"Status"},{key:"actions",label:"Actions"}],rowData:[{name:"John Doe",email:"john.doe@example.com",age:28,status:"Active",actions:e(n,{children:"Edit"})},{name:"Jane Smith",email:"jane.smith@example.com",age:32,status:"Inactive",actions:e(n,{children:"Edit"})},{name:"Bob Johnson",email:"bob.johnson@example.com",age:45,status:"Active",actions:e(n,{children:"Edit"})},{name:"Alice Brown",email:"alice.brown@example.com",age:29,status:"Pending",actions:e(n,{children:"Edit"})}]}},w={render:s=>{const[t,l]=x(new Set),a=i=>{l(r=>{const o=new Set(r);return o.has(i)?o.delete(i):o.add(i),o})},c=[{name:"John Doe",email:"john.doe@company.com",status:"Active",actions:e(n,{onClick:()=>a(0),children:t.has(0)?"Hide":"Show"}),_rowDetails:e(p,{children:[e("h3",{children:"Employee Details"}),e("p",{children:[e("strong",{children:"Department:"})," Engineering"]}),e("p",{children:[e("strong",{children:"Position:"})," Senior Developer"]}),e("p",{children:[e("strong",{children:"Start Date:"})," January 15, 2022"]}),e("p",{children:[e("strong",{children:"Notes:"})," Excellent performance, leads the frontend team."]}),e("div",{style:{marginTop:"12px"},children:[e(n,{style:{marginRight:"8px"},children:"Update Details"}),e(n,{children:"View Full Profile"})]})]})},{name:"Jane Smith",email:"jane.smith@company.com",status:"Pending",actions:e(n,{onClick:()=>a(1),children:t.has(1)?"Hide":"Show"}),_rowDetails:e(p,{children:[e("h3",{children:"Pending Approval"}),e("p",{children:[e("strong",{children:"Department:"})," Marketing"]}),e("p",{children:[e("strong",{children:"Position:"})," Marketing Manager"]}),e("p",{children:[e("strong",{children:"Application Date:"})," December 1, 2024"]}),e("p",{children:[e("strong",{children:"Status:"})," Awaiting HR approval"]}),e("div",{style:{marginTop:"12px"},children:[e(n,{style:{marginRight:"8px",backgroundColor:"#22c55e",color:"white",border:"none",padding:"6px 12px",borderRadius:"4px"},children:"Approve"}),e(n,{style:{backgroundColor:"#ef4444",color:"white",border:"none",padding:"6px 12px",borderRadius:"4px"},children:"Reject"})]})]})},{name:"Bob Johnson",email:"bob.johnson@company.com",status:"Inactive",actions:e(n,{onClick:()=>a(2),children:t.has(2)?"Hide":"Show"}),_rowDetails:e(p,{children:[e("h3",{children:"Account Information"}),e("p",{children:[e("strong",{children:"Department:"})," Sales"]}),e("p",{children:[e("strong",{children:"Position:"})," Sales Director"]}),e("p",{children:[e("strong",{children:"Last Active:"})," November 20, 2024"]}),e("p",{children:[e("strong",{children:"Reason:"})," On extended leave"]}),e("div",{style:{marginTop:"12px"},children:[e(n,{style:{marginRight:"8px"},children:"Reactivate Account"}),e(n,{children:"Contact Employee"})]})]})}];return e(D,{...s,columns:[{key:"name",label:"Name"},{key:"email",label:"Email"},{key:"status",label:"Status"},{key:"actions",label:"Actions"}],rowData:c,expandedRows:t})}},v={args:{loading:!0,skeletonRowCount:5,columns:[{key:"name",label:"Name"},{key:"email",label:"Email"},{key:"status",label:"Status"},{key:"actions",label:"Actions"}],rowData:[]}},k={args:{columns:[{key:"name",label:e("span",{children:e("strong",{children:"👤 User Name"})}),ariaLabel:"User Name"},{key:"email",label:e("span",{style:{color:"#0066cc"},children:"📧 Email Address"}),ariaLabel:"Email Address"},{key:"role",label:e("em",{style:{color:"#666"},children:"Role & Department"}),ariaLabel:"Role & Department"},{key:"status",label:e("span",{style:{padding:"4px 8px",backgroundColor:"#f0f9ff",borderRadius:"4px",fontSize:"12px"},children:"📊 Status"}),ariaLabel:"Status"},{key:"actions",label:e("span",{children:"⚙️ Actions"}),ariaLabel:"Actions"}],rowData:[{name:"John Doe",email:"john.doe@company.com",role:"Senior Developer",status:"Active",actions:e(n,{children:"Edit"})},{name:"Jane Smith",email:"jane.smith@company.com",role:"Product Manager",status:"Active",actions:e(n,{children:"Edit"})},{name:"Bob Johnson",email:"bob.johnson@company.com",role:"UX Designer",status:"Inactive",actions:e(n,{children:"Edit"})}]}},A={render:s=>{const[t,l]=x(1),[a,c]=x(5),i=[{value:"5",text:"5"},{value:"10",text:"10"},{value:"15",text:"15"}],r=Array.from({length:287},(f,m)=>({id:m+1,name:`User ${m+1}`,email:`user${m+1}@example.com`,department:["Engineering","Marketing","Sales","HR","Finance"][m%5],status:["Active","Inactive","Pending"][m%3],actions:e(n,{children:"Edit"})})),o=Math.ceil(r.length/a),d=(t-1)*a+1,xe=Math.min(t*a,r.length),De=r.length,Be=r.slice((t-1)*a,t*a),fe=f=>{const m=f.target,Ee=Number(m.value);c(Ee),l(1)};return e("div",{children:[e(D,{...s,columns:[{key:"id",label:"ID"},{key:"name",label:"Name"},{key:"email",label:"Email"},{key:"department",label:"Department"},{key:"status",label:"Status"},{key:"actions",label:"Actions"}],rowData:Be}),e("div",{style:{marginTop:"var(--spacing-small)",display:"flex",justifyContent:"space-between",alignItems:"center"},children:[e("span",{style:{font:"var(--type-body-1-default-font)",letterSpacing:"var(--type-body-1-default-letter-spacing)",color:"var(--color-neutral-800)"},children:["Items ",d," to ",xe," of ",De," total"]}),e(Pe,{currentPage:t,totalPages:o,onChange:l}),e("div",{style:{display:"flex",alignItems:"center",gap:"var(--spacing-xsmall)",font:"var(--type-body-1-default-font)",letterSpacing:"var(--type-body-1-default-letter-spacing)",color:"var(--color-neutral-800)"},children:[e("span",{children:"Show"}),e(Re,{variant:"primary",size:"medium",value:String(a),options:i,handleSelect:fe,"aria-label":"Items per page"})]})]})]})}},S={render:s=>{const[t,l]=x(new Set),a=i=>{l(r=>{const o=new Set(r);return o.has(i)?o.delete(i):o.add(i),o})},c=[{name:"John Doe",email:"john.doe@company.com",status:"Active",actions:e(n,{onClick:()=>a(0),children:t.has(0)?"Hide":"Show"}),_rowDetails:e(p,{children:[e("h3",{children:"Employee Details"}),e("p",{children:[e("strong",{children:"Department:"})," Engineering"]}),e("p",{children:[e("strong",{children:"Position:"})," Senior Developer"]}),e("p",{children:[e("strong",{children:"Start Date:"})," January 15, 2022"]}),e("p",{children:[e("strong",{children:"Notes:"})," Excellent performance, leads the frontend team."]})]})},{name:"Jane Smith",email:"jane.smith@company.com",status:"Pending",actions:e(n,{onClick:()=>a(1),children:t.has(1)?"Hide":"Show"}),_rowDetails:e(p,{children:[e("h3",{children:"Pending Approval"}),e("p",{children:[e("strong",{children:"Department:"})," Marketing"]}),e("p",{children:[e("strong",{children:"Position:"})," Marketing Manager"]}),e("p",{children:[e("strong",{children:"Application Date:"})," December 1, 2024"]}),e("p",{children:[e("strong",{children:"Status:"})," Awaiting HR approval"]})]})},{name:"Bob Johnson",email:"bob.johnson@company.com",status:"Inactive",actions:e(n,{onClick:()=>a(2),children:t.has(2)?"Hide":"Show"}),_rowDetails:e(p,{children:[e("h3",{children:"Account Information"}),e("p",{children:[e("strong",{children:"Department:"})," Sales"]}),e("p",{children:[e("strong",{children:"Position:"})," Sales Director"]}),e("p",{children:[e("strong",{children:"Last Active:"})," November 20, 2024"]}),e("p",{children:[e("strong",{children:"Reason:"})," On extended leave"]})]})}];return e(D,{...s,mobileLayout:"stacked",columns:[{key:"name",label:"Name",ariaLabel:"Name"},{key:"email",label:"Email",ariaLabel:"Email"},{key:"status",label:"Status",ariaLabel:"Status"},{key:"actions",label:"Actions",ariaLabel:"Actions"}],rowData:c,expandedRows:t})}};var E,P,R,j,C;u.parameters={...u.parameters,docs:{...(E=u.parameters)==null?void 0:E.docs,source:{originalSource:`{
  args: {
    columns: [{
      key: 'name',
      label: 'Name'
    }, {
      key: 'email',
      label: 'Email'
    }, {
      key: 'age',
      label: 'Age'
    }, {
      key: 'actions',
      label: 'Actions'
    }],
    rowData: [{
      name: 'John',
      email: 'john@example.com',
      age: 20,
      actions: <ActionButton>Edit</ActionButton>
    }, {
      name: 'Jane',
      email: 'jane@example.com',
      age: 21,
      actions: <ActionButton>Edit</ActionButton>
    }, {
      name: 'Jim',
      email: 'jim@example.com',
      age: 22,
      actions: <ActionButton>Edit</ActionButton>
    }, {
      name: 'Jill',
      email: 'jill@example.com',
      age: 23,
      actions: <ActionButton>Edit</ActionButton>
    }]
  }
}`,...(R=(P=u.parameters)==null?void 0:P.docs)==null?void 0:R.source},description:{story:`Simple table.
Demonstrates basic table structure with string and number content types.


\`\`\`tsx
<Table
  columns={[
    { key: 'name', label: 'Name' },  
    { key: 'email', label: 'Email' },
    { key: 'age', label: 'Age' }     
  ]}
  rowData={[
    { name: 'John', email: 'john@example.com', age: 20 },
    { name: 'Jane', email: 'jane@example.com', age: 21 }
  ]}
/>
\`\`\``,...(C=(j=u.parameters)==null?void 0:j.docs)==null?void 0:C.description}}};var J,I,N,T,L;h.parameters={...h.parameters,docs:{...(J=h.parameters)==null?void 0:J.docs,source:{originalSource:`{
  render: TableWithState,
  args: {
    columns: [{
      key: 'name',
      label: 'Name',
      sortBy: true
    }, {
      key: 'email',
      label: 'Email',
      sortBy: true
    }, {
      key: 'age',
      label: 'Age',
      sortBy: true
    }, {
      key: 'actions',
      label: 'Actions'
    }],
    rowData: [{
      name: 'John',
      email: 'john@example.com',
      age: 20,
      actions: <ActionButton>Edit</ActionButton>
    }, {
      name: 'Jane',
      email: 'jane@example.com',
      age: 21,
      actions: <ActionButton>Edit</ActionButton>
    }, {
      name: 'Jim',
      email: 'jim@example.com',
      age: 22,
      actions: <ActionButton>Edit</ActionButton>
    }, {
      name: 'Jill',
      email: 'jill@example.com',
      age: 23,
      actions: <ActionButton>Edit</ActionButton>
    }, {
      name: 'Jack',
      email: 'jack@example.com',
      age: 24,
      actions: <ActionButton>Edit</ActionButton>
    }]
  }
}`,...(N=(I=h.parameters)==null?void 0:I.docs)==null?void 0:N.source},description:{story:`Table where all columns are sortable. Demonstrates the three-state sorting cycle: \`true\` → \`'asc'\` → \`'desc'\` → \`true\`.
Shows how multiple columns can be sortable simultaneously, with only one active sort at a time.

\`\`\`tsx
<Table
  columns={[
    { key: 'name', label: 'Name', sortBy: true },  
    { key: 'email', label: 'Email', sortBy: true },
    { key: 'age', label: 'Age', sortBy: true }    
  ]}
  rowData={[
    { name: 'John', email: 'john@example.com', age: 20 },
    { name: 'Jane', email: 'jane@example.com', age: 21 }
  ]}
  onSortChange={(columnKey, direction) => handleSort(columnKey, direction)}
/>
\`\`\``,...(L=(T=h.parameters)==null?void 0:T.docs)==null?void 0:L.description}}};var M,z,H,U,_;g.parameters={...g.parameters,docs:{...(M=g.parameters)==null?void 0:M.docs,source:{originalSource:`{
  args: {
    columns: [{
      key: 'id',
      label: 'ID'
    }, {
      key: 'name',
      label: 'Full Name'
    }, {
      key: 'email',
      label: 'Email Address'
    }, {
      key: 'phone',
      label: 'Phone Number'
    }, {
      key: 'department',
      label: 'Department'
    }, {
      key: 'position',
      label: 'Position'
    }, {
      key: 'salary',
      label: 'Salary'
    }, {
      key: 'startDate',
      label: 'Start Date'
    }, {
      key: 'status',
      label: 'Status'
    }, {
      key: 'actions',
      label: 'Actions'
    }],
    rowData: [{
      id: 1,
      name: 'John Doe',
      email: 'john.doe@company.com',
      phone: '+1-555-0123',
      department: 'Engineering',
      position: 'Senior Developer',
      salary: '$95,000',
      startDate: '2022-01-15',
      status: 'Active',
      actions: <ActionButton>Edit</ActionButton>
    }, {
      id: 2,
      name: 'Jane Smith',
      email: 'jane.smith@company.com',
      phone: '+1-555-0124',
      department: 'Marketing',
      position: 'Marketing Manager',
      salary: '$78,000',
      startDate: '2021-06-20',
      status: 'Active',
      actions: <ActionButton>Edit</ActionButton>
    }, {
      id: 3,
      name: 'Bob Johnson',
      email: 'bob.johnson@company.com',
      phone: '+1-555-0125',
      department: 'Sales',
      position: 'Sales Director',
      salary: '$110,000',
      startDate: '2020-03-10',
      status: 'Active',
      actions: <ActionButton>Edit</ActionButton>
    }, {
      id: 4,
      name: 'Alice Brown',
      email: 'alice.brown@company.com',
      phone: '+1-555-0126',
      department: 'HR',
      position: 'HR Specialist',
      salary: '$65,000',
      startDate: '2023-02-28',
      status: 'Pending',
      actions: <ActionButton>Edit</ActionButton>
    }, {
      id: 5,
      name: 'Charlie Wilson',
      email: 'charlie.wilson@company.com',
      phone: '+1-555-0127',
      department: 'Finance',
      position: 'Financial Analyst',
      salary: '$72,000',
      startDate: '2022-09-12',
      status: 'Active',
      actions: <ActionButton>Edit</ActionButton>
    }]
  }
}`,...(H=(z=g.parameters)==null?void 0:z.docs)==null?void 0:H.source},description:{story:`Wide table with 10 columns to demonstrate horizontal scrolling and container query behavior.
This table will show how the container query responds when the table becomes too wide for its container.

\`\`\`tsx
<Table
  columns={[
    { key: 'id', label: 'ID' },
    { key: 'name', label: 'Full Name' },
    { key: 'email', label: 'Email Address' },
    { key: 'phone', label: 'Phone Number' },
    { key: 'department', label: 'Department' },
    { key: 'position', label: 'Position' },
    { key: 'salary', label: 'Salary' },
    { key: 'startDate', label: 'Start Date' },
    { key: 'status', label: 'Status' },
    { key: 'actions', label: 'Actions' }
  ]}
  rowData={[
    { id: 1, name: 'John Doe', email: 'john@company.com', phone: '+1-555-0123', department: 'Engineering', position: 'Senior Developer', salary: '$95,000', startDate: '2022-01-15', status: 'Active', actions: <ActionButton>Edit</ActionButton> }
  ]}
/>
\`\`\``,...(_=(U=g.parameters)==null?void 0:U.docs)==null?void 0:_.description}}};var F,V,$,W,O;b.parameters={...b.parameters,docs:{...(F=b.parameters)==null?void 0:F.docs,source:{originalSource:`{
  args: {
    columns: [{
      key: 'user',
      label: 'User Info'
    }, {
      key: 'description',
      label: 'Description'
    }, {
      key: 'status',
      label: 'Status'
    }, {
      key: 'actions',
      label: 'Actions'
    }],
    rowData: [{
      user: <div>
            <strong>John Doe</strong><br />
            john.doe@company.com<br />
            <em>Senior Developer</em>
          </div>,
      description: <div>
            Lead developer for the<br />
            e-commerce platform<br />
            <small>with 5+ years experience</small>
          </div>,
      status: <span>Active</span>,
      actions: <ActionButtonGroup>
            <ActionButton value="edit">Edit</ActionButton>
            <ActionButton value="delete">Delete</ActionButton>
            <ActionButton value="view">View</ActionButton>
          </ActionButtonGroup>
    }, {
      user: <div>
            <strong>Jane Smith</strong><br />
            jane.smith@company.com<br />
            <em>Product Manager</em>
          </div>,
      description: <div>
            Manages product roadmap<br />
            and feature planning<br />
            <small>3+ years in product</small>
          </div>,
      status: <span>Pending</span>,
      actions: <ActionButtonGroup>
            <ActionButton value="edit">Edit</ActionButton>
            <ActionButton value="approve">Approve</ActionButton>
            <ActionButton value="reject">Reject</ActionButton>
          </ActionButtonGroup>
    }, {
      user: <div>
            <strong>Bob Johnson</strong><br />
            bob.johnson@company.com<br />
            <em>UX Designer</em>
          </div>,
      description: <div>
            Designs user interfaces<br />
            and user experiences<br />
            <small>Expert in Figma & Sketch</small>
          </div>,
      status: <span>Inactive</span>,
      actions: <ActionButtonGroup>
            <ActionButton value="edit">Edit</ActionButton>
            <ActionButton value="activate">Activate</ActionButton>
            <ActionButton value="archive">Archive</ActionButton>
          </ActionButtonGroup>
    }]
  }
}`,...($=(V=b.parameters)==null?void 0:V.docs)==null?void 0:$.source},description:{story:`Table demonstrating complex VNode content in cells with multi-line text and interactive elements.
This shows how the table handles rich content including buttons, badges, and formatted text.

\`\`\`tsx
<Table
  columns={[
    { key: 'user', label: 'User Info' },
    { key: 'description', label: 'Description' },
    { key: 'status', label: 'Status' },
    { key: 'actions', label: 'Actions' }
  ]}
  rowData={[
    { 
      user: <div><strong>John Doe</strong><br/>john@example.com<br/>Senior Developer</div>,
      description: <div>Lead developer for the<br/>e-commerce platform<br/>with 5+ years experience</div>,
      status: <span>Active</span>,
      actions: <div><ActionButton>Edit</ActionButton><br/><ActionButton>Delete</ActionButton><br/><ActionButton>View</ActionButton></div>
    }
  ]}
/>
\`\`\``,...(O=(W=b.parameters)==null?void 0:W.docs)==null?void 0:O.description}}};var G,q,X,K,Q;y.parameters={...y.parameters,docs:{...(G=y.parameters)==null?void 0:G.docs,source:{originalSource:`{
  args: {
    mobileLayout: 'stacked',
    columns: [{
      key: 'name',
      label: 'Name'
    }, {
      key: 'email',
      label: 'Email'
    }, {
      key: 'age',
      label: 'Age'
    }, {
      key: 'status',
      label: 'Status'
    }, {
      key: 'actions',
      label: 'Actions'
    }],
    rowData: [{
      name: 'John Doe',
      email: 'john.doe@example.com',
      age: 28,
      status: 'Active',
      actions: <ActionButton>Edit</ActionButton>
    }, {
      name: 'Jane Smith',
      email: 'jane.smith@example.com',
      age: 32,
      status: 'Inactive',
      actions: <ActionButton>Edit</ActionButton>
    }, {
      name: 'Bob Johnson',
      email: 'bob.johnson@example.com',
      age: 45,
      status: 'Active',
      actions: <ActionButton>Edit</ActionButton>
    }, {
      name: 'Alice Brown',
      email: 'alice.brown@example.com',
      age: 29,
      status: 'Pending',
      actions: <ActionButton>Edit</ActionButton>
    }]
  }
}`,...(X=(q=y.parameters)==null?void 0:q.docs)==null?void 0:X.source},description:{story:`Table with stacked mobile layout that uses container queries. 
This demonstrates how the table adapts to its container width rather than viewport width.
The table will stack vertically when its container becomes narrow (≤600px).

**Container Query Behavior**: Uses \`mobileLayout="stacked"\` to enable responsive stacking.
When the container width ≤ 600px:
- Headers are hidden (\`display: none\`)
- Cells stack vertically (\`display: block\`)
- Column labels appear as \`data-label\` attributes before each cell value
- Perfect for mobile views, sidebars, or constrained layouts

\`\`\`tsx
<Table
  mobileLayout="stacked"
  columns={[
    { key: 'name', label: 'Name' },  
    { key: 'email', label: 'Email' },
    { key: 'age', label: 'Age' }    
  ]}
  rowData={[
    { name: 'John', email: 'john@example.com', age: 20 },
    { name: 'Jane', email: 'jane@example.com', age: 21 }
  ]}
/>
\`\`\``,...(Q=(K=y.parameters)==null?void 0:K.docs)==null?void 0:Q.description}}};var Y,Z,ee,ne,te;w.parameters={...w.parameters,docs:{...(Y=w.parameters)==null?void 0:Y.docs,source:{originalSource:`{
  render: args => {
    const [expandedRows, setExpandedRows] = useState(new Set<number>());
    const toggleRow = (rowIndex: number) => {
      setExpandedRows(prev => {
        const newSet = new Set(prev);
        if (newSet.has(rowIndex)) {
          newSet.delete(rowIndex);
        } else {
          newSet.add(rowIndex);
        }
        return newSet;
      });
    };
    const rowData = [{
      name: 'John Doe',
      email: 'john.doe@company.com',
      status: 'Active',
      actions: <ActionButton onClick={() => toggleRow(0)}>
            {expandedRows.has(0) ? 'Hide' : 'Show'}
          </ActionButton>,
      _rowDetails: <>
            <h3>Employee Details</h3>
            <p><strong>Department:</strong> Engineering</p>
            <p><strong>Position:</strong> Senior Developer</p>
            <p><strong>Start Date:</strong> January 15, 2022</p>
            <p><strong>Notes:</strong> Excellent performance, leads the frontend team.</p>
            <div style={{
          marginTop: '12px'
        }}>
              <ActionButton style={{
            marginRight: '8px'
          }}>Update Details</ActionButton>
              <ActionButton>View Full Profile</ActionButton>
            </div>
          </>
    }, {
      name: 'Jane Smith',
      email: 'jane.smith@company.com',
      status: 'Pending',
      actions: <ActionButton onClick={() => toggleRow(1)}>
            {expandedRows.has(1) ? 'Hide' : 'Show'}
          </ActionButton>,
      _rowDetails: <>
            <h3>Pending Approval</h3>
            <p><strong>Department:</strong> Marketing</p>
            <p><strong>Position:</strong> Marketing Manager</p>
            <p><strong>Application Date:</strong> December 1, 2024</p>
            <p><strong>Status:</strong> Awaiting HR approval</p>
            <div style={{
          marginTop: '12px'
        }}>
              <ActionButton style={{
            marginRight: '8px',
            backgroundColor: '#22c55e',
            color: 'white',
            border: 'none',
            padding: '6px 12px',
            borderRadius: '4px'
          }}>Approve</ActionButton>
              <ActionButton style={{
            backgroundColor: '#ef4444',
            color: 'white',
            border: 'none',
            padding: '6px 12px',
            borderRadius: '4px'
          }}>Reject</ActionButton>
            </div>
          </>
    }, {
      name: 'Bob Johnson',
      email: 'bob.johnson@company.com',
      status: 'Inactive',
      actions: <ActionButton onClick={() => toggleRow(2)}>
            {expandedRows.has(2) ? 'Hide' : 'Show'}
          </ActionButton>,
      _rowDetails: <>
            <h3>Account Information</h3>
            <p><strong>Department:</strong> Sales</p>
            <p><strong>Position:</strong> Sales Director</p>
            <p><strong>Last Active:</strong> November 20, 2024</p>
            <p><strong>Reason:</strong> On extended leave</p>
            <div style={{
          marginTop: '12px'
        }}>
              <ActionButton style={{
            marginRight: '8px'
          }}>Reactivate Account</ActionButton>
              <ActionButton>Contact Employee</ActionButton>
            </div>
          </>
    }];
    return <TableComponent {...args} columns={[{
      key: 'name',
      label: 'Name'
    }, {
      key: 'email',
      label: 'Email'
    }, {
      key: 'status',
      label: 'Status'
    }, {
      key: 'actions',
      label: 'Actions'
    }]} rowData={rowData} expandedRows={expandedRows} />;
  }
}`,...(ee=(Z=w.parameters)==null?void 0:Z.docs)==null?void 0:ee.source},description:{story:`Table with programmatically controlled expandable rows.
Row expansion is controlled by buttons or other interactive elements within the column content.
Developers must manage the \`expandedRows\` state themselves.

**Features**:
- Row details only render when both \`_rowDetails\` exists and row index is in \`expandedRows\`
- Row details span the full width of the table
- Supports any VNode content in the \`_rowDetails\` property

\`\`\`tsx
const [expandedRows, setExpandedRows] = useState(new Set());

const toggleRow = (rowIndex: number) => {
  setExpandedRows(prev => {
    const newSet = new Set(prev);
    if (newSet.has(rowIndex)) {
      newSet.delete(rowIndex);
    } else {
      newSet.add(rowIndex);
    }
    return newSet;
  });
};

<Table
  columns={[
    { key: 'name', label: 'Name' },  
    { key: 'email', label: 'Email' },
    { key: 'actions', label: 'Actions' }
  ]}
  rowData={[
    { 
      name: 'John', 
      email: 'john@example.com', 
      actions: <ActionButton onClick={() => toggleRow(0)}>Toggle Details</ActionButton>,
      _rowDetails: <div>Additional information...</div>
    }
  ]}
  expandedRows={expandedRows}
/>
\`\`\``,...(te=(ne=w.parameters)==null?void 0:ne.docs)==null?void 0:te.description}}};var ae,oe,ie,se,re;v.parameters={...v.parameters,docs:{...(ae=v.parameters)==null?void 0:ae.docs,source:{originalSource:`{
  args: {
    loading: true,
    skeletonRowCount: 5,
    columns: [{
      key: 'name',
      label: 'Name'
    }, {
      key: 'email',
      label: 'Email'
    }, {
      key: 'status',
      label: 'Status'
    }, {
      key: 'actions',
      label: 'Actions'
    }],
    rowData: [] // Empty when loading
  }
}`,...(ie=(oe=v.parameters)==null?void 0:oe.docs)==null?void 0:ie.source},description:{story:`Table in loading state with skeleton rows.
Demonstrates how the table appears while data is being fetched.
Each cell shows a skeleton placeholder that matches the table structure.

**Features**:
- Shows skeleton rows instead of actual data when \`loading\` is true
- Configurable number of skeleton rows via \`skeletonRowCount\` prop
- Maintains table structure and column headers during loading
- Each cell contains a single-line skeleton component

\`\`\`tsx
<Table
  loading={true}
  skeletonRowCount={5}
  columns={[
    { key: 'name', label: 'Name' },  
    { key: 'email', label: 'Email' },
    { key: 'status', label: 'Status' }
  ]}
  rowData={[]} // Empty array when loading
/>
\`\`\``,...(re=(se=v.parameters)==null?void 0:se.docs)==null?void 0:re.description}}};var le,ce,de,me,pe;k.parameters={...k.parameters,docs:{...(le=k.parameters)==null?void 0:le.docs,source:{originalSource:`{
  args: {
    columns: [{
      key: 'name',
      label: <span>
            <strong>👤 User Name</strong>
          </span>,
      ariaLabel: 'User Name'
    }, {
      key: 'email',
      label: <span style={{
        color: '#0066cc'
      }}>📧 Email Address</span>,
      ariaLabel: 'Email Address'
    }, {
      key: 'role',
      label: <em style={{
        color: '#666'
      }}>Role & Department</em>,
      ariaLabel: 'Role & Department'
    }, {
      key: 'status',
      label: <span style={{
        padding: '4px 8px',
        backgroundColor: '#f0f9ff',
        borderRadius: '4px',
        fontSize: '12px'
      }}>
            📊 Status
          </span>,
      ariaLabel: 'Status'
    }, {
      key: 'actions',
      label: <span>⚙️ Actions</span>,
      ariaLabel: 'Actions'
    }],
    rowData: [{
      name: 'John Doe',
      email: 'john.doe@company.com',
      role: 'Senior Developer',
      status: 'Active',
      actions: <ActionButton>Edit</ActionButton>
    }, {
      name: 'Jane Smith',
      email: 'jane.smith@company.com',
      role: 'Product Manager',
      status: 'Active',
      actions: <ActionButton>Edit</ActionButton>
    }, {
      name: 'Bob Johnson',
      email: 'bob.johnson@company.com',
      role: 'UX Designer',
      status: 'Inactive',
      actions: <ActionButton>Edit</ActionButton>
    }]
  }
}`,...(de=(ce=k.parameters)==null?void 0:ce.docs)==null?void 0:de.source},description:{story:`Table with VNode labels in column headers.
Demonstrates how column labels can be VNode elements instead of simple strings.
This allows for rich header content like icons, formatted text, or custom components.

**Features**:
- Column labels can be VNode elements (JSX components)
- Supports any valid Preact VNode content in headers
- Maintains all table functionality with custom header content
- Useful for adding icons, tooltips, or formatted text to headers

\`\`\`tsx
<Table
  columns={[
    { key: 'name', label: <span><strong>👤 User Name</strong></span> },
    { key: 'email', label: <span style={{ color: '#0066cc' }}>📧 Email</span> },
    { key: 'status', label: <em>Status Info</em> }
  ]}
  rowData={[
    { name: 'John', email: 'john@example.com', status: 'Active' }
  ]}
/>
\`\`\``,...(pe=(me=k.parameters)==null?void 0:me.docs)==null?void 0:pe.description}}};var ue,he,ge,be,ye;A.parameters={...A.parameters,docs:{...(ue=A.parameters)==null?void 0:ue.docs,source:{originalSource:`{
  render: args => {
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(5);

    // Page size options
    const pageSizeOptions: PickerOption[] = [{
      value: '5',
      text: '5'
    }, {
      value: '10',
      text: '10'
    }, {
      value: '15',
      text: '15'
    }];

    // Generate sample data (287 items to match screenshot)
    const allData = Array.from({
      length: 287
    }, (_, index) => ({
      id: index + 1,
      name: \`User \${index + 1}\`,
      email: \`user\${index + 1}@example.com\`,
      department: ['Engineering', 'Marketing', 'Sales', 'HR', 'Finance'][index % 5],
      status: ['Active', 'Inactive', 'Pending'][index % 3],
      actions: <ActionButton>Edit</ActionButton>
    }));
    const totalPages = Math.ceil(allData.length / pageSize);

    // Calculate item range
    const startItem = (currentPage - 1) * pageSize + 1;
    const endItem = Math.min(currentPage * pageSize, allData.length);
    const totalItems = allData.length;

    // Get current page data
    const paginatedData = allData.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    // Handle page size change
    const handlePageSizeChange = (event: Event) => {
      const target = event.target as HTMLSelectElement;
      const newPageSize = Number(target.value);
      setPageSize(newPageSize);
      setCurrentPage(1); // Reset to first page when page size changes
    };
    return <div>
        <TableComponent {...args} columns={[{
        key: 'id',
        label: 'ID'
      }, {
        key: 'name',
        label: 'Name'
      }, {
        key: 'email',
        label: 'Email'
      }, {
        key: 'department',
        label: 'Department'
      }, {
        key: 'status',
        label: 'Status'
      }, {
        key: 'actions',
        label: 'Actions'
      }]} rowData={paginatedData} />
        <div style={{
        marginTop: 'var(--spacing-small)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
          <span style={{
          font: 'var(--type-body-1-default-font)',
          letterSpacing: 'var(--type-body-1-default-letter-spacing)',
          color: 'var(--color-neutral-800)'
        }}>
            Items {startItem} to {endItem} of {totalItems} total
          </span>
          <Pagination currentPage={currentPage} totalPages={totalPages} onChange={setCurrentPage} />
          <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--spacing-xsmall)',
          font: 'var(--type-body-1-default-font)',
          letterSpacing: 'var(--type-body-1-default-letter-spacing)',
          color: 'var(--color-neutral-800)'
        }}>
            <span>Show</span>
            <Picker variant="primary" size="medium" value={String(pageSize)} options={pageSizeOptions} handleSelect={handlePageSizeChange} aria-label="Items per page" />
          </div>
        </div>
      </div>;
  }
}`,...(ge=(he=A.parameters)==null?void 0:he.docs)==null?void 0:ge.source},description:{story:`Table with pagination to navigate through multiple pages of data.
This demonstrates how to integrate the Pagination component with the Table component.

**Features**:
- Pagination controls below the table
- Page state management with useState
- Dynamic row data based on current page
- Items per page configuration

\`\`\`tsx
const [currentPage, setCurrentPage] = useState(1);
const itemsPerPage = 5;
const totalItems = 50;
const totalPages = Math.ceil(totalItems / itemsPerPage);

const paginatedData = allData.slice(
  (currentPage - 1) * itemsPerPage,
  currentPage * itemsPerPage
);

<div>
  <Table
    columns={columns}
    rowData={paginatedData}
  />
  <Pagination
    currentPage={currentPage}
    totalPages={totalPages}
    onChange={setCurrentPage}
  />
</div>
\`\`\``,...(ye=(be=A.parameters)==null?void 0:be.docs)==null?void 0:ye.description}}};var we,ve,ke,Ae,Se;S.parameters={...S.parameters,docs:{...(we=S.parameters)==null?void 0:we.docs,source:{originalSource:`{
  render: args => {
    const [expandedRows, setExpandedRows] = useState(new Set<number>());
    const toggleRow = (rowIndex: number) => {
      setExpandedRows(prev => {
        const newSet = new Set(prev);
        if (newSet.has(rowIndex)) {
          newSet.delete(rowIndex);
        } else {
          newSet.add(rowIndex);
        }
        return newSet;
      });
    };
    const rowData = [{
      name: 'John Doe',
      email: 'john.doe@company.com',
      status: 'Active',
      actions: <ActionButton onClick={() => toggleRow(0)}>
            {expandedRows.has(0) ? 'Hide' : 'Show'}
          </ActionButton>,
      _rowDetails: <>
            <h3>Employee Details</h3>
            <p><strong>Department:</strong> Engineering</p>
            <p><strong>Position:</strong> Senior Developer</p>
            <p><strong>Start Date:</strong> January 15, 2022</p>
            <p><strong>Notes:</strong> Excellent performance, leads the frontend team.</p>
          </>
    }, {
      name: 'Jane Smith',
      email: 'jane.smith@company.com',
      status: 'Pending',
      actions: <ActionButton onClick={() => toggleRow(1)}>
            {expandedRows.has(1) ? 'Hide' : 'Show'}
          </ActionButton>,
      _rowDetails: <>
            <h3>Pending Approval</h3>
            <p><strong>Department:</strong> Marketing</p>
            <p><strong>Position:</strong> Marketing Manager</p>
            <p><strong>Application Date:</strong> December 1, 2024</p>
            <p><strong>Status:</strong> Awaiting HR approval</p>
          </>
    }, {
      name: 'Bob Johnson',
      email: 'bob.johnson@company.com',
      status: 'Inactive',
      actions: <ActionButton onClick={() => toggleRow(2)}>
            {expandedRows.has(2) ? 'Hide' : 'Show'}
          </ActionButton>,
      _rowDetails: <>
            <h3>Account Information</h3>
            <p><strong>Department:</strong> Sales</p>
            <p><strong>Position:</strong> Sales Director</p>
            <p><strong>Last Active:</strong> November 20, 2024</p>
            <p><strong>Reason:</strong> On extended leave</p>
          </>
    }];
    return <TableComponent {...args} mobileLayout="stacked" columns={[{
      key: 'name',
      label: 'Name',
      ariaLabel: 'Name'
    }, {
      key: 'email',
      label: 'Email',
      ariaLabel: 'Email'
    }, {
      key: 'status',
      label: 'Status',
      ariaLabel: 'Status'
    }, {
      key: 'actions',
      label: 'Actions',
      ariaLabel: 'Actions'
    }]} rowData={rowData} expandedRows={expandedRows} />;
  }
}`,...(ke=(ve=S.parameters)==null?void 0:ve.docs)==null?void 0:ke.source},description:{story:`Table with expandable row details and stacked mobile layout.
Combines the expandable rows feature with responsive mobile behavior using container queries.

**Features**:
- Expandable rows with toggle buttons
- Stacked mobile layout when container width ≤ 600px
- Row details expand in both desktop and mobile views
- Mobile view shows labels above each cell value

\`\`\`tsx
const [expandedRows, setExpandedRows] = useState(new Set());

const toggleRow = (rowIndex: number) => {
  setExpandedRows(prev => {
    const newSet = new Set(prev);
    if (newSet.has(rowIndex)) {
      newSet.delete(rowIndex);
    } else {
      newSet.add(rowIndex);
    }
    return newSet;
  });
};

<Table
  mobileLayout="stacked"
  columns={columns}
  rowData={rowDataWithDetails}
  expandedRows={expandedRows}
/>
\`\`\``,...(Se=(Ae=S.parameters)==null?void 0:Ae.docs)==null?void 0:Se.description}}};const Ne=["Table","AllSortable","WideTable","ComplexCells","StackedMobileLayout","RowDetails","LoadingState","VNodeLabels","WithPagination","ExpandableRowsWithMobileLayout"];export{h as AllSortable,b as ComplexCells,S as ExpandableRowsWithMobileLayout,v as LoadingState,w as RowDetails,y as StackedMobileLayout,u as Table,k as VNodeLabels,g as WideTable,A as WithPagination,Ne as __namedExportsOrder,Ie as default};
//# sourceMappingURL=Table.stories-C2W2J9p1.js.map
