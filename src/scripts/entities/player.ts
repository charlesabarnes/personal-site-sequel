import { ExtrudeGeometry, Mesh, MeshBasicMaterial, Shape } from 'three';

export class Player {
  height = 3;
  width = 2;
  color = '#f40000';
  shape: Shape;
  geometry: ExtrudeGeometry;
  material: MeshBasicMaterial;
  mesh: Mesh;

  private readonly extrudeSettings = {
    steps: 12,
    depth: 1,
    bevelEnabled: true,
    bevelThickness: 1,
    bevelSize: 3,
    bevelOffset: 0,
    bevelSegments: 1
  };
    

  constructor(color) {
    this.color = color;
    this.shape = this.createShape();
    this.geometry = new ExtrudeGeometry(this.shape, this.extrudeSettings);
    this.material = new MeshBasicMaterial({ color: this.color, wireframe: true });
    this.mesh = new Mesh(this.geometry, this.material);
    return this; 
  }
  
  private createShape() {
    const shape = new Shape();
    shape.moveTo(0, 0);
    shape.lineTo(this.width/2, this.height);
    shape.lineTo(this.width, 0);
    shape.lineTo(0, 0);
    return shape;
  }


    
}
 