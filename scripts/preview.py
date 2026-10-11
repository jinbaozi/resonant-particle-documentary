"""Generate aligned particle glyphs, cover and pre-render checks."""
import argparse,asyncio,functools,hashlib,http.server,io,itertools,json,os,shutil,threading
from pathlib import Path
import numpy as np
from PIL import Image,ImageDraw
from playwright.async_api import async_playwright
p=argparse.ArgumentParser();p.add_argument('--project',type=Path,required=True);p.add_argument('--out',type=Path,required=True);a=p.parse_args();a.project=a.project.resolve();a.out.mkdir(parents=True,exist_ok=True)
class Quiet(http.server.SimpleHTTPRequestHandler):
 def log_message(self,*args):pass
 def end_headers(self):
  self.send_header("Cache-Control","no-store");super().end_headers()
 def copyfile(self,source,outputfile):
  try:super().copyfile(source,outputfile)
  except (BrokenPipeError,ConnectionResetError):pass
server=http.server.ThreadingHTTPServer(('127.0.0.1',0),functools.partial(Quiet,directory=str(a.project)));threading.Thread(target=server.serve_forever,daemon=True).start()
async def main():
 async with async_playwright() as pw:
  opts={'headless':True,'args':['--no-sandbox','--disable-dev-shm-usage']}
  if os.environ.get('CHROMIUM_PATH') or shutil.which('chromium'):opts['executable_path']=os.environ.get('CHROMIUM_PATH')or shutil.which('chromium')
  browser=await pw.chromium.launch(**opts);page=await browser.new_page(viewport={'width':1920,'height':1080});errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
  url=f'http://127.0.0.1:{server.server_port}';await page.goto(url);await page.evaluate('document.fonts.ready');await page.evaluate('seek(34.5)')
  await page.add_style_tag(content='html,body,#film{background:transparent!important}canvas,.caption,#cover,#fact,#labels,#end-anchor,#hero .term,#veil,#out{display:none!important}#hero .word{color:white!important;text-shadow:none!important}')
  pix=np.array(Image.open(io.BytesIO(await page.screenshot(omit_background=True))));points=[[x,y]for y in range(150,800,3)for x in range(200,1720,3)if pix[y,x,3]>240]
  assert len(points)>1000,'Title mask missing: install Noto Serif CJK SC.'
  (a.project/'glyph.js').write_text('window.GLYPH='+json.dumps(points,separators=(',',':'))+';')
  await page.reload();await page.evaluate('document.fonts.ready');await page.evaluate('seek(1.5)');await page.screenshot(path=str(a.out/'cover.png'))
  times=[1.5,4.5,7.5,10.5,13.5,16.5,19.5,22.5,25.5,28.5,31.5,33.4,33.4333333333,33.4666666667,33.5,34,34.5,34.9,35.4,39,43,47,51,55,59,63,67,71,75,79,83,87,90,92.5]
  layouts=[];hashes={}
  for t in times:
   await page.evaluate('(t)=>seek(t)',t);data=await page.screenshot(path=str(a.out/f'{t:07.3f}.png'));hashes[t]=hashlib.sha256(data).hexdigest()
   boxes=await page.evaluate('''()=>[...document.querySelectorAll('.cn,.en,#cover>div,#hero>div,#fact>div,#labels>span,#end-anchor')].flatMap(e=>{let op=1;for(let p=e;p;p=p.parentElement)op*=+getComputedStyle(p).opacity;if(op<.1)return[];let r=document.createRange();r.selectNodeContents(e);let b=r.getBoundingClientRect();return[{text:e.textContent,x:b.x,y:b.y,w:b.width,h:b.height,lines:r.getClientRects().length,cls:e.className}]})''')
   for b in boxes:
    assert b['x']>=40 and b['y']>=40 and b['x']+b['w']<=1880 and b['y']+b['h']<=1040,(t,b)
    if b['cls'] in ['cn','en']:assert b['lines']==1,(t,'wrapped caption',b)
   for x,y in itertools.combinations(boxes,2):
    ix=min(x['x']+x['w'],y['x']+y['w'])-max(x['x'],y['x']);iy=min(x['y']+x['h'],y['y']+y['h'])-max(x['y'],y['y'])
    assert not(ix>1 and iy>1),(t,'text overlaps',x['text'],y['text'])
   layouts.append({'time':t,'text':boxes})
  await page.evaluate('seek(9)');h1=hashlib.sha256(await page.screenshot()).hexdigest();await page.evaluate('seek(45)');await page.evaluate('seek(9)');h2=hashlib.sha256(await page.screenshot()).hexdigest();assert h1==h2,'Non-deterministic seek'
  assert hashes[33.4]==hashes[33.4333333333]==hashes[33.4666666667],'Freeze is not static'
  assert not errors,errors
  q={'glyph_points':len(points),'browser_errors':errors,'deterministic_seek':h1==h2,'freeze_exact':True,'layouts':layouts};(a.out/'preview-check.json').write_text(json.dumps(q,ensure_ascii=False,indent=2));await browser.close()
try:asyncio.run(main())
finally:server.shutdown()
files=sorted(a.out.glob('[0-9]*.png'));contact=Image.new('RGB',(1920,((len(files)+3)//4)*298),'#101923');d=ImageDraw.Draw(contact)
for i,f in enumerate(files):
 im=Image.open(f);im.thumbnail((480,270));contact.paste(im,(i%4*480,i//4*298));d.text((i%4*480+12,i//4*298+276),f.stem+' s',fill='white')
contact.save(a.out/'contact.jpg',quality=93);print('PREVIEW PASS',a.out)
