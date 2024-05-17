import * as THREE from "./threejs/three.module.js"
import { GLTFLoader } from "./threejs/GLTFLoader.js"
import {OrbitControls} from "./threejs/OrbitControls.js"
import {Water} from "./threejs/Water.js"

let scene, camera, renderer;
scene = new THREE.Scene();
scene.background =  new THREE.Color(0x000647);//Cor do plano defundo
scene.fog = new THREE.Fog(0x000647, 5, 300);//Efeito neblina
//Camera
camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth/ window.innerHeight,
  0.1, 
  1000
);
camera.position.set(0, 15, 500);//Posição da camera  
//Render
renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
const clock = new THREE.Clock();
// Adiciona o controle da câmera 
const control = new OrbitControls(camera, renderer.domElement);
control.update();

//ILUMINAÇÃO

// Luz de cima (luz direcional)
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.2) ; // Cor branca com intensidade 1
directionalLight.position.set(0, 1000, 0); // Posição da luz (acima da cena)
scene.add(directionalLight);
// spotlight

const spotlight = new THREE.SpotLight(0xffffff); // Cor branca
spotlight.position.set(50, 8, 200); // Posição do spotlight na cena
spotlight.angle = Math.PI /20; // Ângulo do spotlight
spotlight.penumbra = 0; // Penumbra do spotlight
spotlight.decay = 0.5; // Atenuação da luz com a distância
spotlight.distance = 150; // Distância máxima da luz
spotlight.castShadow = true; //sombras
spotlight.intensity = 50; // intensidade da luz
scene.add(spotlight);
scene.add(spotlight.target);
// Adicione um helper para visualizar o spotlight
//const spotlightHelper = new THREE.SpotLightHelper(spotlight);;
//scene.add(spotlightHelper);

//ponto de luz
const pointLight = new THREE.PointLight(0xffe175, 500, 30); // Cor branca, intensidade 1
pointLight.position.set(79, 275, -80); // Posição do ponto de luz na cena
scene.add(pointLight);

//CENÁRIO

//Particulas

const geometry = new THREE.BufferGeometry();
const vertices = [];
const sprite = new THREE.TextureLoader().load( 'textures/sprites/disc.png');
sprite.colorSpace = THREE.SRGBColorSpace;

//Determinando o espaço onde as particulas vão ocupar
const minX = -250;
const maxX = 250;
const minY = -190;
const maxY = 210;
const minZ = -250;
const maxZ = 250;
for (let i = 0; i < 100000; i++) {
  const x = Math.random() * (maxX - minX) + minX;
  const y = Math.random() * (maxY - minY) + minY;
  const z = Math.random() * (maxZ - minZ) + minZ;
  vertices.push(x, y, z);
}
geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( vertices, 3 ) );
const material = new THREE.PointsMaterial( { size: 0.1, sizeAttenuation: true, map: sprite, alphaTest: 0.5, transparent: true } );
material.color.setHSL( 0.5, 0.9, 0.8, THREE.SRGBColorSpace );
const particles = new THREE.Points( geometry, material );
scene.add( particles );

//Fundo
const fundoLoader = new GLTFLoader();
fundoLoader.load('./3Dmodels/underwater2/scene.gltf' , function ( gltf ) {
  const fundo = gltf.scene;
  // Ajuste a escala do fundo para torná-lo maior
  const escala = 50; // Ajuste o valor conforme necessário
  fundo.scale.setScalar(escala);
  scene.add( gltf.scene );
  //Posição do fundo
  fundo.position.setX(-500);
  fundo.position.setY(0);
  fundo.position.setZ(-300);

  }, undefined, function ( error ) { 
    console.error( error );
  } 
);

//Farol

const farolLoader = new GLTFLoader();
farolLoader.load('./3Dmodels/lighthouse/scene.gltf' , function ( gltf ) {
  const farol = gltf.scene;
  scene.add( gltf.scene );
  //Posição do fundo
  farol.position.setX(130);
  farol.position.setY(210);
  farol.position.setZ(-80);
  const scaleFactor = new THREE.Vector3(0.2, 0.2, 0.2); 
  farol.scale.copy(scaleFactor);
  }, undefined, function ( error ) { 
    console.error( error );
  } 
);

