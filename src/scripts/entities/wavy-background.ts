import { BufferAttribute, BufferGeometry, Color, Points, PointsMaterial, Scene, Vector2 } from 'three';

export class WavyBackground {
  stats;
  pointclouds;
  raycaster;
  intersection = null;
  spheresIndex = 0;
  toggle = 0;

  pointer = new Vector2();
  spheres = [];

  threshold = 0.1;
  pointSize = 0.06;

  private readonly extrudeSettings = {
    depth: 1,
    
  };
    

  constructor(scene: Scene, width: number, length: number) {
    const pcIndexed = this.generateIndexedPointcloud( new Color(  1, 1, 1 ), width, length );
    pcIndexed.scale.set( 5, 10, 10 );
    pcIndexed.position.set( 0, 0, 0 );
    scene.add( pcIndexed );

    this.pointclouds = [pcIndexed ];

    return this;
  }
  

  private generatePointCloudGeometry( color, width, length ) {

    const geometry = new BufferGeometry();
    const numPoints = width * length;

    const positions = new Float32Array( numPoints * 3 );
    const colors = new Float32Array( numPoints * 3 );

    let k = 0;

    for ( let i = 0; i < width; i ++ ) {

      for ( let j = 0; j < length; j ++ ) {

        const x = (i* (width/length) / length) - 0.5; 
        const y = .05;
        const z = (j / length * 1.4) - 0.5;

        positions[ 3 * k ] = x;
        positions[ 3 * k + 1 ] = y;
        positions[ 3 * k + 2 ] = z;

        const intensity = .5;
        colors[ 3 * k ] = 1;
        colors[ 3 * k + 1 ] = 1;
        colors[ 3 * k + 2 ] = 1;

        k ++;

      }

    }

    geometry.setAttribute( 'position', new BufferAttribute( positions, 3 ) );
    geometry.setAttribute( 'color', new BufferAttribute( colors, 3 ) );
    geometry.computeBoundingBox();

    return geometry;

  }

  private generateIndexedPointcloud( color, width, length ) {

    const geometry = this.generatePointCloudGeometry( color, width, length );
    const numPoints = width * length;
    const indices = new Uint16Array( numPoints );

    let k = 0;

    for ( let i = 0; i < width; i ++ ) {

      for ( let j = 0; j < length; j ++ ) {

        indices[ k ] = k;
        k ++;

      }

    }

    geometry.setIndex( new BufferAttribute( indices, 1 ) );

    const material = new PointsMaterial( { size: this.pointSize, vertexColors: true, sizeAttenuation: true } );

    return new Points( geometry, material );

  }


    
}
 