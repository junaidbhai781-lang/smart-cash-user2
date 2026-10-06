const CFGJ={apiKey:"AIzaSyBSU__zGVNKXRf_kM9mfDlywAlGKxHt2Sk",authDomain:"smart-loot-7a862.firebaseapp.com",databaseURL:"https://smart-loot-7a862-default-rtdb.firebaseio.com",projectId:"smart-loot-7a862",storageBucket:"smart-loot-7a862.firebasestorage.app",messagingSenderId:"294192416760",appId:"1:294192416760:web:3655d851dd9287d84af80d"};
const $=s=>document.querySelector(s);
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const money=n=>(n<0?'-':'')+'₹'+Math.abs(+n||0).toFixed(2);
const fdt=ts=>ts?new Date(ts).toLocaleString('en-GB',{day:'2-digit',month:'short',year:'numeric',hour:'numeric',minute:'2-digit',hour12:true}):'—';
const normUrl=u=>{u=String(u||'').trim().replace(/\s+/g,'');if(!u)return'';if(/^@[A-Za-z0-9_]{4,}$/.test(u))return'https://t.me/'+u.slice(1);if(/^https?:\/\/\S+$/i.test(u))return u;if(/^\/\/\S+$/.test(u))return'https:'+u;if(/^(www\.)?[a-z0-9-]+(\.[a-z0-9-]+)+([\/?#]\S*)?$/i.test(u))return'https://'+u;return''};
/* ADMIN SECURITY: panel har baar open hone par password maangta hai. Purana saved session turant mita diya jata hai. */
const wipeSess=()=>{try{localStorage.removeItem('sc_admin_rest_auth');sessionStorage.removeItem('sc_admin_rest_auth')}catch(e){}};
wipeSess();addEventListener('pagehide',wipeSess);addEventListener('pageshow',e=>{if(e.persisted)location.reload()});
const toast=(m,e)=>{const d=document.createElement('div');d.className='toast'+(e?' e':'');d.textContent=m;$('#toasts').append(d);setTimeout(()=>d.remove(),3200)};
/* ===== REST fallback: Firebase SDK (CDN) load na ho to Auth + Realtime Database seedha Google ke REST se chalte hain (CDN ki zarurat nahi) ===== */
function mkRest(CFG,SK){
const KEY=CFG.apiKey,DB=CFG.databaseURL.replace(/\/$/,'');
let ST='local';const gs=()=>{try{return ST==='local'?localStorage:sessionStorage}catch(e){return null}};
const LS={g:k=>{try{return localStorage.getItem(k)||sessionStorage.getItem(k)}catch(e){return null}},s:(k,v)=>{try{gs().setItem(k,v)}catch(e){}},d:k=>{try{localStorage.removeItem(k);sessionStorage.removeItem(k)}catch(e){}}};
const er=(code,msg)=>Object.assign(new Error(msg||code),{code});
const MAP={INVALID_LOGIN_CREDENTIALS:'auth/invalid-credential',INVALID_PASSWORD:'auth/wrong-password',EMAIL_NOT_FOUND:'auth/user-not-found',EMAIL_EXISTS:'auth/email-already-in-use',TOO_MANY_ATTEMPTS_TRY_LATER:'auth/too-many-requests',USER_DISABLED:'auth/user-disabled',INVALID_EMAIL:'auth/invalid-email',OPERATION_NOT_ALLOWED:'auth/operation-not-allowed',WEAK_PASSWORD:'auth/weak-password'};
const post=async(u,b,form)=>{let r;try{r=await fetch(u,{method:'POST',headers:{'Content-Type':form?'application/x-www-form-urlencoded':'application/json'},body:form?b:JSON.stringify(b)})}catch(e){throw er('auth/network-request-failed')}const j=await r.json().catch(()=>({}));if(!r.ok){const m=String((j.error&&j.error.message)||'').split(' ')[0];throw er(MAP[m]||'auth/internal-error',m)}return j};
const auth={currentUser:null},cbs=new Set();let T=null;
const fire=()=>cbs.forEach(f=>{try{f(auth.currentUser)}catch(e){console.error(e)}});
const setT=(j,em)=>{const uid=j.localId||j.user_id,email=j.email||em||(auth.currentUser&&auth.currentUser.email)||'',dn=j.displayName||(auth.currentUser&&auth.currentUser.uid===uid&&auth.currentUser.displayName)||'';T={idToken:j.idToken||j.id_token,refreshToken:j.refreshToken||j.refresh_token,exp:Date.now()+(+(j.expiresIn||j.expires_in)||3600)*1000};auth.currentUser={uid,email,displayName:dn};LS.s(SK,JSON.stringify({rt:T.refreshToken,uid,email,dn}))};
const tok=async()=>{if(!T)throw er('no-user');if(T.idToken&&T.exp-Date.now()>12e4)return T.idToken;const j=await post('https://securetoken.googleapis.com/v1/token?key='+KEY,'grant_type=refresh_token&refresh_token='+encodeURIComponent(T.refreshToken),1);setT(j);return T.idToken};
try{const st=JSON.parse(LS.g(SK)||'null');if(st&&st.rt){T={refreshToken:st.rt,idToken:'',exp:0};auth.currentUser={uid:st.uid,email:st.email,displayName:st.dn||''}}}catch(e){}
const AU={getAuth:()=>auth,setPersistence:async(a,p)=>{ST=p===AU.browserSessionPersistence?'session':'local'},browserLocalPersistence:{},browserSessionPersistence:{},
onAuthStateChanged:(a,cb)=>{cbs.add(cb);(async()=>{if(auth.currentUser&&T&&!T.idToken){try{await tok()}catch(e){if(e.code!=='auth/network-request-failed'){T=null;auth.currentUser=null;LS.d(SK)}}}cb(auth.currentUser)})();return()=>cbs.delete(cb)},
signInWithEmailAndPassword:async(a,em,pw)=>{const j=await post('https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key='+KEY,{email:em,password:pw,returnSecureToken:true});setT(j,em);fire();return{user:auth.currentUser}},
createUserWithEmailAndPassword:async(a,em,pw)=>{const j=await post('https://identitytoolkit.googleapis.com/v1/accounts:signUp?key='+KEY,{email:em,password:pw,returnSecureToken:true});setT(j,em);fire();return{user:auth.currentUser}},
signOut:async()=>{T=null;auth.currentUser=null;LS.d(SK);fire()},
updateProfile:async(u,o)=>{const t=await tok();const j=await post('https://identitytoolkit.googleapis.com/v1/accounts:update?key='+KEY,{idToken:t,displayName:o.displayName,returnSecureToken:true});if(j.idToken)setT(j);if(auth.currentUser)auth.currentUser.displayName=o.displayName||'';LS.s(SK,JSON.stringify({rt:T.refreshToken,uid:auth.currentUser.uid,email:auth.currentUser.email,dn:auth.currentUser.displayName}))},
updatePassword:async(u,pw)=>{const t=await tok();const j=await post('https://identitytoolkit.googleapis.com/v1/accounts:update?key='+KEY,{idToken:t,password:pw,returnSecureToken:true});if(j.idToken)setT(j)},
reauthenticateWithCredential:async(u,c)=>{await post('https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key='+KEY,{email:c.email,password:c.password,returnSecureToken:true})},
EmailAuthProvider:{credential:(email,password)=>({email,password})},
sendPasswordResetEmail:async(a,em)=>{await post('https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key='+KEY,{requestType:'PASSWORD_RESET',email:em})}};
const rq=async(m,p,b)=>{const t=await tok().catch(()=>'');let r;try{r=await fetch(DB+'/'+p+'.json'+(t?'?auth='+encodeURIComponent(t):''),{method:m,body:b===undefined?undefined:JSON.stringify(b)})}catch(e){throw er('net','Internet nahi hai')}if(!r.ok){const j=await r.json().catch(()=>({}));throw er(r.status===401||r.status===403?'PERMISSION_DENIED':'db/'+r.status,(j&&j.error)||('HTTP '+r.status))}return r.json()};
const PC='-0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz';let lT=0,lR=[];
const pk=()=>{let n=Date.now();const dup=n===lT;lT=n;const ts=[];for(let i=7;i>=0;i--){ts[i]=PC[n%64];n=Math.floor(n/64)}if(!dup)lR=[...Array(12)].map(()=>Math.floor(Math.random()*64));else{let i=11;for(;i>=0&&lR[i]===63;i--)lR[i]=0;if(i>=0)lR[i]++}return ts.join('')+lR.map(i=>PC[i]).join('')};
const subs=new Set();let pt=0;
const snap=(v,p)=>({val:()=>v==null?null:v,exists:()=>v!=null,key:String(p).split('/').pop()||null});
const shape=(v,q)=>{if(q&&q.lim&&v&&typeof v==='object'){const e=Object.entries(v);if(e.length>q.lim){e.sort((a,b)=>((a[1]&&a[1][q.ob])-(b[1]&&b[1][q.ob]))||(a[0]<b[0]?-1:1));return Object.fromEntries(e.slice(-q.lim))}}return v};
const one=async o=>{if(o.busy||o.dead)return;o.busy=1;try{let v=shape(await rq('GET',o.r.path),o.r);if(v===undefined)v=null;const j=JSON.stringify(v);o.bad=0;if(j!==o.last){o.last=j;if(!o.dead)o.cb(snap(v,o.r.path))}}catch(e){if(e.code==='PERMISSION_DENIED'){if(!o.bad&&o.ecb&&!o.dead)o.ecb(e);o.bad=1}}o.busy=0};
const poke=()=>setTimeout(()=>subs.forEach(one),250);
document.addEventListener('visibilitychange',()=>{if(!document.hidden)subs.forEach(one)});
const DBM={getDatabase:()=>({}),ref:(d,p)=>({path:String(p||'').replace(/^\/+|\/+$/g,'')}),query:(r,...c)=>Object.assign({},r,...c),orderByChild:k=>({ob:k}),limitToLast:n=>({lim:n}),
get:async r=>{let v=shape(await rq('GET',r.path),r);return snap(v===undefined?null:v,r.path)},
set:async(r,v)=>{await rq('PUT',r.path,v===undefined?null:v);poke()},update:async(r,o)=>{await rq('PATCH',r.path,o);poke()},remove:async r=>{await rq('DELETE',r.path);poke()},
push:r=>{const k=pk();return{path:(r.path?r.path+'/':'')+k,key:k}},
onDisconnect:()=>({set:async()=>{},cancel:async()=>{}}),serverTimestamp:()=>({'.sv':'timestamp'}),
onValue:(r,cb,ecb)=>{if(r.path==='.info/serverTimeOffset'){setTimeout(()=>cb(snap(0,r.path)),0);return()=>{}}if(r.path==='.info/connected'){setTimeout(()=>cb(snap(true,r.path)),0);return()=>{}}const o={r,cb,ecb,last:undefined,bad:0,busy:0,dead:0};subs.add(o);one(o);if(!pt)pt=setInterval(()=>{if(!document.hidden)subs.forEach(one)},3000);return()=>{o.dead=1;subs.delete(o)}}};
return{M:{initializeApp:()=>({})},AU,DBM}}
const V_='10.14.1',PIN={app:'0.10.13',auth:'1.7.9',database:'1.0.8'},SRC=[n=>`https://www.gstatic.com/firebasejs/${V_}/firebase-${n}.js`,n=>`https://cdn.jsdelivr.net/npm/@firebase/${n}/+esm`,n=>`https://cdn.jsdelivr.net/npm/@firebase/${n}@${PIN[n]}/+esm`,n=>`https://cdn.jsdelivr.net/npm/firebase@${V_}/${n}/+esm`,n=>`https://esm.sh/firebase@${V_}/${n}`];
let M,AU,DBM;
const imp8=p=>Promise.race([p,new Promise((_,j)=>setTimeout(()=>j(new Error('timeout')),5000))]);
$('#lmsg').textContent='Connecting… thoda ruko';
for(const f of SRC){try{const [m,u,d]=await imp8(Promise.all([import(f('app')),import(f('auth')),import(f('database'))]));/* source tabhi lo jab app+auth+database teeno ek hi instance me chalein */const pa=m.initializeApp(CFGJ,'probe'+Math.random().toString(36).slice(2,7));d.getDatabase(pa);u.getAuth(pa);M=m;AU=u;DBM=d;break}catch(e){console.warn('Firebase source skipped:',e&&e.message)}}
if(!M){console.warn('Firebase SDK load nahi hua -> REST mode (CDN ke bina)');({M,AU,DBM}=mkRest(CFGJ,'sc_admin_rest_auth'))}
$('#lmsg').textContent='Admin password daalo';
const {getDatabase,ref,set,get,update,remove,onValue,push,query,orderByChild,limitToLast}=DBM,{setPersistence,browserLocalPersistence,browserSessionPersistence,getAuth,onAuthStateChanged,signInWithEmailAndPassword,createUserWithEmailAndPassword,signOut,sendPasswordResetEmail}=AU;
const app=M.initializeApp(CFGJ),db=getDatabase(app),auth=getAuth(app);

/* ---------- state ---------- */
const D={tasks:[],banners:[],config:{},bc:[],users:[],subs:[],wds:[],tix:[],reps:[],refs:[],admins:[],lb:[],lbh:{},pres:{}};
const toArr=v=>v==null?[]:Object.entries(v).filter(([,x])=>x!=null).map(([k,x])=>typeof x==='object'?{id:k,...x}:{id:k,v:x});
let cur='dash',Q='',LIM=40,ME=null,subs=[];
const FLT={subs:'pending',wds:'pending',sup:'tickets',users:'all',refs:'pending'};
const NAVS=[['dash','📊','Dashboard'],['subs','✅','Task Reviews'],['wds','💸','Withdrawals'],['tasks','🎯','Tasks'],['banners','🖼️','Banners'],['users','👥','Users'],['refs','🔗','Referrals'],['sup','🎧','Support'],['bc','📢','Broadcast'],['lbd','🏆','Leaderboard'],['set','⚙️','Settings']];
/* referrals: sirf info -> naye referral ka badge + toast (kuch approve/pay nahi karna) */
const RS_KEY='sc_refs_seen';let RSEEN=null,RK=null;
const rsLoad=()=>{if(RSEEN)return RSEEN;let x=null;try{x=JSON.parse(localStorage.getItem(RS_KEY)||'null')}catch(e){}RSEEN={init:Array.isArray(x),ids:new Set(Array.isArray(x)?x:[])};return RSEEN};
const rsSave=()=>{try{localStorage.setItem(RS_KEY,JSON.stringify([...RSEEN.ids].slice(-3000)))}catch(e){}};
const rsMarkAll=()=>{const s=rsLoad();D.refs.forEach(r=>s.ids.add(r.id));s.init=true;rsSave()};
const cnt=()=>({refs:(()=>{const s=rsLoad();return s.init?D.refs.filter(r=>!s.ids.has(r.id)).length:0})(),subs:D.subs.filter(s=>(s.status||'pending')==='pending').length,wds:D.wds.filter(s=>(s.status||'pending')==='pending').length,sup:D.tix.filter(t=>(t.status||'open')==='open').length+D.reps.filter(t=>(t.status||'open')==='open').length});
const unameOf=id=>{const u=D.users.find(x=>x.id===id);return u?(u.name||u.email):id};

/* ---------- helpers ---------- */
function openM(h){$('#box').innerHTML=h;$('#modal').classList.add('show')}
function closeM(){$('#modal').classList.remove('show')}
let CONF=null;
function ask(msg,fn,label='Confirm'){CONF=fn;openM(`<h2>Are you sure?</h2><p class="mu" style="margin:8px 0 16px">${esc(msg)}</p><div class="row"><button class="btn grow" data-a="close">Cancel</button><button class="btn er grow" data-a="conf">${label}</button></div>`)}
const val=id=>(($('#'+id)||{}).value||'').trim();
const chk=id=>!!($('#'+id)||{}).checked;
const empty=(i,t)=>`<div class="empty"><div style="font-size:40px">${i}</div>${t}</div>`;
const chip=(s)=>{const c={pending:'wa',open:'wa',approved:'ok',paid:'ok',resolved:'ok',closed:'ok',rejected:'er'}[s]||'';return `<span class="chip ${c}">${esc(s)}</span>`};
const hist10=(l,isP,t)=>{const keep=new Set(l.filter(x=>!isP(x)).sort((a,b)=>t(b)-t(a)).slice(0,10));return l.filter(x=>isP(x)||keep.has(x))};
const lim=(l,f)=>l.slice(0,LIM).map(f).join('')+(l.length>LIM?`<button class="btn full" style="width:100%" data-a="more">Show more (${l.length-LIM})</button>`:'');
async function inbox(uid,obj){await set(push(ref(db,'inbox/'+uid)),{...obj,ts:Date.now()})}
const copyTxt=t=>{(navigator.clipboard?navigator.clipboard.writeText(t):Promise.reject()).catch(()=>{const i=document.createElement('input');i.value=t;document.body.append(i);i.select();try{document.execCommand('copy')}catch(e){}i.remove()}).finally(()=>toast('Copied'))};
const imgBox=(img,ic)=>`<div class="thumb"><span>${esc(ic||'🎯')}</span>${img?`<img src="${esc(img)}" referrerpolicy="no-referrer" alt="" onerror="this.remove()" style="position:absolute;inset:0">`:''}</div>`;

/* ---------- online / last seen (presence/{uid}: {online, lastSeen}) ---------- */
const agoTxt=ts=>{if(!ts)return 'Last seen unknown';const d=Math.max(0,Date.now()-ts),m=Math.floor(d/6e4),h=Math.floor(d/36e5),dy=Math.floor(d/864e5);return m<1?'Just now':m<60?m+' min ago':h<24?h+(h===1?' hour ago':' hours ago'):dy===1?'Yesterday':dy+' days ago'};
const presChip=id=>{const p=D.pres[id]||{};return p.online===true&&(!p.lastSeen||Date.now()-p.lastSeen<18e4)?'<span class="chip ok">🟢 LIVE</span>':`<span class="chip">⚪ OFFLINE</span> <span class="mu sm">${agoTxt(+p.lastSeen||0)}</span>`};

/* ---------- views ---------- */
let USORT='new';const sortU=l=>[...l].sort(USORT==='bal'?(a,b)=>(+b.bal||0)-(+a.bal||0):USORT==='balasc'?(a,b)=>(+a.bal||0)-(+b.bal||0):USORT==='earn'?(a,b)=>(+b.earned||0)-(+a.earned||0):(a,b)=>(b.createdAt||0)-(a.createdAt||0));
const V={
dash:{list:()=>{const c=cnt(),today=new Date().setHours(0,0,0,0),tb=D.users.reduce((a,u)=>a+(+u.bal||0),0),te=D.users.reduce((a,u)=>a+(+u.earned||0),0),pw=D.wds.filter(w=>(w.status||'pending')==='pending').reduce((a,w)=>a+(+w.amount||0),0);
 const days=[...Array(7)].map((_,i)=>{const s=today-(6-i)*864e5;return{l:new Date(s).toLocaleDateString('en',{weekday:'short'}),n:D.users.filter(u=>u.createdAt>=s&&u.createdAt<s+864e5).length}}),mx=Math.max(1,...days.map(x=>x.n));
 const st=[['Total users',D.users.length],['New today',D.users.filter(u=>u.createdAt>=today).length],['Blocked users',D.users.filter(u=>u.blocked).length],['Total wallet balance',money(tb)],['Total user earnings',money(te)],['Pending task reviews',c.subs],['Pending withdrawals',c.wds+' · '+money(pw)],['Open support',c.sup],['Active tasks',D.tasks.filter(t=>t.active!==false).length],['Active banners',D.banners.filter(t=>t.active!==false).length]];
 const ps=D.subs.filter(s=>(s.status||'pending')==='pending').sort((a,b)=>b.submittedAt-a.submittedAt).slice(0,5),pwl=D.wds.filter(s=>(s.status||'pending')==='pending').slice(0,5);
 return `<div class="grid">${st.map(([t,n])=>`<div class="stat"><div class="n">${n}</div><div class="t">${t}</div></div>`).join('')}</div>
 <div class="card"><b>New users – last 7 days</b><div class="bars" style="margin-top:12px">${days.map(d=>`<div><span class="b" style="color:var(--tx)">${d.n}</span><i style="height:${d.n/mx*80}px"></i>${d.l}</div>`).join('')}</div></div>
 <div class="grid2"><div class="card"><div class="row sp"><b>Latest task submissions</b><button class="btn s" data-a="go" data-p="subs">Open</button></div>${ps.map(s=>`<div class="kv"><span>${esc(s.name||'')} · ${esc(s.title||s.taskId)}</span><span>${money(s.reward)}</span></div>`).join('')||'<p class="mu sm" style="margin-top:8px">Nothing pending 🎉</p>'}</div>
 <div class="card"><div class="row sp"><b>Pending withdrawals</b><button class="btn s" data-a="go" data-p="wds">Open</button></div>${pwl.map(s=>`<div class="kv"><span>${esc(s.name||'')} · ${esc(s.method||'')}</span><span>${money(s.amount)}</span></div>`).join('')||'<p class="mu sm" style="margin-top:8px">Nothing pending 🎉</p>'}</div></div>`}},

subs:{bar:()=>`<div class="tools"><div class="pills">${['pending','approved','rejected','all'].map(k=>`<button class="${FLT.subs===k?'on':''}" data-a="flt" data-k="subs" data-p="${k}">${k[0].toUpperCase()+k.slice(1)}</button>`).join('')}</div><input id="q" placeholder="🔎 Search user / task…" value="${esc(Q)}"></div>`,
 list:()=>{const f=FLT.subs,q=Q.toLowerCase(),l0=D.subs.filter(s=>(f==='all'||(s.status||'pending')===f)&&(!q||((s.name||'')+(s.title||'')+(s.taskId||'')).toLowerCase().includes(q))).sort((a,b)=>(b.submittedAt||0)-(a.submittedAt||0)),l=hist10(l0,s=>(s.status||'pending')==='pending',s=>s.reviewedAt||s.submittedAt||0);
 return l.length?lim(l,s=>{const p=s.proof||{},st=s.status||'pending';let pf='';
  const im=(v,w)=>String(v||'').startsWith('data:')?`<img class="pimg" src="${esc(v)}" data-a="zoom" data-p="${esc(s.id)}" data-w="${w}" alt="proof">`:'<span class="mu sm">Photo (not stored)</span>';
  if(p.type==='screenshot'){pf=im(p.value,'v')}
  else{pf=(p.type==='url'?`<a href="${esc(p.value)}" target="_blank" rel="noopener noreferrer">${esc(p.value)}</a>`:`<b>${esc(p.value||'—')}</b>`)+(p.photo?`<div class="mu sm" style="margin-top:6px">📷 User ne photo bhi lagayi:</div>`+im(p.photo,'p'):'')}
  return `<div class="card"><div class="row sp wrap"><div class="grow"><b>${esc(s.title||s.taskId)}</b><div class="mu sm">${esc(s.name||'')} · ${esc(s.uid||'')}</div></div><div style="text-align:right"><div class="b" style="color:var(--pd)">${money(s.reward)}</div>${chip(st)}</div></div>
  <div class="mu sm" style="margin-top:6px">Submitted: ${fdt(s.submittedAt)} · Proof type: ${esc(p.type||'')}</div><div style="margin-top:6px">${pf}</div>
  ${st==='pending'?`<div class="row" style="margin-top:12px"><button class="btn ok grow" data-a="subOk" data-p="${esc(s.id)}">✓ Approve</button><button class="btn er grow" data-a="subNo" data-p="${esc(s.id)}">✕ Reject</button></div>`:`<div class="mu sm" style="margin-top:6px">Reviewed: ${fdt(s.reviewedAt)}${s.reason?' · Reason: '+esc(s.reason):''}</div>`}</div>`}):empty('📭','No submissions here')}},

wds:{bar:()=>`<div class="tools"><div class="pills">${['pending','paid','rejected','all'].map(k=>`<button class="${FLT.wds===k?'on':''}" data-a="flt" data-k="wds" data-p="${k}">${k[0].toUpperCase()+k.slice(1)}</button>`).join('')}</div><input id="q" placeholder="🔎 Search name / email…" value="${esc(Q)}"></div>`,
 list:()=>{const f=FLT.wds,q=Q.toLowerCase(),l0=D.wds.filter(s=>(f==='all'||(s.status||'pending')===f)&&(!q||((s.name||'')+(s.email||'')+(s.method||'')).toLowerCase().includes(q))).sort((a,b)=>(b.ts||0)-(a.ts||0)),l=hist10(l0,w=>(w.status||'pending')==='pending',w=>w.paidAt||w.ts||0);
 return l.length?lim(l,w=>{const p=w.payTo||{},st=w.status||'pending',det=p.upi?`UPI: ${p.upi}`:p.acc?`Holder: ${p.holder} | Bank: ${p.bank} | A/C: ${p.acc} | IFSC: ${p.ifsc}`:'';
 return `<div class="card"><div class="row sp wrap"><div class="grow"><b>${esc(w.name||'')}</b><div class="mu sm">${esc(w.email||'')} · ${esc(w.phone||'')}</div></div><div style="text-align:right"><div class="b" style="color:var(--pd);font-size:20px">${money(w.amount)}</div>${chip(st)}</div></div>
 <div style="margin-top:8px"><div class="kv"><span>Method</span><span>${esc(w.method||'')}</span></div>${det?`<div class="kv"><span>Pay to</span><span>${esc(det)}</span></div>`:''}<div class="kv"><span>Requested</span><span>${fdt(w.ts)}</span></div><div class="kv"><span>Tx ID</span><span>${esc(w.id)}</span></div></div>
 <div class="row wrap" style="margin-top:10px">${det?`<button class="btn s" data-a="cp" data-p="${esc(p.upi||p.acc)}">Copy ${p.upi?'UPI':'A/C no.'}</button>`:''}${st==='pending'?`<button class="btn ok s grow" data-a="wdOk" data-p="${esc(w.id)}">✓ Mark paid</button><button class="btn er s grow" data-a="wdNo" data-p="${esc(w.id)}">✕ Reject & refund</button>`:''}</div></div>`}):empty('💸','No withdrawal requests')}},

tasks:{bar:()=>`<div class="tools"><button class="btn p" data-a="taskEdit" data-p="">＋ New task</button><input id="q" placeholder="🔎 Search tasks…" value="${esc(Q)}"></div>`,
 list:()=>{const q=Q.toLowerCase(),l=D.tasks.filter(t=>!q||((t.title||'')+(t.description||'')).toLowerCase().includes(q)).sort((a,b)=>(b.createdAt||0)-(a.createdAt||0));
 return l.length?`<div class="grid2">${l.map(t=>{const ts_=D.subs.filter(s=>s.taskId===t.id),n=ts_.filter(s=>(s.status||'pending')==='pending').length,ap=new Set(ts_.filter(s=>s.status==='approved').map(s=>s.uid)).size,rj=ts_.filter(s=>s.status==='rejected').length;return `<div class="card"><div class="row">${imgBox(t.image,t.icon)}<div class="grow"><b>${esc(t.title)}</b><div class="mu sm">${esc(t.id)} · ${esc(t.proofType||'screenshot')}${t.estimatedTime?' · ⏱ '+esc(t.estimatedTime):''}</div><div class="b" style="color:var(--pd)">${money(t.reward)}</div></div>${t.active===false?'<span class="chip er">Hidden</span>':'<span class="chip ok">Live</span>'}</div>
 <p class="mu sm" style="margin:8px 0">${esc(t.description||'')}</p><div class="mu sm" style="margin-bottom:6px">👥 Users: ✅ ${ap} approved · ⏳ ${n} pending · ❌ ${rj} rejected — task sab users ke liye live rehta hai (1 user = 1 baar)</div>${n?`<span class="chip wa">${n} pending review</span>`:''}
 <div class="row wrap" style="margin-top:10px"><button class="btn s" data-a="taskEdit" data-p="${esc(t.id)}">Edit</button><button class="btn s" data-a="taskTog" data-p="${esc(t.id)}">${t.active===false?'Show':'Hide'}</button><button class="btn s" data-a="taskDup" data-p="${esc(t.id)}">Duplicate</button><button class="btn er s" data-a="taskDel" data-p="${esc(t.id)}">Delete</button></div></div>`}).join('')}</div>`:empty('🎯','No tasks yet. Create your first task.')}},

banners:{bar:()=>`<div class="tools"><button class="btn p" data-a="bnEdit" data-p="">＋ New banner</button><span class="mu sm">App home par maximum 5 active banners dikhte hain.</span></div>`,
 list:()=>{const l=[...D.banners].sort((a,b)=>(+a.order||0)-(+b.order||0));return l.length?`<div class="grid2">${l.map(b=>`<div class="card">${b.image?`<div style="border-radius:16px;overflow:hidden;aspect-ratio:12/5;background:var(--soft)"><img src="${esc(b.image)}" referrerpolicy="no-referrer" style="width:100%;height:100%;object-fit:cover;display:block" alt=""></div><div class="mu sm" style="margin-top:6px">🏷️ ${esc(b.title)} · app me sirf image dikhegi</div>`:`<div style="border-radius:16px;padding:14px;color:#fff;background:linear-gradient(135deg,${esc((b.bg||[])[0]||'#1d8fb0')},${esc((b.bg||[])[1]||'#2ec4a5')});min-height:96px;position:relative;overflow:hidden">${b.image?`<img src="${esc(b.image)}" referrerpolicy="no-referrer" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:.55" alt="">`:`<span style="position:absolute;right:12px;top:12px;font-size:38px">${esc(b.icon||'🎯')}</span>`}<div style="position:relative"><b style="font-size:17px;display:block;max-width:75%">${esc(b.title)}</b><div class="sm" style="max-width:75%">${esc(b.subtitle||'')}</div>${b.buttonText?`<span class="chip" style="margin-top:8px;background:rgba(255,255,255,.3);color:#fff">${esc(b.buttonText)}</span>`:''}</div></div>`}
 <div class="row sp" style="margin-top:8px"><span class="mu sm">Order ${esc(b.order||'-')} · Link: ${esc(b.link||'-')}</span>${b.active===false?'<span class="chip er">Hidden</span>':'<span class="chip ok">Live</span>'}</div>
 <div class="row wrap" style="margin-top:10px"><button class="btn s" data-a="bnEdit" data-p="${esc(b.id)}">Edit</button><button class="btn s" data-a="bnTog" data-p="${esc(b.id)}">${b.active===false?'Show':'Hide'}</button><button class="btn er s" data-a="bnDel" data-p="${esc(b.id)}">Delete</button></div></div>`).join('')}</div>`:empty('🖼️','No banners yet')}},

users:{bar:()=>`<div class="tools"><div class="pills">${['all','active','blocked'].map(k=>`<button class="${FLT.users===k?'on':''}" data-a="flt" data-k="users" data-p="${k}">${k[0].toUpperCase()+k.slice(1)}</button>`).join('')}</div><input id="q" placeholder="🔎 Name, email, phone, code…" value="${esc(Q)}"><select id="usort" style="max-width:210px">${[['new','Newest first'],['bal','Balance: high → low'],['balasc','Balance: low → high'],['earn','Total earned: high → low']].map(([k,n])=>`<option value="${k}" ${USORT===k?'selected':''}>${n}</option>`).join('')}</select></div>`,
 list:()=>{const q=Q.toLowerCase(),f=FLT.users,l=D.users.filter(u=>(f==='all'||(f==='blocked')===!!u.blocked)&&(!q||((u.name||'')+(u.email||'')+(u.phone||'')+(u.code||'')+u.id).toLowerCase().includes(q))).sort((a,b)=>(b.createdAt||0)-(a.createdAt||0));
 return `<div class="card" style="background:var(--soft);box-shadow:none"><div class="row sp wrap"><span><b>${l.length}</b> users</span><span>Total balance: <b style="color:var(--pd)">${money(l.reduce((a,u)=>a+(+u.bal||0),0))}</b></span><span>Total earned: <b>${money(l.reduce((a,u)=>a+(+u.earned||0),0))}</b></span><span>Withdrawn: <b>${money(l.reduce((a,u)=>a+(+u.wd||0),0))}</b></span></div></div>`+(l.length?lim(sortU(l),u=>`<div class="card"><div class="row"><div class="av">${esc((u.name||'U')[0])}</div><div class="grow"><b>${esc(u.name||'—')}</b> ${u.blocked?'<span class="chip er">Blocked</span>':''}<div class="mu sm">${esc(u.email||'')} · ${esc(u.phone||'')}</div></div><div style="text-align:right"><div class="b" style="color:var(--pd)">${money(u.bal)}</div><div class="mu sm">balance</div></div></div>
 <div class="mu sm" style="margin:8px 0">Earned ${money(u.earned)} · Withdrawn ${money(u.wd)} · Tasks ${u.done||0} · Code ${esc(u.code||'')} ${presChip(u.id)} · Joined ${fdt(u.createdAt)}</div>
 <div class="row wrap"><button class="btn s" data-a="uView" data-p="${esc(u.id)}">View</button><button class="btn s" data-a="uAdj" data-p="${esc(u.id)}">± Balance</button><button class="btn s" data-a="uNotify" data-p="${esc(u.id)}">🔔 Notify</button><button class="btn ${u.blocked?'ok':'er'} s" data-a="uBlock" data-p="${esc(u.id)}">${u.blocked?'Unblock':'Block'}</button></div></div>`):empty('👥','No users found'))}},

refs:{bar:()=>`<div class="tools"><div class="pills">${[['pending','In progress'],['qualified','Qualified'],['all','All']].map(([k,n])=>`<button class="${FLT.refs===k?'on':''}" data-a="flt" data-k="refs" data-p="${k}">${n}</button>`).join('')}</div></div><p class="mu sm" style="margin-bottom:10px">ℹ️ Sirf information ke liye. Referral poori tarah automatic hai: friend ke 3 tasks complete hote hi referrer ko reward (₹${esc(D.config.referralReward??2)}) apne aap, sirf ek baar credit ho jata hai (referrer ka app khulte hi). Admin ko kuch approve / qualify / pay nahi karna.</p>`,
 list:()=>{const REQ=3,sd=new Set(rsLoad().ids),dn=r=>{const fr=D.users.find(u=>u.id===r.nuid);return Math.min(REQ,Math.max(+r.done||0,fr?(+fr.done||0):0))},ql=r=>!!(r.paid||dn(r)>=REQ),f=FLT.refs||'pending',l=D.refs.filter(r=>f==='all'||(f==='qualified')===ql(r)).sort((a,b)=>(b.ts||0)-(a.ts||0));
 return l.length?lim(l,r=>{const d=dn(r),fresh=rsLoad().init&&!sd.has(r.id);return `<div class="card"><div class="row sp wrap"><div class="grow"><b>${esc(r.name||unameOf(r.nuid))}</b> <span class="mu sm">joined ${fdt(r.ts)}</span>${fresh?' <span class="chip wa">🆕 New Referral</span>':''}<div class="mu sm">Referred by: ${esc(unameOf(r.ruid))}</div><div class="mu sm">Progress: ${d}/${REQ} tasks</div></div>${r.paid?`<span class="chip ok">✓ Qualified · Reward credited${r.paidAmount?' '+money(r.paidAmount):''}</span>`:ql(r)?'<span class="chip ok">Qualified · reward auto-credit ho raha hai</span>':`<span class="chip wa">In progress · ${d}/${REQ}</span>`}</div></div>`}):empty('🔗','No referrals')}},

sup:{bar:()=>`<div class="tools"><div class="pills">${[['tickets','Tickets'],['reports','Task reports']].map(([k,n])=>`<button class="${FLT.sup===k?'on':''}" data-a="flt" data-k="sup" data-p="${k}">${n}</button>`).join('')}</div></div>`,
 list:()=>{if(FLT.sup==='tickets'){const l=[...D.tix].sort((a,b)=>(b.createdAt||0)-(a.createdAt||0));return l.length?lim(l,t=>`<div class="card"><div class="row sp wrap"><div class="grow"><b>${esc(t.subject||'')}</b><div class="mu sm">${esc(t.category||'')} · ${esc(t.name||'')} · ${esc(t.email||'')} · ${fdt(t.createdAt)}</div></div>${chip(t.status||'open')}</div><p style="margin:8px 0;overflow-wrap:anywhere">${esc(t.message||'')}</p>${t.reply?`<div class="card" style="background:var(--soft);box-shadow:none"><b class="sm">Your reply</b><p class="sm">${esc(t.reply)}</p></div>`:''}<button class="btn p s" data-a="tkReply" data-p="${esc(t.id)}">Reply / update</button></div>`):empty('🎧','No tickets')}
 const l=[...D.reps].sort((a,b)=>(b.createdAt||0)-(a.createdAt||0));return l.length?lim(l,r=>{const t=D.tasks.find(x=>x.id===r.taskId);return `<div class="card"><div class="row sp wrap"><div class="grow"><b>${esc(t?t.title:(r.taskId||'Task'))}</b><div class="mu sm">Reported by ${esc(r.name||'')} · ${fdt(r.createdAt)}</div></div>${chip(r.status||'open')}</div><p style="margin:8px 0">Reason: <b>${esc(r.reason||'')}</b></p><div class="row wrap">${(r.status||'open')==='open'?`<button class="btn ok s" data-a="repOk" data-p="${esc(r.id)}">Mark resolved</button>`:''}${t&&t.active!==false?`<button class="btn er s" data-a="taskTog" data-p="${esc(t.id)}">Hide this task</button>`:''}</div></div>`}):empty('⚑','No task reports')}},

bc:{bar:()=>`<div class="card"><h2>Send notification to all users</h2><label class="l" for="bt">Title</label><input id="bt" maxlength="80" placeholder="e.g. New offers added!"><label class="l" for="bm">Message</label><textarea id="bm" rows="3" maxlength="300" placeholder="Message…"></textarea><button class="btn p" style="margin-top:12px" data-a="bcSend">📢 Send broadcast</button><p class="mu sm" style="margin-top:8px">Sirf un users ko jayega jo is broadcast se pehle ya 1 din ke andar register hue. Naye users purane broadcast nahi dekhte.</p></div><h3 style="margin:16px 0 8px">History</h3>`,
 list:()=>{const l=[...D.bc].sort((a,b)=>(b.ts||0)-(a.ts||0));return l.length?l.map(b=>`<div class="card"><div class="row sp"><div class="grow"><b>${esc(b.title)}</b><div class="mu sm">${fdt(b.ts)}</div></div><button class="btn er s" data-a="bcDel" data-p="${esc(b.id)}">Delete</button></div><p style="margin-top:6px">${esc(b.message||'')}</p></div>`).join(''):empty('📢','No broadcasts yet')}},

lbd:{bar:()=>`<p class="mu sm" style="margin-bottom:10px">Ye wahi list hai jo app me users ko dikhti hai (<b>wallet amount</b> ke hisaab se, top 10 dikhte hain). Naye users apne aap judte hain. Aap kisi bhi existing user ko ya naya custom naam + ID + amount add karke rank par la sakte ho.</p><div class="tools"><button class="btn p" data-a="lbEdit" data-p="">＋ Add to leaderboard</button><button class="btn s" data-a="lbSync">🔄 Sync all balances</button></div>`,
 list:()=>{const real=r=>{if(typeof r.b==='number')return r.b;const u=D.users.find(x=>x.id===r.id);return +(u&&u.bal)||0},ea=r=>typeof r.a==='number'?r.a:real(r);const l=[...D.lb].sort((x,y)=>ea(y)-ea(x)||(+y.e||0)-(+x.e||0)).slice(0,100);return l.length?l.map((r,i)=>{const h=!!D.lbh[r.id],ov=typeof r.a==='number',mn=!!r.m;return `<div class="card"><div class="row"><b style="width:34px;font-size:18px">${['🥇','🥈','🥉'][i]||'#'+(i+1)}</b><div class="grow"><b>${esc(r.n||'User')}</b>${mn?' <span class="chip wa">Manual</span>':''}${ov?' <span class="chip wa">Admin amount</span>':''}${h?' <span class="chip er">Hidden</span>':''}<div class="mu sm">ID: ${esc(r.c||'—')}${mn?' · custom entry':' · '+esc(unameOf(r.id))+' · '+esc(r.id)}</div></div><div style="text-align:right"><div class="b" style="color:var(--pd)">${money(ea(r))}</div>${ov?`<div class="mu sm">real ${money(real(r))}</div>`:''}</div></div><div class="row wrap" style="margin-top:8px"><button class="btn s" data-a="lbEdit" data-p="${esc(r.id)}">Edit amount</button>${mn||ov?`<button class="btn er s" data-a="lbDel" data-p="${esc(r.id)}">${mn?'Remove':'Reset to real'}</button>`:''}<button class="btn s ${h?'ok':'er'}" data-a="lbHide" data-p="${esc(r.id)}">${h?'Show':'Hide'}</button></div></div>`}).join(''):empty('🏆','Abhi koi user leaderboard me nahi hai')}},

set:{bar:()=>{const c=D.config,dr=Array.isArray(c.dailyRewards)&&c.dailyRewards.length===7?c.dailyRewards:[.1,.2,.3,.4,.5,.6,.7],an=c.announcement||{},mt=c.maintenance||{},faq=Array.isArray(c.faq)?c.faq.map(x=>Array.isArray(x)?{q:x[0],a:x[1]}:x):[];
 return `<div class="card"><h2>General</h2><div class="two"><div><label class="l" for="s_app">App name</label><input id="s_app" value="${esc(c.appName||'Smart Cash')}"></div><div><label class="l" for="s_wa">Support WhatsApp (with country code)</label><input id="s_wa" value="${esc(c.supportWhatsapp||'919568153948')}"></div></div><label class="l" for="s_link">📲 App download link (https://…)</label><input id="s_link" type="url" placeholder="https://play.google.com/store/apps/details?id=…" value="${esc(c.appLink||'')}" autocapitalize="none"><div class="mu sm" style="margin:4px 0 10px">Jab user app ko refer / share karega, friend isi link par redirect hoga. App name upar "App name" me hai. Khali chhodoge to abhi ka web link share hoga.</div><label class="l" for="s_tg">Telegram channel URL</label><input id="s_tg" placeholder="https://t.me/yourchannel" autocapitalize="none" value="${esc(c.telegramUrl||'https://t.me/')}"><div class="two"><div><label class="l" for="s_ref">Referral reward (₹)</label><input id="s_ref" type="number" step="0.01" value="${esc(c.referralReward??2)}"></div><div><label class="l" for="s_min">Minimum withdrawal (₹)</label><input id="s_min" type="number" step="0.01" value="${esc(c.minWithdrawal??50)}"></div></div></div>
 <div class="card"><h2>Daily check-in rewards (₹)</h2><div class="grid" style="grid-template-columns:repeat(auto-fill,minmax(90px,1fr));margin:8px 0 0">${dr.map((x,i)=>`<div><label class="l">Day ${i+1}</label><input id="s_d${i}" type="number" step="0.01" value="${esc(x)}"></div>`).join('')}</div></div>
 <div class="card"><h2>Control</h2><label class="chk"><input type="checkbox" id="s_reg" ${c.registrationOpen!==false?'checked':''}> New registrations open</label><label class="chk"><input type="checkbox" id="s_demo" ${c.demoMode?'checked':''}> Demo mode (user app me demo/test buttons dikhao)</label>
 <label class="chk"><input type="checkbox" id="s_an_on" ${an.active?'checked':''}> Show announcement bar on app home</label><input id="s_an_tx" placeholder="Announcement text" value="${esc(an.text||'')}" style="margin-top:6px">
 <label class="chk"><input type="checkbox" id="s_mt_on" ${mt.active?'checked':''}> 🛠️ Maintenance mode (app band ho jayega)</label><input id="s_mt_tx" placeholder="Maintenance message" value="${esc(mt.message||'We are making Smart Cash better. Please check back soon.')}" style="margin-top:6px"></div>
 <div class="card"><div class="row sp"><h2>FAQ</h2><button class="btn s" data-a="faqAdd">＋ Add</button></div><p class="mu sm">Khali chhodoge to app ke default FAQ dikhenge.</p><div id="faqs" style="margin-top:8px">${faq.map(faqRow).join('')}</div></div>
 <button class="btn p" style="width:100%;min-height:48px" data-a="saveCfg">💾 Save settings</button>
 <div class="card" style="margin-top:14px"><h2>Admins</h2><div id="adm">${admList()}</div><label class="l" for="s_adm">Add admin by User UID</label><div class="row"><input id="s_adm" placeholder="Firebase UID"><button class="btn p" data-a="admAdd">Add</button></div></div>
 <div class="card"><b>Your UID</b><div class="mu sm" style="overflow-wrap:anywhere">${esc(ME&&ME.uid)}</div></div>`}}
};
const faqRow=x=>`<div class="fq"><input class="fqq" placeholder="Question" value="${esc(x.q||'')}"><textarea class="fqa" rows="2" placeholder="Answer" style="margin-top:6px">${esc(x.a||'')}</textarea><button class="btn er s" data-a="faqDel" style="margin-top:6px">Remove</button></div>`;
const admList=()=>D.admins.map(id=>`<div class="kv"><span>${esc(unameOf(id))}<br><span class="mu sm">${esc(id)}</span></span><span>${id===(ME&&ME.uid)?'<span class="chip">You</span>':`<button class="btn er s" data-a="admDel" data-p="${esc(id)}">Remove</button>`}</span></div>`).join('');

/* ---------- render ---------- */
function buildNav(){const c=cnt();$('#side').innerHTML=`<div class="br"><i><img src="logo.png" alt=""></i>Smart Cash</div>`+NAVS.map(([k,i,n])=>`<button class="nv ${cur===k?'on':''}" data-a="go" data-p="${k}"><span>${i}</span>${n}${c[k]?`<span class="bd">${c[k]}</span>`:''}</button>`).join('')+`<button class="nv" data-a="logout" style="margin-top:auto"><span>🚪</span>Logout</button>`;
 const MN=['dash','subs','wds','users'],SH={dash:'Home',subs:'Reviews',wds:'Payouts',users:'Users'},mo=NAVS.filter(x=>!MN.includes(x[0])).reduce((a,x)=>a+(c[x[0]]||0),0);
 $('#bnav').innerHTML=MN.map(k=>{const n=NAVS.find(x=>x[0]===k);return `<button class="${cur===k?'on':''}" data-a="go" data-p="${k}"><i>${n[1]}</i><span>${SH[k]}</span>${c[k]?`<span class="bd">${c[k]}</span>`:''}</button>`}).join('')+`<button class="${MN.includes(cur)?'':'on'}" data-more="1"><i>⋯</i><span>More</span>${mo?`<span class="bd">${mo}</span>`:''}</button>`}
function draw(){const v=V[cur],n=NAVS.find(x=>x[0]===cur);$('#main').innerHTML=`<h1 class="ttl">${n[1]} ${n[2]}</h1>`+(v.bar?v.bar():'')+`<div id="list"></div>`;paint();buildNav()}
function paint(){const l=$('#list');if(l&&V[cur].list)l.innerHTML=V[cur].list();if(cur==='refs')rsMarkAll();buildNav()}
setInterval(()=>{const a=document.activeElement,t=a&&a.tagName;if(cur==='users'&&$('#app').style.display==='block'&&!$('#modal').classList.contains('show')&&t!=='INPUT'&&t!=='TEXTAREA'&&t!=='SELECT')tick()},60000);
let tk=0;const tick=()=>{clearTimeout(tk);tk=setTimeout(()=>{if($('#app').style.display==='block'&&cur!=='set')paint();else buildNav()},150)};

/* ---------- actions ---------- */
const cleanImg=raw=>{let u=String(raw||'').trim();if(!u)return{url:''};const m=u.match(/https?:\/\/[^\s"'<>\[\]()]+/i);if(!m)return{url:u,warn:'Link https:// se shuru hona chahiye.'};u=m[0];
 let d=u.match(/drive\.google\.com\/file\/d\/([\w-]+)/);if(d)u='https://drive.google.com/uc?export=view&id='+d[1];
 if(/dropbox\.com/i.test(u))u=u.replace(/[?&]dl=0/,'').replace(/www\.dropbox\.com/,'dl.dropboxusercontent.com');
 if(/^https?:\/\/(www\.)?ibb\.co\//i.test(u)||/^https?:\/\/(www\.)?postimg\.cc\//i.test(u)||/^https?:\/\/(www\.)?imgur\.com\/(?!a\/)[\w]+$/i.test(u))return{url:u,warn:'Ye page ka link hai, image ka direct link nahi. Upload ke baad "Direct link" wala link lo (i.ibb.co/…jpg ya i.postimg.cc/…jpg).'};
 return{url:u}};
const IMG={t:'',b:''};
const prevAny=u=>/^data:/.test(u||'')?`<img src="${esc(u)}" class="pimg" style="cursor:default" alt="">`:prevH(u);
const urlOnly=u=>/^data:/.test(u||'')?'':(u||'');
const prevH=raw=>{if(!raw)return'';const c=cleanImg(raw);if(c.warn)return `<span class="chip er" style="white-space:normal">⚠ ${esc(c.warn)}</span>`;
 return `<img src="${esc(c.url)}" referrerpolicy="no-referrer" class="pimg" style="cursor:default" alt="" onerror="this.outerHTML='<span class=&quot;chip er&quot; style=&quot;white-space:normal&quot;>Preview nahi dikh raha. Link kholke check karo; sahi ho to panel ko Chrome / hosting se kholo (Claude ke preview me images block ho sakti hain).</span>'"><a class="sm" href="${esc(c.url)}" target="_blank" rel="noopener noreferrer">🔗 Link kholke check karo</a>`}
const find=(a,id)=>D[a].find(x=>x.id===id);
const arr=v=>Array.isArray(v)?v.filter(x=>x!=null):v&&typeof v==='object'?Object.values(v):[];
let BUSY=false;const once=fn=>async(...a)=>{if(BUSY)return;BUSY=true;try{return await fn(...a)}finally{BUSY=false}};
const srvStatus=async path=>{try{return (await get(ref(db,path))).val()}catch(e){return undefined}};
const A={
imgRm:el=>{const k=el.dataset.p;IMG[k]='';const u=$('#'+k+'_img'),f=$('#'+k+'_file'),pv=$('#'+k+'_pv');if(u)u.value='';if(f)f.value='';if(pv)pv.innerHTML='';toast('Image hata di (Save dabao)')},
close:closeM,conf:()=>{const f=CONF;CONF=null;closeM();f&&f()},
go:el=>{cur=el.dataset.p;Q='';LIM=40;$('#side').classList.remove('open');draw();scrollTo(0,0)},
more:()=>{LIM+=40;paint()},
flt:el=>{FLT[el.dataset.k]=el.dataset.p;LIM=40;draw()},
cp:el=>copyTxt(el.dataset.p),
logout:async()=>{opened=false;fbLive=false;unsub.forEach(f=>f());unsub=[];$('#app').style.display='none';$('#login').style.display='grid';$('#lpw').value='';try{await TO(signOut(auth),4000)}catch(e){}},
zoom:el=>{const s=find('subs',el.dataset.p);if(s)openM(`<img src="${esc(el.dataset.w==='p'?s.proof.photo:s.proof.value)}" style="max-width:100%;border-radius:14px" alt=""><button class="btn full" style="width:100%;margin-top:12px" data-a="close">Close</button>`)},
/* reviews */
subOk:el=>ask('Is task ko approve karke user ko reward credit karein?',once(async()=>{const s=find('subs',el.dataset.p);if(!s)return;try{const cs=await srvStatus('submissions/'+s.id+'/status');if((cs||'pending')!=='pending')return toast('Ye task pehle hi review ho chuka hai ('+cs+')',1);await update(ref(db,'submissions/'+s.id),{status:'approved',reviewedAt:Date.now()});await inbox(s.uid,{type:'review',taskId:s.taskId,ok:true});toast('✓ Approved — reward user ko mil jayega')}catch(e){toast(e.message,1)}}),'Approve'),
subNo:el=>openM(`<h2>Reject task</h2><label class="l" for="rr">Reason (user ko dikhega)</label><select id="rr"><option>Proof unclear</option><option>Required action was not completed</option><option>Incorrect link</option><option>Task requirement not satisfied</option><option>Duplicate submission</option><option value="">Custom…</option></select><input id="rc" placeholder="Custom reason" style="margin-top:8px"><div class="row" style="margin-top:14px"><button class="btn grow" data-a="close">Cancel</button><button class="btn er grow" data-a="subNo2" data-p="${esc(el.dataset.p)}">Reject</button></div>`),
subNo2:once(async el=>{const s=find('subs',el.dataset.p),reason=val('rc')||val('rr')||'Proof unclear';if(!s)return;try{const cs=await srvStatus('submissions/'+s.id+'/status');if((cs||'pending')!=='pending'){closeM();return toast('Ye task pehle hi review ho chuka hai ('+cs+')',1)}await update(ref(db,'submissions/'+s.id),{status:'rejected',reviewedAt:Date.now(),reason});await inbox(s.uid,{type:'review',taskId:s.taskId,ok:false,reason});closeM();toast('✕ Rejected')}catch(e){toast(e.message,1)}}),
/* leaderboard */
lbEdit:el=>{const id=el.dataset.p,ex=id?find('lb',id):null;if(id&&!ex)return;const mn=!!(ex&&ex.m),realE=!!(ex&&!mn),u=realE?find('users',id):null;
 const nm=ex?(ex.n||''):'',cd=ex?(ex.c||''):'',am=ex?(typeof ex.a==='number'?ex.a:(typeof ex.b==='number'?ex.b:(u?+u.bal||0:0))):'';
 openM(`<h2>${ex?'Edit leaderboard entry':'Add to leaderboard'}</h2><input type="hidden" id="lb_id" value="${esc(id||'')}">${ex?'':`<label class="l" for="lb_u">Existing user (optional)</label><select id="lb_u"><option value="">— Naya custom user —</option>${[...D.users].sort((x,y)=>String(x.name||'').localeCompare(String(y.name||''))).map(x=>`<option value="${esc(x.id)}">${esc(x.name||x.email||x.id)} · ${esc(x.code||'')} · ${money(x.bal)}</option>`).join('')}</select>`}<label class="l" for="lb_n">Name</label><input id="lb_n" maxlength="24" value="${esc(nm)}" ${realE?'disabled':''}><label class="l" for="lb_c">User ID (app me dikhegi)</label><input id="lb_c" maxlength="16" value="${esc(cd)}" ${realE?'disabled':''}><label class="l" for="lb_a">Amount (₹)</label><input id="lb_a" type="number" step="0.01" min="0" value="${esc(am)}"><div class="mu sm" style="margin-top:6px">${realE?'Real user hai: sirf leaderboard amount badlega, uska asli wallet nahi.':'Existing user chunoge to uska naam/ID apne aap aa jayega. Amount sirf leaderboard me dikhega, asli wallet me nahi jayega.'}</div><div class="row" style="margin-top:14px"><button class="btn grow" data-a="close">Cancel</button><button class="btn p grow" data-a="lbSave">Save</button></div>`)},
lbSave:once(async()=>{const id0=val('lb_id'),pick=val('lb_u'),key=id0||pick,amt=parseFloat(val('lb_a'));if(!isFinite(amt)||amt<0)return toast('Amount sahi daalo',1);const a=+amt.toFixed(2),ex=key?find('lb',key):null;
 try{
  if(key&&!(ex&&ex.m)){const u=find('users',key)||{},o={a};if(!ex||ex.b==null){const w=String(u.name||val('lb_n')||'User').trim().split(/\s+/);Object.assign(o,{n:(w[0]||'User').slice(0,14)+(w[1]?' '+w[1][0].toUpperCase()+'.':''),c:u.code||'',b:+(+u.bal||0).toFixed(2),e:+u.earned||0,p:0,t:Date.now()})}await update(ref(db,'lb/'+key),o)}
  else{const n=val('lb_n').trim(),c=val('lb_c').trim();if(n.length<2)return toast('Naam likho',1);const k=key||'adm_'+Date.now().toString(36);await update(ref(db,'lb/'+k),{n,c,b:a,e:a,p:0,t:Date.now(),m:1})}
  closeM();toast('✓ Leaderboard me save ho gaya')}catch(e){toast(e.message,1)}}),
lbDel:el=>{const id=el.dataset.p,ex=find('lb',id);if(!ex)return;ask(ex.m?'Ye entry leaderboard se hata dein?':'Admin amount hata kar asli wallet balance par wapas karein?',once(async()=>{try{if(ex.m)await remove(ref(db,'lb/'+id));else await update(ref(db,'lb/'+id),{a:null});toast('✓ Done')}catch(e){toast(e.message,1)}}),ex.m?'Remove':'Reset')},
lbSync:once(async()=>{try{const P={};D.users.forEach(u=>{const ex=D.lb.find(x=>x.id===u.id)||{},w=String(u.name||'User').trim().split(/\s+/);P['lb/'+u.id+'/b']=+((+u.bal||0).toFixed(2));P['lb/'+u.id+'/e']=+u.earned||0;P['lb/'+u.id+'/c']=u.code||'';if(!ex.n)P['lb/'+u.id+'/n']=(w[0]||'User').slice(0,14)+(w[1]?' '+w[1][0].toUpperCase()+'.':'');if(ex.p==null)P['lb/'+u.id+'/p']=0;if(!ex.t)P['lb/'+u.id+'/t']=Date.now()});if(!Object.keys(P).length)return toast('Koi user nahi mila');await update(ref(db),P);toast('✓ '+D.users.length+' users ka balance leaderboard me sync ho gaya')}catch(e){toast(e.message,1)}}),
lbHide:once(async el=>{const id=el.dataset.p,h=!!D.lbh[id];try{await set(ref(db,'lbHide/'+id),h?null:true);toast(h?'Leaderboard me wapas dikhega':'Leaderboard se hata diya')}catch(e){toast(e.message,1)}}),
/* withdrawals */
wdOk:el=>ask('Payment kar di? Withdrawal ko PAID mark karein?',once(async()=>{const w=find('wds',el.dataset.p);if(!w)return;try{const cs=await srvStatus('withdrawals/'+w.id+'/status');if((cs||'pending')!=='pending')return toast('Ye withdrawal pehle hi process ho chuki hai ('+cs+')',1);await update(ref(db,'withdrawals/'+w.id),{status:'paid',paidAt:Date.now()});await inbox(w.uid,{type:'withdrawal',txId:w.id,ok:true});toast('✓ Marked paid')}catch(e){toast(e.message,1)}}),'Mark paid'),
wdNo:el=>ask('Reject karke amount user ke wallet me wapas bhej dein?',once(async()=>{const w=find('wds',el.dataset.p);if(!w)return;try{const cs=await srvStatus('withdrawals/'+w.id+'/status');if((cs||'pending')!=='pending')return toast('Ye withdrawal pehle hi process ho chuki hai ('+cs+')',1);await update(ref(db,'withdrawals/'+w.id),{status:'rejected',paidAt:Date.now()});await inbox(w.uid,{type:'withdrawal',txId:w.id,ok:false});toast('Rejected & refunded')}catch(e){toast(e.message,1)}}),'Reject & refund'),
/* tasks */
taskEdit:el=>{const t=el.dataset.p?find('tasks',el.dataset.p):{};if(el.dataset.p&&!t)return;IMG.t=t.image||'';
 openM(`<h2>${t.id?'Edit task':'New task'}</h2><input type="hidden" id="t_id" value="${esc(t.id||'')}"><div class="two"><div><label class="l" for="t_ic">Icon (emoji)</label><input id="t_ic" value="${esc(t.icon||'🎯')}" maxlength="4"></div><div><label class="l" for="t_rw">Reward (₹)</label><input id="t_rw" type="number" step="0.01" value="${esc(t.reward??'')}"></div></div>
 <label class="l" for="t_ti">Title</label><input id="t_ti" value="${esc(t.title||'')}" maxlength="80"><label class="l" for="t_de">Description</label><textarea id="t_de" rows="2">${esc(t.description||'')}</textarea>
 <div class="two"><div><label class="l" for="t_pt">Proof required</label><select id="t_pt">${[['screenshot','Screenshot'],['text','Text answer'],['url','Page URL'],['username','Username / handle']].map(([k,n])=>`<option value="${k}" ${(t.proofType||'screenshot')===k?'selected':''}>${n}</option>`).join('')}</select></div><div><label class="l" for="t_et">Estimated time</label><input id="t_et" placeholder="e.g. 3 min" value="${esc(t.estimatedTime||'')}"></div></div>
 <label class="l" for="t_li">Task link (https://…)</label><input id="t_li" placeholder="https://t.me/yourchannel  ya  Play Store link" autocapitalize="none" value="${esc(t.taskLink||'')}"><div class="mu sm" style="margin:4px 0 10px">Telegram (t.me/…) ya Play Store link dalo — user ke phone me seedha Telegram / Play Store app khulega, app na ho to browser me.</div><label class="l" for="t_in">How to complete (one step per line)</label><textarea id="t_in" rows="5">${esc((Array.isArray(t.instructions)?t.instructions:t.instructions&&typeof t.instructions==='object'?Object.values(t.instructions):[]).join('\n'))}</textarea>
 <label class="l" for="t_file">📷 Phone se image upload karo (optional)</label><div class="szhint">📐 <b>Koi bhi photo chuno</b> — crop screen khulegi. <b>1:1 square</b> frame me photo set karo, final <b>460 × 460 px</b>. App ki offers list me square icon ban kar dikhegi (task detail page me beech ka hissa dikhta hai, isliye subject beech me rakho).</div><input type="file" accept="image/*" id="t_file"><label class="l" for="t_img">ya Image link / URL (optional)</label><input id="t_img" type="url" placeholder="https://example.com/photo.jpg" value="${esc(urlOnly(t.image))}" autocapitalize="none"><div id="t_pv" style="margin-top:6px">${prevAny(t.image)}</div><button class="btn s" type="button" data-a="imgRm" data-p="t" style="margin-top:6px">Remove image</button>
 <label class="chk"><input type="checkbox" id="t_ac" ${t.active!==false?'checked':''}> Active (users ko dikhe)</label><div class="row" style="margin-top:16px"><button class="btn grow" data-a="close">Cancel</button><button class="btn p grow" data-a="taskSave">Save</button></div>`)},
taskSave:once(async()=>{const id0=val('t_id'),ti=val('t_ti'),rw=parseFloat(val('t_rw')),li0=val('t_li'),li=normUrl(li0);if(ti.length<3)return toast('Title likho',1);if(!(rw>0))return toast('Reward amount sahi daalo',1);if(li0&&!li)return toast('Link sahi daalo (https:// se shuru)',1);if(val('t_img')&&cleanImg(val('t_img')).warn)return toast(cleanImg(val('t_img')).warn,1);const iu=IMG.t;
 const old=id0?find('tasks',id0):null,id=id0||'TASK_'+Date.now().toString(36).toUpperCase(),o={id,icon:val('t_ic')||'🎯',title:ti,description:val('t_de'),reward:+rw.toFixed(2),proofType:val('t_pt'),estimatedTime:val('t_et'),taskLink:li,instructions:val('t_in').split(/\r?\n/).map(s=>s.trim()).filter(Boolean),image:iu,active:chk('t_ac'),createdAt:(old&&old.createdAt)||Date.now(),updatedAt:Date.now()};
 try{await update(ref(db,'tasks/'+id),o);closeM();toast('✓ Task saved')}catch(e){toast(e.message,1)}}),
taskTog:async el=>{const t=find('tasks',el.dataset.p);if(!t)return;try{await update(ref(db,'tasks/'+t.id),{active:t.active===false,updatedAt:Date.now()});toast(t.active===false?'Task live':'Task hidden')}catch(e){toast(e.message,1)}},
taskDup:async el=>{const t=find('tasks',el.dataset.p);if(!t)return;const id='TASK_'+Date.now().toString(36).toUpperCase(),{id:_,...r}=t;try{await set(ref(db,'tasks/'+id),{...r,id,title:t.title+' (copy)',active:false,createdAt:Date.now(),updatedAt:Date.now()});toast('Duplicated (hidden)')}catch(e){toast(e.message,1)}},
taskDel:el=>ask('Task delete karein? Users ki purani history snapshot se bachi rahegi.',async()=>{try{await remove(ref(db,'tasks/'+el.dataset.p));toast('Deleted')}catch(e){toast(e.message,1)}},'Delete'),
/* banners */
bnEdit:el=>{const b=el.dataset.p?find('banners',el.dataset.p):{};IMG.b=b.image||'';const pre=['tg','refer','tasks','wallet','profile','checkin','gift'],isC=b.link&&!pre.includes(b.link);
 openM(`<h2>${b.id?'Edit banner':'New banner'}</h2><input type="hidden" id="b_id" value="${esc(b.id||'')}"><label class="l" for="b_ti">Title</label><input id="b_ti" maxlength="70" value="${esc(b.title||'')}"><label class="l" for="b_su">Subtitle</label><input id="b_su" maxlength="120" value="${esc(b.subtitle||'')}">
 <div class="two"><div><label class="l" for="b_bt">Button text</label><input id="b_bt" value="${esc(b.buttonText||'')}" maxlength="20"></div><div><label class="l" for="b_ic">Icon (emoji)</label><input id="b_ic" value="${esc(b.icon||'🎁')}" maxlength="4"></div></div>
 <label class="l" for="b_lk">Button action</label><select id="b_lk">${[['tg','Open Telegram'],['refer','Refer page'],['tasks','Earn / Tasks'],['wallet','Wallet'],['profile','Profile'],['checkin','Check-in page'],['gift','Daily gift popup'],['url','Custom https:// link…']].map(([k,n])=>`<option value="${k}" ${(isC?'url':b.link||'tg')===k?'selected':''}>${n}</option>`).join('')}</select><input id="b_url" placeholder="https://…" value="${isC?esc(b.link):''}" style="margin-top:8px">
 <div class="two"><div><label class="l" for="b_c1">Color 1</label><input id="b_c1" type="color" value="${esc((b.bg||[])[0]||'#1d8fb0')}"></div><div><label class="l" for="b_c2">Color 2</label><input id="b_c2" type="color" value="${esc((b.bg||[])[1]||'#2ec4a5')}"></div></div>
 <div class="two"><div><label class="l" for="b_or">Order (1 = first)</label><input id="b_or" type="number" value="${esc(b.order||D.banners.length+1)}"></div><div></div></div>
 <label class="l" for="b_file">📷 Phone se background image upload karo (optional, icon ki jagah)</label><div class="szhint">📐 <b>Koi bhi photo chuno</b> — crop screen khulegi. <b>12:5 wide</b> frame (app ke hero slider jaisa), final <b>960 × 400 px</b>.<br>✨ Image lagane par <b>title / subtitle / button app me image ke upar nahi dikhenge</b> — sirf saaf image dikhegi (image par tap karne se Button action chalega). Title sirf admin label hai.</div><input type="file" accept="image/*" id="b_file"><label class="l" for="b_img">ya Image link / URL (optional)</label><input id="b_img" type="url" placeholder="https://example.com/banner.jpg" value="${esc(urlOnly(b.image))}" autocapitalize="none"><div id="b_pv" style="margin-top:6px">${prevAny(b.image)}</div><button class="btn s" type="button" data-a="imgRm" data-p="b" style="margin-top:6px">Remove image</button>
 <label class="chk"><input type="checkbox" id="b_ac" ${b.active!==false?'checked':''}> Active</label><div class="row" style="margin-top:16px"><button class="btn grow" data-a="close">Cancel</button><button class="btn p grow" data-a="bnSave">Save</button></div>`)},
bnSave:once(async()=>{const ti=val('b_ti');if(ti.length<3)return toast('Title likho',1);let lk=val('b_lk');if(lk==='url'){lk=normUrl(val('b_url'));if(!lk)return toast('Valid https:// link daalo',1)}
 if(val('b_img')&&cleanImg(val('b_img')).warn)return toast(cleanImg(val('b_img')).warn,1);const iu=IMG.b;const id0=val('b_id'),id=id0||'BN_'+Date.now().toString(36).toUpperCase(),o={id,title:ti,subtitle:val('b_su'),buttonText:val('b_bt'),link:lk,icon:val('b_ic')||'🎁',bg:[val('b_c1'),val('b_c2')],order:+val('b_or')||1,image:iu,active:chk('b_ac')};
 try{await update(ref(db,'banners/'+id),o);closeM();toast('✓ Banner saved')}catch(e){toast(e.message,1)}}),
bnTog:async el=>{const b=find('banners',el.dataset.p);if(!b)return;try{await update(ref(db,'banners/'+b.id),{active:b.active===false})}catch(e){toast(e.message,1)}},
bnDel:el=>ask('Banner delete karein?',async()=>{try{await remove(ref(db,'banners/'+el.dataset.p));toast('Deleted')}catch(e){toast(e.message,1)}},'Delete'),
/* users */
uView:async el=>{const u=find('users',el.dataset.p);openM('<p class="mu">Loading…</p>');let S=null;try{const s=await get(ref(db,'users/'+el.dataset.p+'/state'));S=s.val()}catch(e){}
 if(!S)return openM(`<h2>${esc(u?u.name:'User')}</h2><p class="mu">User data load nahi hua.</p><button class="btn full" style="width:100%;margin-top:12px" data-a="close">Close</button>`);
 const tx=arr(S.tx).slice(0,8),tk=Object.entries(S.tasks||{}),pay=arr(S.pay).map(p=>p&&p.label).filter(Boolean).join(', ')||'—',us=S.user||{};
 openM(`${typeof us.photo==='string'&&us.photo.startsWith('data:')?`<img src="${esc(us.photo)}" alt="" style="width:72px;height:72px;border-radius:20px;object-fit:cover;display:block;margin-bottom:8px">`:''}<h2>${esc(us.name)}</h2><div class="mu sm" style="margin-bottom:8px">${esc(us.email)} · ${esc(us.phone||'')}</div><div class="card" style="box-shadow:none"><div class="kv"><span>UID</span><span>${esc(el.dataset.p)}</span></div><div class="kv"><span>Balance</span><span>${money(S.bal)}</span></div><div class="kv"><span>Total earned</span><span>${money(S.earned)}</span></div><div class="kv"><span>Withdrawn / pending</span><span>${money(S.wd)} / ${money(S.pendW)}</span></div><div class="kv"><span>Task / check-in / referral / bonus</span><span>${money(S.eTask)} / ${money(S.eCheck)} / ${money(S.eRef)} / ${money(S.eBonus)}</span></div><div class="kv"><span>Tasks done</span><span>${S.done||0}</span></div><div class="kv"><span>Check-in streak</span><span>${(S.ci||{}).streak||0} (longest ${(S.ci||{}).longestStreak||0})</span></div><div class="kv"><span>Referral code / used</span><span>${esc(us.code||'')} / ${esc(us.referredBy||'—')}</span></div><div class="kv"><span>Payment methods</span><span>${esc(pay)}</span></div></div>
 <h3 style="margin:10px 0 4px">Tasks (${tk.length})</h3>${tk.map(([id,r])=>`<div class="kv"><span>${esc(((r.snap||{}).title)||id)}</span><span>${chip(r.s||'')}</span></div>`).join('')||'<p class="mu sm">None</p>'}
 <h3 style="margin:10px 0 4px">Recent transactions</h3>${tx.map(x=>`<div class="kv"><span>${esc(x.type)} · ${esc(x.desc)}<br><span class="mu sm">${fdt(x.ts)} · ${esc(x.st)}</span></span><span style="color:${x.amt>0?'var(--ok)':'var(--er)'}">${money(x.amt)}</span></div>`).join('')||'<p class="mu sm">None</p>'}<button class="btn full" style="width:100%;margin-top:14px" data-a="close">Close</button>`)},
uAdj:el=>openM(`<h2>Adjust balance</h2><p class="mu sm">${esc(unameOf(el.dataset.p))}</p><label class="l" for="ja_t">Type</label><select id="ja_t"><option value="1">➕ Credit (add)</option><option value="-1">➖ Debit (deduct)</option></select><label class="l" for="ja_a">Amount (₹)</label><input id="ja_a" type="number" step="0.01"><label class="l" for="ja_n">Note (user ko dikhega)</label><input id="ja_n" value="Admin adjustment"><div class="row" style="margin-top:14px"><button class="btn grow" data-a="close">Cancel</button><button class="btn p grow" data-a="uAdj2" data-p="${esc(el.dataset.p)}">Apply</button></div>`),
uAdj2:once(async el=>{const a=parseFloat(val('ja_a'));if(!(a>0))return toast('Amount sahi daalo',1);const amt=a*(+val('ja_t'));try{await inbox(el.dataset.p,{type:'adjust',amount:+amt.toFixed(2),note:val('ja_n')||'Admin adjustment'});closeM();toast('✓ Sent — user ke app me apply ho jayega')}catch(e){toast(e.message,1)}}),
uNotify:el=>openM(`<h2>Notify user</h2><p class="mu sm">${esc(unameOf(el.dataset.p))}</p><label class="l" for="un_t">Title</label><input id="un_t"><label class="l" for="un_m">Message</label><textarea id="un_m" rows="3"></textarea><div class="row" style="margin-top:14px"><button class="btn grow" data-a="close">Cancel</button><button class="btn p grow" data-a="uNotify2" data-p="${esc(el.dataset.p)}">Send</button></div>`),
uNotify2:once(async el=>{if(!val('un_t'))return toast('Title likho',1);try{await inbox(el.dataset.p,{type:'notify',title:val('un_t'),message:val('un_m')});closeM();toast('✓ Notification sent')}catch(e){toast(e.message,1)}}),
uBlock:el=>{const u=find('users',el.dataset.p);if(!u)return;const b=!u.blocked;ask(b?'Is user ko block karein? Wo login nahi kar payega.':'Unblock karein?',async()=>{try{await set(ref(db,'users/'+u.id+'/blocked'),b?true:null);await update(ref(db,'usersIndex/'+u.id),{blocked:b?true:null});toast(b?'Blocked':'Unblocked')}catch(e){toast(e.message,1)}},b?'Block':'Unblock')},
/* referrals */
/* support */
tkReply:el=>{const t=find('tix',el.dataset.p);if(!t)return;openM(`<h2>${esc(t.subject)}</h2><p class="mu sm" style="margin-bottom:8px">${esc(t.message)}</p><label class="l" for="tr_r">Reply</label><textarea id="tr_r" rows="4">${esc(t.reply||'')}</textarea><label class="l" for="tr_s">Status</label><select id="tr_s">${['open','in-progress','closed'].map(s=>`<option ${(t.status||'open')===s?'selected':''}>${s}</option>`).join('')}</select><div class="row" style="margin-top:14px"><button class="btn grow" data-a="close">Cancel</button><button class="btn p grow" data-a="tkSave" data-p="${esc(t.id)}">Send</button></div>`)},
tkSave:once(async el=>{const t=find('tix',el.dataset.p),r=val('tr_r'),s=val('tr_s');if(!t)return;try{await update(ref(db,'tickets/'+t.id),{status:s,reply:r,repliedAt:Date.now()});await inbox(t.uid,{type:'ticket',ticketId:t.id,status:s,reply:r});closeM();toast('✓ Reply sent')}catch(e){toast(e.message,1)}}),
repOk:async el=>{try{await update(ref(db,'reports/'+el.dataset.p),{status:'resolved'});toast('Resolved')}catch(e){toast(e.message,1)}},
/* broadcast */
bcSend:()=>{const t=val('bt'),m=val('bm');if(t.length<3)return toast('Title likho',1);ask('Sabhi users ko notification bhejein?',async()=>{try{const id='BC'+Date.now().toString(36);await set(ref(db,'broadcasts/'+id),{id,title:t,message:m,ts:Date.now()});$('#bt').value='';$('#bm').value='';toast('✓ Broadcast sent')}catch(e){toast(e.message,1)}},'Send')},
bcDel:el=>ask('Broadcast delete karein?',async()=>{try{await remove(ref(db,'broadcasts/'+el.dataset.p));toast('Deleted')}catch(e){toast(e.message,1)}},'Delete'),
/* settings */
faqAdd:()=>$('#faqs').insertAdjacentHTML('beforeend',faqRow({})),faqDel:el=>el.closest('.fq').remove(),
saveCfg:once(async()=>{const dr=[...Array(7)].map((_,i)=>parseFloat(val('s_d'+i)));if(dr.some(x=>!isFinite(x)||x<0))return toast('Daily rewards sahi daalo',1);const ref_=parseFloat(val('s_ref')),mn=parseFloat(val('s_min'));if(!(ref_>=0)||!(mn>0))return toast('Referral / minimum withdrawal sahi daalo',1);
 const faq=[...document.querySelectorAll('.fq')].map(f=>({q:f.querySelector('.fqq').value.trim(),a:f.querySelector('.fqa').value.trim()})).filter(x=>x.q&&x.a);
 const tg0=val('s_tg').trim(),tg=tg0?normUrl(tg0):'';if(tg0&&!tg)return toast('Telegram link sahi daalo (jaise https://t.me/channelname)',1);const lk=val('s_link').trim();if(lk&&!/^https?:\/\/\S+\.\S+$/i.test(lk))return toast('App download link https:// se shuru hona chahiye',1);
  const o={appName:val('s_app')||'Smart Cash',appLink:lk,supportWhatsapp:val('s_wa').replace(/\D/g,''),telegramUrl:tg||'https://t.me/',referralReward:ref_,minWithdrawal:mn,dailyRewards:dr,registrationOpen:chk('s_reg'),demoMode:chk('s_demo'),announcement:{active:chk('s_an_on'),text:val('s_an_tx')},maintenance:{active:chk('s_mt_on'),message:val('s_mt_tx')},faq:faq.length?faq:null};
 try{await update(ref(db,'config'),o);if(tg&&$('#s_tg'))$('#s_tg').value=tg;toast('✓ Settings saved — app me live ho gaye')}catch(e){toast(e.message,1)}}),
admAdd:()=>{const id=val('s_adm');if(id.length<10)return toast('Valid UID daalo',1);ask('Is UID ko admin banayein?',async()=>{try{await set(ref(db,'admins/'+id),true);$('#s_adm').value='';toast('✓ Admin added')}catch(e){toast(e.message,1)}},'Add admin')},
admDel:el=>ask('Admin access hata dein?',async()=>{try{await remove(ref(db,'admins/'+el.dataset.p));toast('Removed')}catch(e){toast(e.message,1)}},'Remove')
};

document.addEventListener('change',e=>{if(e.target.id!=='lb_u')return;const u=find('users',e.target.value),n=$('#lb_n'),c=$('#lb_c'),m=$('#lb_a');if(!u){n.disabled=c.disabled=false;return}const w=String(u.name||'User').trim().split(/\s+/);n.value=(w[0]||'User').slice(0,14)+(w[1]?' '+w[1][0].toUpperCase()+'.':'');c.value=u.code||'';n.disabled=c.disabled=true;m.value=(+u.bal||0).toFixed(2)});
document.addEventListener('click',e=>{if(e.target.id==='modal')return closeM();const a=e.target.closest('[data-a]');if(a&&A[a.dataset.a]){e.preventDefault();A[a.dataset.a](a)}});
document.addEventListener('input',e=>{if(e.target.id==='q'){Q=e.target.value;LIM=40;paint()}});
const cropToast=m=>toast(m,1);
const CROPS={t:{name:'Task image',ratios:[['1:1',1]],w:460,h:460,q:.74,pv:'sq'},b:{name:'Banner image',ratios:[['12:5',2.4]],w:960,h:400,q:.72,pv:'banner'}};
/* ---------- image cropper: gallery photo -> drag / zoom / rotate -> exact size ---------- */
function openCrop(file,cfg,done,cancel){
 const url=URL.createObjectURL(file),im=new Image();
 im.onerror=()=>{URL.revokeObjectURL(url);cropToast('Ye image khul nahi payi. JPG / PNG / WebP chuno');cancel&&cancel()};
 im.onload=()=>startCrop(im,cfg,done,cancel,url);
 im.src=url}
function startCrop(im,cfg,done,cancel,url){
 let src=im,sw=im.naturalWidth,sh=im.naturalHeight;
 if(!sw||!sh){URL.revokeObjectURL(url);cropToast('Image read nahi hui');cancel&&cancel();return}
 const RT=cfg.ratios,multi=RT.length>1;let ri=0;
 const ov=document.createElement('div');ov.id='crop';
 ov.innerHTML=`<div class="cbar"><b>✂️ ${cfg.name} crop karo</b><button type="button" class="cx" id="c_x" aria-label="Close">✕</button></div>
 <div class="cinfo" id="c_info"></div>
 <div class="cstage"><canvas id="c_cv"></canvas></div>
 <div class="cctl"><span>−</span><input type="range" id="c_z" min="0" max="100" value="0" step="0.5" aria-label="Zoom"><span>+</span></div>
 ${multi?`<div class="crow" id="c_rt">${RT.map((r,i)=>`<button type="button" class="btn s${i?'':' on'}" data-i="${i}">${r[0]}</button>`).join('')}</div>`:''}
 <div class="crow"><button type="button" class="btn s" id="c_rot">⟳ Rotate</button><button type="button" class="btn s" id="c_rs">⤢ Reset</button></div>
 <div class="cpv"><div><div class="cl">App mein aisa dikhega</div><canvas id="c_pv"></canvas></div><div id="c_q"></div></div>
 <div class="cact"><button type="button" class="btn" id="c_no">Cancel</button><button type="button" class="btn p" id="c_ok">✓ Use this image</button></div>`;
 document.body.append(ov);const bo=document.body.style.overflow;document.body.style.overflow='hidden';
 const cv=ov.querySelector('#c_cv'),ctx=cv.getContext('2d'),pv=ov.querySelector('#c_pv'),pc=pv.getContext('2d'),zr=ov.querySelector('#c_z'),dpr=Math.min(window.devicePixelRatio||1,3),ZM=6;
 let sW=0,sH=0,fw=0,fh=0,fx0=0,fy0=0,pw=0,ph=0,s=1,cx=0,cy=0,minS=1;
 const ratio=()=>{const r=RT[ri][1];return r==='orig'?Math.min(2.8,Math.max(.4,sw/sh)):r};
 const outSz=()=>{if(cfg.w)return[cfg.w,cfg.h];const r=ratio(),A=cfg.area||520000;let w=Math.round(Math.sqrt(A*r)),h=Math.round(Math.sqrt(A/r));const m=Math.max(w,h);if(m>1280){w=Math.round(w*1280/m);h=Math.round(h*1280/m)}return[w,h]};
 function layout(){const r=ratio();sW=Math.min(innerWidth-24,460);const maxFH=Math.max(140,innerHeight*.4);fw=sW-28;fh=fw/r;if(fh>maxFH){fh=maxFH;fw=fh*r}
  sH=Math.round(Math.max(fh+56,Math.min(innerHeight*.42,360)));fx0=(sW-fw)/2;fy0=(sH-fh)/2;
  cv.width=sW*dpr;cv.height=sH*dpr;cv.style.width=sW+'px';cv.style.height=sH+'px';
  if(cfg.pv==='dp'||cfg.pv==='sq'){pw=ph=76}else if(cfg.pv==='banner'){pw=Math.min(240,sW-150);ph=pw/r}else if(r>=1){pw=130;ph=130/r}else{ph=120;pw=120*r}
  pv.width=pw*dpr;pv.height=ph*dpr;pv.style.width=pw+'px';pv.style.height=ph+'px';pv.style.borderRadius=cfg.pv==='dp'?'50%':cfg.pv==='sq'?'18px':'10px'}
 const clamp=()=>{const hw=sw*s/2,hh=sh*s/2;cx=Math.min(fx0+hw,Math.max(fx0+fw-hw,cx));cy=Math.min(fy0+hh,Math.max(fy0+fh-hh,cy))};
 const reset=()=>{minS=Math.max(fw/sw,fh/sh);s=minS;cx=sW/2;cy=sH/2;zr.value=0;clamp();draw()};
 const setScale=(ns,mx,my)=>{ns=Math.min(minS*ZM,Math.max(minS,ns));cx=mx-(mx-cx)*ns/s;cy=my-(my-cy)*ns/s;s=ns;zr.value=Math.log(s/minS)/Math.log(ZM)*100;clamp();draw()};
 const region=(x,X,Y,W,H)=>x.drawImage(src,(fx0-(cx-sw*s/2))/s,(fy0-(cy-sh*s/2))/s,fw/s,fh/s,X,Y,W,H);
 function draw(){
  ctx.setTransform(dpr,0,0,dpr,0,0);ctx.fillStyle='#0b1418';ctx.fillRect(0,0,sW,sH);
  ctx.imageSmoothingQuality='high';ctx.drawImage(src,cx-sw*s/2,cy-sh*s/2,sw*s,sh*s);
  ctx.fillStyle='rgba(8,16,20,.62)';ctx.fillRect(0,0,sW,fy0);ctx.fillRect(0,fy0+fh,sW,sH-fy0-fh);ctx.fillRect(0,fy0,fx0,fh);ctx.fillRect(fx0+fw,fy0,sW-fx0-fw,fh);
  ctx.strokeStyle='rgba(255,255,255,.35)';ctx.lineWidth=1;ctx.beginPath();for(let i=1;i<3;i++){ctx.moveTo(fx0+fw*i/3,fy0);ctx.lineTo(fx0+fw*i/3,fy0+fh);ctx.moveTo(fx0,fy0+fh*i/3);ctx.lineTo(fx0+fw,fy0+fh*i/3)}ctx.stroke();
  ctx.strokeStyle='#2ec4a5';ctx.lineWidth=2;ctx.strokeRect(fx0,fy0,fw,fh);
  pc.setTransform(dpr,0,0,dpr,0,0);pc.clearRect(0,0,pw,ph);pc.imageSmoothingQuality='high';pc.fillStyle='#fff';pc.fillRect(0,0,pw,ph);region(pc,0,0,pw,ph);
  const vw=fw/s,vh=fh/s,pct=Math.round(vw*vh/(sw*sh)*100),o=outSz(),q=vw/o[0];
  ov.querySelector('#c_info').innerHTML=`Original: <b>${sw}×${sh}</b> px → Final: <b>${o[0]}×${o[1]}</b> px<br>Drag karke photo khiskao · 2 ungli / slider se zoom`;
  ov.querySelector('#c_q').innerHTML=(q>=1?'<b style="color:#5be3c2">✓ Bilkul fit — image sharp rahegi</b>':q>=.7?'<b style="color:#ffd166">👍 Theek hai — halki si soft ho sakti hai</b>':'<b style="color:#ff8b85">⚠ Zyada zoom / chhoti photo — dhundhli dikhegi. Zoom kam karo ya badi photo chuno</b>')+`<br><span style="color:#9fb6ba">Photo ka ~${pct}% hissa dikhega${pct<100?', baaki kat jayega':''}.</span>`}
 const close=()=>{document.removeEventListener('keydown',onKey);URL.revokeObjectURL(url);ov.remove();document.body.style.overflow=bo};
 const onKey=e=>{if(e.key==='Escape'){close();cancel&&cancel()}};document.addEventListener('keydown',onKey);
 const P=new Map(),pd=()=>{if(P.size!==2)return 0;const [a,b]=[...P.values()];return Math.hypot(a[0]-b[0],a[1]-b[1])};let d0=0;
 cv.addEventListener('pointerdown',e=>{try{cv.setPointerCapture(e.pointerId)}catch(_){}P.set(e.pointerId,[e.clientX,e.clientY]);d0=pd();cv.style.cursor='grabbing'});
 cv.addEventListener('pointermove',e=>{const o=P.get(e.pointerId);if(!o)return;const n=[e.clientX,e.clientY];
  if(P.size===1){cx+=n[0]-o[0];cy+=n[1]-o[1];clamp();draw()}
  P.set(e.pointerId,n);
  if(P.size===2){const d=pd(),r=cv.getBoundingClientRect(),[a,b]=[...P.values()];if(d0>0)setScale(s*d/d0,(a[0]+b[0])/2-r.left,(a[1]+b[1])/2-r.top);d0=d}});
 const up=e=>{P.delete(e.pointerId);d0=pd();if(!P.size)cv.style.cursor='grab'};
 cv.addEventListener('pointerup',up);cv.addEventListener('pointercancel',up);
 cv.addEventListener('wheel',e=>{e.preventDefault();const r=cv.getBoundingClientRect();setScale(s*(e.deltaY<0?1.1:1/1.1),e.clientX-r.left,e.clientY-r.top)},{passive:false});
 zr.addEventListener('input',()=>setScale(minS*Math.pow(ZM,zr.value/100),sW/2,sH/2));
 ov.querySelector('#c_rs').onclick=reset;
 ov.querySelector('#c_rot').onclick=()=>{const rc=document.createElement('canvas');rc.width=sh;rc.height=sw;const x=rc.getContext('2d');x.translate(sh,0);x.rotate(Math.PI/2);x.drawImage(src,0,0);src=rc;[sw,sh]=[sh,sw];layout();reset()};
 const rt=ov.querySelector('#c_rt');if(rt)rt.onclick=e=>{const b=e.target.closest('button');if(!b)return;ri=+b.dataset.i;rt.querySelectorAll('button').forEach(x=>x.classList.toggle('on',x===b));layout();reset()};
 ov.querySelector('#c_x').onclick=ov.querySelector('#c_no').onclick=()=>{close();cancel&&cancel()};
 ov.querySelector('#c_ok').onclick=()=>{const z=outSz(),o=document.createElement('canvas');o.width=z[0];o.height=z[1];const x=o.getContext('2d');x.fillStyle='#fff';x.fillRect(0,0,o.width,o.height);x.imageSmoothingQuality='high';region(x,0,0,o.width,o.height);let d;try{d=o.toDataURL('image/jpeg',cfg.q||.72)}catch(er){cropToast('Image process nahi hui');return}close();done(d)};
 layout();reset()}
document.addEventListener('change',e=>{const f=e.target;if(f.id==='usort'){USORT=f.value;paint();return}
 if((f.id==='t_file'||f.id==='b_file')&&f.files[0]){const file=f.files[0];if(!/^image\//.test(file.type)){f.value='';return toast('Sirf image file chuno',1)}const k=f.id[0];f.value='';
  openCrop(file,CROPS[k],d=>{IMG[k]=d;const u=$('#'+k+'_img');if(u)u.value='';const pv=$('#'+k+'_pv');if(pv)pv.innerHTML=prevAny(d);toast('✓ Image crop ho gayi ('+Math.round(d.length*0.75/1024)+' KB) — Save dabao')},()=>{f.value=''})}});
document.addEventListener('input',e=>{const i=e.target;if(i.id==='t_img'||i.id==='b_img'){const k=i.id[0],c=cleanImg(i.value.trim()),pv=$('#'+k+'_pv');IMG[k]=c.warn?'':c.url;if(pv)pv.innerHTML=prevH(i.value.trim())}});
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeM()});
$('#menu').onclick=()=>$('#side').classList.toggle('open');
$('#bnav').addEventListener('click',e=>{if(e.target.closest('[data-more]'))$('#side').classList.toggle('open')});
document.addEventListener('click',e=>{const sd=$('#side');if(sd.classList.contains('open')&&!e.target.closest('#side,#bnav,#menu'))sd.classList.remove('open')});
$('#side').addEventListener('click',e=>{if(e.target.closest('.nv'))$('#side').classList.remove('open')});

/* ---------- auth ---------- */
const lerr=m=>$('#lerr').textContent=m;
const AERR=e=>{const c=(e&&e.code)||'',M={'auth/invalid-credential':'Email ya password galat hai (ya ye email Firebase Authentication me bana hi nahi hai).','auth/wrong-password':'Password galat hai. "Forgot password?" se reset karo.','auth/user-not-found':'Ye email Firebase Authentication me nahi hai. Console → Authentication → Users me Add user karo.','auth/invalid-login-credentials':'Email ya password galat hai.','auth/invalid-email':'Email format sahi nahi hai.','auth/user-disabled':'Ye account Firebase me disabled hai.','auth/too-many-requests':'Bahut zyada koshish. Thodi der baad try karo ya password reset karo.','auth/network-request-failed':'Internet nahi hai.','auth/unauthorized-domain':'Ye domain Firebase → Authentication → Settings → Authorized domains me add karo.','auth/operation-not-allowed':'Firebase me Email/Password sign-in enable nahi hai (Authentication → Sign-in method).','auth/operation-not-supported-in-this-environment':'File seedhe phone/PC se mat kholo. https link (hosting) se kholo.','auth/web-storage-unsupported':'Browser storage blocked hai. Cookies/storage allow karo ya normal (non-private) tab me kholo.','auth/api-key-not-valid.-please-pass-a-valid-api-key.':'Firebase API key galat hai.','auth/internal-error':'Firebase internal error. Reload karke dobara try karo.'};return M[c]||('Login fail ho gaya'+(c?' ('+c+')':'')+'.')};
const ADMIN_EMAIL='mohdjunaid17755@gmail.com';
const ADMIN_HASH='0da1da052cf4f8f4da02ba10edf7ba85581f5b042b5130ed4ce9c25bc080de58';
function sha256(m){
 const K=[0x428a2f98,0x71374491,0xb5c0fbcf,0xe9b5dba5,0x3956c25b,0x59f111f1,0x923f82a4,0xab1c5ed5,0xd807aa98,0x12835b01,0x243185be,0x550c7dc3,0x72be5d74,0x80deb1fe,0x9bdc06a7,0xc19bf174,0xe49b69c1,0xefbe4786,0x0fc19dc6,0x240ca1cc,0x2de92c6f,0x4a7484aa,0x5cb0a9dc,0x76f988da,0x983e5152,0xa831c66d,0xb00327c8,0xbf597fc7,0xc6e00bf3,0xd5a79147,0x06ca6351,0x14292967,0x27b70a85,0x2e1b2138,0x4d2c6dfc,0x53380d13,0x650a7354,0x766a0abb,0x81c2c92e,0x92722c85,0xa2bfe8a1,0xa81a664b,0xc24b8b70,0xc76c51a3,0xd192e819,0xd6990624,0xf40e3585,0x106aa070,0x19a4c116,0x1e376c08,0x2748774c,0x34b0bcb5,0x391c0cb3,0x4ed8aa4a,0x5b9cca4f,0x682e6ff3,0x748f82ee,0x78a5636f,0x84c87814,0x8cc70208,0x90befffa,0xa4506ceb,0xbef9a3f7,0xc67178f2];
 let H=[0x6a09e667,0xbb67ae85,0x3c6ef372,0xa54ff53a,0x510e527f,0x9b05688c,0x1f83d9ab,0x5be0cd19];
 const b=unescape(encodeURIComponent(m)),L=b.length,w=[];
 for(let k=0;k<L;k++)w[k>>2]|=b.charCodeAt(k)<<(24-(k%4)*8);
 w[L>>2]|=0x80<<(24-(L%4)*8);
 const n=(((L+8)>>6)+1)*16;for(let k=0;k<n;k++)w[k]=w[k]|0;
 w[n-1]=L*8;
 const R=(x,s)=>(x>>>s)|(x<<(32-s));
 for(let o=0;o<n;o+=16){const t=w.slice(o,o+16);
  for(let q=16;q<64;q++){const a=t[q-15],c=t[q-2];t[q]=(t[q-16]+(R(a,7)^R(a,18)^(a>>>3))+t[q-7]+(R(c,17)^R(c,19)^(c>>>10)))|0}
  let [a,bb,c,d,e,f,g,h]=H;
  for(let q=0;q<64;q++){const T1=(h+(R(e,6)^R(e,11)^R(e,25))+((e&f)^(~e&g))+K[q]+t[q])|0,T2=((R(a,2)^R(a,13)^R(a,22))+((a&bb)^(a&c)^(bb&c)))|0;h=g;g=f;f=e;e=(d+T1)|0;d=c;c=bb;bb=a;a=(T1+T2)|0}
  H=[H[0]+a,H[1]+bb,H[2]+c,H[3]+d,H[4]+e,H[5]+f,H[6]+g,H[7]+h].map(x=>x|0)}
 return H.map(x=>('00000000'+(x>>>0).toString(16)).slice(-8)).join('')}
let opened=false,fbLive=false;
const TO=(pr,ms,m)=>Promise.race([pr,new Promise((_,r)=>setTimeout(()=>r({code:'timeout',msg:m||'Firebase ne jawab nahi diya.'}),ms))]);
function openApp(){if(opened)return;opened=true;fbLive=!!auth.currentUser;lerr('');$('#deny').style.display='none';$('#login').style.display='none';$('#app').style.display='block';
 try{listen()}catch(e){console.error(e);toast('Data load error: '+e.message,1)}
 cur='dash';try{draw()}catch(e){console.error(e);toast('Screen error: '+e.message,1)}}
function ensureLive(){if(fbLive||!auth.currentUser)return;fbLive=true;try{listen()}catch(e){console.error(e)}try{draw()}catch(e){console.error(e)}}
async function doLogin(){lerr('');const CL=x=>String(x||'').normalize('NFKC').replace(/[\u200B-\u200D\uFEFF\u00A0\s]/g,''),pw=CL($('#lpw').value),em=ADMIN_EMAIL;if(!pw)return lerr('Password daalo.');
 /* admin gate: sirf ye ek email+password panel kholta hai (file, APK ya hosting, kahin bhi) */
 if(sha256('sc|admin|'+pw.toLowerCase())!==ADMIN_HASH)return lerr('Password galat hai.');
 pwOK=true;/* har baar password: pehle se saved session se panel kabhi apne aap nahi khulta */
 /* panel TURANT khulta hai, Firebase ka intezaar nahi */
 openApp();$('#lbtn').disabled=false;$('#lbtn').textContent='Login';
 /* data ke liye peeche se usi email/password se Firebase me connect (account na ho to ban jata hai) */
 try{
  await TO(setPersistence(auth,browserLocalPersistence).catch(()=>setPersistence(auth,browserSessionPersistence).catch(()=>{})),4000).catch(()=>{});
  if(auth.currentUser&&(auth.currentUser.email||'').toLowerCase()!==em)await TO(signOut(auth),6000);
  if(!auth.currentUser||(auth.currentUser.email||'').toLowerCase()!==em){
   try{await TO(signInWithEmailAndPassword(auth,em,pw),12000)}
   catch(e){if(['auth/user-not-found','auth/invalid-credential','auth/invalid-login-credentials'].includes(e&&e.code)){
     try{await TO(createUserWithEmailAndPassword(auth,em,pw),12000)}
     catch(e2){throw e2&&e2.code==='auth/email-already-in-use'?{code:'x',msg:'Firebase me is email ka password alag hai. Data dikhane ke liye Firebase me "Forgot password" se wahi password set karo.'}:e2}
    }else throw e}}
  ensureLive();
 }catch(e){toast(e.msg||('Firebase connect nahi hua: '+AERR(e)),1)}}
$('#lbtn').onclick=doLogin;$('#lpw').addEventListener('keydown',e=>{if(e.key==='Enter')doLogin()});
$('#leye').onclick=()=>{const i=$('#lpw');i.type=i.type==='password'?'text':'password'};
let unsub=[],pwOK=false;
function listen(){unsub.forEach(f=>f());unsub=[];const L=(p,k,fn)=>unsub.push(onValue(ref(db,p),s=>{D[k]=fn(s.val());tick()},e=>toast('Permission denied: '+p+' — Firebase Rules publish karo',1)));
 L('tasks','tasks',toArr);L('banners','banners',toArr);L('config','config',v=>v&&typeof v==='object'?v:{});L('broadcasts','bc',toArr);L('usersIndex','users',toArr);unsub.push(onValue(query(ref(db,'submissions'),orderByChild('submittedAt'),limitToLast(500)),s=>{D.subs=toArr(s.val());tick()},e=>toast('Permission denied: submissions — Firebase Rules publish karo',1)));L('withdrawals','wds',toArr);L('tickets','tix',toArr);L('reports','reps',toArr);
 L('referrals','refs',v=>{const o=[];Object.entries(v||{}).forEach(([r,m])=>Object.entries(m||{}).forEach(([n,x])=>o.push({...x,ruid:r,nuid:n,id:r+'_'+n})));
  {const s=rsLoad();if(!s.init){o.forEach(r=>s.ids.add(r.id));s.init=true;rsSave()}
   if(RK===null)RK=new Set(o.map(r=>r.id));else o.forEach(r=>{if(RK.has(r.id))return;RK.add(r.id);toast('🔔 New Referral: '+(r.name||unameOf(r.nuid))+' joined using '+unameOf(r.ruid)+"'s code")})}
  return o});L('admins','admins',v=>Object.keys(v||{}).filter(k=>v[k]===true));L('lb','lb',toArr);L('lbHide','lbh',v=>v&&typeof v==='object'?v:{});L('presence','pres',v=>v&&typeof v==='object'?v:{})}
onAuthStateChanged(auth,async u=>{ME=u;
 try{
 if(u&&!pwOK){try{await signOut(auth)}catch(e){}return}
 if(!u){if(!opened){unsub.forEach(f=>f());unsub=[];$('#app').style.display='none';$('#login').style.display='grid'}return}
 let ok=(u.email||'').toLowerCase()===ADMIN_EMAIL;if(!ok){try{const s=await get(ref(db,'admins/'+u.uid));ok=s.val()===true}catch(e){}}
 if(!ok){await signOut(auth);opened=false;$('#app').style.display='none';$('#login').style.display='grid';lerr('Ye account admin nahi hai.');return}

 if(opened)ensureLive();else openApp();
 }catch(e){console.error(e);lerr('Login ke baad error: '+(e&&e.message||e))}
});
