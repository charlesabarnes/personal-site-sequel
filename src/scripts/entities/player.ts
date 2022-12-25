import { ExtrudeGeometry, Mesh, MeshBasicMaterial, Path, Shape, Vector3 } from 'three';

export class Player {
  height = 3;
  width = 3;
  thickness = .96;
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

    const outershape = new Shape( this.vectorsToCurvedPoints([pt1, pt2, pt3], radius));

    const holePt1 = new Vector3(this.width/2, this.height * this.thickness, 0);

    const distanceBetweenPoints = pt1.distanceTo(holePt1);
    // TODO: calculate inner points
    const holePt2 = new Vector3(distanceBetweenPoints, distanceBetweenPoints-.1, 0);
    const holePt3 = new Vector3(this.width - distanceBetweenPoints, distanceBetweenPoints -.1, 0);

    console.log(distanceBetweenPoints);
    console.log(pt3.distanceTo(holePt3));


    const inner = new Shape( this.vectorsToCurvedPoints([holePt1, holePt2, holePt3], radius *.9 ));
    outershape.holes.push(inner);
    return  outershape;
  }


  private vectorsToCurvedPoints(vectors: [Vector3, Vector3, Vector3], radius: number) {
    let p = vectors[2].clone().sub(vectors[0]);
    const a1 = Math.atan2(p.y, p.x) + Math.PI / 2;

    p = vectors[1].clone().sub(vectors[0]);
    const a2 = Math.atan2(p.y, p.x) - Math.PI / 2;

    p = vectors[0].clone().sub(vectors[1]);
    const a3 = Math.atan2(p.y, p.x) + Math.PI / 2;

    p = vectors[2].clone().sub(vectors[1]);
    const a4 = Math.atan2(p.y, p.x) - Math.PI / 2;

    const path = new Path();

    path.absarc(vectors[0].x, vectors[0].y, radius, a1, a2, false);

    path.absarc(vectors[1].x, vectors[1].y, radius, a3, a4, false);

    path.absarc(vectors[2].x, vectors[2].y, radius, a4, a1, false);
    return path.getSpacedPoints( 100 );
  }


    
}
 