
import * as THREE from './vendor/three.module.js';
import { OrbitControls } from './vendor/OrbitControls.js';

/* =====================================================================
 * ETA 2824-2 自动机芯 · 参数化复刻 (Parameterized Caliber Replica)
 * 建模约定：
 *  - 所有轮系位于 XY 平面，轮轴朝向 +Z（ExtrudeGeometry 默认挤出方向）
 *  - 单一单位源：布局只使用分度圆半径 r = m*z/2，Mesh 恒不缩放
 *  - 传动链先行：轴距 = 主动轮分度圆半径 + 从动齿轴分度圆半径；
 *    角速度沿链递推，啮合对取负号、同轴件同速
 *  - 齿数为运动学反推的复原值（ETA 不公开官方齿数），
 *    约束：中心轮 1r/h → 过轮 8 → 秒轮 60 → 擒纵轮 720 r/h，
 *    720 × 2 × 20(擒纵齿) = 28,800 vph，与官方摆频严格闭合
 * ===================================================================== */

/* ===================== 分类与部件数据（15 组件） ===================== */
const CAT = {
  structure :{zh:'结构',color:0x3ee6ff,cls:'c-structure'},
  power     :{zh:'动力',color:0xffb24d,cls:'c-power'},
  train     :{zh:'传动',color:0x46e6a8,cls:'c-train'},
  escape    :{zh:'擒纵',color:0xb98cff,cls:'c-escape'},
  regulation:{zh:'调速',color:0xff5d6c,cls:'c-regulation'},
  winding   :{zh:'自动',color:0xe8d487,cls:'c-winding'},
};