//Agua
const waterGeometry = new THREE.PlaneGeometry(500, 500 );
const water = new Water(
  waterGeometry,
  {
    textureWidth: 512,
    textureHeight: 512,
    waterNormals: new THREE.TextureLoader().load( 'textures/waternormals.jpg', function ( texture ) {
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  } ),
    waterColor: 0x031f4d,
    distortionScale: 3.7,
  }
);
water.rotation.x = - Math.PI / 2;
water.position.y = 210;
scene.add( water );

//Função para luz seguir submarino
function subLight() {
  // Obtém a direção para frente do submarino
  const direction = new THREE.Vector3(0, 0, -1).applyQuaternion(submarino.quaternion);
  // Posição da luz na frente do submarino
  spotlight.position.copy(submarino.position).add(direction.clone().multiplyScalar(0));
  // Direção da luz  apontando para onde o submarino está virado
  spotlight.target.position.copy(submarino.position).add(direction);
}

//OBJETOS DA CENA

//Submarino

const velMov = 0.5;
const velRot = 0.5;
let submarino;
const loader = new GLTFLoader();
loader.load('./3Dmodels/red_submarine/scene.gltf' , function ( gltf ) {
  submarino = gltf.scene;
  scene.add( gltf.scene );
  //Posição do submarino
  submarino.position.set(50, 5 , 200);
  //Move o submarino
  document.addEventListener('keydown', function (event) {
    if(event.key === 'ArrowUp')
    {
      moveSubmarineForward();
    }
    if(event.key === 'ArrowDown')
    {
      moveSubmarineBackward(); 
    } 
    if(event.key == 'ArrowLeft')
    {
      rotateSubmarineLeft();
    }
    if (event.key == 'ArrowRight')
    {
      rotateSubmarineRight();
    }
    if (event.key == 'w' ){
      moveSubmarineUp();
    }
    if (event.key == 's'){
      moveSubmarineDown();
    }      
  //Atualiza a posição da câmera para acompanhar o submarino   
  camera.position.x = submarino.position.x;
  camera.position.y = submarino.position.y + 5;  // Ajusta a altura da câmera 
  camera.position.z = submarino.position.z + 15; // Ajusta a distância da câmera 
  }) 
  },undefined, function ( error ) { 
  console.error( error );
});
// Função para mover o submarino para frente
function moveSubmarineForward() {
  // Calcula a direção para frente do submarino
  const direction = new THREE.Vector3(0, 0, -1).applyQuaternion(submarino.quaternion);
  // Move o submarino na direção para frente
  submarino.position.add(direction);
  subLight();
}
// Função para mover o submarino para trás
function moveSubmarineBackward() {
  // Calcula a direção para frente do submarino
  const direction = new THREE.Vector3(0, 0, 1).applyQuaternion(submarino.quaternion);
   // Move o submarino na direção para trás
   submarino.position.add(direction);
   subLight();
}
// Função para rotacionar o submarino para a esquerda
function rotateSubmarineLeft() {
  submarino.rotation.y += velRot;
}
// Função para rotacionar o submarino para a direita
function rotateSubmarineRight() {
  submarino.rotation.y -= velRot;
}
// Função para mover o submarino para cima
function moveSubmarineUp() {
  submarino.position.y += velMov;
  if(submarino.position.y >=208){
    submarino.position.y = 208;
  }
  subLight();
}
// Função para mover o submarino para baixo
function moveSubmarineDown() {
  submarino.position.y -= velMov;
  if(submarino.position.y <= -50){
    submarino.position.y = -50;
  }
  subLight();
}

//Arraia
const arraialoader = new GLTFLoader();
let arraia, arraiaMixer;

