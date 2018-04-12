import * as THREE from 'three';
import torsoImg from '../../../public/assets/images/torso.png'
import headImg from '../../../public/assets/images/head.png'
import Light from "./Light";

/**
 * Clase R2D2: modelo jerarquico de un robot parecido a
 * R2D2 donde tendrá 3 grados de libertad: podra elevarse
 * con sus brazos, balancearse hacia delante y atras y
 * girar la cabeza hasta determinada posicion
 */
export default class R2D2 extends THREE.Object3D {

    /**
     * @param refHeight altura de referencia de los brazos
     * @param refWidth anchura de referencia del cuerpo
     * @param alpha angulo balanceo (35º hacia delante, 45º hacia atras
     * @param beta angulo giro de la cabeza (80º como maximo)
     * @param gamma escalado de brazos no mayor del 20% de la altura original
     */
    constructor(refHeight, refWidth, alpha, beta, gamma){
        super();

        //Partes del cuerpo
        //Partes del brazo completo
        this.rightFoot = null;
        this.leftFoot = null;
        this.rightArm = null;
        this.leftArm = null;
        this.rightShoulder = null;
        this.leftShoulder = null;

        //Cuerpo y cabeza
        this.body = null;
        this.head = null;
        this.eye = null;
        this.headLight = null;

        //Vectores direccion del robot
        this.forwardVector = null;
        this.backwardVector = null;

        //Valores de referencia: alto y ancho
        this.armHeight = refHeight;
        this.bodyWidth = refWidth;
        this.shoulderWidth = refWidth*0.2;
        this.bottomFootRadius = 0.3*refWidth;
        this.topFootRadius = 0.1*refWidth;
        this.footHeight = 0.3*refHeight;

        //Variable de control del movimiento
        this.rotationDegrees = (15 * Math.PI/180);

        //Variables de control de grados de libertad (los grados deben expresarse en radianes)
        // La cabeza girará entre -80º y 80º (eje Y)
        this.minHeadRotation = (-80 * Math.PI/180);
        this.maxHeadRotation = (80 * Math.PI/180);
        // El cuerpo se balanceará entre -45º y 30º (eje X)
        this.minBodyRotation = (-45 * Math.PI/180);
        this.maxBodyRotation = (30 * Math.PI/180);
        // Los brazos podrán escalarse (solo en eje Y) hasta un 20% más
        this.minArmsScale = 1;
        this.maxArmsScale = 1.2;

        //Creación del robot
        this.createFeet();
        this.add(this.rightFoot);
        this.add(this.leftFoot);

        //Creacion de las flechas que indican las direcciones
        //forward y backward
        this.createDirectionVectors();
        this.add(this.forwardVector);
        this.add(this.backwardVector);

    }

    createDirectionVectors(){

        //Direccion de forward y backward vector
        var forwardDir = new THREE.Vector3(0,0,10);
        var backwardDir = new THREE.Vector3(0,0,-10)
        //Normalizacion de vectores
        forwardDir.normalize();
        backwardDir.normalize();

        //Vector origen a la altura del pecho del robot
        var origin = new THREE.Vector3( 0, this.armHeight+this.footHeight, 0 );
        var size = 10;
        var color = 0xff0000;

        //Creamos nuestros vectores direccion para poder mover al robot por la escena.
        //No queremos que aparezcan en la escena asi que la visibilidad sera false
        this.forwardVector = new THREE.ArrowHelper( forwardDir, origin, size, color );
        this.backwardVector = new THREE.ArrowHelper( backwardDir, origin, size, color );
        this.forwardVector.visible = false;
        this.backwardVector.visible = false;
    }

    createFeet() {
        //Creación del pie derecho y traslacion para apoyarlo sobre el plano X
        this.rightFoot = new THREE.Mesh(
            new THREE.CylinderGeometry(this.topFootRadius, this.bottomFootRadius, this.footHeight, 32, 32, 1),
            new THREE.MeshPhongMaterial({ color: 0x0000ff, specular: 0x000eee, shininess: 70 }));
        this.rightFoot.geometry.applyMatrix(new THREE.Matrix4().makeTranslation(0, this.footHeight / 2, 0));
        this.rightFoot.castShadow = true;
        this.rightFoot.matrixAutoUpdate = false;
        this.rightFoot.position.x -= (this.bodyWidth + this.shoulderWidth) / 2;
        this.rightFoot.updateMatrix();

        //Creación del pie izauierdo: lo trasladamos tambien en el eje X
        this.leftFoot = new THREE.Mesh(
            new THREE.CylinderGeometry(this.topFootRadius, this.bottomFootRadius, this.footHeight, 32, 32, 1),
            new THREE.MeshPhongMaterial({ color: 0x0000ff, specular: 0x000eee, shininess: 70 }));
        this.leftFoot.geometry.applyMatrix(new THREE.Matrix4().makeTranslation(this.bodyWidth + this.shoulderWidth, this.footHeight / 2, 0));
        this.leftFoot.castShadow = true;
        this.leftFoot.matrixAutoUpdate = false;
        this.leftFoot.position.x -= (this.bodyWidth + this.shoulderWidth) / 2;
        this.leftFoot.updateMatrix();

        //Creación de los brazos: serán añadidos como hijos de esta geometria
        this.createArms();
        this.rightFoot.add(this.rightArm);
        this.leftFoot.add(this.leftArm);
    }