const PARTS = [
 {id:'mainplate', no:'01', cat:'structure', zh:'主夹板', en:'Main Plate', sub:'镀铑黄铜 · 机芯基座',
  desc:'ETA 2824-2 的装配基准（原厂件号 100），直径 25.60 mm（11½ 法分）。轮系、条盒与桥板全部固定其上，重要轴承位均镶嵌宝石。',
  specs:[['机芯直径','25.60 mm'],['机芯厚度','4.60 mm'],['材质','镀铑黄铜'],['基座钻位','含全套宝石孔']],
  tags:['装配基准','11½ 法分','日内瓦纹'], explode:[0,-.7,-3.4], z0:-.35},
 {id:'jewels', no:'02', cat:'structure', zh:'宝石轴承组', en:'Ruby Jewel Bearings', sub:'合成红宝石 · 25 钻',
  desc:'25 钻版本在传动轮系、擒纵、摆轮与自动模组的全部关键枢轴上镶嵌合成红宝石（莫氏 9 级），把枢尖摩擦与磨损降到极低。',
  specs:[['钻数','25 钻'],['材料','合成红宝石'],['硬度','莫氏 9 级'],['自动模组','含 4 钻']],
  tags:['25 钻','低摩擦','长寿命'], explode:[0,0,2.2], z0:.02},
 {id:'barrelBridge', no:'03', cat:'structure', zh:'条夹板', en:'Barrel Bridge', sub:'原厂件号 105',
  desc:'横跨发条盒与中心轮的桥板，蓝钢螺丝锁固在主夹板上，约束两根轮轴的轴向间隙，保证条盒轮与中心齿轴啮合深度恒定。',
  specs:[['原厂件号','105'],['覆盖','条盒 / 中心轮'],['固定','蓝钢螺丝'],['材质','镀铑黄铜']],
  tags:['桥板','轴向限位'], explode:[-1,-.6,3.6], z0:.46},
 {id:'trainBridge', no:'04', cat:'structure', zh:'轮夹板', en:'Train Wheel Bridge', sub:'原厂件号 110 · 带钻',
  desc:'承载过轮与秒轮枢轴的桥板（25 钻版本带宝石轴承），与条夹板共同保证传动轮系运转不跳齿。',
  specs:[['原厂件号','110'],['覆盖','过轮 / 秒轮'],['版本','带钻版'],['材质','镀铑黄铜']],
  tags:['轮系桥板','啮合稳定'], explode:[.8,.9,4.4], z0:.52},
 {id:'balanceCock', no:'05', cat:'structure', zh:'摆夹板', en:'Balance Cock', sub:'Incabloc 防震 · ETACHRON',
  desc:'固定摆轮上枢轴的悬臂桥板，末端是 Incabloc 防震器端石组件，并集成 ETACHRON 快慢微调机构与游丝外桩固定座。',
  specs:[['防震器','Incabloc'],['微调','ETACHRON'],['端石','红宝石 + 防震簧'],['材质','镀铑黄铜']],
  tags:['防震器','ETACHRON'], explode:[-1.4,1.1,5.2], z0:.66},
 {id:'barrel', no:'06', cat:'power', zh:'发条盒（条盒轮）', en:'Mainspring Barrel', sub:'96 齿 · 原厂件号 182',
  desc:'内含主发条的动力源，盒缘本身是 96 齿的条盒轮。满链后约 8 小时转一圈，38 小时官方储能对应约 4.75 圈释放。',
  specs:[['条盒轮齿','96 齿'],['官方储能','38 h'],['典型储能','42 h'],['驱动比','96 / 12 = 8 : 1']],
  tags:['动力源','38h 储能'], explode:[-.9,-.9,1.6], z0:.08},
 {id:'center', no:'07', cat:'train', zh:'中心轮（二轮）', en:'Center Wheel', sub:'80 齿 · 齿轴 12 叶',
  desc:'轮系第一级从动轮，条盒轮经 12 叶齿轴驱动，每小时精确转一圈，是分针与整套指针轮系的时间基准。',
  specs:[['轮齿','80 齿'],['齿轴','12 叶'],['转速','1 圈 / 小时'],['级传动比','8 : 1']],
  tags:['时间基准','分针驱动'], explode:[.5,-.5,2.2], z0:.14},
 {id:'third', no:'08', cat:'train', zh:'过轮（三轮）', en:'Third Wheel', sub:'75 齿 · 齿轴 10 叶',
  desc:'中间换向轮，把中心轮的力矩增速 8 倍后传给秒轮，自身每小时转 8 圈，五辐镂空兼顾刚度与低惯量。',
  specs:[['轮齿','75 齿'],['齿轴','10 叶'],['转速','8 圈 / 小时'],['级传动比','8 : 1']],
  tags:['中间换向','8 r/h'], explode:[.9,.7,2.8], z0:.14},
 {id:'fourth', no:'09', cat:'train', zh:'秒轮（四轮）', en:'Fourth Wheel', sub:'72 齿 · 齿轴 10 叶',
  desc:'轮系末端传动轮，每分钟精确转一圈，轴端安装中央秒针（2824-2 为直接中央秒针结构 SCD）。',
  specs:[['轮齿','72 齿'],['齿轴','10 叶'],['转速','1 圈 / 分钟'],['级传动比','7.5 : 1']],
  tags:['中央秒针','60 r/h'], explode:[-.7,.9,3.4], z0:.14},
 {id:'escape', no:'10', cat:'escape', zh:'擒纵轮', en:'Escape Wheel', sub:'20 尖齿 · 钢制',
  desc:'快摆机型的钢制擒纵轮，20 个尖齿每小时转 720 圈；与擒纵叉配合把连续转动切成 28,800 次/小时的步进脉冲。',
  specs:[['轮齿','20 尖齿'],['齿轴','6 叶'],['转速','720 圈 / 小时'],['级传动比','12 : 1']],
  tags:['28800 vph','尖齿式'], explode:[-1.3,.9,4.0], z0:.16},
 {id:'pallet', no:'11', cat:'escape', zh:'擒纵叉（马仔）', en:'Pallet Fork', sub:'瑞士杠杆擒纵 · 升角 50°',
  desc:'瑞士杠杆擒纵的核心，两颗红宝石叉瓦周期性锁接擒纵轮，每个半摆频放行半个齿距，并把冲击脉冲传回摆轮。',
  specs:[['擒纵类型','瑞士杠杆式'],['叉瓦','红宝石 ×2'],['升角','50°'],['摆频','4 Hz 往复']],
  tags:['杠杆擒纵','机械开关'], explode:[-1.5,.3,4.6], z0:.36},
 {id:'balance', no:'12', cat:'regulation', zh:'摆轮', en:'Balance Wheel', sub:'Glucydur · 28800 vph',
  desc:'机芯的时间基准。高级版本采用 Glucydur 铍铜环形摆轮，以 4 Hz 固定频率往复摆动，Incabloc 防震器保护脆弱枢尖。',
  specs:[['摆频','28800 vph / 4 Hz'],['升角','50°'],['材质','Glucydur 铍铜'],['防震','Incabloc']],
  tags:['时间基准','等时振荡'], explode:[.9,1.2,5.2], z0:.62},
 {id:'hairspring', no:'13', cat:'regulation', zh:'游丝', en:'Hairspring', sub:'Nivarox · 平面螺线',
  desc:'Nivarox 合金平面游丝，摆轮偏转后靠其回复力矩回到平衡位置；ETACHRON 微调通过改变游丝有效长度调节走时快慢。',
  specs:[['材质','Nivarox 合金'],['线型','阿基米德螺线'],['调节','ETACHRON 快慢针'],['频率','4 Hz 共振']],
  tags:['回复力矩','快慢调节'], explode:[1.0,1.3,5.9], z0:.86},
 {id:'reverser', no:'14', cat:'winding', zh:'自动换向轮组', en:'Reversing Wheels', sub:'双换向轮 · 棘轮离合',
  desc:'自动模组的两个换向轮内置棘轮离合：无论自动陀往哪个方向转，总有一个轮空程、另一个啮合，使上链方向始终一致；手动上链时自动脱开。',
  specs:[['换向轮','2 个'],['离合','棘轮式'],['上链','双向整流'],['轴承','25 钻版含宝石']],
  tags:['双向整流','棘轮离合'], explode:[1.1,-.4,6.3], z0:.98},
 {id:'rotor', no:'15', cat:'winding', zh:'自动陀（摆重）', en:'Oscillating Weight', sub:'重金属半月锤 · 滚珠轴承',
  desc:'2824-2 的标志部件：重金属半月形摆重绕滚珠轴承自由旋转，手臂任意方向摆动都能上链，轴承结构比轴套式更耐冲击磨损。',
  specs:[['形式','半月形偏心重锤'],['轴承','滚珠轴承'],['上链','双向自动'],['材质','钨合金重金属']],
  tags:['双向自动','滚珠轴承'], explode:[-.4,1.0,7.0], z0:1.18},
];

