import{r as g}from"./index-uubelm5h.js";var x={exports:{}},p={};/**
 * @license React
 * react-jsx-runtime.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var b=g,v=Symbol.for("react.element"),E=Symbol.for("react.fragment"),O=Object.prototype.hasOwnProperty,R=b.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner,S={key:!0,ref:!0,__self:!0,__source:!0};function _(t,r,o){var e,n={},i=null,c=null;o!==void 0&&(i=""+o),r.key!==void 0&&(i=""+r.key),r.ref!==void 0&&(c=r.ref);for(e in r)O.call(r,e)&&!S.hasOwnProperty(e)&&(n[e]=r[e]);if(t&&t.defaultProps)for(e in r=t.defaultProps,r)n[e]===void 0&&(n[e]=r[e]);return{$$typeof:v,type:t,key:i,ref:c,props:n,_owner:R.current}}p.Fragment=E;p.jsx=_;p.jsxs=_;x.exports=p;var j=x.exports;const k=j.jsx,P=({label:t,variant:r="primary",onClick:o})=>{const e={padding:"12px 16px",borderRadius:6,fontWeight:500,display:"inline-flex",gap:8,alignItems:"center",justifyContent:"center",cursor:"pointer",background:r==="primary"?"#2563eb":"#e2e8f0",color:r==="primary"?"#fff":"#1e293b",border:"1px solid "+(r==="primary"?"#1d4ed8":"#cbd5e1")};return k("button",{style:e,onClick:o,children:t})},w={title:"Example/Button",component:P,args:{label:"Export Me"}},s={args:{variant:"primary"}},a={args:{variant:"secondary"}};var d,m,u;s.parameters={...s.parameters,docs:{...(d=s.parameters)==null?void 0:d.docs,source:{originalSource:`{
  args: {
    variant: 'primary'
  }
}`,...(u=(m=s.parameters)==null?void 0:m.docs)==null?void 0:u.source}}};var l,y,f;a.parameters={...a.parameters,docs:{...(l=a.parameters)==null?void 0:l.docs,source:{originalSource:`{
  args: {
    variant: 'secondary'
  }
}`,...(f=(y=a.parameters)==null?void 0:y.docs)==null?void 0:f.source}}};const I=["Primary","Secondary"];export{s as Primary,a as Secondary,I as __namedExportsOrder,w as default};
