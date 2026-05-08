import{r,j as e,u as m,c as u,b as h}from"./index-DymJqIoo.js";const f="/assets/splash-icon-CSbsh1Ye.png",k=({size:o=250})=>{const s=r.useRef(null);return r.useEffect(()=>{const t=s.current;if(t)return t.style.animation="pulpoFloat 1s ease-in-out infinite, pulpoRotate 2s linear infinite",()=>{t&&(t.style.animation="")}},[]),e.jsxs("div",{className:"animated-pulpo-container",children:[e.jsx("img",{ref:s,src:f,alt:"Kraken Pulpo",className:"animated-pulpo",style:{width:o,height:200},onError:t=>{t.target.src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'%3E%3Cg transform='translate(100,100)'%3E%3C!-- Cuerpo del pulpo --%3E%3Ccircle cx='0' cy='-20' r='40' fill='%23FF4500'/%3E%3C!-- Ojos --%3E%3Ccircle cx='-15' cy='-30' r='8' fill='white'/%3E%3Ccircle cx='15' cy='-30' r='8' fill='white'/%3E%3Ccircle cx='-15' cy='-30' r='4' fill='black'/%3E%3Ccircle cx='15' cy='-30' r='4' fill='black'/%3E%3C!-- Tentáculos --%3E%3Cpath d='M-30,-10 Q-50,20 -40,50 Q-30,70 -20,60 Q-10,50 -15,30' fill='%23FF4500' stroke='%23E63E00' stroke-width='2'/%3E%3Cpath d='M-15,-5 Q-25,25 -15,55 Q-5,75 5,65 Q15,55 10,35' fill='%23FF4500' stroke='%23E63E00' stroke-width='2'/%3E%3Cpath d='M0,-5 Q-10,25 0,55 Q10,75 20,65 Q30,55 25,35' fill='%23FF4500' stroke='%23E63E00' stroke-width='2'/%3E%3Cpath d='M15,-5 Q25,25 15,55 Q5,75 -5,65 Q-15,55 -10,35' fill='%23FF4500' stroke='%23E63E00' stroke-width='2'/%3E%3Cpath d='M30,-10 Q50,20 40,50 Q30,70 20,60 Q10,50 15,30' fill='%23FF4500' stroke='%23E63E00' stroke-width='2'/%3E%3C!-- Gorro opcional --%3E%3Cpath d='M-25,-50 Q0,-70 25,-50 Q20,-45 0,-55 Q-20,-45 -25,-50' fill='%234169E1'/%3E%3Ccircle cx='0' cy='-65' r='5' fill='white'/%3E%3C/g%3E%3C/svg%3E"}}),e.jsx("style",{jsx:!0,children:`
        .animated-pulpo-container {
          display: flex;
          justify-content: center;
          align-items: center;
          margin: 20px 0;
        }

        .animated-pulpo {
          display: block;
          filter: drop-shadow(0 4px 12px rgba(255, 69, 0, 0.3));
          transform-origin: center;
          will-change: transform;
        }

        @keyframes pulpoFloat {
          0%, 100% {
            transform: translateY(0px) scale(1);
          }
          50% {
            transform: translateY(-15px) scale(1.05);
          }
        }

        @keyframes pulpoRotate {
          0% {
            transform: rotate(0deg);
          }
          25% {
            transform: rotate(2deg);
          }
          50% {
            transform: rotate(0deg);
          }
          75% {
            transform: rotate(-2deg);
          }
          100% {
            transform: rotate(0deg);
          }
        }

        // @keyframes pulseBorder {
        //   0%, 100% {
        //     box-shadow: 0 0 0 0 rgba(255, 69, 0, 0.4);
        //   }
        //   50% {
        //     box-shadow: 0 0 0 10px rgba(255, 69, 0, 0);
        //   }
        // }

        /* Efecto hover para interactividad */
        .animated-pulpo:hover {
          animation: pulpoFloat 1s ease-in-out infinite, pulpoRotate 2s linear infinite, pulseBorder 2s infinite !important;
          cursor: pointer;
        }

        /* Modo oscuro */
        [data-theme="dark"] .animated-pulpo {
          filter: drop-shadow(0 4px 16px rgba(255, 69, 0, 0.5)) brightness(1.1);
        }
      `})]})},x=()=>{const o=m(),{theme:s}=u(),{user:t}=h(),n=s==="auto"?"light":s,[l,i]=r.useState(!1);r.useEffect(()=>{const a=document.querySelector(".kraken-welcome");a&&a.setAttribute("data-theme",n)},[n]),r.useEffect(()=>{const a=p=>{p.preventDefault(),window.history.pushState(null,"",window.location.href)};return window.history.pushState(null,"",window.location.href),window.addEventListener("popstate",a),()=>{window.removeEventListener("popstate",a)}},[]);const c=async()=>{i(!0);try{await new Promise(a=>setTimeout(a,500)),o("/home",{replace:!0})}catch(a){console.error("❌ [Welcome] Error navegando al dashboard:",a),setTimeout(()=>{o("/home",{replace:!0})},1e3)}finally{i(!1)}},d=()=>{window.open("/how-it-works","_blank")};return e.jsx("div",{className:"kraken-welcome","data-theme":n,children:e.jsxs("div",{className:"kraken-welcome__content",children:[e.jsx("div",{className:"kraken-welcome__pulpo-container",children:e.jsx(k,{})}),e.jsx("h1",{className:"kraken-welcome__title",children:"¡Bienvenido!"}),e.jsx("p",{className:"kraken-welcome__message",children:"Ya tienes tu casillero gratuito."}),e.jsx("p",{className:"kraken-welcome__message",children:"Revisa tu e-mail, allí encontrarás toda la información para que empieces a recibir tus envíos."}),e.jsx("button",{className:"kraken-welcome__button",onClick:c,disabled:l,children:l?e.jsxs("div",{className:"kraken-welcome__loading",children:[e.jsx("div",{className:"kraken-welcome__spinner"}),"Accediendo..."]}):"Ir a mi cuenta"}),e.jsxs("div",{className:"kraken-welcome__help-link",onClick:d,children:[e.jsx("span",{className:"kraken-welcome__help-icon",children:"❓"}),e.jsxs("span",{className:"kraken-welcome__help-text",children:["¿Tienes dudas? Revisa"," ",e.jsx("span",{className:"kraken-welcome__help-highlight",children:"cómo funciona"})]})]})]})})};export{x as default};
