import{G as I,c as L,u as F,v as G,D as U,w as N,x as _,W as B,q as V,s as D,t as H,y as E,A as O}from"./ar-controller-Ms-ziwT7.js";const R=`
  uniform float time;
  uniform float levels[32];
  uniform float aspect;
  uniform float launchLevel;
  const float TAU = 6.2831853;
  float levelAt(float t) {
    float i = 29. * sqrt(clamp(t, 0., 1.));
    int k = int(i);
    return mix(levels[k], levels[k+1], fract(i));
  }
  vec3 axisAt(float t) {
    float force = smoothstep(.24, .96, launchLevel);
    float bow = sin(3.14159*t);
    float x = .0975 + t*mix(.210,.075,force) + .045*bow*force;
    float y = (.211 - mix(.442*t, .17*t + .50*t*t, force)) / aspect;
    float z = (.009 + .29*force)*t + .095*force*bow;
    return vec3(x,y,z);
  }
  float radiusAt(float t, float level) {
    return (.0052 + sqrt(t)*(.010+.045*level) + t*t*.038*level)
      * smoothstep(0.,.09,level);
  }
  float rolling(float t) { return sqrt(t+.025)*24. - time*14.; }
`,J=R+`
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
`,K=`
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
`;function Q(l){const c=new F(1,1),o=new N;o.index=c.index,o.attributes=c.attributes;const n=960,a=new Float32Array(n*4);let i=39241;for(let r=0;r<a.length;r++)i=Math.imul(i,1664525)+1013904223>>>0,a[r]=i/4294967296;o.setAttribute("seed",new _(a,4)),o.instanceCount=n;const d=new G({uniforms:l,transparent:!0,depthWrite:!1,side:U,vertexShader:R+`
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
      }`});return new L(o,d)}function X(l,c){const o={time:{value:0},levels:{value:new Float32Array(32).fill(c)},aspect:{value:l},launchLevel:{value:c}},n=new I,a=new L(new F(1,1,40,140),new G({uniforms:o,vertexShader:J,fragmentShader:K,side:U})),i=Q(o);return a.frustumCulled=i.frustumCulled=!1,n.add(a,i),{group:n,uniforms:o}}const b=document.querySelector("#stage"),k=document.querySelector("#photo"),Y=document.querySelector("#water"),y=document.querySelector("#strength"),Z=document.querySelector("#reading"),z=document.querySelector("#pause"),u=document.querySelector("#surge"),M=document.querySelector("#camera"),W=document.querySelector("#mode"),q=document.querySelector("#status");function $(){const l=new B({canvas:Y,alpha:!0,antialias:!0});l.setPixelRatio(Math.min(devicePixelRatio,2));const c=1500/997,o=new V;let n=Number(y.value)/100;const{group:a,uniforms:i}=X(c,n);a.matrixAutoUpdate=!1,o.add(a);const d=new D(45,1,.015,10);d.position.z=.82;const r=new H,P=new E;let f,s,A=Promise.resolve(),p=!1,j=performance.now();function w(){const t=b.clientWidth,e=b.clientHeight;if(!t||!e)return;l.setSize(t,e,!1);const m=t/e;d.aspect=m;const g=.5/Math.min(m,c);if(d.fov=2*Math.atan(g/d.position.z)*180/Math.PI,d.updateProjectionMatrix(),f){const x=Math.min(t/f.width,e/f.height);r.projectionMatrix.copy(P),r.projectionMatrix.elements[0]*=f.width*x/t,r.projectionMatrix.elements[5]*=f.height*x/e,r.projectionMatrixInverse.copy(r.projectionMatrix).invert()}}new ResizeObserver(w).observe(b),w();const h=i.levels.value;let S=0,v=0;u.onclick=()=>{p=!1,z.textContent="一時停止",v=1.5,u.disabled=!0,u.textContent="放流中"},y.oninput=()=>{Z.value=y.value+"%",n=Number(y.value)/100},z.onclick=()=>{p=!p,z.textContent=p?"再開":"一時停止"};function C(t){const e=s;s=void 0,e&&(A=Promise.allSettled([A,e.stop()]).then(()=>{})),f=void 0,k.hidden=!1,a.matrix.identity(),a.matrixWorldNeedsUpdate=!0,a.visible=!0,M.textContent="カメラで景色に重ねる",q.textContent=t,W.textContent="写真で体験",w()}const T={loading:"カメラと画像認識を準備しています。",searching:"写真と同じ見学位置から、堤体上端と中央の開口部を画面に入れてください。横向きにすると構図を合わせやすくなります。",found:"堤体を認識しました。スライダーで仮想の放流を変えられます。",lost:"位置を見失いました。同じ構図に戻すと放流が再び現れます。"};M.onclick=async()=>{if(s){C("写真に戻りました。");return}const t=new O({state:e=>{t===s&&(q.textContent=T[e],W.textContent=e==="found"?"実景に重ねています":e==="loading"?"カメラ準備中":"景色を照合中")},ready:(e,m)=>{t===s&&(f=e,P.copy(m),b.prepend(e),k.hidden=!0,a.visible=!1,w())},pose:e=>{t===s&&(a.visible=e!==null,e&&(a.matrix.copy(e),a.matrixWorldNeedsUpdate=!0))},fallback:e=>{t===s&&C(e)}},"landscape/dam.mind","写真","風景");s=t,M.textContent="写真に戻る",await A,s===t&&t.start()},window.addEventListener("pagehide",()=>C("写真で体験できます。")),l.setAnimationLoop(t=>{if(!p&&!document.hidden){const e=Math.min(.1,(t-j)/1e3);for(i.time.value+=e,S+=e;S>=.06;){S-=.06,h.copyWithin(1,0,h.length-1);const m=Math.min(1,(1.5-v)*6,v*4),g=n+(1.55-n)*m,x=g-h[1];h[0]=Math.abs(x)<.009?g:h[1]+.48*x,i.launchLevel.value+=.1*(g-i.launchLevel.value),v=Math.max(0,v-.06)}u.disabled&&v===0&&(u.disabled=!1,u.textContent="放流の波を送る")}j=t,l.render(o,f?r:d)})}try{$()}catch{q.textContent="放流の描画にはWebGL対応ブラウザが必要です。Safariで開き直してください。",u.disabled=M.disabled=z.disabled=y.disabled=!0}
