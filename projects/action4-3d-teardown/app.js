
import * as THREE from './vendor/three.module.js';
import { OrbitControls } from './vendor/OrbitControls.js';
import { RoundedBoxGeometry } from './vendor/RoundedBoxGeometry.js';

/* ===================== 部件工程数据（16 组件） ===================== */
const CAT = {
  structure:{zh:'结构',color:0x3ee6ff,cls:'c-structure'},
  optics   :{zh:'光学',color:0xb98cff,cls:'c-optics'},
  circuit  :{zh:'电路',color:0x46e6a8,cls:'c-circuit'},
  power    :{zh:'能源',color:0xffb24d,cls:'c-power'},
};
const PARTS = [
 {id:'frame', no:'01', cat:'structure', zh:'中框骨架', en:'Mainframe Chassis', sub:'高强度复合骨架',
  desc:'整机承力骨架，前后壳、镜头模组与底部磁吸底座都锁固在它上面，侧壁与密封件共同构成 18 米防水腔体。',
  specs:[['外形尺寸','70.5×44.2×32.8 mm'],['侧壁厚度','1.6 mm'],['主体材质','PC+GF30 / 金属嵌件'],['防护等级','整机深潜 18 m']],
  tags:['承力主体','防水腔体','装配基准'], explode:[0,0,0]},
 {id:'front', no:'02', cat:'structure', zh:'前壳前面板', en:'Front Housing', sub:'一体式前壳',
  desc:'覆盖整机正面的一体式面板，包裹镜头与前屏并承担正面冲击，内侧布有一圈防水压缩泡棉。',
  specs:[['结构工艺','一体注塑成型'],['表面处理','哑光橡胶涂层'],['密封','1.2 mm 压缩泡棉'],['材质','PC+GF30']],
  tags:['一体式前壳','抗冲击','正面密封'], explode:[-1.0,0.7,3.0]},
 {id:'fscreen', no:'03', cat:'optics', zh:'前触控屏', en:'Front Screen', sub:'1.4″ · 320×320',
  desc:'位于镜头一侧的前置自拍取景屏，支持触控与取景构图，表面覆盖防指纹康宁玻璃。',
  specs:[['尺寸','1.4 英寸'],['分辨率','320×320'],['亮度','750 nits'],['盖板','防指纹玻璃']],
  tags:['自拍取景','息屏触控'], explode:[-2.6,1.2,3.4]},
 {id:'lenscap', no:'04', cat:'optics', zh:'镜头保护盖', en:'Lens Cover', sub:'旋入式 · 6 层镀膜',
  desc:'旋入式镜头保护组件，6 层增透镀膜在保护镜片的同时把反光与鬼影压到最低。',
  specs:[['装配方式','螺纹旋入'],['镀膜','6 层增透膜'],['玻璃','高透光钢化'],['硬度','莫氏 7H']],
  tags:['旋入式','6 层镀膜','抗刮'], explode:[2.4,1.9,4.0]},
 {id:'lens', no:'05', cat:'optics', zh:'镜头光学模组', en:'Lens Module', sub:'f/2.8 · 非球面镜组',
  desc:'155° 超广角非球面镜组，大光圈保证暗光进光量，是 1/1.3 英寸大底传感器的成像前级。',
  specs:[['光圈','f / 2.8'],['视场角','155° 超广角'],['镜片','非球面低色散'],['对焦','定焦超焦距']],
  tags:['大光圈','非球面','155°'], explode:[2.9,0.5,3.3]},
 {id:'cmos', no:'06', cat:'optics', zh:'影像传感器板', en:'CMOS Sensor Board', sub:'1/1.3″ CMOS',
  desc:'1/1.3 英寸大底影像传感器及其基板，直接贴合镜组后端，负责把光信号转为电信号并做初步降噪。',
  specs:[['传感器','1/1.3″ CMOS'],['像素','约 10 MP'],['防抖','RockSteady 3.0'],['接口','MIPI CSI']],
  tags:['1/1.3 大底','高感光'], explode:[3.2,-0.6,1.9]},
 {id:'mainboard', no:'07', cat:'circuit', zh:'主控主板', en:'Mainboard', sub:'影像 SoC · M6-V1.0',
  desc:'整机计算核心，影像 SoC、内存与电源管理集中在这块刚挠结合板上，统筹成像、编码与外设。',
  specs:[['板型','刚挠结合 6 层板'],['核心','影像处理 SoC'],['编码','4K / 120 fps'],['工艺','HDI 盲埋孔']],
  tags:['计算核心','4K 编码'], explode:[-0.6,2.7,0.3]},
 {id:'thermal', no:'08', cat:'circuit', zh:'散热模组', en:'Thermal Module', sub:'石墨烯 · 铜箔',
  desc:'石墨烯均热片叠加铜箔，把 SoC 高负载热量快速摊平并导向中框，长时间录制不降频。',
  specs:[['均热材料','石墨烯 38 W/mK'],['导热层','压延铜箔'],['界面','导热凝胶'],['温差控制','≤ 6 ℃']],
  tags:['均热','持续录制'], explode:[-2.3,2.3,0.2]},
 {id:'battery', no:'09', cat:'power', zh:'电池', en:'Battery', sub:'1770 mAh · 6.8 Wh',
  desc:'1770 mAh 低温锂电池，支持快充并在 −20℃ 环境下保持稳定放电，是整机的能量来源。',
  specs:[['容量','1770 mAh'],['能量','6.8 Wh'],['低温工作','−20 ℃'],['快充','PD 快充']],
  tags:['长续航','耐低温','PD 快充'], explode:[-0.6,-3.6,1.2]},
 {id:'bdoor', no:'10', cat:'structure', zh:'电池仓盖', en:'Battery Door', sub:'机械锁扣 · 硅胶圈',
  desc:'底部电池仓门，机械锁扣加硅胶密封圈，在方便换电的同时维持整机深潜级防水。',
  specs:[['锁紧','两段式机械锁扣'],['密封','硅胶 O 型圈'],['材质','PC+GF30'],['寿命','5000 次开合']],
  tags:['可换电','防水锁扣'], explode:[1.9,-3.7,1.7]},
 {id:'rear', no:'11', cat:'structure', zh:'后壳', en:'Rear Housing', sub:'屏幕导槽 · 扬声器开孔',
  desc:'背部一体式壳体，预留后屏导槽与扬声器、麦克风出声孔位，边缘做防水网贴合台阶。',
  specs:[['工艺','一体注塑'],['出声','扬声器导音腔'],['防水','Gore-Tex 透声膜'],['材质','PC+GF30']],
  tags:['一体后壳','透声防水'], explode:[1.0,0.5,-3.2]},
 {id:'rscreen', no:'12', cat:'optics', zh:'后触控屏', en:'Rear Screen', sub:'2.25″ · 360×640',
  desc:'2.25 英寸高刷主屏幕，360×640 分辨率与高亮度让户外取景、参数调整都清晰可见。',
  specs:[['尺寸','2.25 英寸'],['分辨率','360×640'],['刷新率','高刷触屏'],['亮度','户外高亮']],
  tags:['主屏','高刷触控'], explode:[-1.2,-0.3,-4.2]},
 {id:'mount', no:'13', cat:'structure', zh:'磁吸快拆底座', en:'Magnetic Mount', sub:'磁吸 · 双卡点',
  desc:'底部磁吸快拆接口，强磁吸附配合双卡点机械限位，一吸即合、一拧即拆且绝不松脱。',
  specs:[['固定','强磁 + 双卡点'],['接口','快拆标准接口'],['承重','≥ 3 kg'],['材质','不锈钢 + PC']],
  tags:['快拆','磁吸锁定'], explode:[0.2,-4.2,-1.3]},
 {id:'keys', no:'14', cat:'structure', zh:'顶部按键', en:'Top Controls', sub:'录制键 · 红色指示',
  desc:'顶部集成带红色指示环的录制键与拾音开孔，按键为机械微动结构，支持息屏状态下的盲操作。',
  specs:[['录制键','机械微动 + 红色环'],['麦克风','顶部拾音孔'],['操作','息屏快拍'],['按键寿命','10 万次']],
  tags:['盲操作','红色指示','防水按键'], explode:[0.9,2.7,0.7]},
 {id:'audio', no:'15', cat:'circuit', zh:'音频模组', en:'Audio Module', sub:'3 麦克风 · 扬声器',
  desc:'三麦克风阵列配合大音量扬声器，支持立体声收声、风噪压制与回放监听。',
  specs:[['麦克风','3 麦阵列'],['扬声器','高响度单扬'],['降噪','AI 风噪压制'],['防水','透声气密膜']],
  tags:['三麦','风噪压制'], explode:[-4.0,1.4,0.6]},
 {id:'ports', no:'16', cat:'circuit', zh:'接口模组', en:'Port Module', sub:'USB-C · microSD',
  desc:'侧边集成 USB-C 与 microSD 卡槽，盖板内侧带防水胶塞，兼顾快充、数据与扩展存储。',
  specs:[['数据 / 供电','USB Type-C'],['扩展','microSD 卡槽'],['防水','硅胶胶塞'],['其他','麦克风开孔']],
  tags:['USB-C','可扩展'], explode:[4.0,-1.4,0.8]},
];