/* ===================== 传动链：单一数据源（位置 + 角速度） ===================== */
const MODULE = 0.075;                                  // 齿轮模数（场景单位）
const pitchR = z => MODULE * z / 2;                   // 分度圆半径
const TRAIN = {
  barrel:{ z:96, pinion:0,  pos:new THREE.Vector3(-2.60,-2.40,0), angle:0   },
  center:{ z:80, pinion:12, from:'barrel', angle:25  },
  third: { z:75, pinion:10, from:'center', angle:130 },
  fourth:{ z:72, pinion:10, from:'third',  angle:212 },
  escape:{ z:20, pinion:6,  from:'fourth', angle:112 },
};
Object.values(TRAIN).forEach(n=>{ n.r=pitchR(n.z); n.pr=n.pinion?pitchR(n.pinion):0; });
// 轴距 = 主动轮分度圆半径 + 从动齿轴分度圆半径，保证正确啮合
['center','third','fourth','escape'].forEach(k=>{
  const n=TRAIN[k], p=TRAIN[n.from];
  const d=p.r+n.pr, a=THREE.MathUtils.degToRad(n.angle);
  n.pos=new THREE.Vector3(p.pos.x+Math.cos(a)*d, p.pos.y+Math.sin(a)*d, 0);
});
// 角速度沿链递推：ω从动 = -ω主动 × (z主动轮 / z从动齿轴)，啮合反向、同轴同速
const BASE_OMEGA=.22, COMP=.42;                        // 演示基准角速度 + 非线性压缩指数
TRAIN.barrel.omega=BASE_OMEGA;
['center','third','fourth','escape'].forEach(k=>{
  const n=TRAIN[k], p=TRAIN[n.from];
  n.omega=-p.omega*(p.z/n.pinion);
});
Object.values(TRAIN).forEach(n=>{
  const mag=Math.abs(n.omega);
  n.visW=Math.sign(n.omega)*BASE_OMEGA*Math.pow(mag/BASE_OMEGA,COMP); // 压缩高速级，避免频闪
});
const PLATE_CENTER=new THREE.Vector3(-1.1,.2,0);
const PALLET_POS=new THREE.Vector3(-3.70,3.90,0);
const BALANCE_POS=new THREE.Vector3(-1.40,4.50,0);
const REVERSER_POS=[new THREE.Vector3(-2.00,-.50,0), new THREE.Vector3(-1.20,-1.20,0)];
const PIVOTS=[...Object.values(TRAIN).map(n=>n.pos), PALLET_POS, BALANCE_POS, ...REVERSER_POS];

