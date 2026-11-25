import{u as Q,v as X,w as Y,x as Z,a as R,G as ee,c as G,y as O,z as I,J,K,D as te,V as E,W as ae,q as oe,s as re,t as ie,N as ne,A as se}from"./ar-controller-DDlqlueF.js";function le(){const r=new Uint8Array(65536).fill(255);let i=72317;for(const[f,l]of[7,19,47].entries()){const y=new Float32Array(l*l);for(let s=0;s<y.length;s++)i=Math.imul(i,1664525)+1013904223>>>0,y[s]=i/4294967296;const n=(s,v)=>y[v%l*l+s%l];for(let s=0;s<128;s++)for(let v=0;v<128;v++){const p=v*l/128,x=s*l/128,m=Math.floor(p),c=Math.floor(x),b=p-m,a=x-c,d=b*b*(3-2*b),u=a*a*(3-2*a),M=n(m,c)*(1-d)+n(m+1,c)*d,A=n(m,c+1)*(1-d)+n(m+1,c+1)*d;r[(s*128+v)*4+f]=Math.round(255*(M*(1-u)+A*u))}}const o=new Q(r,128,128);return o.wrapS=o.wrapT=X,o.magFilter=Y,o.minFilter=Z,o.generateMipmaps=!0,o.needsUpdate=!0,o}const _=`
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
  mat3 jetFrame(float t, vec3 axis) {
    vec3 tangent = normalize(axisAt(t+.002)-axis);
    vec3 across = normalize(cross(tangent, vec3(0.,0.,1.)));
    return mat3(across,tangent,cross(across,tangent));
  }
  float radiusAt(float t, float level) {
    return (.0052 + sqrt(t)*(.010+.045*level) + t*t*.038*level)
      * smoothstep(0.,.09,level);
  }
  float travel(float t) { return sqrt(t+.04) - time*.34; }
`,ce=_+`
  varying vec2 streamUV;
  varying vec3 viewNormal;
  varying vec3 viewDirection;
  varying float volume;
  void main() {
    float t = uv.y;
    float a = -uv.x * TAU;
    float phase = travel(t)*26.;
    volume = levelAt(t);
    float fold = .075*sin(4.*a + phase) + .045*sin(7.*a - .8*phase)
               + .034*sin(11.*a + 1.5*phase) + .065*sin(.7*phase);
    float radius = radiusAt(t,volume)*(1.+fold);
    vec3 axis = axisAt(t);
    mat3 frame = jetFrame(t,axis);
    vec3 normal = normalize(frame[0]*cos(a) + frame[2]*sin(a)/.86);
    vec3 surface = axis + radius*(frame[0]*cos(a) + frame[2]*.86*sin(a));
    vec4 viewPos = modelViewMatrix * vec4(surface,1.);
    viewNormal = normalize(normalMatrix*normal);
    viewDirection = -viewPos.xyz;
    streamUV = uv;
    gl_Position = projectionMatrix * viewPos;
  }
`,de=`
  uniform float time;
  uniform sampler2D flowMap;
  varying vec2 streamUV;
  varying vec3 viewNormal;
  varying vec3 viewDirection;
  varying float volume;
  void main() {
    if (volume < .005) discard;
    float t = streamUV.y;
    float run = sqrt(t+.04) - time*.34;
    vec2 uv = vec2(streamUV.x, run*2.75);
    vec3 eddy = texture2D(flowMap, uv + vec2(.07, .08*run)).rgb;
    vec2 bend = vec2(.13*(eddy.r-.5) + .026*(eddy.g-.5), .075*(eddy.g-.5));
    vec3 foam = texture2D(flowMap, uv*vec2(3.,1.15) + bend + vec2(.31,.42)).rgb;
    vec3 threads = texture2D(flowMap, uv*vec2(6.,1.7) + 2.*bend + vec2(.16*foam.g,.28)).rgb;

    // Fine streaks fork around the slower eddies. The same filtered breakup
    // supplies small air pockets inside the otherwise continuous foam ribbons.
    vec3 grain = texture2D(flowMap, uv*vec2(9.,3.5) + 2.6*bend + vec2(.12*threads.r,.07*foam.r)).rgb;
    vec3 n = normalize(viewNormal + vec3((foam.r-.5)*.34,(eddy.g-.5)*.19,0.));
    float day = dot(n,normalize(vec3(-.45,.72,.50)))*.5+.5;
    float facing = clamp(dot(n,normalize(viewDirection)),0.,1.);
    float rim = pow(1.-facing,2.);
    float aeration = smoothstep(.04,.9,t)*(.52+.48*min(volume,1.));
    vec3 core = mix(vec3(.035,.18,.23), vec3(.15,.45,.47), day*.74 + eddy.r*.22);
    vec3 water = mix(core, vec3(.46,.72,.72), .56*rim + .16*foam.r);
    float ribbons = .46*foam.r + .26*foam.g + .16*eddy.g + .12*threads.b;
    float lace = 1.-smoothstep(.024,.14,abs(threads.r + .23*(threads.g-.5)-.51));
    float white = smoothstep(.48,.74, ribbons + aeration*.14 + rim*.06);
    float pockets = smoothstep(.28,.72, .57*grain.g + .27*grain.b + .16*threads.g);
    float bubbles = white*(.48 + .43*pockets + .09*lace);
    float filament = 1.-smoothstep(.025,.13,abs(grain.r+.24*(grain.g-.5)-.53));
    bubbles += (1.-bubbles)*filament*smoothstep(.40,.70,ribbons)*(.16+.22*aeration);
    vec3 foamColor = mix(vec3(.68,.83,.82),vec3(.97,.99,.96),.60*day+.40*threads.g);
    water = mix(water,foamColor,bubbles);
    water += vec3(.10,.13,.13)*lace*smoothstep(.52,.83,foam.g)*(.45+.55*day);
    float density = .54 + .29*facing + .13*bubbles;
    gl_FragColor = vec4(water, density*smoothstep(.005,.09,volume)*(1.-smoothstep(.94,1.,t)));
  }
`;function ue(h){const r=new O(1,1,6,96),i=new J;i.index=r.index,i.attributes=r.attributes,i.setAttribute("strand",new K(new Float32Array([.02,.14,.27,.39,.52,.63,.78,.91]),1)),i.instanceCount=8;const o=new I({uniforms:h,side:te,transparent:!0,depthWrite:!1,forceSinglePass:!0,vertexShader:_+`
      attribute float strand;
      varying vec2 sheetUV;
      varying float seed;
      varying float volume;
      void main() {
        float t = uv.y;
        float k = travel(t)*25.;
        float crest = sin(k + strand*31. + 1.15*sin(k*.63+strand*19.));
        float a = TAU*strand + (uv.x-.5)*(.42+.20*crest) + .16*sin(k*.65+strand*13.);
        vec3 axis = axisAt(t);
        mat3 frame = jetFrame(t,axis);
        vec3 radial = frame[0]*cos(a) + .86*frame[2]*sin(a);
        volume = levelAt(t);
        float spread = 1.02 + smoothstep(.015,.43,t)*(.17+.17*crest);
        float r = radiusAt(t,volume)*(spread + .045*sin(k*2.3 + 3.*a) + .08*uv.x);
        sheetUV = uv;
        seed = strand;
        gl_Position = projectionMatrix*modelViewMatrix*vec4(axis + r*radial,1.);
      }`,fragmentShader:`
      uniform float time;
      uniform sampler2D flowMap;
      varying vec2 sheetUV;
      varying float seed;
      varying float volume;
      void main() {
        float t = sheetUV.y;
        float run = sqrt(t+.04)-time*.34;
        vec2 sampleUV = vec2(sheetUV.x*.20 + seed,run*4.2 + seed*5.);
        vec3 waves = texture2D(flowMap,sampleUV).rgb;
        vec3 flecks = texture2D(flowMap,sampleUV*2.4+vec2(waves.r*.17,waves.g*.06)).rgb;
        float edge = 1.-abs(2.*sheetUV.x-1.);
        float coverage = smoothstep(.46,.63,.35*waves.r+.26*waves.g+.19*flecks.g+.20*edge);
        float envelope = smoothstep(.012,.18,t)*(1.-smoothstep(.91,1.,t))*smoothstep(.02,.28,volume);
        float alpha = envelope*coverage*smoothstep(0.,.28,edge)*(.30+.56*flecks.b);
        if (alpha < .012) discard;
        vec3 color = mix(vec3(.53,.75,.77),vec3(.97,.99,.98),.5*waves.g+.5*flecks.b);
        gl_FragColor = vec4(color,alpha);
      }`});return new G(i,o)}function me(h){const r=new O(1,1),i=new J;i.index=r.index,i.attributes=r.attributes;const o=960,f=new Float32Array(o*4);let l=39241;for(let n=0;n<f.length;n++)l=Math.imul(l,1664525)+1013904223>>>0,f[n]=l/4294967296;i.setAttribute("seed",new K(f,4)),i.instanceCount=o;const y=new I({uniforms:h,transparent:!0,depthWrite:!1,vertexShader:_+`
      attribute vec4 seed;
      varying vec2 sprite;
      varying vec2 mistOffset;
      varying float opacity;
      varying float mist;
      void main() {
        mist = step(.77,seed.w);
        float age = fract(seed.x + time*(.69+.72*seed.w));
        float start = .016 + .95*seed.y;
        float t = start + age*(.06+.11*seed.w);
        float level = levelAt(t);
        float radius = radiusAt(t,level);
        vec3 axis = axisAt(t);
        mat3 frame = jetFrame(t,axis);
        vec3 radial = frame[0]*cos(seed.z*TAU) + frame[2]*sin(seed.z*TAU);
        float spread = (.78 + .32*seed.w + age*(1.15+1.45*seed.w));
        vec3 center = axis + radial*radius*spread;
        center.y += level*(.045*age-.077*age*age);
        vec4 eye = modelViewMatrix * vec4(center,1.);
        vec3 drift = frame[1] + radial*(.32+.36*age);
        vec3 velocity = mat3(modelViewMatrix) * drift;
        vec2 along = normalize(velocity.xy-eye.xy*(velocity.z/eye.z)+vec2(.00001,0.));
        vec2 lateral = vec2(along.y,-along.x);
        float size = mix(.00045+.0021*t,.004+.023*t,mist)
                   * (.52+level)*(.68+seed.z*.63)*(.65+age);
        sprite = uv*2.-1.;
        eye.xy += size*length(modelViewMatrix[0].xyz) *
          (lateral*sprite.x + along*sprite.y*mix(2.2+.8*age,1.4,mist));
        mistOffset = seed.yz + age*vec2(.07,.04);
        opacity = smoothstep(.02,.34,level)*sin(age*3.14159)*mix(.82,.25,mist);
        gl_Position = projectionMatrix*eye;
      }`,fragmentShader:`
      uniform sampler2D flowMap;
      varying vec2 sprite;
      varying vec2 mistOffset;
      varying float opacity;
      varying float mist;
      void main() {
        float edge = dot(sprite,sprite);
        if (edge>=1.) discard;
        float cloud = texture2D(flowMap, mistOffset+sprite*.095).g;
        float alpha = opacity*(1.-edge)*(1.-edge)*mix(1.,.28+.95*cloud,mist);
        gl_FragColor = vec4(mix(vec3(.78,.90,.91),vec3(.98,1.,.98),cloud),alpha);
      }`});return new G(i,y)}function fe(h){const r={time:{value:0},flowMap:{value:le()},levels:{value:new Float32Array(32).fill(h)},aspect:{value:1},outlet:{value:new R},chute:{value:new R},jet:{value:new R},launchLevel:{value:h}},i=new ee,o=new G(new O(1,1,40,140),new I({uniforms:r,vertexShader:ce,fragmentShader:de,transparent:!0})),f=ue(r),l=me(r);return o.frustumCulled=f.frustumCulled=l.frustumCulled=!1,f.renderOrder=1,l.renderOrder=2,i.add(o,f,l),{group:i,uniforms:r}}const ve="https://www.pref.kagawa.lg.jp/kasensabo/dam/kabagawa/",B=[{id:"outlet",label:"放流口",title:"水が出ていく場所",body:"目印は斜面へつながる開口部。椛川ダムでは、洪水時に上流の貯水位に応じて常用洪水吐きから流れる量が自然に変わります。",metric:"自然調節",caption:"貯水位に応じて流量が変わる",source:"keikaku/chisui05.html"},{id:"chute",label:"水の通り道",title:"水は斜面を下っていく",body:"開口部から下へ伸びる斜面に注目。ARの水柱は、そこから水が流れ出す様子を立体で見せる演出です。「放流の波を送る」で水の動きを追えます。",metric:"開口部 → 斜面",caption:"立体の水柱で流れを観察",source:"gaiyo/03.html"},{id:"wall",label:"堤体",title:"一時的に水をため、下流を守る",body:"雨が強まると、ダムは流れ込む水の一部をためながら下流へ流します。こうして下流の川の急な増水を抑えます。",metric:"88.5 m",caption:"椛川ダムの堤高",source:"gaiyo/03.html"}];function pe(h){const r=document.querySelector("#guide-anchors"),i=document.querySelector("#dam-guide"),o=document.querySelector("#guide-topics"),f=document.querySelector("#guide-toggle"),l=document.querySelector("#guide-title"),y=document.querySelector("#guide-body"),n=document.querySelector("#guide-metric"),s=document.querySelector("#guide-caption"),v=document.querySelector("#guide-source");let p=!0;const x=new E,m=new E,c=B.map(a=>{const d=document.createElement("button");d.type="button",d.textContent=a.label,d.onclick=()=>b(a),o.append(d);const u=document.createElement("button");u.type="button",u.className="guide-pin",u.setAttribute("aria-label",a.label+"の解説"),u.onclick=()=>b(a);const M=document.createElement("span");return M.className="guide-pin-label",M.textContent=a.label,u.append(M),r.append(u),{topic:a,choice:d,pin:u}});function b(a){l.textContent=a.title,y.textContent=a.body,n.textContent=a.metric,s.textContent=a.caption,v.href=ve+a.source;for(const d of c){const u=String(d.topic===a);d.pin.setAttribute("aria-pressed",u),d.choice.setAttribute("aria-pressed",u)}}return b(B[0]),f.onclick=()=>{p=!p,i.hidden=!p,f.setAttribute("aria-pressed",String(p))},{update(a,d,u,M,A){if(r.hidden=!A||!p,r.hidden)return;const S=h.clientWidth,j=h.clientHeight;for(const{topic:z,pin:k}of c){const[T,e]=M[z.id];x.set(T-.5,(.5-e)/u,0).applyMatrix4(d),m.copy(x).applyMatrix4(a.matrixWorldInverse),x.applyMatrix4(a.matrixWorldInverse).applyMatrix4(a.projectionMatrix);const t=(x.x+1)*S/2,g=(1-x.y)*j/2;if(k.hidden=m.z>=0||!Number.isFinite(t+g)||t<14||t>S-14||g<16||g>j-16,!k.hidden){k.style.setProperty("--left",t.toFixed(1)+"px"),k.style.setProperty("--top",g.toFixed(1)+"px");const w=z.id==="wall";k.classList.toggle("guide-pin-left",t>S-122||w&&t>110)}}}}}const V=document.querySelector("#stage"),C=document.querySelector("#view-picker"),F=document.querySelector("#photo"),ge=document.querySelector("#water"),P=document.querySelector("#strength"),he=document.querySelector("#reading"),W=document.querySelector("#pause"),q=document.querySelector("#surge"),L=document.querySelector("#camera"),H=document.querySelector("#mode"),N=document.querySelector("#status"),D=[{id:"front",label:"正面寄り",file:"dam.jpg",width:1500,height:997,outlet:[.5975,.289],chute:[.21,.442],jet:[.075,.67],guideChute:[.733,.574],guideWall:[.279,.532]},{id:"oblique",label:"斜めから",file:"dam-oblique.jpg",width:700,height:396,outlet:[310/700,146/396],chute:[108/700,234/396],jet:[.102,.66],guideChute:[.567,.728],guideWall:[.289,.57]}];function ye(){const h=pe(V),r=new ae({canvas:ge,alpha:!0,antialias:!0});r.setPixelRatio(Math.min(devicePixelRatio,2));const i=new URLSearchParams(location.search).get("view");let o=D.find(e=>e.id===i)??D[0],f=1;const l=new oe;let y=Number(P.value)/100;const{group:n,uniforms:s}=fe(y);n.matrixAutoUpdate=!1,l.add(n);const v=new re(45,1,.015,10);v.position.z=.82;const p=new ie,x=new ne;let m,c,b=Promise.resolve(),a=!1,d=performance.now();function u(){const e=V.clientWidth,t=V.clientHeight;if(!e||!t)return;r.setSize(e,t,!1);const g=e/t;v.aspect=g;const w=.5/Math.min(g,f);if(v.fov=2*Math.atan(w/v.position.z)*180/Math.PI,v.updateProjectionMatrix(),m){const U=Math.min(e/m.width,t/m.height);p.projectionMatrix.copy(x),p.projectionMatrix.elements[0]*=m.width*U/e,p.projectionMatrix.elements[5]*=m.height*U/t,p.projectionMatrixInverse.copy(p.projectionMatrix).invert()}}function M(e){o=e,s.aspect.value=e.width/e.height,s.outlet.value.set(e.outlet[0],e.outlet[1]),s.chute.value.set(e.chute[0],e.chute[1]),s.jet.value.set(e.jet[0],e.jet[1])}function A(e){M(e),C.value=e.id,F.src=`./landscape/${e.file}`,F.alt=`堤体を${e.label}見た写真。中央付近に放流口がある。`,F.width=e.width,F.height=e.height,f=e.width/e.height,V.style.aspectRatio=String(f),u()}new ResizeObserver(u).observe(V),A(o),C.onchange=()=>{const e=D.find(t=>t.id===C.value);e&&!c&&A(e)};const S=s.levels.value;let j=0,z=0;q.onclick=()=>{a=!1,W.textContent="一時停止",z=1.5,q.disabled=!0,q.textContent="放流中"},P.oninput=()=>{he.value=P.value+"%",y=Number(P.value)/100},W.onclick=()=>{a=!a,W.textContent=a?"再開":"一時停止"};function k(e){const t=c;c=void 0,t&&(b=Promise.allSettled([b,t.stop()]).then(()=>{})),m=void 0,C.disabled=!1,F.hidden=!1,A(o),n.matrix.identity(),n.matrixWorldNeedsUpdate=!0,n.visible=!0,L.textContent="カメラで景色に重ねる",N.textContent=e,H.textContent="写真で体験"}const T={loading:"カメラと画像認識を準備しています。",searching:"見学位置から堤体上端と中央付近の開口部を画面に入れてください。正面寄り・斜めの両方を認識できます。",lost:"位置を見失いました。同じ構図に戻すと放流が再び現れます。"};L.onclick=async()=>{if(c){k("写真に戻りました。");return}const e=new se({state:t=>{e===c&&(N.textContent=t==="found"?`${o.label}の堤体を認識しました。放流の強さを変更できます。`:T[t],H.textContent=t==="found"?"実景に重ねています":t==="loading"?"カメラ準備中":"景色を照合中")},ready:(t,g)=>{e===c&&(m=t,x.copy(g),V.prepend(t),F.hidden=!0,n.visible=!1,u())},pose:(t,g)=>{if(e===c&&(n.visible=t!==null,t)){const w=D[g];w&&w!==o&&(M(w),C.value=w.id,N.textContent=`${w.label}の堤体を認識しました。放流の強さを変更できます。`),n.matrix.copy(t),n.matrixWorldNeedsUpdate=!0}},fallback:t=>{e===c&&k(t)}},"landscape/dam-views.mind","写真","風景");c=e,C.disabled=!0,L.textContent="写真に戻る",await b,c===e&&e.start()},window.addEventListener("pagehide",()=>k("写真で体験できます。")),r.setAnimationLoop(e=>{if(!a&&!document.hidden){const g=Math.min(.1,(e-d)/1e3);for(s.time.value+=g,j+=g;j>=.06;){j-=.06,S.copyWithin(1,0,S.length-1);const w=Math.min(1,(1.5-z)*6,z*4),U=y+(1.55-y)*w,$=U-S[1];S[0]=Math.abs($)<.009?U:S[1]+.48*$,s.launchLevel.value+=.1*(U-s.launchLevel.value),z=Math.max(0,z-.06)}q.disabled&&z===0&&(q.disabled=!1,q.textContent="放流の波を送る")}d=e;const t=m?p:v;r.render(l,t),h.update(t,n.matrixWorld,s.aspect.value,{outlet:o.outlet,chute:o.guideChute,wall:o.guideWall},n.visible)})}try{ye()}catch{N.textContent="放流の描画にはWebGL対応ブラウザが必要です。Safariで開き直してください。",C.disabled=q.disabled=L.disabled=W.disabled=P.disabled=!0}
