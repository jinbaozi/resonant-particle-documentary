"""Check the actual encoded delivery, not only source HTML."""
from pathlib import Path
import argparse,json,subprocess,hashlib
import numpy as np
from PIL import Image,ImageDraw
p=argparse.ArgumentParser();p.add_argument('--video',type=Path,required=True);p.add_argument('--out',type=Path,required=True);a=p.parse_args();v=a.video;o=a.out;o.mkdir(parents=True,exist_ok=True)
probe=json.loads(subprocess.check_output(['ffprobe','-v','error','-show_streams','-show_format','-of','json',str(v)]));vs=next(x for x in probe['streams']if x['codec_type']=='video');au=next(x for x in probe['streams']if x['codec_type']=='audio');assert(vs['width'],vs['height'],vs['r_frame_rate'],int(vs['nb_frames']))==(1920,1080,'30/1',2790);assert abs(float(probe['format']['duration'])-93)<.04
nums=[45,135,315,495,675,855,945,1002,1003,1004,1005,1008,1020,1035,1047,1062,1170,1290,1410,1530,1650,1770,1890,2010,2130,2250,2370,2490,2610,2700,2789];sel='+'.join(f'eq(n,{n})'for n in nums);subprocess.run(['ffmpeg','-v','error','-y','-i',str(v),'-vf',"select='"+sel+"'",'-vsync','0',str(o/'f-%03d.png')],check=True)
fs=sorted(o.glob('f-*.png'));arr={n:np.array(Image.open(f)).astype(float)for n,f in zip(nums,fs)};delta=[float(abs(arr[n]-arr[1002]).mean())for n in[1003,1004]];assert max(delta)<.1;assert arr[1005].mean()>arr[1004].mean()+30
raw=subprocess.check_output(['ffmpeg','-v','error','-i',str(v),'-vn','-f','f32le','-ac','2','-ar','48000','pipe:1']);samples=np.frombuffer(raw,dtype='<f4').reshape(-1,2)
def rms(t1,t2):return float(np.sqrt(np.mean(samples[int(t1*48000):int(t2*48000)]**2)))
assert np.count_nonzero(samples[:3*48000])==0,'Cover must be silent';assert rms(3.2,4)>.001,'Music missing at main-film start';assert np.abs(samples).max()<.99,'Clipping';pre=rms(33.4,33.5);post=rms(33.5,33.6);assert post>pre*2,'No audible impact at frame1005'
contact=Image.new('RGB',(1920,((len(fs)+3)//4)*298),'#101923');d=ImageDraw.Draw(contact)
for i,(n,f)in enumerate(zip(nums,fs)):
 im=Image.open(f);im.thumbnail((480,270));contact.paste(im,(i%4*480,i//4*298));d.text((i%4*480+10,i//4*298+275),f'{n/30:.3f}s | {n}',fill='white')
contact.save(o/'contact.jpg',quality=94)
q={'duration':probe['format']['duration'],'width':vs['width'],'height':vs['height'],'fps':vs['r_frame_rate'],'frames':vs['nb_frames'],'audio':[au['codec_name'],au['sample_rate'],au['channels']],'cover_rms':rms(0,3),'cover_nonzero_samples':int(np.count_nonzero(samples[:3*48000])),'peak_dbfs':float(20*np.log10(np.abs(samples).max())),'freeze_delta':delta,'impact_frame':1005,'impact_gain_db':float(20*np.log10(post/max(pre,1e-12))),'tail_rms_last_100ms':rms(92.9,93),'bytes':v.stat().st_size,'sha256':hashlib.sha256(v.read_bytes()).hexdigest()};(o/'verification.json').write_text(json.dumps(q,indent=2));print(json.dumps(q))
