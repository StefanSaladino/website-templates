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
  // Repair missing scan normals from incident faces; keep positions and topology.
  const repaired=new Float32Array(n.length),sum=new Float64Array(n.length),largest=new Float64Array(n.length),areas=new Float64Array(data.vertices);
  const missing=new Set();
  for(let i=0;i<n.length;i+=3){
    const length=Math.hypot(n[i],n[i+1],n[i+2]);
    if(length<1){missing.add(i/3);continue}
    for(let k=0;k<3;k++)repaired[i+k]=n[i+k]/length;
  }
  for(let j=0;j<idx.length;j+=3){
    const a=idx[j],b=idx[j+1],c=idx[j+2];
    if(Math.max(a,b,c)>=data.vertices)throw Error('David mesh index');
    if(!missing.has(a)&&!missing.has(b)&&!missing.has(c))continue;
    const u=[0,1,2].map(k=>p[b*3+k]-p[a*3+k]),v=[0,1,2].map(k=>p[c*3+k]-p[a*3+k]);
    const face=[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]];
    const area=Math.hypot(...face);
    for(const i of [a,b,c])if(missing.has(i)){
      for(let k=0;k<3;k++)sum[3*i+k]+=face[k];
      if(area>areas[i]){areas[i]=area;largest.set(face,3*i)}
    }
  }
  for(const i of missing){
    let normal=Array.from(sum.slice(3*i,3*i+3)),length=Math.hypot(...normal);
    if(length<1e-12){normal=Array.from(largest.slice(3*i,3*i+3));length=Math.hypot(...normal)}
    if(length<1e-12)throw Error('David mesh missing normal');
    for(let k=0;k<3;k++)repaired[3*i+k]=normal[k]/length;
  }
  const a=-.88,c=Math.cos(a),s=Math.sin(a),h=4.5,output=[];
  const color=[.85,.82,.75];
  for(const index of idx){
    if(index>=data.vertices)throw Error('David mesh index');
    const i=index*3,x=p[i],y=p[i+1],z=p[i+2],nx=repaired[i],ny=repaired[i+1],nz=repaired[i+2];
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