/* ===================== 材质与程序化建模 ===================== */
const MAT = {
  shell : new THREE.MeshStandardMaterial({color:0x12343e, metalness:.35, roughness:.42}),
  shell2: new THREE.MeshStandardMaterial({color:0x184551, metalness:.4, roughness:.38}),
  dark  : new THREE.MeshStandardMaterial({color:0x0b151a, metalness:.3, roughness:.6}),
  pcb   : new THREE.MeshStandardMaterial({color:0x0e4a38, metalness:.2, roughness:.55}),
  chip  : new THREE.MeshStandardMaterial({color:0x10161b, metalness:.5, roughness:.4}),
  metal : new THREE.MeshStandardMaterial({color:0x9fb6be, metalness:.9, roughness:.28}),
  graphite:new THREE.MeshStandardMaterial({color:0x1b2c32, metalness:.4, roughness:.7}),
  glass : new THREE.MeshStandardMaterial({color:0x0a2630, metalness:.9, roughness:.06, transparent:true, opacity:.9, emissive:0x0c4654, emissiveIntensity:.5}),
  screen: new THREE.MeshStandardMaterial({color:0x06222b, metalness:.2, roughness:.3, emissive:0x27d8ec, emissiveIntensity:.5}),
  screenGlow:new THREE.MeshBasicMaterial({color:0x7df3ff}),
  red   : new THREE.MeshStandardMaterial({color:0x3a0d12, metalness:.4, roughness:.4, emissive:0xff3b4e, emissiveIntensity:.9}),
  label : new THREE.MeshStandardMaterial({color:0xeef4f6, metalness:.1, roughness:.5}),
};
function edgeMat(hex, op=.85){return new THREE.LineBasicMaterial({color:hex, transparent:true, opacity:op});}
// 建实体并叠加发光线框（双层）
function part(geo, mat, edgeHex, edgeOp=.8){
  const g = new THREE.Group();
  const m = new THREE.Mesh(geo, mat);
  g.add(m);
  if(edgeHex!==null){
    const e = new THREE.LineSegments(new THREE.EdgesGeometry(geo, 28), edgeMat(edgeHex, edgeOp));
    g.add(e);
  }
  return g;
}
const RB=(w,h,d,r=0.12,s=4)=>new RoundedBoxGeometry(w,h,d,s,r);
const CY=(rt,rb,h,seg=40)=>new THREE.CylinderGeometry(rt,rb,h,seg);
function zCyl(geo){geo.rotateX(Math.PI/2);return geo;} // 让圆柱轴朝向 +z
function xCyl(geo){geo.rotateZ(Math.PI/2);return geo;} // 让圆柱轴朝向 +x
// 圆角矩形轮廓（asShape=true 为外轮廓，false 为孔洞路径），cx/cy 为中心
function rrect(w,h,r,asShape,cx=0,cy=0){
  const P=asShape?new THREE.Shape():new THREE.Path();
  const x=cx-w/2,y=cy-h/2;
  P.moveTo(x+r,y);P.lineTo(x+w-r,y);P.quadraticCurveTo(x+w,y,x+w,y+r);
  P.lineTo(x+w,y+h-r);P.quadraticCurveTo(x+w,y+h,x+w-r,y+h);
  P.lineTo(x+r,y+h);P.quadraticCurveTo(x,y+h,x,y+h-r);
  P.lineTo(x,y+r);P.quadraticCurveTo(x,y,x+r,y);
  if(!asShape)P.closePath();
  return P;
}
// 带孔洞的挤出面板：holes = [{t:'c',x,y,r} | {t:'r',x,y,w,h,r}]
function panelGeo(w,h,r,depth,holes){
  const sh=rrect(w,h,r,true);
  holes.forEach(ho=>{ if(ho.t==='c'){const p=new THREE.Path();p.absarc(ho.x,ho.y,ho.r,0,Math.PI*2,true);sh.holes.push(p);}
    else sh.holes.push(rrect(ho.w,ho.h,ho.r,false,ho.x,ho.y)); });
  const g=new THREE.ExtrudeGeometry(sh,{depth:depth,bevelEnabled:true,bevelThickness:.03,bevelSize:.035,bevelSegments:2,steps:1});
  g.translate(0,0,-depth/2);
  return g;
}

