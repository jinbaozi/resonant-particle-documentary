"""Validated HyperFrames rendering with an exact, pinned CLI version."""
import argparse,json,os,shutil,subprocess
from pathlib import Path
p=argparse.ArgumentParser();p.add_argument('--project',type=Path,required=True);p.add_argument('--output',type=Path,required=True);p.add_argument('--workers',type=int,default=4);a=p.parse_args();a.project=a.project.resolve();a.output=a.output.resolve();a.output.parent.mkdir(parents=True,exist_ok=True)
root=Path(__file__).resolve().parents[1];cli=os.environ.get('HYPERFRAMES_CLI')or shutil.which('hyperframes')or str(root/'node_modules/.bin/hyperframes');assert Path(cli).exists(),'Install dependencies with npm install in the skill directory.'
env=os.environ.copy()
if 'HYPERFRAMES_BROWSER_PATH'not in env:
 browser=env.get('CHROMIUM_PATH')or shutil.which('chromium')
 if not browser:
  from playwright.sync_api import sync_playwright
  with sync_playwright()as pw:browser=pw.chromium.executable_path
 env['HYPERFRAMES_BROWSER_PATH']=browser
assert 'window.GLYPH=['in(a.project/'glyph.js').read_text(),'Run preview.py before rendering.'
for command in ['lint','inspect']:
 subprocess.run([cli,command,str(a.project)],env=env,check=True)
subprocess.run([cli,'render',str(a.project),'--output',str(a.output),'--quality','high','--fps','30','--workers',str(a.workers)],env=env,check=True)
print('RENDERED',a.output)
