import{a as U,G as H,c as $,u as D,v as I,D as N,w as E,x as O,W as J,q as K,s as Q,t as X,y as Y,A as Z}from"./ar-controller-DbavAZS2.js";const _=`
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
`,ee=_+`
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
`,te=`
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
`;function ae(s){const d=new D(1,1),a=new E;a.index=d.index,a.attributes=d.attributes;const r=960,c=new Float32Array(r*4);let u=39241;for(let o=0;o<c.length;o++)u=Math.imul(u,1664525)+1013904223>>>0,c[o]=u/4294967296;a.setAttribute("seed",new O(c,4)),a.instanceCount=r;const i=new I({uniforms:s,transparent:!0,depthWrite:!1,side:N,vertexShader:_+`
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
      }`});return new $(a,i)}function oe(s){const d={time:{value:0},levels:{value:new Float32Array(32).fill(s)},aspect:{value:1},outlet:{value:new U},chute:{value:new U},jet:{value:new U},launchLevel:{value:s}},a=new H,r=new $(new D(1,1,40,140),new I({uniforms:d,vertexShader:ee,fragmentShader:te,side:N})),c=ae(d);return r.frustumCulled=c.frustumCulled=!1,a.add(r,c),{group:a,uniforms:d}}const z=document.querySelector("#stage"),m=document.querySelector("#view-picker"),y=document.querySelector("#photo"),ie=document.querySelector("#water"),M=document.querySelector("#strength"),le=document.querySelector("#reading"),A=document.querySelector("#pause"),h=document.querySelector("#surge"),q=document.querySelector("#camera"),T=document.querySelector("#mode"),C=document.querySelector("#status"),j=[{id:"front",label:"正面寄り",file:"dam.jpg",width:1500,height:997,outlet:[.5975,.289],chute:[.21,.442],jet:[.075,.67]},{id:"oblique",label:"斜めから",file:"dam-oblique.jpg",width:700,height:396,outlet:[310/700,146/396],chute:[108/700,234/396],jet:[.102,.66]}];function ne(){const s=new J({canvas:ie,alpha:!0,antialias:!0});s.setPixelRatio(Math.min(devicePixelRatio,2));const d=new URLSearchParams(location.search).get("view");let a=j.find(e=>e.id===d)??j[0],r=1;const c=new K;let u=Number(M.value)/100;const{group:i,uniforms:o}=oe(u);i.matrixAutoUpdate=!1,c.add(i);const p=new Q(45,1,.015,10);p.position.z=.82;const g=new X,F=new Y;let f,n,P=Promise.resolve(),w=!1,G=performance.now();function k(){const e=z.clientWidth,t=z.clientHeight;if(!e||!t)return;s.setSize(e,t,!1);const v=e/t;p.aspect=v;const l=.5/Math.min(v,r);if(p.fov=2*Math.atan(l/p.position.z)*180/Math.PI,p.updateProjectionMatrix(),f){const S=Math.min(e/f.width,t/f.height);g.projectionMatrix.copy(F),g.projectionMatrix.elements[0]*=f.width*S/e,g.projectionMatrix.elements[5]*=f.height*S/t,g.projectionMatrixInverse.copy(g.projectionMatrix).invert()}}function V(e){a=e,o.aspect.value=e.width/e.height,o.outlet.value.set(e.outlet[0],e.outlet[1]),o.chute.value.set(e.chute[0],e.chute[1]),o.jet.value.set(e.jet[0],e.jet[1])}function W(e){V(e),m.value=e.id,y.src=`./landscape/${e.file}`,y.alt=`堤体を${e.label}見た写真。中央付近に放流口がある。`,y.width=e.width,y.height=e.height,r=e.width/e.height,z.style.aspectRatio=String(r),k()}new ResizeObserver(k).observe(z),W(a),m.onchange=()=>{const e=j.find(t=>t.id===m.value);e&&!n&&W(e)};const b=o.levels.value;let L=0,x=0;h.onclick=()=>{w=!1,A.textContent="一時停止",x=1.5,h.disabled=!0,h.textContent="放流中"},M.oninput=()=>{le.value=M.value+"%",u=Number(M.value)/100},A.onclick=()=>{w=!w,A.textContent=w?"再開":"一時停止"};function R(e){const t=n;n=void 0,t&&(P=Promise.allSettled([P,t.stop()]).then(()=>{})),f=void 0,m.disabled=!1,y.hidden=!1,W(a),i.matrix.identity(),i.matrixWorldNeedsUpdate=!0,i.visible=!0,q.textContent="カメラで景色に重ねる",C.textContent=e,T.textContent="写真で体験"}const B={loading:"カメラと画像認識を準備しています。",searching:"見学位置から堤体上端と中央付近の開口部を画面に入れてください。正面寄り・斜めの両方を認識できます。",lost:"位置を見失いました。同じ構図に戻すと放流が再び現れます。"};q.onclick=async()=>{if(n){R("写真に戻りました。");return}const e=new Z({state:t=>{e===n&&(C.textContent=t==="found"?`${a.label}の堤体を認識しました。放流の強さを変更できます。`:B[t],T.textContent=t==="found"?"実景に重ねています":t==="loading"?"カメラ準備中":"景色を照合中")},ready:(t,v)=>{e===n&&(f=t,F.copy(v),z.prepend(t),y.hidden=!0,i.visible=!1,k())},pose:(t,v)=>{if(e===n&&(i.visible=t!==null,t)){const l=j[v];l&&l!==a&&(V(l),m.value=l.id,C.textContent=`${l.label}の堤体を認識しました。放流の強さを変更できます。`),i.matrix.copy(t),i.matrixWorldNeedsUpdate=!0}},fallback:t=>{e===n&&R(t)}},"landscape/dam-views.mind","写真","風景");n=e,m.disabled=!0,q.textContent="写真に戻る",await P,n===e&&e.start()},window.addEventListener("pagehide",()=>R("写真で体験できます。")),s.setAnimationLoop(e=>{if(!w&&!document.hidden){const t=Math.min(.1,(e-G)/1e3);for(o.time.value+=t,L+=t;L>=.06;){L-=.06,b.copyWithin(1,0,b.length-1);const v=Math.min(1,(1.5-x)*6,x*4),l=u+(1.55-u)*v,S=l-b[1];b[0]=Math.abs(S)<.009?l:b[1]+.48*S,o.launchLevel.value+=.1*(l-o.launchLevel.value),x=Math.max(0,x-.06)}h.disabled&&x===0&&(h.disabled=!1,h.textContent="放流の波を送る")}G=e,s.render(c,f?g:p)})}try{ne()}catch{C.textContent="放流の描画にはWebGL対応ブラウザが必要です。Safariで開き直してください。",m.disabled=h.disabled=q.disabled=A.disabled=M.disabled=!0}