    createArms() {
        //Creación del brazo derecho y traslacion para apoyarlo sobre el eje y posteriormente a
        //la altura del pie que le corresponda
        this.rightArm = new THREE.Mesh(
            new THREE.CylinderGeometry(this.topFootRadius, this.topFootRadius, this.armHeight),
            new THREE.MeshPhongMaterial({ color: 0xffffff, specular: 0x000eee, shininess: 70 }));

        this.rightArm.geometry.applyMatrix(new THREE.Matrix4().makeTranslation(0, this.armHeight / 2, 0));
        this.rightArm.castShadow = true;
        this.rightArm.matrixAutoUpdate = false;
        this.rightArm.position.y = this.footHeight;
        this.rightArm.updateMatrix();

        //Creación del brazo izquierdo de la misma forma
        this.leftArm = new THREE.Mesh(
            new THREE.CylinderGeometry(this.topFootRadius, this.topFootRadius, this.armHeight),
            new THREE.MeshPhongMaterial({ color: 0xffffff, specular: 0x000eee, shininess: 70 }));

        this.leftArm.geometry.applyMatrix(new THREE.Matrix4().makeTranslation(this.bodyWidth + this.shoulderWidth, this.armHeight / 2, 0));
        this.leftArm.castShadow = true;
        this.leftArm.matrixAutoUpdate = false;
        this.leftArm.position.y = this.footHeight;
        this.leftArm.updateMatrix();

        //Creación de los hombros: serán hijos de la geometria de los pies
        //y contendrán ademas el cuerpo del robot
        this.createShoulders();
        this.rightFoot.add(this.rightShoulder);
        this.leftFoot.add(this.leftShoulder);
    }

    createShoulders() {
        //Creamos el hombro derecho y lo situamos sobre el plano X y posteriomente lo
        //desplazamos hasta estar encima del brazo
        this.rightShoulder = new THREE.Mesh(
            new THREE.BoxGeometry(this.shoulderWidth, this.shoulderWidth, this.shoulderWidth),
            new THREE.MeshPhongMaterial({ color: 0x0000ff, specular: 0x000eee, shininess: 70 }));

        this.rightShoulder.geometry.applyMatrix(new THREE.Matrix4().makeTranslation(0, this.shoulderWidth * 0.5, 0));
        //Trasladarlo justo encima del brazo
        this.rightShoulder.castShadow = true;
        this.rightShoulder.matrixAutoUpdate = false;
        this.rightShoulder.position.y = this.armHeight + this.footHeight;
        this.rightShoulder.updateMatrix();

        //Hombro derecho
        this.leftShoulder = new THREE.Mesh(
            new THREE.BoxGeometry(this.shoulderWidth, this.shoulderWidth, this.shoulderWidth),
            new THREE.MeshPhongMaterial({ color: 0x0000ff, specular: 0x000eee, shininess: 70 }));

        this.leftShoulder.geometry.applyMatrix(new THREE.Matrix4().makeTranslation(this.bodyWidth + this.shoulderWidth, this.bodyWidth * 0.1, 0));
        //Trasladarlo justo encima del brazo
        this.leftShoulder.castShadow = true;
        this.leftShoulder.matrixAutoUpdate = false;
        this.leftShoulder.position.y = this.armHeight + this.footHeight;
        this.leftShoulder.updateMatrix();

        //Creación del cuerpo
        this.createBody();
        this.rightShoulder.add(this.body);
    }

    createBody() {
        //Creación del cuerpo del robot: el eje de coordenadas del cuerpo
        //estará situado a la altura de los hombros, de forma que la rotacion
        //se realice con respecto a estos
        this.body = new THREE.Mesh(
            new THREE.CylinderGeometry(this.bodyWidth / 2, this.bodyWidth / 2, this.armHeight + this.shoulderWidth, 32, 32),
            new THREE.MeshPhongMaterial({ map: new THREE.TextureLoader().load(torsoImg) }));
        this.body.castShadow = true;

        //Trasladamos el cuerpo un poco mas abajo de la mitad de su altura para que
        //se ajuste mejor a los hombros
        this.body.geometry.applyMatrix(new THREE.Matrix4().makeTranslation(0, -this.footHeight, 0));
        this.body.geometry.applyMatrix(new THREE.Matrix4().makeRotationY(-Math.PI/2.25));
        this.body.position.x = this.bodyWidth / 2 + this.shoulderWidth / 2;
        this.body.rotation.x = 0;
        this.createHead();
        this.body.add(this.head);
    }