/* ===================== 材质与几何工具 ===================== */
const MAT = {
  plate : new THREE.MeshStandardMaterial({color:0x8fa3ad, metalness:.92, roughness:.34}),
  plate2: new THREE.MeshStandardMaterial({color:0x748892, metalness:.9,  roughness:.38}),
  brass : new THREE.MeshStandardMaterial({color:0xc9a24b, metalness:.95, roughness:.30}),
  brass2: new THREE.MeshStandardMaterial({color:0xa9823c, metalness:.95, roughness:.34}),
  steel : new THREE.MeshStandardMaterial({color:0xc3d0d8, metalness:1.0, roughness:.18}),
  blue  : new THREE.MeshStandardMaterial({color:0x2f4f86, metalness:.9,  roughness:.26}),
  ruby  : new THREE.MeshStandardMaterial({color:0xc8143c, metalness:.4,  roughness:.18, emissive:0x5a0716, emissiveIntensity:.55}),
  dark  : new THREE.MeshStandardMaterial({color:0x10181d, metalness:.6,  roughness:.5}),
  spring: new THREE.MeshStandardMaterial({color:0xdfe9f0, metalness:1.0, roughness:.14}),
  rotor : new THREE.MeshStandardMaterial({color:0x8a8f96, metalness:1.0, roughness:.32}),
};
const extraSpin=[];   // 换向轮等独立自转件 {obj, w}
function edgeMat(hex, op=.85){return new THREE.LineBasicMaterial({color:hex, transparent:true, opacity:op});}
function part(geo, mat, edgeHex, edgeOp=.8){
  const g=new THREE.Group();
  const m=new THREE.Mesh(geo, mat); g.add(m);
  if(edgeHex!==null){const e=new THREE.LineSegments(new THREE.EdgesGeometry(geo,28), edgeMat(edgeHex,edgeOp)); g.add(e);}
  return g;
}
const CY=(rt,rb,h,seg=40)=>new THREE.CylinderGeometry(rt,rb,h,seg);
function zCyl(geo){geo.rotateX(Math.PI/2);return geo;}                 // 圆柱轴朝向 +Z
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
// 带孔洞的挤出桥板：holes = [{x,y,r}]
function panelGeo(w,h,r,depth,holes){
  const sh=rrect(w,h,r,true);
  holes.forEach(ho=>{const p=new THREE.Path();p.absarc(ho.x,ho.y,ho.r,0,Math.PI*2,true);sh.holes.push(p);});
  const g=new THREE.ExtrudeGeometry(sh,{depth:depth,bevelEnabled:true,bevelThickness:.02,bevelSize:.03,bevelSegments:2,steps:1});
  g.translate(0,0,-depth/2);
  return g;
}
/* 程序化齿轮：梯形齿（擒纵轮用尖齿），含轴孔与可选辐条孔 */
function gearGeo(z,m,th,opts={}){
  const r=m*z/2, ra=r+m, rd=Math.max(r-1.25*m,m*1.8);
  const sh=new THREE.Shape(), tw=Math.PI*2/z;
  for(let i=0;i<z;i++){
    const a=i*tw;
    const profile=opts.pointed
      ? [[rd,.06],[ra,.5],[rd,.94]]
      : [[rd,0],[rd,.30],[ra,.40],[ra,.60],[rd,.70],[rd,1]];
    profile.forEach(([rr,f],k)=>{
      const ang=a+tw*f, x=Math.cos(ang)*rr, y=Math.sin(ang)*rr;
      (i===0&&k===0)?sh.moveTo(x,y):sh.lineTo(x,y);
    });
  }
  sh.closePath();
  const hub=new THREE.Path(); hub.absarc(0,0,Math.max(m*1.6,r*.13),0,Math.PI*2,true); sh.holes.push(hub);
  if(opts.spokes && r>1.4){
    for(let s=0;s<opts.spokes;s++){
      const ang=s/opts.spokes*Math.PI*2;
      const p=new THREE.Path(); p.absarc(Math.cos(ang)*r*.6, Math.sin(ang)*r*.6, r*.135, 0, Math.PI*2, true);
      sh.holes.push(p);
    }
  }
  const g=new THREE.ExtrudeGeometry(sh,{depth:th,bevelEnabled:true,bevelThickness:.015,bevelSize:.02,bevelSegments:2,steps:1});
  g.translate(0,0,-th/2);
  return g;
}
// 阿基米德平面螺线（游丝 / 发条）
function spiralGeo(r0,r1,turns,tube){
  class SpiralCurve extends THREE.Curve{
    getPoint(t){const a=t*Math.PI*2*turns, rr=r0+(r1-r0)*t; return new THREE.Vector3(Math.cos(a)*rr,Math.sin(a)*rr,0);}
  }
  return new THREE.TubeGeometry(new SpiralCurve(), Math.max(120,turns*48), tube, 6, false);
}
// 半月形偏心重锤轮廓（自动陀）
function rotorWeightGeo(rOut,rIn,th){
  const sh=new THREE.Shape();
  sh.absarc(0,0,rOut,0,Math.PI,false);
  sh.lineTo(-rIn,0);
  const inner=new THREE.Path(); inner.absarc(0,0,rIn,0,Math.PI,true); sh.holes.push(inner);
  const g=new THREE.ExtrudeGeometry(sh,{depth:th,bevelEnabled:true,bevelThickness:.02,bevelSize:.03,bevelSegments:2,steps:1});
  g.translate(0,0,-th/2);
  return g;
}