function buildPart(p){
  const c = CAT[p.cat].color;
  const G = new THREE.Group();
  const add=(o)=>{o.traverse(ch=>{ch.userData.partId=p.id;}); G.add(o); return o;};
  switch(p.id){
    case 'frame':{
      add(part(RB(7.0,4.42,3.28,.42,4), MAT.shell, c,.55));
      // 四角固定柱
      [[-3,-1.7],[3,-1.7],[-3,1.7],[3,1.7]].forEach(([x,y])=>{
        const s=part(zCyl(CY(.16,.16,.5,20)),MAT.metal,c,.4); s.position.set(x,y,0); add(s);
      });
      break;}
    case 'front':{
      const fp=part(panelGeo(6.96,4.38,.32,.34,[
        {t:'c',x:1.7,y:.05,r:1.36},{t:'r',x:-1.95,y:.15,w:1.7,h:2.16,r:.14}]),MAT.shell2,c,.75);
      fp.position.set(0,0,1.52);add(fp);
      const ring=new THREE.Mesh(new THREE.TorusGeometry(1.36,.05,14,56),MAT.metal);ring.position.set(1.7,.05,1.7);add(ring);
      break;}
    case 'fscreen':{
      const b=part(RB(1.52,1.98,.16,.08),MAT.dark,c,.7); b.position.set(-1.95,.15,1.74); add(b);
      const s=part(RB(1.32,1.78,.05,.04),MAT.screen,c,.9); s.position.set(-1.95,.15,1.8); add(s);
      const crossV=new THREE.Mesh(new THREE.BoxGeometry(.02,.6,.01),MAT.screenGlow); crossV.position.set(-1.95,.15,1.84); add(crossV);
      const crossH=new THREE.Mesh(new THREE.BoxGeometry(.5,.02,.01),MAT.screenGlow); crossH.position.set(-1.95,.15,1.84); add(crossH);
      break;}
    case 'lenscap':{
      const ring=new THREE.Mesh(new THREE.TorusGeometry(1.06,.09,18,56),MAT.metal);
      ring.position.set(1.7,.05,1.98); add(ring);
      const gl=part(zCyl(CY(.97,.97,.06,56)),MAT.glass,c,.9); gl.position.set(1.7,.05,1.96); add(gl);
      const ar=new THREE.Mesh(new THREE.TorusGeometry(.72,.025,12,48),new THREE.MeshBasicMaterial({color:0x8ff6ff}));
      ar.position.set(1.7,.05,2.0); add(ar);
      break;}
    case 'lens':{
      const barrel=part(zCyl(CY(.92,1.06,.72,56)),MAT.dark,c,.8); barrel.position.set(1.7,.05,1.5); add(barrel);
      const ring1=new THREE.Mesh(new THREE.TorusGeometry(.9,.06,14,48),MAT.metal); ring1.position.set(1.7,.05,1.82); add(ring1);
      const glass=part(zCyl(CY(.66,.66,.08,48)),MAT.glass,c,.9); glass.position.set(1.7,.05,1.85); add(glass);
      const iris=new THREE.Mesh(new THREE.TorusGeometry(.5,.03,10,40),new THREE.MeshBasicMaterial({color:0xffb24d}));
      iris.position.set(1.7,.05,1.89); add(iris);
      break;}
    case 'cmos':{
      const board=part(RB(1.15,1.15,.16,.05),MAT.pcb,c,.8); board.position.set(1.7,.05,.92); add(board);
      const sensor=new THREE.Mesh(RB(.62,.62,.06,.03),new THREE.MeshStandardMaterial({color:0x140d24,emissive:0x4a2a8a,emissiveIntensity:.6,roughness:.3}));
      sensor.position.set(1.7,.05,1.02); add(sensor);
      break;}
    case 'mainboard':{
      const board=part(RB(2.75,3.05,.14,.04),MAT.pcb,c,.85); board.position.set(-.2,-.25,.18); add(board);
      [[-.8,.5],[.2,.7],[.6,-.6],[-.7,-.8],[.9,.2]].forEach(([x,y],i)=>{
        const chip=part(RB(i===0?.7:.5,i===0?.55:.45,.12,.03),MAT.chip,null); chip.position.set(x,y,.29); add(chip);
      });
      const shield=part(RB(.8,.8,.1,.03),MAT.metal,null,.4); shield.position.set(-.85,-.9,.3); add(shield);
      break;}
    case 'thermal':{
      const sheet=part(RB(2.5,2.9,.07,.04),MAT.graphite,c,.5); sheet.position.set(-.2,-.25,.36); add(sheet);
      for(let i=0;i<9;i++){
        const fin=new THREE.Mesh(new THREE.BoxGeometry(.045,2.7,.5),MAT.metal);
        fin.position.set(-1.25+i*.31,-.25,.62); add(fin);
      }
      break;}
    case 'battery':{
      const cell=part(RB(2.5,3.1,.95,.12),MAT.dark,c,.8); cell.position.set(-.3,-.35,-.4); add(cell);
      const tag=part(RB(2.05,1.35,.04,.03),MAT.label,null); tag.position.set(-.3,-.5,.1); add(tag);
      const stripe=new THREE.Mesh(RB(1.9,.16,.05,.02),new THREE.MeshStandardMaterial({color:0xffb24d,emissive:0xff8a1e,emissiveIntensity:.4}));
      stripe.position.set(-.3,-.05,.12); add(stripe);
      break;}
    case 'bdoor':{
      const door=part(RB(2.95,.3,1.15,.08),MAT.shell2,c,.8); door.position.set(-.3,-2.3,-.25); add(door);
      const latch=new THREE.Mesh(RB(.5,.12,.4,.04),MAT.metal); latch.position.set(1.0,-2.46,-.25); add(latch);
      break;}
    case 'rear':{
      const holes=[{t:'r',x:-.2,y:0,w:3.42,h:4.02,r:.16}];
      for(let i=0;i<5;i++)holes.push({t:'c',x:3.06,y:1.5-i*.34,r:.09});
      const rp=part(panelGeo(6.96,4.38,.32,.3,holes),MAT.shell2,c,.75);
      rp.position.set(0,0,-1.52);add(rp);
      break;}
    case 'rscreen':{
      const b=part(RB(3.15,3.75,.16,.1),MAT.dark,c,.8); b.position.set(-.2,0,-1.74); add(b);
      const s=part(RB(2.92,3.52,.05,.06),MAT.screen,c,.9); s.position.set(-.2,0,-1.81); add(s);
      const bar=new THREE.Mesh(new THREE.BoxGeometry(2.5,.03,.01),MAT.screenGlow); bar.position.set(-.2,1.2,-1.85); add(bar);
      const rec=new THREE.Mesh(new THREE.BoxGeometry(.5,.34,.01),new THREE.MeshBasicMaterial({color:0xff5d6c})); rec.position.set(.95,1.2,-1.85); add(rec);
      break;}
    case 'mount':{
      const base=part(RB(3.3,.5,1.75,.12),MAT.shell2,c,.85); base.position.set(0,-2.5,-.55); add(base);
      [-1.35,1.35].forEach(x=>{
        const claw=part(RB(.45,.7,.7,.06),MAT.metal,c,.6); claw.position.set(x,-2.55,-.55); add(claw);
      });
      const foot=part(RB(2.5,.22,1.0,.08),MAT.dark,c,.5); foot.position.set(0,-2.86,-1.0); add(foot);
      break;}
    case 'keys':{
      const rec=part(CY(.34,.34,.22,36),MAT.red,c,.9); rec.position.set(1.95,2.3,.95); add(rec);
      const ring=new THREE.Mesh(new THREE.TorusGeometry(.36,.045,12,40),new THREE.MeshBasicMaterial({color:0xff4154}));
      ring.rotation.x=Math.PI/2; ring.position.set(1.95,2.42,.95); add(ring);
      const key=part(RB(.95,.16,.36,.05),MAT.shell2,c,.7); key.position.set(-1.7,2.32,.95); add(key);
      break;}
    case 'audio':{
      const bar=part(RB(.18,2.3,.72,.06),MAT.shell2,c,.8); bar.position.set(-3.52,.05,.25); add(bar);
      for(let i=0;i<3;i++){
        const h=part(xCyl(CY(.09,.09,.2,16)),MAT.dark,null); h.position.set(-3.62,.75-i*.7,.25); add(h);
      }
      const spk=part(xCyl(CY(.22,.22,.2,24)),MAT.metal,null,.5); spk.position.set(-3.62,-.9,.25); add(spk);
      break;}
    case 'ports':{
      const mod=part(RB(.22,1.6,.95,.06),MAT.shell2,c,.8); mod.position.set(3.52,-.8,.2); add(mod);
      const usb=part(RB(.12,.36,.52,.04),MAT.dark,null); usb.position.set(3.64,-.35,.25); add(usb);
      const tong=new THREE.Mesh(RB(.02,.2,.3,.02),MAT.metal); tong.position.set(3.7,-.35,.25); add(tong);
      const sd=part(RB(.12,.18,.6,.03),MAT.dark,null); sd.position.set(3.64,-1.1,.25); add(sd);
      break;}
  }
  G.userData.partId=p.id;
  return G;
}

