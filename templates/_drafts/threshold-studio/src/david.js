// Scan the World David, CC BY-SA 4.0. See ../assets/david/ATTRIBUTION.md.
export async function loadDavid(){
  const response=await fetch(new URL('../assets/david/david.mesh.json',import.meta.url),{signal:AbortSignal.timeout(8000)});
  if(!response.ok)throw Error('David asset unavailable');
  return decodeDavid(await response.json());
}
export function decodeDavid(data){
  if(data.format!=='threshold-indexed-mesh-v1'||data.vertices!==8966||data.triangles!==18000)throw Error('David mesh format');
  const bytes=s=>Uint8Array.from(atob(s),c=>c.charCodeAt(0));
  const p=new Float32Array(bytes(data.positionsF32LE).buffer),n=new Int8Array(bytes(data.normalsI8).buffer),idx=new Uint16Array(bytes(data.indicesU16LE).buffer);
  if(p.length!==data.vertices*3||n.length!==p.length||idx.length!==data.triangles*3)throw Error('David mesh length');
  const a=-.88,c=Math.cos(a),s=Math.sin(a),h=4.5,output=[];
  const color=[.85,.82,.75];
  for(const index of idx){
    if(index>=data.vertices)throw Error('David mesh index');
    const i=index*3,x=p[i],y=p[i+1],z=p[i+2],nx=n[i]/127,ny=n[i+1]/127,nz=n[i+2]/127;
    output.push(4.18+h*(c*x+s*z),.32+h*y,-15.05+h*(-s*x+c*z),...color,c*nx+s*nz,ny,-s*nx+c*nz);
  }
  // Low limestone plinth; hard face normals distinct from the scan's smooth normals.
  const l=3.20,r=5.22,b=0,t=.32,z0=-15.98,z1=-13.92,stone=[.70,.68,.63];
  const quad=(a,b,c,d,n)=>{for(const p of [a,b,c,a,c,d])output.push(...p,...stone,...n)};
  quad([l,b,z1],[r,b,z1],[r,t,z1],[l,t,z1],[0,0,1]);
  quad([r,b,z0],[l,b,z0],[l,t,z0],[r,t,z0],[0,0,-1]);
  quad([l,b,z0],[l,b,z1],[l,t,z1],[l,t,z0],[-1,0,0]);
  quad([r,b,z1],[r,b,z0],[r,t,z0],[r,t,z1],[1,0,0]);
  quad([l,t,z1],[r,t,z1],[r,t,z0],[l,t,z0],[0,1,0]);
  quad([l,b,z0],[r,b,z0],[r,b,z1],[l,b,z1],[0,-1,0]);
  if(!output.every(Number.isFinite))throw Error('David mesh nonfinite');
  return new Float32Array(output);
}