    createHead() {
        //Creamos la mitad de una esfera para la cabeza,
        //que tendrá una lente en el centro simulando un ojo
        this.head = new THREE.Mesh(new THREE.SphereGeometry(this.bodyWidth / 2, 32, 32, 0, Math.PI * 2, 0, 0.5 * Math.PI),
            new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load(headImg)}));
        this.head.position.y += 1.9 * this.shoulderWidth;
        this.head.rotation.y = 0;

        //Creamos el ojo del robot
        this.eye = new THREE.Mesh(new THREE.CylinderGeometry(this.shoulderWidth / 2, this.shoulderWidth / 2, this.shoulderWidth, 32, 32),
            new THREE.MeshPhongMaterial({ color: 0xff0000, specular: 0x000eee, shininess: 70 }));
        this.head.castShadow = true;
        this.eye.geometry.applyMatrix(new THREE.Matrix4().makeRotationX(Math.PI / 2));
        this.eye.geometry.applyMatrix(new THREE.Matrix4().makeTranslation(0, this.bodyWidth / 4, 0));
        this.eye.position.z = this.bodyWidth/2.5;
        this.eye.rotation.y = 0;
        //Creamos la luz que sale del ojo del robot
        this.createHeadLight();
        this.head.add(this.eye);
    }

    createHeadLight(){

        //Creamos la luz focal con un grado de inclinacion de 30º
        //sobre el ojo del robot, como si fuera una luz de casco de minero
        this.headLight = new Light('spot',0xff0000,0.85, new THREE.Vector3(0,40,this.bodyWidth*2));
        this.eye.add(this.headLight);
    }

    computeKey(event){

        //Realiza una accion en funcion del tipo de tecla pulsada
        switch(event.code){
            case 'KeyQ':    // rotar cabeza hacia la izquierda
                if (this.head.rotation.y + 0.1 <= this.maxHeadRotation)
                    this.head.rotation.y += 0.1;
                break;
            case 'KeyW':    // rotar cabeza hacia la derecha
                if (this.head.rotation.y - 0.1 >= this.minHeadRotation)
                    this.head.rotation.y -= 0.1;
                break;
            case 'KeyA':    // balancear cuerpo hacia atrás
                if (this.body.rotation.x + 0.1 <= this.maxBodyRotation)
                    this.body.rotation.x += 0.1;
                break;
            case 'KeyS':    // balancear cuerpo hacia adelante
                if (this.body.rotation.x - 0.1 >= this.minBodyRotation)
                    this.body.rotation.x -= 0.1;
                break;
            case 'KeyZ':    // disminuir escala brazos
                if (this.rightArm.scale.y - 0.05 >= this.minArmsScale) {
                    this.rightArm.scale.y -= 0.05;
                    this.rightArm.updateMatrix();
                    this.rightShoulder.position.y -= (0.05 * this.armHeight);
                    this.rightShoulder.updateMatrix();
                    this.leftArm.scale.y -= 0.05;
                    this.leftArm.updateMatrix();
                    this.leftShoulder.position.y -= (0.05 * this.armHeight);
                    this.leftShoulder.updateMatrix();
                }
                break;
            case 'KeyX':    // aumentar escala brazos
                if (this.rightArm.scale.y + 0.05 <= this.maxArmsScale) {
                    this.rightArm.scale.y += 0.05;
                    this.rightArm.updateMatrix();
                    this.rightShoulder.position.y += (0.05 * this.armHeight);
                    this.rightShoulder.updateMatrix();
                    this.leftArm.scale.y += 0.05;
                    this.leftArm.updateMatrix();
                    this.leftShoulder.position.y += (0.05 * this.armHeight);
                    this.leftShoulder.updateMatrix();
                }
                break;

            //Teclas que permiten mover al robot por la escena
            case 'ArrowUp':
                //Obtenemos las coordenadas de la punta del vector Forward
                //y desplazamos el robot hacia esa posicion
                var vector = new THREE.Vector3();
                vector.setFromMatrixPosition(this.forwardVector.cone.matrixWorld);
                this.position.x = vector.x;
                this.position.z = vector.z;
                break;
            case 'ArrowDown':
                //Obtenemos las coordenadas de la punta del vector Backward
                //y desplazamos el robot hacia esa posicion
                var vector = new THREE.Vector3();
                vector.setFromMatrixPosition(this.backwardVector.cone.matrixWorld);
                this.position.x = vector.x;
                this.position.z = vector.z;
                break;
            case 'ArrowLeft':
                this.rotateY(this.rotationDegrees);

                break;
            case 'ArrowRight':
                this.rotateY(-this.rotationDegrees);
                break;
        }
    }

}
