/* ===================== 部件建模 ===================== */
function buildPart(p){
  const c=CAT[p.cat].color;
  const outer=new THREE.Group();                       // 外层：承接爆炸位移
  const rotor=new THREE.Group();                       // 内层：承接旋转/摆动
  rotor.position.set(0,0,p.z0);
  outer.add(rotor);
  const add=(o)=>{o.traverse(ch=>{ch.userData.partId=p.id;}); rotor.add(o); return o;};
  const addStatic=(o)=>{o.traverse(ch=>{ch.userData.partId=p.id;}); outer.add(o); return o;};

  switch(p.id){
    case 'mainplate':{
      addStatic(part(zCyl(CY(6.8,6.8,.3,72)),MAT.plate,c,.55));
      [6.35,5.55].forEach(r=>{const ring=new THREE.Mesh(new THREE.TorusGeometry(r,.018,10,96),MAT.plate2); ring.position.z=.17; addStatic(ring);});
      for(let i=0;i<6;i++){const a=i/6*Math.PI*2;
        const s=part(zCyl(CY(.12,.12,.09,20)),MAT.blue,null); s.position.set(PLATE_CENTER.x+Math.cos(a)*6.05,PLATE_CENTER.y+Math.sin(a)*6.05,.2); addStatic(s);}
      break;}
    case 'jewels':{
      PIVOTS.forEach(v=>{
        const j=part(zCyl(CY(.13,.13,.08,20)),MAT.ruby,c,.9); j.position.set(v.x,v.y,0); addStatic(j);
        const ring=new THREE.Mesh(new THREE.TorusGeometry(.17,.025,8,24),MAT.brass2); ring.position.set(v.x,v.y,.05); addStatic(ring);
      });
      break;}
    case 'barrelBridge':{
      const mid=TRAIN.barrel.pos.clone().add(TRAIN.center.pos).multiplyScalar(.5);
      const g=part(panelGeo(5.2,1.55,.5,.16,[
        {x:TRAIN.barrel.pos.x-mid.x,y:TRAIN.barrel.pos.y-mid.y,r:.2},
        {x:TRAIN.center.pos.x-mid.x,y:TRAIN.center.pos.y-mid.y,r:.2}]),MAT.plate,c,.7);
      g.position.set(mid.x,mid.y,0); add(g);
      [[-2.2,.5],[2.2,-.5]].forEach(([x,y])=>{const s=part(zCyl(CY(.1,.1,.08,18)),MAT.blue,null); s.position.set(mid.x+x,mid.y+y,.1); add(s);});
      break;}
    case 'trainBridge':{
      const mid=TRAIN.third.pos.clone().add(TRAIN.fourth.pos).multiplyScalar(.5);
      const g=part(panelGeo(3.9,1.35,.45,.16,[
        {x:TRAIN.third.pos.x-mid.x,y:TRAIN.third.pos.y-mid.y,r:.18},
        {x:TRAIN.fourth.pos.x-mid.x,y:TRAIN.fourth.pos.y-mid.y,r:.18}]),MAT.plate,c,.7);
      g.position.set(mid.x,mid.y,0); add(g);
      [[-1.6,.42],[1.6,-.42]].forEach(([x,y])=>{const s=part(zCyl(CY(.1,.1,.08,18)),MAT.blue,null); s.position.set(mid.x+x,mid.y+y,.1); add(s);});
      break;}
    case 'balanceCock':{
      const mid=new THREE.Vector3(-2.30,4.10,0);
      const g=part(panelGeo(3.6,1.05,.42,.16,[
        {x:BALANCE_POS.x-mid.x,y:BALANCE_POS.y-mid.y,r:.2}]),MAT.plate,c,.7);
      g.position.copy(mid); add(g);
      const endstone=part(zCyl(CY(.16,.16,.08,20)),MAT.ruby,c,.9); endstone.position.set(BALANCE_POS.x,BALANCE_POS.y,.12); add(endstone);
      const s=part(zCyl(CY(.1,.1,.08,18)),MAT.blue,null); s.position.set(.05,-.25,.1); add(s);
      break;}
    case 'barrel':{
      const n=TRAIN.barrel;
      add(part(zCyl(CY(n.r*.94,n.r*.94,.5,72)),MAT.brass2,c,.5));
      add(part(zCyl(CY(n.r*.82,n.r*.82,.08,64)),MAT.brass,null));
      const teeth=new THREE.Mesh(gearGeo(n.z,MODULE,.16,{}),MAT.brass); teeth.position.z=.05; add(teeth);
      const coil=new THREE.Mesh(spiralGeo(.35,n.r*.72,5,.028),MAT.spring); coil.position.z=.3; add(coil);
      add(part(zCyl(CY(.18,.18,.62,24)),MAT.steel,null));
      rotor.position.set(n.pos.x,n.pos.y,p.z0);
      break;}
    case 'center': case 'third': case 'fourth':{
      const n=TRAIN[p.id];
      const wheel=new THREE.Mesh(gearGeo(n.z,MODULE,.2,{spokes:5}),MAT.brass); add(wheel);
      if(n.pinion){const pin=new THREE.Mesh(gearGeo(n.pinion,MODULE,.16,{}),MAT.steel); pin.position.z=.18; add(pin);}
      add(part(zCyl(CY(.09,.09,.46,18)),MAT.steel,null));
      rotor.position.set(n.pos.x,n.pos.y,p.z0);
      break;}
    case 'escape':{
      const n=TRAIN.escape;
      const wheel=new THREE.Mesh(gearGeo(n.z,MODULE,.16,{pointed:true}),MAT.steel); add(wheel);
      const pin=new THREE.Mesh(gearGeo(n.pinion,MODULE,.14,{}),MAT.steel); pin.position.z=.16; add(pin);
      add(part(zCyl(CY(.08,.08,.42,16)),MAT.steel,null));
      rotor.position.set(n.pos.x,n.pos.y,p.z0);
      break;}
    case 'pallet':{
      add(part(zCyl(CY(.08,.08,.5,16)),MAT.steel,CAT.escape.color,.7));
      const arm1=part(new THREE.BoxGeometry(1.05,.12,.12),MAT.steel,c,.8); arm1.position.set(.45,.28,0); arm1.rotation.z=.5; add(arm1);
      const arm2=part(new THREE.BoxGeometry(1.05,.12,.12),MAT.steel,c,.8); arm2.position.set(.45,-.28,0); arm2.rotation.z=-.5; add(arm2);
      const tail=part(new THREE.BoxGeometry(.85,.1,.1),MAT.steel,c,.8); tail.position.set(-.42,0,0); add(tail);
      const st1=part(new THREE.BoxGeometry(.2,.28,.14),MAT.ruby,c,.9); st1.position.set(.92,.52,.02); st1.rotation.z=.5; add(st1);
      const st2=part(new THREE.BoxGeometry(.2,.28,.14),MAT.ruby,c,.9); st2.position.set(.92,-.52,.02); st2.rotation.z=-.5; add(st2);
      rotor.position.set(PALLET_POS.x,PALLET_POS.y,p.z0);
      break;}
    case 'balance':{
      const ring=part(new THREE.TorusGeometry(1.25,.08,16,80),MAT.steel,CAT.regulation.color,.75); add(ring);
      for(let i=0;i<3;i++){const sp=part(new THREE.BoxGeometry(2.3,.07,.07),MAT.steel,c,.6); sp.rotation.z=i*Math.PI/3; add(sp);}
      add(part(zCyl(CY(.16,.16,.22,24)),MAT.steel,c,.8));
      for(let i=0;i<8;i++){const a=i/8*Math.PI*2;
        const scr=part(zCyl(CY(.07,.07,.09,14)),MAT.brass2,null); scr.position.set(Math.cos(a)*1.25,Math.sin(a)*1.25,.02); add(scr);}
      rotor.position.set(BALANCE_POS.x,BALANCE_POS.y,p.z0);
      break;}
    case 'hairspring':{
      const coil=part(spiralGeo(.12,.85,6,.022),MAT.spring,CAT.regulation.color,.8); add(coil);
      const stud=part(new THREE.BoxGeometry(.16,.16,.1),MAT.steel,null); stud.position.set(.9,0,.02); add(stud);
      add(part(zCyl(CY(.1,.1,.16,18)),MAT.steel,null));
      rotor.position.set(BALANCE_POS.x,BALANCE_POS.y,p.z0);
      break;}
    case 'reverser':{
      const mid=REVERSER_POS[0].clone().add(REVERSER_POS[1]).multiplyScalar(.5);
      const g=part(panelGeo(2.3,1.9,.4,.14,
        REVERSER_POS.map(v=>({x:v.x-mid.x,y:v.y-mid.y,r:.16}))),MAT.plate,c,.7);
      g.position.set(mid.x,mid.y,0); add(g);
      REVERSER_POS.forEach((v,i)=>{
        const wheelG=new THREE.Group(); wheelG.position.set(v.x,v.y,0);
        const w=new THREE.Mesh(gearGeo(14,MODULE,.14,{}),MAT.steel); wheelG.add(w);
        const j=new THREE.Mesh(zCyl(CY(.1,.1,.1,18)),MAT.ruby); wheelG.add(j);
        wheelG.traverse(ch=>{ch.userData.partId=p.id;});
        rotor.add(wheelG); extraSpin.push({obj:wheelG,w:i===0?1.4:-1.4});
      });
      rotor.position.set(0,0,0);
      break;}
    case 'rotor':{
      const weight=part(rotorWeightGeo(3.3,2.0,.3),MAT.rotor,c,.7); add(weight);
      [-1,1].forEach(sx=>{const arm=part(new THREE.BoxGeometry(2.05,.16,.18),MAT.rotor,c,.6);
        arm.position.set(sx*1.05,0,0); add(arm);});
      [2.55,2.85].forEach(r=>{const groove=new THREE.Mesh(new THREE.TorusGeometry(r,.02,8,80,Math.PI),MAT.steel);
        groove.position.z=.17; add(groove);});
      const bearingOuter=new THREE.Mesh(new THREE.TorusGeometry(.42,.09,16,40),MAT.steel); add(bearingOuter);
      const bearingInner=part(zCyl(CY(.28,.28,.24,32)),MAT.steel,c,.8); add(bearingInner);
      for(let i=0;i<7;i++){const a=i/7*Math.PI*2;
        const ball=new THREE.Mesh(new THREE.SphereGeometry(.07,12,12),MAT.spring); ball.position.set(Math.cos(a)*.42,Math.sin(a)*.42,0); add(ball);}
      const axle=part(zCyl(CY(.12,.12,.5,20)),MAT.blue,null); add(axle);
      rotor.position.set(PLATE_CENTER.x,PLATE_CENTER.y,0);
      break;}
  }
  outer.userData.partId=p.id;
  return {outer, rotor};
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
scene.fog=new THREE.FogExp2(0x041016,.015);
const camera=new THREE.PerspectiveCamera(42,W()/H(),.1,200);
const HOME_CAM=new THREE.Vector3(10.5,7.8,16);
camera.position.copy(HOME_CAM);

const controls=new OrbitControls(camera,renderer.domElement);
controls.enableDamping=true; controls.dampingFactor=.08;
controls.minDistance=5; controls.maxDistance=40;
controls.target.copy(PLATE_CENTER); controls.autoRotateSpeed=1.1;

/* 灯光（冷暖对比，突出金属质感） */
scene.add(new THREE.AmbientLight(0x4a8fa0,.55));
const key=new THREE.DirectionalLight(0xd8fbff,1.4); key.position.set(9,13,11); scene.add(key);
const rim=new THREE.DirectionalLight(0x2fd2ff,.85); rim.position.set(-10,3,-9); scene.add(rim);
const warm=new THREE.PointLight(0xffb24d,.65,48); warm.position.set(-7,-6,8); scene.add(warm);

/* HUD 雷达环（与机芯同处 XY 平面，置于背后） */
const hud=new THREE.Group();
function ring(r,op){const pts=Array.from({length:128},(_,i)=>{const a=i/128*Math.PI*2;return new THREE.Vector3(Math.cos(a)*r,Math.sin(a)*r,0);});
  return new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(pts),new THREE.LineBasicMaterial({color:0x3ee6ff,transparent:true,opacity:op}));}