arraialoader.load('./3Dmodels/batoidea_animated/scene.gltf', function (gltf){
  arraia = gltf.scene;
  arraia.position.setX(100);
  arraia.position.setY(200);
  arraia.position.setZ(-5);
  arraiaMixer = new THREE.AnimationMixer(arraia);
  arraiaMixer.clipAction(gltf.animations[0]).play(); 
  scene.add(arraia);
});
let time = 0;
const speed = 0.001; 
function movearraia(){
  const Arraiaradius = 150; // Raio do círculo
  const arraiax = Math.cos(time) * Arraiaradius;
  const arraiaz = Math.sin(time) * Arraiaradius;
  arraia.position.set(arraiax, 2, arraiaz);
  time += speed;
}
//peixe
const fishloader = new GLTFLoader();
let fish, fishmixer;
fishloader.load('./3Dmodels/the_fish_particle/scene.gltf', function (gltf){
  fish = gltf.scene;
  fishmixer = new THREE.AnimationMixer(fish);
  fishmixer.clipAction(gltf.animations[0]).play();
  fish.position.setX(-50);
  fish.position.setY(30);
  fish.position.setZ(100);
  fish.rotation.y = -180;
  const escala = 10; 
  fish.scale.setScalar(escala);
  scene.add(fish);
});
//peixe2
const fishl2oader = new GLTFLoader();
let fish2, fishmixer2;
fishl2oader.load('./3Dmodels/tropical_fish/scene.gltf', function (gltf){
  fish2 = gltf.scene;
  fishmixer2 = new THREE.AnimationMixer(fish2);
  fishmixer2.clipAction(gltf.animations[0]).play();
  fish2.position.setX(-60);
  fish2.position.setY(80);
  fish2.position.setZ(30);
  fish2.rotation.y = -180;
  const escala = 10; 
  fish2.scale.setScalar(escala);
  scene.add(fish2);
});
//peixe3
const fish3loader = new GLTFLoader();
let fish3, fishmixer3;
fish3loader.load('./3Dmodels/tropical_fish/scene.gltf', function (gltf){
  fish3 = gltf.scene;
  fishmixer3 = new THREE.AnimationMixer(fish3);
  fishmixer3.clipAction(gltf.animations[0]).play();
  fish3.position.setX(100);
  fish3.position.setY(80);
  fish3.position.setZ(30);
  fish3.rotation.y = -180;
  const escala = 10; 
  fish3.scale.setScalar(escala);
  scene.add(fish3);
});
//Baleia
const whaleloader = new GLTFLoader();
let whale, whaleMixer;
whaleloader.load('./3Dmodels/whale_shark/scene.gltf', function (gltf){
  whale = gltf.scene;
  whaleMixer = new THREE.AnimationMixer(whale);
  whaleMixer.clipAction(gltf.animations[0]).play();
  whale.position.setX(210);
  whale.position.setY(50);
  whale.position.setZ(-5);
  const escala = 20;
  whale.scale.setScalar(escala);
  scene.add(whale);
});
const tempo = 0.2;
const veloRot = 0.001;
function movearWhale(){
  
   // Calcula a direção do movimento da baleia com base em sua rotação
   const direction = new THREE.Vector3(0, 0, 1).applyQuaternion(whale.quaternion);

   // Move a baleia na direção calculada
   whale.position.add(direction.clone().multiplyScalar(tempo));
 
   // Rotaciona a baleia
   whale.rotation.y += -veloRot;
  

}

function animate(){
  requestAnimationFrame(animate);
  water.material.uniforms[ 'time' ].value += 1.0 / 60.0;
 
  let delta = clock.getDelta();
  if(arraiaMixer && fishmixer && whaleMixer && fishmixer2 && fishmixer3){
    arraiaMixer.update(delta);
    fishmixer.update(delta);
    whaleMixer.update(delta);
    fishmixer2.update(delta);
    fishmixer3.update(delta);
  }
  movearraia();
  movearWhale();
  //subLight();
  renderer.render(scene, camera);
}
animate();