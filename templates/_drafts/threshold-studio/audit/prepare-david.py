"""Download the attributed source separately, then bake a bounded web asset.
No network access is used by this script; the workflow downloads the exact source."""
import argparse, base64, hashlib, json, pathlib, struct
import numpy as np
import trimesh
import fast_simplification
from PIL import Image, ImageDraw

parser=argparse.ArgumentParser()
parser.add_argument("source",type=pathlib.Path)
parser.add_argument("output",type=pathlib.Path)
args=parser.parse_args()
args.output.mkdir(parents=True,exist_ok=True)
source=args.source.read_bytes()
if len(source)<84: raise ValueError("Missing STL data")
count=struct.unpack_from("<I",source,80)[0]
if len(source)!=84+50*count or count<1000: raise ValueError("Expected binary STL")
digest=hashlib.sha256(source).hexdigest()
mesh=trimesh.load_mesh(args.source,process=True)
if not isinstance(mesh,trimesh.Trimesh) or not np.isfinite(mesh.vertices).all(): raise ValueError("Invalid mesh")
original_faces=len(mesh.faces)
target=18000
vertices,faces=fast_simplification.simplify(np.asarray(mesh.vertices,dtype=np.float64),np.asarray(mesh.faces,dtype=np.int32),target_count=target)
mesh=trimesh.Trimesh(vertices=vertices,faces=faces,process=True)
mesh.remove_unreferenced_vertices()
mesh.fix_normals()
if not 1000<=len(mesh.faces)<=target+100 or len(mesh.vertices)>=65536: raise ValueError("Invalid simplified mesh size")
# STL is typically Z-up, but determine the dominant vertical extent rather than
# assuming the scan's coordinate convention. Orientation sign is reviewed in
# the generated four-view preview before runtime placement.
extents=np.ptp(mesh.vertices,axis=0)
vertical=int(np.argmax(extents))
horizontal=sorted([i for i in range(3) if i!=vertical],key=lambda i:extents[i],reverse=True)
transform=np.eye(4)
transform[:3,:3]=np.eye(3)[[horizontal[0],vertical,horizontal[1]]]
if np.linalg.det(transform[:3,:3])<0: transform[2,:3]*=-1
mesh.apply_transform(transform)
bounds=mesh.bounds
mesh.apply_translation([-float((bounds[0,0]+bounds[1,0])/2),-float(bounds[0,1]),-float((bounds[0,2]+bounds[1,2])/2)])
mesh.apply_scale(1/float(mesh.extents[1]))
v=np.asarray(mesh.vertices,dtype="<f4")
n=np.asarray(mesh.vertex_normals,dtype="<f4")
faces=np.asarray(mesh.faces,dtype="<u2")
if not np.isfinite(v).all() or not np.isfinite(n).all() or faces.max()>=len(v): raise ValueError("Invalid packed mesh")
def pack(x):return base64.b64encode(x.tobytes()).decode("ascii")
# Quantize only normals, retaining full float coordinates and indexed triangles.
normal_i8=np.round(np.clip(n,-1,1)*127).astype("i1")
payload={"format":"threshold-indexed-mesh-v1","vertices":len(v),"triangles":len(faces),"positionsF32LE":pack(v),"normalsI8":pack(normal_i8),"indicesU16LE":pack(faces)}
out=args.output/"david.mesh.json"
out.write_text(json.dumps(payload,separators=(",",":"))+"\n")
if out.stat().st_size>500_000:raise ValueError("Asset exceeds 500KB web budget")
(args.output/"david.glb").write_bytes(mesh.export(file_type="glb"))
report={"source_sha256":digest,"source_bytes":len(source),"source_triangles":original_faces,"triangles":len(faces),"vertices":len(v),"axis_order":[horizontal[0],vertical,horizontal[1]],"bounds":mesh.bounds.tolist(),"mesh_bytes":out.stat().st_size,"license":"CC BY-SA 4.0","orientation_review_required":True}
(args.output/"report.json").write_text(json.dumps(report,indent=2)+"\n")
# CPU-only orthographic depth-sorted turntable: inspect actual scan silhouette,
# not a generated imitation. The four views reveal front/back and vertical sign.
canvas=Image.new("RGB",(1000,760),"#d9d5ca")
draw=ImageDraw.Draw(canvas)
for i,angle in enumerate([0,90,180,270]):
    r=np.deg2rad(angle)
    rotation=np.array([[np.cos(r),0,np.sin(r)],[0,1,0],[-np.sin(r),0,np.cos(r)]])
    points=v@rotation.T
    tri=points[faces]
    depth=tri[:,:,2].mean(axis=1)
    normals=np.cross(tri[:,1]-tri[:,0],tri[:,2]-tri[:,0])
    normals/=np.maximum(np.linalg.norm(normals,axis=1,keepdims=True),1e-10)
    light=np.array([-.35,.55,.76])
    luminance=np.clip(.50+.48*np.abs(normals@light),0,1)
    ox=250+500*(i%2);oy=344+380*(i//2)
    for j in np.argsort(depth):
        polygon=[(float(ox+x*290),float(oy-y*290)) for x,y,z in tri[j]]
        c=int(luminance[j]*218)
        draw.polygon(polygon,fill=(c,min(255,c+1),max(0,c-5)))
    draw.text((ox-35,oy+12),f"{angle} degrees",fill="#35332c")
canvas.save(args.output/"orientation.png")
print(json.dumps(report))