hud.add(ring(8.2,.22)); hud.add(ring(9.1,.14)); hud.add(ring(10.0,.09));
const ticks=new THREE.Group();
for(let i=0;i<72;i++){const a=i/72*Math.PI*2,r1=i%6===0?8.5:8.75,r2=8.95;
  const g=new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(Math.cos(a)*r1,Math.sin(a)*r1,0),new THREE.Vector3(Math.cos(a)*r2,Math.sin(a)*r2,0)]);
  ticks.add(new THREE.Line(g,new THREE.LineBasicMaterial({color:0x3ee6ff,transparent:true,opacity:i%6===0?.4:.18})));}
hud.add(ticks);
hud.position.copy(PLATE_CENTER); hud.position.z=-1.6;
scene.add(hud);

/* 地面极坐标栅格 + 星点 */
const polar=new THREE.PolarGridHelper(14,16,10,64,0x3ee6ff,0x1b6a78);
polar.position.y=-5.8; polar.material.transparent=true; polar.material.opacity=.2; scene.add(polar);
const starGeo=new THREE.BufferGeometry();
const sp=[];for(let i=0;i<420;i++){sp.push((Math.random()-.5)*100,(Math.random()-.5)*60,(Math.random()-.5)*100);}
starGeo.setAttribute('position',new THREE.Float32BufferAttribute(sp,3));
scene.add(new THREE.Points(starGeo,new THREE.PointsMaterial({color:0x9feaff,size:.08,transparent:true,opacity:.5})));

