from scipy.io import wavfile
from scipy.signal import butter,sosfilt
import numpy as np,json
from pathlib import Path
import argparse,subprocess,tempfile
p=argparse.ArgumentParser();p.add_argument('--source',required=True);p.add_argument('--output',required=True);args=p.parse_args()
with tempfile.TemporaryDirectory() as td:
 decoded=Path(td)/'source.wav'
 subprocess.run(['ffmpeg','-v','error','-y','-i',args.source,'-ar','48000','-ac','2','-c:a','pcm_f32le',str(decoded)],check=True)
 sr,src=wavfile.read(decoded)
src=src.astype(np.float32)
n=90*sr;t=np.arange(n)/sr;mix=src[61*sr:151*sr].copy()
# A complete final eight-bar phrase followed by the track's original natural decay.
tail_start=228.60;join=70.0;cross=.12
st=int((join-cross/2)*sr);last=src[int((tail_start-cross/2)*sr):]
L=min(n-st,len(last));w=np.clip((np.arange(L)/sr)/cross,0,1).astype('float32')
mix[st:st+L]=mix[st:st+L]*(1-w[:,None])+last[:L]*w[:,None]
# Original has a rising fill, not silence: create the specified half-second breath in the edit.
gain=np.ones(n,dtype='float32')*.31
gain*=np.minimum(t/.55,1)
duck=(t>=30)&(t<30.5)
u=np.clip((t[duck]-30)/.4,0,1)
gain[duck]*=1-.96*(u*u*(3-2*u))
gain*=1-np.clip((t-88.1)/1.8,0,1)
mix*=gain[:,None]
rng=np.random.default_rng(1229)
noise=rng.normal(0,1,n).astype('float32');wind=sosfilt(butter(2,[110,1300],btype='bandpass',fs=sr,output='sos'),noise)
wind*=.0025*(.75+.25*np.sin(t*.3));wind*=np.clip(t/2,0,1)*(1-np.clip((t-88)/2,0,1));wind[(t>=30.4)&(t<30.5)]=0
mix+=wind[:,None]
events=[]
def add(start,sig,name,pan=0):
 global mix
 sig=np.asarray(sig,dtype='float32');a=int(round(start*sr));L=min(len(sig),len(mix)-a)
 mix[a:a+L,0]+=sig[:L]*(1-pan*.3);mix[a:a+L,1]+=sig[:L]*(1+pan*.3);events.append({'time':start,'name':name,'duration':len(sig)/sr})
def noise_hit(d,amp,lo,hi):
 z=np.arange(int(d*sr))/sr;q=sosfilt(butter(2,[lo,hi],btype='bandpass',fs=sr,output='sos'),rng.normal(size=len(z)));return q*np.sin(np.pi*z/d)**2*amp
add(6.13,noise_hit(.23,.027,1600,5500),'short air trace',-.4)
add(12.12,noise_hit(.70,.017,250,2000),'tide',.2)
add(21.12,noise_hit(.32,.018,450,3200),'passing air',-.6)
z=np.arange(int(.9*sr))/sr;phase=2*np.pi*(43*z+20*.085*(1-np.exp(-z/.085)))
impact=.19*np.sin(phase)*np.exp(-z*6)*np.clip(z/.004,0,1)+noise_hit(.9,.016,150,2500)*np.exp(-z*5)
add(30.5,impact,'low impact')
add(34.15,noise_hit(.24,.022,600,5000),'network reveal',.4)
z=np.arange(int(.8*sr))/sr;bell=(np.sin(2*np.pi*1150*z)+.24*np.sin(2*np.pi*2389*z))*np.exp(-z*8)*np.clip(z/.002,0,1)*.026
add(54.22,bell,'arrival tone',.5)
z=np.arange(int(.55*sr))/sr;cup=(np.sin(2*np.pi*1620*z)+.35*np.sin(2*np.pi*2792*z))*np.exp(-z*16)*np.clip(z/.002,0,1)*.021
add(74.20,cup,'reply tone',-.2)
add(87.6,noise_hit(1.7,.006,300,2000),'closing air')
peak=float(np.max(np.abs(mix)));print('peak',peak,'dBFS',20*np.log10(peak))
assert peak<.95
wavfile.write(args.output,sr,np.int16(np.clip(mix,-1,1)*32767))
Path(args.output).with_suffix('.edit.json').write_text(json.dumps({'duration':90,'music':'Hi Noise — We Never (Original Mix)','source_entry':61,'impact':30.5,'ending_join':join,'ending_source_start':tail_start,'crossfade':cross,'events':events,'peak_dbfs':20*np.log10(peak)},indent=2))