/* ===================== 引擎 ===================== */
const sceneEl=document.getElementById('scene');
const labelsEl=document.getElementById('labels');
const svg=document.getElementById('leaders');
const W=()=>window.innerWidth, H=()=>window.innerHeight;

const renderer=new THREE.WebGLRenderer({antialias:true});
renderer.setPixelRatio(Math.min(devicePixelRatio,1.75));
renderer.setSize(W(),H());
renderer.toneMapping=THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure=1.12;
sceneEl.appendChild(renderer.domElement);

const scene=new THREE.Scene();
scene.fog=new THREE.FogExp2(0x041016,0.018);
const camera=new THREE.PerspectiveCamera(42,W()/H(),.1,200);
const HOME_CAM=new THREE.Vector3(11,6.8,13.5);
camera.position.copy(HOME_CAM);

const controls=new OrbitControls(camera,renderer.domElement);
controls.enableDamping=true; controls.dampingFactor=.08;
controls.minDistance=5; controls.maxDistance=34;
controls.target.set(0,0,0); controls.autoRotateSpeed=1.1;

/* 灯光 */
scene.add(new THREE.AmbientLight(0x4a8fa0,.55));
const key=new THREE.DirectionalLight(0xd8fbff,1.35); key.position.set(9,13,11); scene.add(key);
const rim=new THREE.DirectionalLight(0x2fd2ff,.8); rim.position.set(-10,3,-9); scene.add(rim);
const fill=new THREE.PointLight(0xffb24d,.5,40); fill.position.set(-7,-6,7); scene.add(fill);

