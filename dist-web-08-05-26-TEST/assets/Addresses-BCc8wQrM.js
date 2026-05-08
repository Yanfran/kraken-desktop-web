import{r as x,b as v,o as y,j as e}from"./index-DymJqIoo.js";import{f as X}from"./addressService-LdpGFRvV.js";/**
 * @license lucide-react v0.545.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const $=r=>r.replace(/([a-z0-9])([A-Z])/g,"$1-$2").toLowerCase(),k=r=>r.replace(/^([A-Z])|[\s-_]+(\w)/g,(t,c,l)=>l?l.toUpperCase():c.toLowerCase()),b=r=>{const t=k(r);return t.charAt(0).toUpperCase()+t.slice(1)},j=(...r)=>r.filter((t,c,l)=>!!t&&t.trim()!==""&&l.indexOf(t)===c).join(" ").trim(),A=r=>{for(const t in r)if(t.startsWith("aria-")||t==="role"||t==="title")return!0};/**
 * @license lucide-react v0.545.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */var w={xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round"};/**
 * @license lucide-react v0.545.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const P=x.forwardRef(({color:r="currentColor",size:t=24,strokeWidth:c=2,absoluteStrokeWidth:l,className:m="",children:u,iconNode:p,...s},a)=>x.createElement("svg",{ref:a,...w,width:t,height:t,stroke:r,strokeWidth:l?Number(c)*24/Number(t):c,className:j("lucide",m),...!u&&!A(s)&&{"aria-hidden":"true"},...s},[...p.map(([g,o])=>x.createElement(g,o)),...Array.isArray(u)?u:[u]]));/**
 * @license lucide-react v0.545.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const N=(r,t)=>{const c=x.forwardRef(({className:l,...m},u)=>x.createElement(P,{ref:u,iconNode:t,className:j(`lucide-${$(b(r))}`,`lucide-${r}`,l),...m}));return c.displayName=b(r),c};/**
 * @license lucide-react v0.545.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const L=[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3",key:"1u773s"}],["path",{d:"M12 17h.01",key:"p32p05"}]],z=N("circle-question-mark",L);/**
 * @license lucide-react v0.545.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const E=[["rect",{width:"14",height:"14",x:"8",y:"8",rx:"2",ry:"2",key:"17jyea"}],["path",{d:"M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2",key:"zix9uf"}]],C=N("copy",E);/**
 * @license lucide-react v0.545.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const I=[["path",{d:"M12 2v4",key:"3427ic"}],["path",{d:"m16.2 7.8 2.9-2.9",key:"r700ao"}],["path",{d:"M18 12h4",key:"wj9ykh"}],["path",{d:"m16.2 16.2 2.9 2.9",key:"1bxg5t"}],["path",{d:"M12 18v4",key:"jadmvz"}],["path",{d:"m4.9 19.1 2.9-2.9",key:"bwix9q"}],["path",{d:"M2 12h4",key:"j09sii"}],["path",{d:"m4.9 4.9 2.9 2.9",key:"giyufr"}]],K=N("loader",I);/**
 * @license lucide-react v0.545.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const S=[["circle",{cx:"18",cy:"5",r:"3",key:"gq8acd"}],["circle",{cx:"6",cy:"12",r:"3",key:"w7nqdw"}],["circle",{cx:"18",cy:"19",r:"3",key:"1xt0gg"}],["line",{x1:"8.59",x2:"15.42",y1:"13.51",y2:"17.49",key:"47mynk"}],["line",{x1:"15.41",x2:"8.59",y1:"6.51",y2:"10.49",key:"1n3mei"}]],F=N("share-2",S),R="/assets/venezuela-Cyxmo4PC.png",T="/assets/usa-H4TTIS7w.png",M="/assets/china-B9WGA_v_.png",f=({casilleroName:r,country:t,state:c,city:l,line1:m,line2:u,zip:p,name:s,phone:a,isChina:g=!1})=>{const o=({label:_,value:d})=>e.jsxs("div",{className:"address-block__row",children:[e.jsx("span",{className:"address-block__label",children:_}),e.jsx("span",{className:"address-block__value",children:d})]});return g?e.jsxs("div",{className:"address-block__wrapper",children:[r&&e.jsx(o,{label:"Tu Casillero Kraken:",value:r}),t&&e.jsx(o,{label:"Country:",value:t}),c&&e.jsx(o,{label:"Province:",value:c}),l&&e.jsx(o,{label:"City:",value:l}),m&&e.jsx(o,{label:"Detailed Address:",value:m}),p&&e.jsx(o,{label:"Postal Code:",value:p}),s&&e.jsx(o,{label:"Full Name:",value:s}),a&&e.jsx(o,{label:"Phone:",value:a})]}):e.jsxs("div",{className:"address-block__wrapper",children:[r&&e.jsx(o,{label:"Tu Casillero Kraken:",value:r}),s&&e.jsx(o,{label:"Full Name:",value:s}),m&&e.jsx(o,{label:"Address Line 1:",value:m}),u&&e.jsx(o,{label:"Address Line 2:",value:u}),l&&e.jsx(o,{label:"City:",value:l}),c&&e.jsx(o,{label:"State:",value:c}),p&&e.jsx(o,{label:"ZIP:",value:p}),t&&e.jsx(o,{label:"Country:",value:t}),a&&e.jsx(o,{label:"Phone Number:",value:a})]})};function U(){const{user:r}=v(),[t,c]=x.useState(!0),[l,m]=x.useState(null);x.useEffect(()=>{u()},[]);const u=async()=>{try{c(!0);const d=await X();d.success?m(d.data):y.error(d.message||"Error al cargar direcciones.")}catch(d){console.error("Error loading addresses:",d),y.error("Error de conexión al cargar direcciones.")}finally{c(!1)}},p=async d=>{try{await navigator.clipboard.writeText(d),y.success("✅ Copiado al portapapeles")}catch(h){console.error("Error copying to clipboard:",h),y.error("❌ Error al copiar")}},s=l?.[0],a=l?.[1],g=async()=>{if(!s)return;const d=`${r?.name??""} ${r?.lastName??""}`.trim(),h=r?.codCliente||"KVXXXXXXXX",i=s.nombre||s.addressLine1;let n=`🇺🇸 DIRECCIÓN USA
`;i&&(n+=`Tu Casillero Kraken: ${i}
`),d&&(n+=`Full Name: ${d}
`),s.addressLine1&&(n+=`Address Line 1: ${s.addressLine1}
`),n+=`Address Line 2: (${h})
`,s.city&&(n+=`City: ${s.city}
`),s.stateProvince&&(n+=`State: ${s.stateProvince}
`),s.zip&&(n+=`ZIP: ${s.zip}
`),s.country&&(n+=`Country: ${s.country}
`),s.phoneNumber&&(n+=`Phone Number: ${s.phoneNumber}`),await p(n)},o=async()=>{if(!a)return;const d=`${r?.name??""} ${r?.lastName??""}`.trim(),h=r?.codCliente||"KVXXXXXXXX",i=a.nombre||a.addressLine1;let n=`🇨🇳 DIRECCIÓN CHINA
`;i&&(n+=`Tu Casillero Kraken: ${i}
`),a.country&&(n+=`Country: ${a.country}
`),a.stateProvince&&(n+=`Province: ${a.stateProvince}
`),a.city&&(n+=`City: ${a.city}
`),a.addressLine1&&(n+=`Detailed Address: ${a.addressLine1} (${h})
`),a.zip&&(n+=`Postal Code: ${a.zip}
`),d&&(n+=`Full Name: ${d}
`),a.phoneNumber&&(n+=`Phone: ${a.phoneNumber}`),await p(n)},_=async()=>{const d=`${r?.name??""} ${r?.lastName??""}`.trim(),h=r?.codCliente||"KVXXXXXXXX";let i=`📦 DIRECCIONES PARA ENVIAR COMPRAS

`;if(s){const n=s.nombre||s.addressLine1;i+=`🇺🇸 USA
`,n&&(i+=`Tu Casillero Kraken: ${n}
`),d&&(i+=`Full Name: ${d}
`),s.addressLine1&&(i+=`Address Line 1: ${s.addressLine1}
`),i+=`Address Line 2: (${h})
`,s.city&&(i+=`City: ${s.city}
`),s.stateProvince&&(i+=`State: ${s.stateProvince}
`),s.zip&&(i+=`ZIP: ${s.zip}
`),s.country&&(i+=`Country: ${s.country}
`),s.phoneNumber&&(i+=`Phone Number: ${s.phoneNumber}
`),i+=`
`}if(a){const n=a.nombre||a.addressLine1;i+=`🇨🇳 CHINA
`,n&&(i+=`Tu Casillero Kraken: ${n}
`),a.country&&(i+=`Country: ${a.country}
`),a.stateProvince&&(i+=`Province: ${a.stateProvince}
`),a.city&&(i+=`City: ${a.city}
`),a.addressLine1&&(i+=`Detailed Address: ${a.addressLine1} (${h})
`),a.zip&&(i+=`Postal Code: ${a.zip}
`),d&&(i+=`Full Name: ${d}
`),a.phoneNumber&&(i+=`Phone: ${a.phoneNumber}`)}if(s||a)if(navigator.share)try{await navigator.share({title:"Mis Direcciones Kraken",text:i})}catch(n){console.error("Error sharing:",n),y.error("Error al compartir.")}else await p(i),y.info("Direcciones copiadas al portapapeles para compartir.")};return t||!r?e.jsxs("div",{className:"addresses-page__loading",children:[e.jsx(K,{className:"spinner",size:48}),e.jsx("p",{children:"Cargando direcciones..."})]}):!s&&!a?e.jsx("div",{className:"addresses-page__loading",children:e.jsx("p",{children:"No se encontraron direcciones."})}):e.jsx("div",{className:"addresses-page",children:e.jsxs("div",{className:"addresses-page__container",children:[e.jsx("img",{src:R,alt:"Venezuela Flag",className:"addresses-page__main-flag"}),e.jsx("h1",{className:"addresses-page__title",children:"Estas son las direcciones que debes usar para enviar tus compras online a Venezuela"}),e.jsxs("div",{className:"addresses-page__section",children:[e.jsxs("div",{className:"addresses-page__row",children:[e.jsx("p",{className:"addresses-page__label",children:"Nº de Casillero"}),e.jsx("div",{className:"addresses-page__badge",children:e.jsx("p",{className:"addresses-page__badge-text",children:r.codCliente||"KVXXXXXXXX"})}),e.jsx("button",{onClick:()=>p(r.codCliente||"KVXXXXXXXX"),className:"addresses-page__copy-button",children:e.jsx(C,{size:18})})]}),e.jsx("p",{className:"addresses-page__note",children:"Siempre debes poner tu número de usuario en la dirección de envío (shipping address)."})]}),e.jsxs("div",{className:"addresses-page__addresses-grid",children:[s&&e.jsxs("div",{className:"addresses-page__section",children:[e.jsxs("div",{className:"addresses-page__row",children:[e.jsx("img",{src:T,alt:"USA Flag",className:"addresses-page__flag-icon"}),e.jsx("h2",{className:"addresses-page__country-title",children:"USA"}),e.jsx("button",{onClick:g,className:"addresses-page__copy-button",children:e.jsx(C,{size:18})})]}),e.jsx(f,{casilleroName:s.nombre||s.addressLine1,name:`${r.name??""} ${r.lastName??""}`.trim(),line1:s.addressLine1,line2:`(${r.codCliente||"KVXXXXXXXX"})`,city:s.city,state:s.stateProvince,zip:s.zip,country:s.country,phone:s.phoneNumber,isChina:!1})]}),a&&e.jsxs("div",{className:"addresses-page__section",children:[e.jsxs("div",{className:"addresses-page__row",children:[e.jsx("img",{src:M,alt:"China Flag",className:"addresses-page__flag-icon"}),e.jsx("h2",{className:"addresses-page__country-title",children:"CHINA"}),e.jsx("button",{onClick:o,className:"addresses-page__copy-button",children:e.jsx(C,{size:18})})]}),e.jsx(f,{casilleroName:a.nombre||a.addressLine1,country:a.country,state:a.stateProvince,city:a.city,line1:`${a.addressLine1} (${r.codCliente||"KVXXXXXXXX"})`,zip:a.zip,name:`${r.name??""} ${r.lastName??""}`.trim(),phone:a.phoneNumber,isChina:!0})]})]}),e.jsxs("button",{className:"addresses-page__help-row",children:[e.jsx(z,{size:18}),e.jsx("p",{className:"addresses-page__help-text",children:"¿Tienes dudas? Así debes escribir la dirección"})]}),(s||a)&&e.jsxs("div",{className:"addresses-page__share-section",children:[e.jsx("p",{className:"addresses-page__share-title",children:"COMPARTIR"}),e.jsx("button",{onClick:_,className:"addresses-page__share-button",children:e.jsx(F,{size:20})})]})]})})}export{U as default};
