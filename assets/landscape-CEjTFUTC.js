import{a as I,G as K,c as _,u as B,v as H,D as O,w as Q,x as X,V as $,W as Y,q as Z,s as ee,t as te,y as ae,A as oe}from"./ar-controller-DbavAZS2.js";const J=`
  uniform float time;
  uniform float levels[32];
  uniform float aspect;
  uniform float launchLevel;
  uniform vec2 outlet;
  uniform vec2 chute;
  uniform vec2 jet;
  const float TAU = 6.2831853;
  float levelAt(float t) {
    float i = 29. * sqrt(clamp(t, 0., 1.));
    int k = int(i);
    return mix(levels[k], levels[k+1], fract(i));
  }
  vec3 axisAt(float t) {
    float force = smoothstep(.24, .96, launchLevel);
    float bow = sin(3.14159*t);
    float x = outlet.x - .5 + t*mix(chute.x,jet.x,force) + .045*bow*force;
    float jetDrop = jet.y * (.25*t + .75*t*t);
    float y = (.5 - outlet.y - mix(chute.y*t, jetDrop, force)) / aspect;
    float z = (.009 + .29*force)*t + .095*force*bow;
    return vec3(x,y,z);
  }
  float radiusAt(float t, float level) {
    return (.0052 + sqrt(t)*(.010+.045*level) + t*t*.038*level)
      * smoothstep(0.,.09,level);
  }
  float rolling(float t) { return sqrt(t+.025)*24. - time*14.; }
`,ie=J+`
  varying vec3 radial;
  varying vec3 detail;
  varying float volume;
  void main() {
    float t = uv.y;
    float a = uv.x * TAU;
    volume = levelAt(t);
    float wave = rolling(t);
    float eddy = .12*sin(3.*a+wave) + .077*sin(7.*a-wave*1.7)
               + .05*sin(11.*a+wave*2.6) + .12*sin(wave*1.1);
    float radius = radiusAt(t,volume)*(1.+eddy);
    vec3 axis = axisAt(t);
    vec3 tangent = normalize(axisAt(t+.002)-axis);
    vec3 across = normalize(cross(tangent, vec3(0.,0.,1.)));
    vec3 forward = normalize(cross(across,tangent));
    radial = normalize(across*cos(a)+forward*sin(a)/.86);
    vec3 surface = axis + radius*(across*cos(a)+forward*.86*sin(a));
    detail = vec3(cos(a),sin(a),t);
    gl_Position = projectionMatrix*modelViewMatrix*vec4(surface,1.);
  }
`,ne=`
  uniform float time;
  varying vec3 radial;
  varying vec3 detail;
  varying float volume;
  float hash(vec2 p) { return fract(sin(mod(dot(p,vec2(17.13,63.71)),6.28318))*4375.5453); }
  float noise(vec2 p) {
    vec2 i=floor(p), f=fract(p); f=f*f*(3.-2.*f);
    return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+1.),f.x),f.y);
  }
  void main() {
    if(volume<.005) discard;

    float t=detail.z, adv=sqrt(t+.025)*44.-time*21.;
    float stream=detail.x*8.+detail.y*3.;
    float swell=noise(vec2(stream,adv*.85));
    float swirls=noise(vec2(stream*3.+2.8*swell,adv*1.7+swell));
    float bubbles=noise(vec2(stream*9.+swirls,adv*4.));
    vec3 n=normalize(radial + vec3(.39*(swirls-.5),.33*(swell-.5),.21*(bubbles-.5)));
    float light=max(0.,dot(n,normalize(vec3(-.45,.65,.85))));
    float glint=pow(max(0.,dot(n,normalize(vec3(-.28,.4,1.)))),18.);
    float froth=smoothstep(.50,.76,.46*swell+.31*swirls+.23*bubbles+.10*t);
    vec3 deep=mix(vec3(.045,.14,.18),vec3(.24,.43,.45), light*(.52+.48*swell));
    vec3 color=mix(deep,vec3(.89,.96,.95)*(.69+.31*light),froth)+.14*glint;
    gl_FragColor=vec4(color,1.);
  }
`;function le(h){const l=new B(1,1),u=new Q;u.index=l.index,u.attributes=l.attributes;const i=960,c=new Float32Array(i*4);let b=39241;for(let o=0;o<c.length;o++)b=Math.imul(b,1664525)+1013904223>>>0,c[o]=b/4294967296;u.setAttribute("seed",new X(c,4)),u.instanceCount=i;const w=new H({uniforms:h,transparent:!0,depthWrite:!1,side:O,vertexShader:J+`
      attribute vec4 seed;
      varying vec2 sprite;
      varying float opacity;
      varying float mist;
      void main() {
        mist=step(.84,seed.w);
        float age=fract(seed.x+time*(.62+.86*seed.w));
        float start=.035+.94*seed.y;
        float t=min(1.,start+.12*age);
        float level=levelAt(t);
        float r=radiusAt(t,level);
        float az=seed.z*TAU;
        float scatter=(.4+1.9*age)*r;
        vec3 center=axisAt(t);
        center.x+=cos(az)*scatter;
        center.z+=sin(az)*scatter + age*(.018+.05*level);
        center.y+=(.09*age-.14*age*age)*level*(.4+seed.w);
        float size=mix(.0009+.0038*t,.006+.033*t,mist)*(.4+level)*(.5+age);
        sprite=uv*2.-1.;
        center.xy+=size*vec2(sprite.x*(.66+.55*mist),sprite.y*1.3);
        opacity=smoothstep(.025,.35,level)*sin(age*3.14159)*mix(.85,.16,mist);
        gl_Position=projectionMatrix*modelViewMatrix*vec4(center,1.);
      }`,fragmentShader:`
      varying vec2 sprite; varying float opacity; varying float mist;
      void main(){
        float fade=1.-smoothstep(mix(.35,.04,mist),1.,length(sprite));
        if(opacity*fade<.003) discard;
        gl_FragColor=vec4(.86,.95,.96,opacity*fade);
      }`});return new _(u,w)}function re(h){const l={time:{value:0},levels:{value:new Float32Array(32).fill(h)},aspect:{value:1},outlet:{value:new I},chute:{value:new I},jet:{value:new I},launchLevel:{value:h}},u=new K,i=new _(new B(1,1,40,140),new H({uniforms:l,vertexShader:ie,fragmentShader:ne,side:O})),c=le(l);return i.frustumCulled=c.frustumCulled=!1,u.add(i,c),{group:u,uniforms:l}}const se="https://www.pref.kagawa.lg.jp/kasensabo/dam/kabagawa/",D=[{id:"outlet",label:"放流口",title:"水が出ていく場所",body:"目印は斜面へつながる開口部。椛川ダムでは、洪水時に上流の貯水位に応じて常用洪水吐きから流れる量が自然に変わります。",metric:"自然調節",caption:"貯水位に応じて流量が変わる",source:"keikaku/chisui05.html"},{id:"chute",label:"水の通り道",title:"水は斜面を下っていく",body:"開口部から下へ伸びる斜面に注目。ARの水柱は、そこから水が流れ出す様子を立体で見せる演出です。「放流の波を送る」で水の動きを追えます。",metric:"開口部 → 斜面",caption:"立体の水柱で流れを観察",source:"gaiyo/03.html"},{id:"wall",label:"堤体",title:"一時的に水をため、下流を守る",body:"雨が強まると、ダムは流れ込む水の一部をためながら下流へ流します。こうして下流の川の急な増水を抑えます。",metric:"88.5 m",caption:"椛川ダムの堤高",source:"gaiyo/03.html"}];function ce(h){const l=document.querySelector("#guide-anchors"),u=document.querySelector("#dam-guide"),i=document.querySelector("#guide-topics"),c=document.querySelector("#guide-toggle"),b=document.querySelector("#guide-title"),w=document.querySelector("#guide-body"),o=document.querySelector("#guide-metric"),m=document.querySelector("#guide-caption"),S=document.querySelector("#guide-source");let f=!0;const q=new $,v=new $,d=D.map(a=>{const r=document.createElement("button");r.type="button",r.textContent=a.label,r.onclick=()=>M(a),i.append(r);const n=document.createElement("button");n.type="button",n.className="guide-pin",n.setAttribute("aria-label",a.label+"の解説"),n.onclick=()=>M(a);const C=document.createElement("span");return C.className="guide-pin-label",C.textContent=a.label,n.append(C),l.append(n),{topic:a,choice:r,pin:n}});function M(a){b.textContent=a.title,w.textContent=a.body,o.textContent=a.metric,m.textContent=a.caption,S.href=se+a.source;for(const r of d){const n=String(r.topic===a);r.pin.setAttribute("aria-pressed",n),r.choice.setAttribute("aria-pressed",n)}}return M(D[0]),c.onclick=()=>{f=!f,u.hidden=!f,c.setAttribute("aria-pressed",String(f))},{update(a,r,n,C,L){if(l.hidden=!L||!f,l.hidden)return;const g=h.clientWidth,z=h.clientHeight;for(const{topic:y,pin:x}of d){const[U,e]=C[y.id];q.set(U-.5,(.5-e)/n,0).applyMatrix4(r),v.copy(q).applyMatrix4(a.matrixWorldInverse),q.applyMatrix4(a.matrixWorldInverse).applyMatrix4(a.projectionMatrix);const t=(q.x+1)*g/2,s=(1-q.y)*z/2;if(x.hidden=v.z>=0||!Number.isFinite(t+s)||t<14||t>g-14||s<16||s>z-16,!x.hidden){x.style.setProperty("--left",t.toFixed(1)+"px"),x.style.setProperty("--top",s.toFixed(1)+"px");const p=y.id==="wall";x.classList.toggle("guide-pin-left",t>g-122||p&&t>110)}}}}}const W=document.querySelector("#stage"),A=document.querySelector("#view-picker"),P=document.querySelector("#photo"),de=document.querySelector("#water"),F=document.querySelector("#strength"),ue=document.querySelector("#reading"),V=document.querySelector("#pause"),j=document.querySelector("#surge"),G=document.querySelector("#camera"),E=document.querySelector("#mode"),N=document.querySelector("#status"),R=[{id:"front",label:"正面寄り",file:"dam.jpg",width:1500,height:997,outlet:[.5975,.289],chute:[.21,.442],jet:[.075,.67],guideChute:[.733,.574],guideWall:[.279,.532]},{id:"oblique",label:"斜めから",file:"dam-oblique.jpg",width:700,height:396,outlet:[310/700,146/396],chute:[108/700,234/396],jet:[.102,.66],guideChute:[.567,.728],guideWall:[.289,.57]}];function fe(){const h=ce(W),l=new Y({canvas:de,alpha:!0,antialias:!0});l.setPixelRatio(Math.min(devicePixelRatio,2));const u=new URLSearchParams(location.search).get("view");let i=R.find(e=>e.id===u)??R[0],c=1;const b=new Z;let w=Number(F.value)/100;const{group:o,uniforms:m}=re(w);o.matrixAutoUpdate=!1,b.add(o);const S=new ee(45,1,.015,10);S.position.z=.82;const f=new te,q=new ae;let v,d,M=Promise.resolve(),a=!1,r=performance.now();function n(){const e=W.clientWidth,t=W.clientHeight;if(!e||!t)return;l.setSize(e,t,!1);const s=e/t;S.aspect=s;const p=.5/Math.min(s,c);if(S.fov=2*Math.atan(p/S.position.z)*180/Math.PI,S.updateProjectionMatrix(),v){const k=Math.min(e/v.width,t/v.height);f.projectionMatrix.copy(q),f.projectionMatrix.elements[0]*=v.width*k/e,f.projectionMatrix.elements[5]*=v.height*k/t,f.projectionMatrixInverse.copy(f.projectionMatrix).invert()}}function C(e){i=e,m.aspect.value=e.width/e.height,m.outlet.value.set(e.outlet[0],e.outlet[1]),m.chute.value.set(e.chute[0],e.chute[1]),m.jet.value.set(e.jet[0],e.jet[1])}function L(e){C(e),A.value=e.id,P.src=`./landscape/${e.file}`,P.alt=`堤体を${e.label}見た写真。中央付近に放流口がある。`,P.width=e.width,P.height=e.height,c=e.width/e.height,W.style.aspectRatio=String(c),n()}new ResizeObserver(n).observe(W),L(i),A.onchange=()=>{const e=R.find(t=>t.id===A.value);e&&!d&&L(e)};const g=m.levels.value;let z=0,y=0;j.onclick=()=>{a=!1,V.textContent="一時停止",y=1.5,j.disabled=!0,j.textContent="放流中"},F.oninput=()=>{ue.value=F.value+"%",w=Number(F.value)/100},V.onclick=()=>{a=!a,V.textContent=a?"再開":"一時停止"};function x(e){const t=d;d=void 0,t&&(M=Promise.allSettled([M,t.stop()]).then(()=>{})),v=void 0,A.disabled=!1,P.hidden=!1,L(i),o.matrix.identity(),o.matrixWorldNeedsUpdate=!0,o.visible=!0,G.textContent="カメラで景色に重ねる",N.textContent=e,E.textContent="写真で体験"}const U={loading:"カメラと画像認識を準備しています。",searching:"見学位置から堤体上端と中央付近の開口部を画面に入れてください。正面寄り・斜めの両方を認識できます。",lost:"位置を見失いました。同じ構図に戻すと放流が再び現れます。"};G.onclick=async()=>{if(d){x("写真に戻りました。");return}const e=new oe({state:t=>{e===d&&(N.textContent=t==="found"?`${i.label}の堤体を認識しました。放流の強さを変更できます。`:U[t],E.textContent=t==="found"?"実景に重ねています":t==="loading"?"カメラ準備中":"景色を照合中")},ready:(t,s)=>{e===d&&(v=t,q.copy(s),W.prepend(t),P.hidden=!0,o.visible=!1,n())},pose:(t,s)=>{if(e===d&&(o.visible=t!==null,t)){const p=R[s];p&&p!==i&&(C(p),A.value=p.id,N.textContent=`${p.label}の堤体を認識しました。放流の強さを変更できます。`),o.matrix.copy(t),o.matrixWorldNeedsUpdate=!0}},fallback:t=>{e===d&&x(t)}},"landscape/dam-views.mind","写真","風景");d=e,A.disabled=!0,G.textContent="写真に戻る",await M,d===e&&e.start()},window.addEventListener("pagehide",()=>x("写真で体験できます。")),l.setAnimationLoop(e=>{if(!a&&!document.hidden){const s=Math.min(.1,(e-r)/1e3);for(m.time.value+=s,z+=s;z>=.06;){z-=.06,g.copyWithin(1,0,g.length-1);const p=Math.min(1,(1.5-y)*6,y*4),k=w+(1.55-w)*p,T=k-g[1];g[0]=Math.abs(T)<.009?k:g[1]+.48*T,m.launchLevel.value+=.1*(k-m.launchLevel.value),y=Math.max(0,y-.06)}j.disabled&&y===0&&(j.disabled=!1,j.textContent="放流の波を送る")}r=e;const t=v?f:S;l.render(b,t),h.update(t,o.matrixWorld,m.aspect.value,{outlet:i.outlet,chute:i.guideChute,wall:i.guideWall},o.visible)})}try{fe()}catch{N.textContent="放流の描画にはWebGL対応ブラウザが必要です。Safariで開き直してください。",A.disabled=j.disabled=G.disabled=V.disabled=F.disabled=!0}