/* 组装 15 部件 */
const assembly=new THREE.Group(); scene.add(assembly);
const POM={};
const SPINNERS=[];   // {rotor, mode:'spin'|'osc', w|A,f,phase}
PARTS.forEach(p=>{
  const {outer,rotor}=buildPart(p);
  assembly.add(outer);
  const box=new THREE.Box3().setFromObject(outer);
  const anchor=box.getCenter(new THREE.Vector3());
  const radius=box.getSize(new THREE.Vector3()).length()/2;
  const vec=new THREE.Vector3(...p.explode);
  const out=vec.lengthSq()>0?vec.clone().normalize():new THREE.Vector3(0,1,0);
  const lab=document.createElement('div'); lab.className='flab';
  lab.innerHTML=`<span class="lno">${p.no}</span><span class="lzh">${p.zh}</span><span class="lsub">${p.sub}</span>`;
  labelsEl.appendChild(lab);
  POM[p.id]={part:p,group:outer,rotor,anchor,vec,out,label:lab,key:null,radius};
});
/* 注册运动件：轮系连续转动；摆轮/游丝/擒纵叉同频摆动；自动陀慢速旋转 */
Object.keys(TRAIN).forEach(k=>SPINNERS.push({rotor:POM[k].rotor,mode:'spin',w:TRAIN[k].visW}));
SPINNERS.push({rotor:POM.rotor.rotor,   mode:'spin',w:.35});
SPINNERS.push({rotor:POM.pallet.rotor,  mode:'osc',A:.17,f:2.2,phase:0});
SPINNERS.push({rotor:POM.balance.rotor, mode:'osc',A:1.15,f:2.2,phase:Math.PI/2});
SPINNERS.push({rotor:POM.hairspring.rotor,mode:'osc',A:.5, f:2.2,phase:Math.PI/2});

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
    _v.copy(o.anchor); o.group.localToWorld(_v);
    const behind=_v.project(camera).z>1;
    const active=showAll||o.part.id===selectedId||o.part.id===hoverId;
    if(behind||!active){o.label.classList.remove('on');o.line.setAttribute('opacity','0');o.circle.setAttribute('opacity','0');return;}
    const ax=( _v.x*.5+.5)*W(), ay=(-_v.y*.5+.5)*H();
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
let running=true, simT=0, camAnim=null;
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
  const d=dist??Math.max(5.5,(o.radius||1.5)*4.2);
  const dir=camera.position.clone().sub(controls.target);if(dir.lengthSq()<1e-4)dir.set(1,.6,1);dir.normalize();
  tweenCam(_v.clone().add(dir.multiplyScalar(d)),_v.clone(),700);
}

/* 射线拾取 */
const ray=new THREE.Raycaster(),ptr=new THREE.Vector2();
let downXY=null;
function pick(cx,cy){ptr.set(cx/W()*2-1,-(cy/H())*2+1);ray.setFromCamera(ptr,camera);
  const hits=ray.intersectObjects(assembly.children,true);
  for(const h of hits){const id=h.object.userData.partId;if(id)return id;}return null;}
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
  reset(){targetExplode=0;collapsed.clear();document.getElementById('explodeRange').value=0;selectedId=null;hoverId=null;refreshHL();
    tweenCam(HOME_CAM,PLATE_CENTER.clone());
    if(engine._cb)engine._cb(null);document.getElementById('stMode').textContent='装配';},
  toggleCollapse(id){if(collapsed.has(id))collapsed.delete(id);else collapsed.add(id);return collapsed.has(id);},
  toggleRotate(){autoRot=!autoRot;controls.autoRotate=autoRot;return autoRot;},
  toggleRun(){running=!running;return running;},
  views:[new THREE.Vector3(PLATE_CENTER.x,PLATE_CENTER.y+.6,18),new THREE.Vector3(PLATE_CENTER.x,PLATE_CENTER.y+.6,-16),new THREE.Vector3(17,1.2,2),HOME_CAM],vi:0,
  cycleView(){const v=this.views[this.vi++%this.views.length];tweenCam(v,PLATE_CENTER.clone());},
};