/* HUD：竖直雷达环 + 刻度 */
const hud=new THREE.Group();
function ring(r,op){const pts=Array.from({length:128},(_,i)=>{const a=i/128*Math.PI*2;return new THREE.Vector3(Math.cos(a)*r,Math.sin(a)*r,0);});
  return new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(pts),new THREE.LineBasicMaterial({color:0x3ee6ff,transparent:true,opacity:op}));}
hud.add(ring(5.4,.22)); hud.add(ring(6.3,.14)); hud.add(ring(7.2,.09));
const ticks=new THREE.Group();
for(let i=0;i<72;i++){const a=i/72*Math.PI*2,r1=i%6===0?5.7:5.95,r2=6.15;
  const g=new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(Math.cos(a)*r1,Math.sin(a)*r1,0),new THREE.Vector3(Math.cos(a)*r2,Math.sin(a)*r2,0)]);
  ticks.add(new THREE.Line(g,new THREE.LineBasicMaterial({color:0x3ee6ff,transparent:true,opacity:i%6===0?.4:.18})));}
hud.add(ticks);
hud.position.set(0,0,-1.6);
const hud2=hud.clone(); hud2.rotation.y=Math.PI/2; hud2.position.set(-1.6,0,0); hud2.children.forEach(c=>c.material&&(c.material=c.material.clone(),c.material.opacity*=.5));
scene.add(hud,hud2);

/* 地面极坐标栅格 + 星点 */
const polar=new THREE.PolarGridHelper(11,16,10,64,0x3ee6ff,0x1b6a78);
polar.position.y=-3.4; polar.material.transparent=true; polar.material.opacity=.22; scene.add(polar);
const starGeo=new THREE.BufferGeometry();
const sp=[];for(let i=0;i<420;i++){sp.push((Math.random()-.5)*90,(Math.random()-.5)*55,(Math.random()-.5)*90);}
starGeo.setAttribute('position',new THREE.Float32BufferAttribute(sp,3));
scene.add(new THREE.Points(starGeo,new THREE.PointsMaterial({color:0x9feaff,size:.08,transparent:true,opacity:.55})));

