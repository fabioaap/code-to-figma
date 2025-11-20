import{j as l}from"./jsx-runtime-CDt2p4po.js";import"./index-GiUgBvb1.js";const d=({label:c,variant:a="primary",onClick:m})=>{const u={padding:"12px 16px",borderRadius:6,fontWeight:500,display:"inline-flex",gap:8,alignItems:"center",justifyContent:"center",cursor:"pointer",background:a==="primary"?"#2563eb":"#e2e8f0",color:a==="primary"?"#fff":"#1e293b",border:"1px solid "+(a==="primary"?"#1d4ed8":"#cbd5e1")};return l.jsx("button",{style:u,onClick:m,children:c})};d.__docgenInfo={description:"",methods:[],displayName:"Button",props:{label:{required:!0,tsType:{name:"string"},description:""},variant:{required:!1,tsType:{name:"union",raw:"'primary' | 'secondary'",elements:[{name:"literal",value:"'primary'"},{name:"literal",value:"'secondary'"}]},description:"",defaultValue:{value:"'primary'",computed:!1}},onClick:{required:!1,tsType:{name:"signature",type:"function",raw:"() => void",signature:{arguments:[],return:{name:"void"}}},description:""}}};const f={title:"Example/Button",component:d,args:{label:"Export Me"}},r={args:{variant:"primary"}},e={args:{variant:"secondary"}};var n,t,s;r.parameters={...r.parameters,docs:{...(n=r.parameters)==null?void 0:n.docs,source:{originalSource:`{
  args: {
    variant: 'primary'
  }
}`,...(s=(t=r.parameters)==null?void 0:t.docs)==null?void 0:s.source}}};var o,i,p;e.parameters={...e.parameters,docs:{...(o=e.parameters)==null?void 0:o.docs,source:{originalSource:`{
  args: {
    variant: 'secondary'
  }
}`,...(p=(i=e.parameters)==null?void 0:i.docs)==null?void 0:p.source}}};const x=["Primary","Secondary"];export{r as Primary,e as Secondary,x as __namedExportsOrder,f as default};
