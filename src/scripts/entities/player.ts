import { ExtrudeGeometry, Mesh, MeshBasicMaterial, Path, Shape, Vector3 } from 'three';

export class Player {
  height = 3;
  width = 2.5;
  thickness = .8;
  color = '#f40000';
  shape: Shape;
  geometry: ExtrudeGeometry;
  material: MeshBasicMaterial;
  mesh: Mesh;

  private readonly extrudeSettings = {
    depth: 1,
    
  };
    

  constructor(color) {
    this.color = color;
    this.shape = this.createShape();
    this.geometry = new ExtrudeGeometry(this.shape, this.extrudeSettings);
    this.material = new MeshBasicMaterial({ color: this.color, wireframe: false });
    this.mesh = new Mesh(this.geometry, this.material);
    return this; 
  }
  
  private createShape() {
    const radius = .5;

    const pt1 = new Vector3(this.width / 2, this.height, 0);
    const pt2 = new Vector3(0, 0, 0);
    const pt3 = new Vector3(this.width, 0, 0);

    let p = pt3.clone().sub(pt1);
    const a1 = Math.atan2(p.y, p.x) + Math.PI / 2;

    p = pt2.clone().sub(pt1);
    const a2 = Math.atan2(p.y, p.x) - Math.PI / 2;

    p = pt1.clone().sub(pt2);
    const a3 = Math.atan2(p.y, p.x) + Math.PI / 2;

    p = pt3.clone().sub(pt2);
    const a4 = Math.atan2(p.y, p.x) - Math.PI / 2;

    const path = new Path(); // <============================= changed

    path.absarc(pt1.x, pt1.y, radius, a1, a2, false);

    path.absarc(pt2.x, pt2.y, radius, a3, a4, false);

    path.absarc(pt3.x, pt3.y, radius, a4, a1, false);
    const points = path.getSpacedPoints( 100 );

    const outershape = new Shape( points );



    const pt12 = new Vector3(this.width*this.thickness/2, this.height * this.thickness, 0);
    const pt22 = new Vector3(.1, 0, 0);
    const pt32 = new Vector3(this.width * this.thickness, 0, 0);

    p = pt32.clone().sub(pt12);
    const a12 = Math.atan2(p.y, p.x) + Math.PI / 2;

    p = pt22.clone().sub(pt12);
    const a22 = Math.atan2(p.y, p.x) - Math.PI / 2;

    p = pt12.clone().sub(pt22);
    const a32 = Math.atan2(p.y, p.x) + Math.PI / 2;

    p = pt32.clone().sub(pt22);
    const a42 = Math.atan2(p.y, p.x) - Math.PI / 2;

    const path2 = new Path(); // <============================= changed

    path2.absarc(pt12.x, pt12.y, radius, a12, a22, false);

    path2.absarc(pt22.x, pt22.y, radius, a32, a42, false);

    path2.absarc(pt32.x, pt32.y, radius, a42, a12, false);
    const points2 = path2.getSpacedPoints( 100 );

    const inner = new Shape( points2 );
    outershape.holes.push(inner);
    return  outershape;
  }


    
}
 