/* 组装 16 部件 */
const assembly=new THREE.Group(); scene.add(assembly);
const POM={}; // id -> {part,group,anchor(局部中心),vec,out,label,line,circle,key}
PARTS.forEach(p=>{
  const g=buildPart(p);
  assembly.add(g);
  const box=new THREE.Box3().setFromObject(g);
  const anchor=box.getCenter(new THREE.Vector3());
  const size=box.getSize(new THREE.Vector3());
  const radius=size.length()/2;
  const vec=new THREE.Vector3(...p.explode);
  const out=vec.lengthSq()>0?vec.clone().normalize():new THREE.Vector3(0,1.15,0);
  // 标签
  const lab=document.createElement('div'); lab.className='flab';
  lab.innerHTML=`<span class="lno">${p.no}</span><span class="lzh">${p.zh}</span><span class="lsub">${p.sub}</span>`;
  labelsEl.appendChild(lab);
  POM[p.id]={part:p,group:g,anchor,vec,out,label:lab,key:null,radius};
});

/* 悬浮标签 + 引线 */
function sizeSvg(){svg.setAttribute('width',W());svg.setAttribute('height',H());svg.innerHTML='';
  Object.values(POM).forEach(o=>{o.line=document.createElementNS('http://www.w3.org/2000/svg','line');
    o.line.setAttribute('stroke','#3ee6ff');o.line.setAttribute('stroke-width','1');o.line.setAttribute('stroke-dasharray','3 4');o.line.setAttribute('opacity','.7');
    o.circle=document.createElementNS('http://www.w3.org/2000/svg','circle');o.circle.setAttribute('r','2.6');o.circle.setAttribute('fill','#7df3ff');
    svg.appendChild(o.line);svg.appendChild(o.circle);});}
sizeSvg();
const _v=new THREE.Vector3(),_lw=new THREE.Vector3();
function updateLabels(){
  const showAll=explode>0.18;
  Object.values(POM).forEach(o=>{
    _v.copy(o.anchor); o.group.localToWorld(_v);           // 部件当前世界锚点
    const behind=_v.project(camera).z>1;
    const active=showAll||o.part.id===selectedId||o.part.id===hoverId;
    if(behind||!active){o.label.classList.remove('on');o.line.setAttribute('opacity','0');o.circle.setAttribute('opacity','0');return;}
    const ax=( _v.x*.5+.5)*W(), ay=(-_v.y*.5+.5)*H();
    _lw.copy(_v);                                            // project 会改 _v，重算
    // 标签世界点：锚点 + 外方向
    o.group.localToWorld(_lw.copy(o.anchor));
    const world=_lw.clone().add(o.out.clone().multiplyScalar(1.05));
    const pv=world.project(camera);
    let lx=(pv.x*.5+.5)*W(), ly=(-pv.y*.5+.5)*H()-8;
    lx=Math.max(70,Math.min(W()-70,lx)); ly=Math.max(34,Math.min(H()-20,ly));
    o.label.style.left=lx+'px'; o.label.style.top=ly+'px';
    o.label.classList.add('on');
    o.label.classList.toggle('hot',o.part.id===selectedId);
    o.line.setAttribute('x1',ax);o.line.setAttribute('y1',ay);o.line.setAttribute('x2',lx);o.line.setAttribute('y2',ly+16);
    o.line.setAttribute('opacity',o.part.id===selectedId?'1':'.55');
    o.circle.setAttribute('cx',ax);o.circle.setAttribute('cy',ay);o.circle.setAttribute('opacity','.9');
  });
}

/* 状态与动画 */
let explode=0, targetExplode=0, selectedId=null, hoverId=null, autoRot=false;
let camAnim=null;
function tweenCam(toPos,toTgt,dur=700){
  controls.enabled=false;
  camAnim={t0:performance.now(),dur,fp:camera.position.clone(),tp:toPos.clone(),ft:controls.target.clone(),tt:toTgt.clone()};}
const collapsed=new Set();
function applyExplode(e){Object.values(POM).forEach(o=>o.group.position.copy(o.vec).multiplyScalar(collapsed.has(o.part.id)?0:e));}
function refreshHL(){
  Object.values(POM).forEach(o=>{
    const want=o.part.id===selectedId?'sel':(o.part.id===hoverId?'hov':null);
    if(want===o.key)return; o.key=want;
    const hex=CAT[o.part.cat].color;
    o.group.traverse(m=>{
      if(m.isMesh){
        if(want){if(!m.userData._om)m.userData._om=m.material;const c=m.userData._om.clone();
          if(c.emissive){c.emissive.setHex(hex);c.emissiveIntensity=want==='sel'?.38:.18;}m.material=c;}
        else if(m.userData._om)m.material=m.userData._om;
      } else if(m.isLineSegments){
        if(want){if(m.userData._oc==null){m.userData._oc=m.material.color.getHex();m.userData._oo=m.material.opacity;}
          m.material.color.setHex(want==='sel'?0xffffff:hex);m.material.opacity=1;}
        else if(m.userData._oc!=null){m.material.color.setHex(m.userData._oc);m.material.opacity=m.userData._oo;}
      }
      });
  });
}
function focusId(id,dist){
  const o=POM[id]; if(!o)return;
  _v.copy(o.anchor);o.group.localToWorld(_v);
  const d=dist??Math.max(6.2,(o.radius||1.5)*4.8);
  const dir=camera.position.clone().sub(controls.target);if(dir.lengthSq()<1e-4)dir.set(1,.6,1);dir.normalize();
  tweenCam(_v.clone().add(dir.multiplyScalar(d)),_v.clone(),700);
}

