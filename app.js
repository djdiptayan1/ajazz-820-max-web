import {AK820Protocol,LED_EFFECTS,PALETTE,lightingPacket,customPackets} from './protocol.js';
import {KEYBOARD_KEYS,KNOB_CONTROL,CODE_TO_KEY_ID} from './layout.js';
const $ = id => document.getElementById(id);
const appearance = $('appearanceSelect');
appearance.value = document.documentElement.dataset.theme || 'system';
appearance.onchange = () => {
  document.documentElement.dataset.theme = appearance.value;
  try { localStorage.setItem('ak820-appearance', appearance.value); }
  catch { tell('Appearance changed for this session; browser storage is unavailable.', true); }
};
const protocol = new AK820Protocol();
const storageKey = 'ak820-last-sent-v1';
let draft = {mode:'effect',settings:{effectId:7,brightness:4,speed:2,direction:0,colorIndex:5},colors:{}};
let lastSent = null;
let view = 'draft';
let selected = null;
let sending = false;
const names = ['Red','Green','Blue','Yellow','Magenta','Cyan','White'];
function tell(message,error=false){$('statusLog').textContent=message;$('statusLog').classList.toggle('error',error);}
try {
  const saved = JSON.parse(localStorage.getItem(storageKey));
  if(saved && ['effect','custom'].includes(saved.mode) && Number.isFinite(saved.sentAt)) {
    lightingPacket(saved.settings);
    customPackets(saved.colors,KEYBOARD_KEYS);
    lastSent=saved;
    draft={mode:saved.mode,settings:{...saved.settings},colors:{...saved.colors}};
  }
} catch { tell('Saved preview could not be loaded. Your keyboard has not been changed.',true); }
function same(a,b){return !!b && a.mode===b.mode && JSON.stringify(a.settings)===JSON.stringify(b.settings) && JSON.stringify(a.colors)===JSON.stringify(b.colors);}
function refresh(){
  const model=view==='sent'?lastSent:draft;
  for(const key of KEYBOARD_KEYS){
    const el=$('key-'+key.id);
    const color=model ? model.mode==='custom' ? model.colors[key.id] : PALETTE[model.settings.colorIndex] : null;
    el.classList.toggle('colored',!!color && color!=='#000000');
    el.style.setProperty('--key-color',color||'transparent');
    el.classList.toggle('selected',selected===key.id);
    el.setAttribute('aria-label',`${key.label}, ${color||'no color preview'}`);
  }
  const changed=!same(draft,lastSent);
  $('draftBadge').textContent=view==='sent'?'Last sent · local copy':changed?'Draft · not applied':'Last-sent copy';
  $('previewCaption').textContent=view==='sent' ? lastSent ? `Sent ${new Date(lastSent.sentAt).toLocaleString()} · not readback` : 'No saved colors from this browser yet' : 'Draft preview · not read from keyboard';
  $('viewDraft').setAttribute('aria-pressed',view==='draft');
  $('viewSent').setAttribute('aria-pressed',view==='sent');
  $('changeSummary').textContent=sending?'Sending to keyboard…':changed?'Draft ready to apply':'No changes to the last-sent copy';
  $('saveHint').textContent='Applying replaces the keyboard lighting. Hardware state is not read back.';
  $('applyLightingBtn').disabled=sending||!protocol.device?.opened;
  $('applyLightingBtn').textContent=sending?'Applying…':'Apply to keyboard';
  $('statusText').textContent=protocol.device?.opened?'Keyboard connected':'Not connected';
  $('statusDot').classList.toggle('connected',!!protocol.device?.opened);
  $('connectBtn').textContent=protocol.device?.opened?'Disconnect':'Connect keyboard';
}
function controls(){
  const custom=draft.mode==='custom';
  $('effectMode').setAttribute('aria-pressed',!custom);$('paintMode').setAttribute('aria-pressed',custom);
  $('effectsControls').hidden=custom;$('paintControls').hidden=!custom;
  $('rainbowLabel').hidden=custom;
  $('paletteTitle').textContent=custom?'Quick colors':'Color palette';
  $('paletteHint').textContent=custom?'Pick a color, then select keys.':'Hardware effects use these seven colors or rainbow.';
  const attr=LED_EFFECTS.find(e=>e.id===draft.settings.effectId).attributes;
  $('lightingModeSelect').value=String(draft.settings.effectId);
  for(const [id,field] of [['brightnessSlider','brightness'],['speedSlider','speed']]){$(id).value=draft.settings[field];$(field==='brightness'?'brightnessVal':'speedVal').textContent=`${draft.settings[field]+1} / 5`;}
  $('brightnessSlider').disabled=!(attr&1);$('speedSlider').disabled=!(attr&2);$('directionSelect').disabled=!(attr&4);
  $('directionSelect').value=String(draft.settings.direction);$('rainbowToggle').disabled=!(attr&64);$('rainbowToggle').checked=draft.settings.colorIndex===7;
  document.querySelectorAll('.swatch').forEach((b,i)=>{b.setAttribute('aria-pressed',custom?$('lightingColor').value.toLowerCase()===PALETTE[i]:draft.settings.colorIndex===i);b.disabled=!custom&&!(attr&64);});
  refresh();
}
function edit(){view='draft';controls();}
for(const key of KEYBOARD_KEYS){
  const button=document.createElement('button');button.type='button';button.className='key-cap';button.id='key-'+key.id;button.textContent=key.label;
  Object.assign(button.style,{left:key.x+'px',top:key.y+'px',width:key.w+'px',height:key.h+'px'});
  button.title=`${key.label} · LED ${key.led}`;
  button.onclick=()=>{selected=key.id;$('selectedKeyName').textContent=`${key.label} · LED ${key.led}`;
    if(draft.mode==='custom'&&view==='draft'){draft.colors[key.id]=$('lightingColor').value;edit();}
    else refresh();
  };$('keyboardGrid').append(button);
}
const knob=document.createElement('div');knob.className='key-knob';knob.title=KNOB_CONTROL.label;
Object.assign(knob.style,{left:KNOB_CONTROL.x+'px',top:KNOB_CONTROL.y+'px',width:KNOB_CONTROL.w+'px',height:KNOB_CONTROL.h+'px'});$('keyboardGrid').append(knob);
$('lightingModeSelect').innerHTML=LED_EFFECTS.map(e=>`<option value="${e.id}">${e.name}</option>`).join('');
$('effectMode').onclick=()=>{draft.mode='effect';edit();};$('paintMode').onclick=()=>{draft.mode='custom';edit();};
$('lightingModeSelect').onchange=e=>{draft.settings.effectId=Number(e.target.value);edit();};
for(const [id,field] of [['brightnessSlider','brightness'],['speedSlider','speed'],['directionSelect','direction']]){$(id).addEventListener('input',e=>{draft.settings[field]=Number(e.target.value);edit();});}
$('rainbowToggle').onchange=e=>{draft.settings.colorIndex=e.target.checked?7:5;edit();};
$('lightingColor').oninput=()=>{$('colorHexText').textContent=$('lightingColor').value.toUpperCase();controls();};
for(const [i,color] of PALETTE.entries()){
 const button=document.createElement('button');button.className='swatch';button.style.setProperty('--swatch',color);button.setAttribute('aria-label',names[i]);button.title=names[i];button.innerHTML='<span></span>';
 button.onclick=()=>{if(draft.mode==='custom'){$('lightingColor').value=color;$('colorHexText').textContent=color.toUpperCase();}else draft.settings.colorIndex=i;edit();};$('palette').append(button);
}
$('fillBtn').onclick=()=>{for(const key of KEYBOARD_KEYS)draft.colors[key.id]=$('lightingColor').value;edit();};
$('clearBtn').onclick=()=>{draft.colors={};edit();};
$('viewDraft').onclick=()=>{view='draft';refresh();};$('viewSent').onclick=()=>{view='sent';refresh();};
$('connectBtn').onclick=async()=>{
 try{if(!navigator.hid||!isSecureContext)throw new Error('Use Chrome or Edge at localhost or HTTPS for USB access.');
 if(protocol.device?.opened)await protocol.disconnect();else await protocol.connect();
 refresh();tell(protocol.device?'Connected. Existing keyboard lighting was not changed. Preview, then Apply.':'Disconnected. Your draft is still here.');
 }catch(error){refresh();tell(error.message,true);}
};
navigator.hid?.addEventListener('disconnect',e=>{if(e.device===protocol.device){protocol.device=null;refresh();tell('Keyboard disconnected. Reconnect by USB to apply your draft.',true);}});
$('applyLightingBtn').onclick=async()=>{
 if(sending)return;
 const snapshot=structuredClone(draft);sending=true;refresh();
 try{
 await protocol.send(snapshot.mode==='custom'?customPackets(snapshot.colors,KEYBOARD_KEYS):[lightingPacket(snapshot.settings)]);
 lastSent={...snapshot,sentAt:Date.now()};
 try{localStorage.setItem(storageKey,JSON.stringify(lastSent));tell('Lighting sent. Last-sent colors saved in this browser; hardware appearance is not read back.');}
 catch{tell('Lighting sent, but browser storage is unavailable. This copy will not survive a reload.',true);}
 }catch(error){tell('Could not apply lighting. '+error.message+' Reconnect and apply again.',true);}
 finally{sending=false;refresh();}
};
function keyEvent(event,down){const id=CODE_TO_KEY_ID[event.code];if(!down){if(id!==undefined)$('key-'+id)?.classList.remove('pressed');return;}if(event.target instanceof Element&&event.target.matches('input,textarea,select'))return;if($('testModeCheck').checked&&id!==undefined)$('key-'+id)?.classList.add('pressed');}
window.addEventListener('keydown',e=>keyEvent(e,true));window.addEventListener('keyup',e=>keyEvent(e,false));
window.addEventListener('blur',()=>document.querySelectorAll('.pressed').forEach(el=>el.classList.remove('pressed')));
$('testModeCheck').onchange=()=>document.querySelectorAll('.pressed').forEach(el=>el.classList.remove('pressed'));
const profilesKey='ak820-profiles-v1';
let profiles=[];
function profileDraft(value){
 if(!value || !['effect','custom'].includes(value.mode) || !value.settings || !value.colors || typeof value.colors!=='object' || Array.isArray(value.colors))throw new Error('Invalid lighting profile.');
 lightingPacket(value.settings);
 for(const [id,color] of Object.entries(value.colors)){if(!KEYBOARD_KEYS.some(k=>String(k.id)===id)||!/^#[0-9a-f]{6}$/i.test(color))throw new Error('Invalid profile key or color.');}
 return {mode:value.mode,settings:{effectId:value.settings.effectId,brightness:value.settings.brightness,speed:value.settings.speed,direction:value.settings.direction,colorIndex:value.settings.colorIndex},colors:{...value.colors}};
}
function profileList(){
 $('profileSelect').replaceChildren(...profiles.map((p,i)=>new Option(p.name,String(i))));
 $('loadProfileBtn').disabled=!profiles.length;
}
try{const saved=JSON.parse(localStorage.getItem(profilesKey)||'[]');if(!Array.isArray(saved))throw new Error();profiles=saved.map(p=>{if(typeof p.name!=='string'||!p.name.trim()||p.name.length>60)throw new Error();return {name:p.name,draft:profileDraft(p.draft)};});}catch{tell('Saved profiles could not be loaded. Existing storage was not changed.',true);}
profileList();
function saveProfile(name,value){
 const next=[...profiles,{name,draft:profileDraft(value)}];
 localStorage.setItem(profilesKey,JSON.stringify(next));profiles=next;profileList();$('profileSelect').value=String(profiles.length-1);
}
const profileAction=fn=>{try{fn();}catch(error){tell(error.message,true);}};
$('saveProfileBtn').onclick=()=>profileAction(()=>{const name=$('profileName').value.trim();if(!name)throw new Error('Enter a profile name.');saveProfile(name,draft);tell('Profile saved in this browser. Keyboard unchanged.');});
$('loadProfileBtn').onclick=()=>profileAction(()=>{const p=profiles[Number($('profileSelect').value)];if(!p)throw new Error('Select a saved profile.');draft=profileDraft(p.draft);edit();tell('Profile loaded into draft. Open Lighting to apply it.');});
$('exportProfileBtn').onclick=()=>profileAction(()=>{const blob=new Blob([JSON.stringify({format:'ak820-lighting',version:1,name:$('profileName').value.trim()||'My lighting',draft:profileDraft(draft)},null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='ak820-lighting.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);});
$('importProfile').onchange=async e=>{try{const file=e.target.files[0];if(!file)return;if(file.size>65536)throw new Error('Profile must be smaller than 64 KiB.');const value=JSON.parse(await file.text());if(value.format!=='ak820-lighting'||value.version!==1||typeof value.name!=='string'||!value.name.trim()||value.name.length>60)throw new Error('Unsupported lighting profile.');saveProfile(value.name.trim(),value.draft);tell('Profile imported. Load it to preview; keyboard unchanged.');}catch(error){tell(error.message,true);}finally{e.target.value='';}};
const sections={keys:['Keys & layers','Inspect keys on the canvas. Hardware remapping and layer writes have not been verified, so they are unavailable.'],performance:['Performance','Sleep, debounce, polling rate and software mode switching are not verified for this controller. Use the keyboard’s physical mode switch.'],macros:['Macros','Onboard macro encoding has not been decoded. Recording or uploading macros is not available.'],profiles:['Profiles']};
for(const button of document.querySelectorAll('.nav-item'))button.onclick=()=>{
 const section=button.dataset.section,lighting=section==='lighting',isProfiles=section==='profiles';document.querySelectorAll('.nav-item').forEach(b=>{b.classList.toggle('active',b===button);if(b===button)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current');});
 $('lightingPanel').hidden=!lighting;$('profilesPanel').hidden=!isProfiles;$('applyBar').hidden=!lighting;$('unavailablePanel').hidden=lighting||isProfiles;
 $('pageTitle').textContent=lighting?'Make it yours.':sections[section][0];$('pageDescription').textContent=lighting?'Set the mood, or give every key its own color.':'Your keyboard, with clear boundaries.';
 if(!lighting&&!isProfiles){$('unavailableTitle').textContent=sections[section][0];$('unavailableCopy').textContent=sections[section][1];}
};
if(!navigator.hid)tell('USB control needs desktop Chrome or Edge. You can still preview colors here.');
controls();
