#!/usr/bin/env python3
"""Compare exact ATLAS summit evidence archives or extracted directories.

Requires Pillow. Screenshots include UI; canvas hashes are sampled, not full RGB.
Timing is software-browser diagnostic only, never a hardware benchmark.
"""
import argparse
import io
import json
import math
from pathlib import Path
from zipfile import ZipFile
from PIL import Image, ImageChops

ANCHORS = [.64,.665,.69,.71,.73,.745,.76,.78,.80,.82,.84,.86,.88,.90,.92,.94,.96]
SIZES = {390: 844, 1440: 900}

class Evidence:
    def __init__(self, source, release, commit=None, run=None):
        self.path = Path(source)
        self.archive = None if self.path.is_dir() else ZipFile(self.path)
        self.report = json.loads(self.read('summit-report.json'))
        if commit and self.report.get('commit') != commit:
            raise ValueError(f'{source}: unexpected commit')
        if run and str(self.report.get('run')) != str(run):
            raise ValueError(f'{source}: unexpected workflow run')
        self.views = {v['width']: v for v in self.report['views']}
        if len(self.report['views']) != 2 or set(self.views) != set(SIZES):
            raise ValueError(f'{source}: incomplete or duplicate viewports')
        for width, view in self.views.items():
            if view['release'] != release or view['height'] != SIZES[width]:
                raise ValueError(f'{source}: unexpected release or viewport')
            if [f['requested'] for f in view['frames']] != ANCHORS:
                raise ValueError(f'{source}: incomplete or reordered shot sequence')
            for frame in view['frames']:
                if (not math.isfinite(frame['progress']) or abs(frame['progress']-frame['requested']) >= .006
                    or frame['glError'] != 0 or frame['colors'] <= 25 or not frame['clearance'] >= 1.8):
                    raise ValueError(f'{source}: invalid frame {frame}')
            if [(s['from'],s['to']) for s in view['sweeps']] != [(.64,.96),(.96,.64)]:
                raise ValueError(f'{source}: missing forward/reverse sweep')
            if any(s['reversals'] != 0 for s in view['sweeps']):
                raise ValueError(f'{source}: unexpected direction reversal')
    def read(self, name):
        return self.archive.read(name) if self.archive else (self.path/name).read_bytes()
    def image(self, width, index):
        name = f'{width}-summit-{index:02d}.png'
        with Image.open(io.BytesIO(self.read(name))) as image:
            if image.size != (width,SIZES[width]):
                raise ValueError(f'{self.path}: wrong dimensions for {name}')
            return image.convert('RGB')
    def close(self):
        if self.archive:
            self.archive.close()

def metrics(a, b):
    diff = ImageChops.difference(a,b)
    r,g,b = diff.split()
    maximum = ImageChops.lighter(ImageChops.lighter(r,g),b)
    hist = maximum.histogram()
    n = a.width*a.height
    channels = [ch.histogram() for ch in (r,g,b)]
    return {'mean_absolute_rgb':sum(i*c for h in channels for i,c in enumerate(h))/(3*n),
            'rms_rgb':math.sqrt(sum(i*i*c for h in channels for i,c in enumerate(h))/(3*n)),
            'exact_pixel_fraction':hist[0]/n,'changed_over_2_fraction':sum(hist[3:])/n,
            'max_channel_delta':maximum.getextrema()[1]}

def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('baseline');parser.add_argument('candidate')
    parser.add_argument('--baseline-release',required=True);parser.add_argument('--candidate-release',required=True)
    parser.add_argument('--baseline-commit');parser.add_argument('--candidate-commit')
    parser.add_argument('--baseline-run');parser.add_argument('--candidate-run')
    parser.add_argument('--output',required=True,type=Path)
    parser.add_argument('--max-mean-absolute-rgb',type=float,help='Optional per-frame tolerance for performance-only changes; no visual approval implied')
    args=parser.parse_args()
    if args.max_mean_absolute_rgb is not None and not 0 <= args.max_mean_absolute_rgb <= 255:
        parser.error('tolerance must be within 0–255')
    base=Evidence(args.baseline,args.baseline_release,args.baseline_commit,args.baseline_run)
    try:
        candidate=Evidence(args.candidate,args.candidate_release,args.candidate_commit,args.candidate_run)
        try:
            frames=[]
            for width in SIZES:
                for index,progress in enumerate(ANCHORS):
                    left=base.views[width]['frames'][index];right=candidate.views[width]['frames'][index]
                    frames.append({'width':width,'progress':progress,'sampled_canvas_hash_equal':left['hash']==right['hash'],
                                   **metrics(base.image(width,index),candidate.image(width,index))})
            result={'baseline':{'release':args.baseline_release,'commit':base.report.get('commit'),'run':base.report.get('run')},
                    'candidate':{'release':args.candidate_release,'commit':candidate.report.get('commit'),'run':candidate.report.get('run')},
                    'frame_count':len(frames),'sampled_hash_matches':sum(f['sampled_canvas_hash_equal'] for f in frames),
                    'exact_screenshot_matches':sum(f['exact_pixel_fraction']==1 for f in frames),
                    'worst_mean_absolute_rgb':max(f['mean_absolute_rgb'] for f in frames),
                    'note':'Full screenshots include text/UI. Legacy reports may lack commit/run; verify artifact provenance separately. Not a perceptual or device-performance acceptance test.',
                    'frames':frames}
            if args.max_mean_absolute_rgb is not None:
                result['threshold']=args.max_mean_absolute_rgb
                result['threshold_passed']=result['worst_mean_absolute_rgb']<=args.max_mean_absolute_rgb
            args.output.parent.mkdir(parents=True,exist_ok=True)
            args.output.write_text(json.dumps(result,indent=2)+'\n',encoding='utf-8')
            print(json.dumps({k:v for k,v in result.items() if k!='frames'},indent=2))
            if result.get('threshold_passed') is False:
                return 1
        finally:
            candidate.close()
    finally:
        base.close()
    return 0

if __name__=='__main__':
    raise SystemExit(main())