/* 射线拾取 */
const ray=new THREE.Raycaster(),ptr=new THREE.Vector2();
let downXY=null;
function pick(cx,cy){ptr.set(cx/W()*2-1,-(cy/H())*2+1);ray.setFromCamera(ptr,camera);
  const hits=ray.intersectObjects(assembly.children,true);
  for(const h of hits){let id=h.object.userData.partId;if(id)return id;}return null;}
renderer.domElement.addEventListener('pointerdown',e=>downXY=[e.clientX,e.clientY]);
renderer.domElement.addEventListener('pointerup',e=>{
  if(!downXY)return;const d=Math.hypot(e.clientX-downXY[0],e.clientY-downXY[1]);downXY=null;
  if(d<6){const id=pick(e.clientX,e.clientY);if(id)selectById(id);}
});
renderer.domElement.addEventListener('pointermove',e=>{
  if(downXY)return;const id=pick(e.clientX,e.clientY);hoverId=id;refreshHL();
  renderer.domElement.style.cursor=id?'pointer':'grab';
});

/* 对外接口 */
function selectById(id){selectedId=id;refreshHL();focusId(id);if(engine._cb)engine._cb(id);
  document.getElementById('stMode').textContent='部件 '+(POM[id]?POM[id].part.no:'');}
const engine={
  _cb:null,onSelect(cb){this._cb=cb;},
  select(id){selectById(id);},
  setExplode(v){targetExplode=v;document.getElementById('explodeRange').value=Math.round(v*100);},
  explodeAll(){targetExplode=targetExplode>.5?0:1;document.getElementById('explodeRange').value=Math.round(targetExplode*100);},
  reset(){targetExplode=0;collapsed.clear();document.getElementById('explodeRange').value=0;selectedId=null;hoverId=null;refreshHL();tweenCam(HOME_CAM,new THREE.Vector3(0,0,0));
    if(engine._cb)engine._cb(null);document.getElementById('stMode').textContent='装配';},
  toggleCollapse(id){if(collapsed.has(id))collapsed.delete(id);else collapsed.add(id);return collapsed.has(id);},
  toggleRotate(){autoRot=!autoRot;controls.autoRotate=autoRot;return autoRot;},
  views:[new THREE.Vector3(0,1.5,14),new THREE.Vector3(0,1.5,-14),new THREE.Vector3(14,1.2,0),HOME_CAM],vi:0,
  cycleView(){const v=this.views[this.vi++%this.views.length];tweenCam(v,new THREE.Vector3(0,0,0));},
};

/* 主循环 */
let last=performance.now(),frames=0,fpsT=last;
function tick(now){
  requestAnimationFrame(tick);
  const dt=now-last;last=now;
  explode+=(targetExplode-explode)*Math.min(1,dt/140);
  if(Math.abs(targetExplode-explode)<.0015)explode=targetExplode;
  applyExplode(explode);
  hud.rotation.z+=dt*.00002;ticks.rotation.z-=dt*.00005;hud2.rotation.z-=dt*.00002;
  if(camAnim){const k=Math.min(1,(now-camAnim.t0)/camAnim.dur),e=1-Math.pow(1-k,3);
    camera.position.lerpVectors(camAnim.fp,camAnim.tp,e);controls.target.lerpVectors(camAnim.ft,camAnim.tt,e);
    if(k>=1){camAnim=null;controls.enabled=true;controls.update();}}
  controls.update();
  updateLabels();
  renderer.render(scene,camera);
  if(!window.__firstFrame){window.__firstFrame=1;const l=document.getElementById('loader');l&&l.classList.add('off');}
  frames++;if(now-fpsT>500){document.getElementById('stFps').textContent=Math.round(frames*1000/(now-fpsT));frames=0;fpsT=now;}
  document.getElementById('stExplode').textContent=Math.round(explode*100)+'%';
  document.getElementById('stMode').textContent=selectedId?('部件 '+POM[selectedId].part.no):(explode>.05?'拆解':'装配');
}
requestAnimationFrame(tick);
window.addEventListener('resize',()=>{camera.aspect=W()/H();camera.updateProjectionMatrix();renderer.setSize(W(),H());sizeSvg();});

/* ===================== UI 层 ===================== */
const hexCss=h=>'#'+h.toString(16).padStart(6,'0');
const listEl=document.getElementById('partsList');
const specEl=document.getElementById('specPanel');
let curFilter='all';