/* 主循环 */
let last=performance.now(),frames=0,fpsT=last;
function tick(now){
  requestAnimationFrame(tick);
  const dt=now-last;last=now;
  if(running)simT+=dt/1000;
  SPINNERS.forEach(s=>{
    if(s.mode==='spin') s.rotor.rotation.z=simT*s.w;
    else s.rotor.rotation.z=s.A*Math.sin(2*Math.PI*s.f*simT+(s.phase||0));
  });
  extraSpin.forEach(s=>{s.obj.rotation.z=simT*s.w;});
  explode+=(targetExplode-explode)*Math.min(1,dt/140);
  if(Math.abs(targetExplode-explode)<.0015)explode=targetExplode;
  applyExplode(explode);
  hud.rotation.z+=dt*.00002;ticks.rotation.z-=dt*.00005;
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
        <span class="cat-chip"><span class="d"></span>ETA 2824-2 REPLICA</span>
        <div class="spec-title" style="font-size:21px">ETA 2824-2 自动机芯</div>
        <div class="spec-en">Parameterized Replica · 25 Jewels</div>
        <div class="spec-desc">瑞士 ETA 2824-2 自动上链机芯的参数化教学复刻：25 钻、28800 vph、38 小时储能。拖拽旋转、滚轮缩放；点击模型或左侧清单查看部件规格，轮系按真实齿数比实时运转，可暂停或沿轴向爆炸拆解 15 个组件。</div>
        <div class="tags"><span class="tag">25 钻</span><span class="tag">28800 vph</span><span class="tag">双向自动陀</span><span class="tag">爆炸拆解</span></div>
        <button class="sbtn primary" style="margin-top:16px" onclick="document.getElementById('btnExplode').click()">全部拆解 15 组件</button>
      </div>`;
    return;
  }
  const p=PARTS.find(x=>x.id===id),c=CAT[p.cat];
  specEl.innerHTML=`<div class="phead"><span class="zh">参数说明</span><span class="en">/ SPECS</span><span class="cnt">PART ${p.no}</span></div>
    <div class="spec-body">
      <span class="cat-chip" style="color:${hexCss(c.color)};border-color:${hexCss(c.color)}55"><span class="d" style="background:${hexCss(c.color)};box-shadow:0 0 7px ${hexCss(c.color)}"></span>${c.zh} / MOVEMENT</span>
      <span class="part-no">${p.no} / 15</span>
      <div class="spec-title">${p.zh}</div>
      <div class="spec-en">${p.en}</div>
      <div class="spec-desc">${p.desc}</div>
      <div class="spec-grid">${p.specs.map(([k,v])=>`<div class="spec-cell"><div class="k">${k}</div><div class="v">${v}</div></div>`).join('')}</div>
      <div class="tags">${p.tags.map(t=>`<span class="tag">${t}</span>`).join('')}</div>
      <div class="spec-status"><span>装配状态</span><b id="specState">装配就位</b></div>
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
btnE.onclick=()=>engine.explodeAll();
document.getElementById('btnReset').onclick=()=>engine.reset();
const btnR=document.getElementById('btnRotate');
btnR.onclick=()=>btnR.classList.toggle('on',engine.toggleRotate());
const btnP=document.getElementById('btnPlay');
btnP.onclick=()=>{const on=engine.toggleRun();btnP.classList.toggle('on',!on);
  btnP.lastChild.textContent=on?' 暂停运转':' 启动运转';};
document.getElementById('btnView').onclick=()=>engine.cycleView();
document.getElementById('explodeRange').addEventListener('input',e=>{targetExplode=e.target.value/100;});
setInterval(()=>{const on=targetExplode>.5;btnE.classList.toggle('on',on);
  btnE.lastChild.textContent=on?'  组装复位':' 全部拆解';},200);

/* 引导模式 */
const guideEl=document.getElementById('guide');let gi=0;
function showStep(i){const p=PARTS[i];
  engine.setExplode(.62);engine.select(p.id);focusId(p.id,5.5);
  document.getElementById('gStep').textContent=`STEP ${p.no} / 15`;
  document.getElementById('gTitle').textContent=`${p.no} · ${p.zh}`;
  document.getElementById('gDesc').textContent=p.desc;
  document.getElementById('gProg').style.width=((i+1)/15*100)+'%';
  document.getElementById('gNext').textContent=i===14?'完成拆解':'下一步';
}
document.getElementById('btnGuide').onclick=()=>{guideEl.classList.add('on');gi=0;showStep(gi);};
document.getElementById('gNext').onclick=()=>{if(gi<14){gi++;showStep(gi);}else{guideEl.classList.remove('on');engine.setExplode(1);}};
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
