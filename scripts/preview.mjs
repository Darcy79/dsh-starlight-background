// Local artwork preview; serves only known project resources, on loopback.
import { createServer } from 'node:http'
import { readFile } from 'node:fs/promises'
const root = new URL('../', import.meta.url)
const client = await readFile(new URL('client.js', root), 'utf8')
const runtime = await readFile(new URL('scripts/preview-runtime.js', root), 'utf8')
const css = client.slice(client.indexOf('String.raw`') + 11, client.indexOf('\n`\n'))
// Exercise the bundled implementations in the preview as well as the host.
const previewClient = client.replace('    /* ── plugin entry', `
    window.previewAPI = { OceanArtwork, SeaBreeze, createArtworkRenderer, renderFixedMeteor,
      renderMeteorHead, LightSettings, installAppearance, toggleOn, getOn,
      getPreferences, subscribePreferences, subscribeOn };
    /* ── plugin entry`)
const html = `<!doctype html><html lang="zh-CN"><meta charset="utf-8"><title>海风 · 背景预览</title>
<style>${css}
*{box-sizing:border-box}body{margin:0;background:#151517;color:#e6e7ed;font:15px/1.9 system-ui,sans-serif}
body.light{background:#fff;color:#252637}.dhl-root{z-index:3}aside{position:fixed;inset:0 auto 0 0;width:220px;padding:28px;border-right:1px solid #8882}
main{margin:10vh auto;width:min(600px,60vw);position:relative;z-index:2}h1{font-size:30px;letter-spacing:2px;font-weight:500}p{opacity:.85}
.composer{margin-top:100px;padding:22px;border:1px solid #8883;border-radius:24px;background:#15151780}body.light .composer{background:#ffffffb8}
textarea{width:100%;background:transparent;border:0;color:inherit;font:inherit;resize:none;outline:none}
.controls{position:fixed;bottom:20px;left:24px;z-index:4;display:flex;gap:8px}button{padding:8px 12px;background:#829ff326;color:inherit;border:1px solid #829ff34d;border-radius:10px;cursor:pointer}
@media(max-width:720px){aside{display:none}main{width:84vw}.controls{left:12px;bottom:12px}}
</style>
<body data-ds-dark-theme><aside>DeepSeek Harness<br><small>海风 · 动态插画背景</small><hr><p>新的对话</p><p>最近的会话</p></aside>
<main><h1>让海风，轻轻吹进来。</h1><p>风从脸侧发束传到长发末端，裙边顺风轻摆，双手缓慢晃动，脚边水花闪动。鲸尾轻摆，双眼保留视线变化与眨眼。</p><p>这段文字用于检查实际聊天内容和插画叠加后的可读性。图片沿右侧淡入，与原有光感背景融合。</p><div class="composer" data-composer-card><textarea rows="2" placeholder="在这里试着输入一段话…"></textarea></div></main>
<div class="dhl-root" data-on="true" data-visible="true" data-scheme="dark"><div class="dhl-effect" id="effect"></div></div>
<div class="controls"><button id="theme">切换深浅色</button><button id="toggle">关闭背景</button><button id="motion">暂停动画</button></div>
<script>
${runtime}
const props={on:true,visible:true,shown:true,animate:true};
window.__ModuleLoader__={load({factory}){factory(name=>{if(name==='react')return React;throw new Error('Unexpected preview dependency: '+name)})}};
${previewClient}
const {OceanArtwork,SeaBreeze,createArtworkRenderer,renderFixedMeteor,renderMeteorHead,LightSettings,installAppearance,toggleOn,getOn,getPreferences,subscribePreferences,subscribeOn}=window.previewAPI;
const releaseAppearance=installAppearance({get:()=>null});
props.on=getOn();
const root=document.querySelector('.dhl-root');
root.dataset.on=String(props.on);
document.querySelector('#effect').append(SeaBreeze());
const artworkIsland=mountPreviewIsland(OceanArtwork,props,document.querySelector('#effect'),true);
const settingsIsland=mountPreviewIsland(LightSettings,{on:props.on,onToggle:toggleOn},root);
const render=()=>{const preferences=getPreferences();props.on=getOn();props.shown=preferences.artwork;props.animate=preferences.animation;root.dataset.on=String(props.on);root.dataset.artwork=String(preferences.artwork);root.dataset.artworkMotion=String(preferences.animation);root.dataset.meteors=String(preferences.meteors);artworkIsland.update(props);settingsIsland.update({on:props.on,onToggle:toggleOn})};
const unsubscribePreferences=subscribePreferences(render),unsubscribeOn=subscribeOn(render);
render();
document.querySelector('#theme').onclick=()=>{document.body.classList.toggle('light');const light=document.body.classList.contains('light');root.dataset.scheme=light?'light':'dark';document.body.toggleAttribute('data-ds-dark-theme',!light)};
document.querySelector('#toggle').onclick=(e)=>{toggleOn();props.on=getOn();root.dataset.on=String(props.on);e.target.textContent=props.on?'关闭背景':'开启背景';render()};
document.querySelector('#motion').onclick=(e)=>{props.visible=!props.visible;root.dataset.visible=String(props.visible);e.target.textContent=props.visible?'暂停动画':'继续动画';render()};
document.addEventListener('visibilitychange',()=>{props.visible=document.visibilityState!=='hidden';render()});
const specimens=document.createElement('div');specimens.id='meteor-specimens';specimens.className='dhl-fixed-meteors';
const colors={tail:'rgba(140,190,255,.45)',head:'#eef7ff',glow:'rgba(130,180,255,.7)'};
for(let i=0;i<2;i++)specimens.append(renderFixedMeteor({id:i,x:7+i*18,y:70+i*12,angle:24,length:160,duration:14,delay:-8,opacity:.85},true,colors,Boolean(i),1,1));
specimens.append(h('span',{className:'dhl-meteor',style:{left:'12%',top:'90%',width:'150px','--dhl-meteor-tail':colors.tail,'--dhl-meteor-head':colors.head,'--dhl-meteor-glow':colors.glow,'--dhl-meteor-dx':'48vw','--dhl-meteor-dy':'32vh','--dhl-meteor-mx':'24vw','--dhl-meteor-my':'14vh','--dhl-meteor-angle':'24deg','--dhl-meteor-duration':'14s','--dhl-meteor-opacity':'.85'}},renderMeteorHead()));
document.querySelector('#effect').append(specimens);
window.artworkPreview={renderer:createArtworkRenderer,render,props,dispose(){artworkIsland.dispose();settingsIsland.dispose();unsubscribePreferences();unsubscribeOn();releaseAppearance()}};
</script></html>`
export function startPreview(port = 4177) {
  return new Promise(resolve => {
    const server = createServer((req, res) => {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' })
      res.end(html)
    })
    server.listen(port, '127.0.0.1', () => resolve(server))
  })
}
if (process.argv[1]?.replaceAll('\\', '/').endsWith('/scripts/preview.mjs')) {
  await startPreview()
  console.log('Artwork preview: http://127.0.0.1:4177')
}
