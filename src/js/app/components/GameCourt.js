import * as THREE from 'three';

/**
 * Clase GameCourt: representa la superficie
 * de apoyo donde se desarrollaran las acciones
 */
export default class GameCourt extends THREE.Object3D {

    constructor(aWidth, aDepth, material){
        super();

        //Datos miembro
        this.width = aWidth;
        this.height = 0.2;
        this.depth = aDepth;
        this.material = material;

        // Creación del plano que representa el suelo
        this.ground = new THREE.Mesh(
            new THREE.BoxGeometry(this.width, this.height, this.depth),
            this.material
        );
        this.ground.receiveShadow = true;
        this.ground.matrixAutoUpdate = false;
        this.add(this.ground);
    }
}