function renderList(){
  listEl.innerHTML='';
  PARTS.forEach(p=>{
    const row=document.createElement('div');
    row.className='pitem'; row.dataset.id=p.id;
    row.innerHTML=`<span class="idx">${p.no}</span>
      <span style="min-width:0"><span class="nm">${p.zh}</span><span class="en">${p.en}</span></span>
      <span class="led ${CAT[p.cat].cls}"></span>`;
    row.style.display=(curFilter==='all'||p.cat===curFilter)?'flex':'none';
    row.addEventListener('click',()=>engine.select(p.id));
    listEl.appendChild(row);
  });
  syncListActive();
}
function syncListActive(){
  listEl.querySelectorAll('.pitem').forEach(r=>r.classList.toggle('sel',r.dataset.id===selectedId));
}
function renderSpec(id){
  if(!id){
    specEl.innerHTML=`<div class="phead"><span class="zh">参数说明</span><span class="en">/ SPECS</span><span class="cnt">STANDBY</span></div>
      <div class="spec-body">
        <span class="cat-chip"><span class="d"></span>STRUCTURE EXPLORER</span>
        <div class="spec-title" style="font-size:21px">交互式结构探索器</div>
        <div class="spec-en">Select A Component</div>
        <div class="spec-desc">拖拽旋转整机、滚轮缩放；点击 3D 模型或左侧清单中的任意部件，可查看其结构与规格并自动聚焦。使用底部「全部拆解」可将 16 个组件沿装配方向展开。</div>
        <div class="tags"><span class="tag">拖拽旋转</span><span class="tag">滚轮缩放</span><span class="tag">点击选中</span><span class="tag">爆炸拆解</span></div>
        <button class="sbtn primary" style="margin-top:16px" onclick="document.getElementById('btnExplode').click()">全部拆解 16 组件</button>
      </div>`;
    return;
  }
  const p=PARTS.find(x=>x.id===id),c=CAT[p.cat];
  specEl.innerHTML=`<div class="phead"><span class="zh">参数说明</span><span class="en">/ SPECS</span><span class="cnt">PART ${p.no}</span></div>
    <div class="spec-body">
      <span class="cat-chip" style="color:${hexCss(c.color)};border-color:${hexCss(c.color)}55"><span class="d" style="background:${hexCss(c.color)};box-shadow:0 0 7px ${hexCss(c.color)}"></span>${c.zh} / STRUCTURE</span>
      <span class="part-no">${p.no} / 16</span>
      <div class="spec-title">${p.zh}</div>
      <div class="spec-en">${p.en}</div>
      <div class="spec-desc">${p.desc}</div>
      <div class="spec-grid">${p.specs.map(([k,v])=>`<div class="spec-cell"><div class="k">${k}</div><div class="v">${v}</div></div>`).join('')}</div>
      <div class="tags">${p.tags.map(t=>`<span class="tag">${t}</span>`).join('')}</div>
      <div class="spec-status"><span>材料体系</span><b id="specState">装配就位</b></div>
      <button class="sbtn ghost" id="btnFocus">聚焦此部件</button>
      <button class="sbtn primary" id="btnCollapse">收起该部件</button>
    </div>`;
  document.getElementById('btnFocus').onclick=()=>focusId(id);
  const bc=document.getElementById('btnCollapse');
  bc.onclick=()=>{const isC=engine.toggleCollapse(id);bc.textContent=isC?'展开该部件':'收起该部件';
    document.getElementById('specState').textContent=isC?'已收起':'装配就位';};
}
engine.onSelect(id=>{syncListActive();renderSpec(id);});

/* 分类 tabs */
document.querySelectorAll('#tabs .tab').forEach(t=>t.addEventListener('click',()=>{
  document.querySelectorAll('#tabs .tab').forEach(x=>x.classList.remove('on'));
  t.classList.add('on');curFilter=t.dataset.cat;renderList();
}));

/* 工具栏 */
const btnE=document.getElementById('btnExplode');
btnE.onclick=()=>{engine.explodeAll();};
document.getElementById('btnReset').onclick=()=>engine.reset();
const btnR=document.getElementById('btnRotate');
btnR.onclick=()=>btnR.classList.toggle('on',engine.toggleRotate());
document.getElementById('btnView').onclick=()=>engine.cycleView();
document.getElementById('explodeRange').addEventListener('input',e=>{targetExplode=e.target.value/100;});
setInterval(()=>{const on=targetExplode>.5;btnE.classList.toggle('on',on);
  btnE.lastChild.textContent=on?'  组装复位':' 全部拆解';},200);

/* 引导模式 */
const guideEl=document.getElementById('guide');let gi=0;
function showStep(i){const p=PARTS[i];
  engine.setExplode(.62);engine.select(p.id);focusId(p.id,6);
  document.getElementById('gStep').textContent=`STEP ${p.no} / 16`;
  document.getElementById('gTitle').textContent=`${p.no} · ${p.zh}`;
  document.getElementById('gDesc').textContent=p.desc;
  document.getElementById('gProg').style.width=((i+1)/16*100)+'%';
  document.getElementById('gNext').textContent=i===15?'完成拆解':'下一步';
}
document.getElementById('btnGuide').onclick=()=>{guideEl.classList.add('on');gi=0;showStep(gi);};
document.getElementById('gNext').onclick=()=>{if(gi<15){gi++;showStep(gi);}else{guideEl.classList.remove('on');engine.setExplode(1);}};
document.getElementById('gSkip').onclick=()=>guideEl.classList.remove('on');

/* 启动 */
renderList();renderSpec(null);
const hint=document.getElementById('dragHint');
setTimeout(()=>{hint.style.opacity='1';setTimeout(()=>hint.style.opacity='0',3600);},700);
renderer.domElement.addEventListener('pointerdown',()=>hint.style.opacity='0',{once:true});
window.__engReady=true;
window.addEventListener('error',e=>{if(window.__firstFrame)return;const s=document.querySelector('#loader .s');
  if(s)s.textContent='引擎加载失败：'+(e.message||'本地 ES 模块被拦截')+' —— 请使用在线部署链接访问';});
setTimeout(()=>{if(!window.__firstFrame){const s=document.querySelector('#loader .s');
  if(s)s.textContent='本地模块装载耗时较长…若持续如此，请使用在线部署链接访问';}},4000);
/* 兜底：无论首帧回调是否被后台标签节流，3.5s 后强制隐藏 loader，避免全屏遮罩拦截指针 */
setTimeout(()=>{const l=document.getElementById('loader');if(l)l.classList.add('off');},3500);
