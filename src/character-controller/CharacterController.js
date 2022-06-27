import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.118/build/three.module.js";
import {FBXLoader} from "https://cdn.jsdelivr.net/npm/three@0.118.1/examples/jsm/loaders/FBXLoader.js";

import CharacterKeyController from "../key-contols/KeyContlos.js";
import CharacterFSM from "../FSMModel/FiniteStateMachine.js";

class CharacterControlMiddleware {
  constructor(animations) {
    this._animations = animations;
  }

  get animations() {
    return this._animations;
  }
};

export default class CharacterController {
  constructor(params) {
    this._Initialize(params);
  }

  _Initialize(params) {
    this._params = params;
    this._decceleration = new THREE.Vector3(-0.0003, -0.0002, -4.0);
    this._acceleration = new THREE.Vector3(1, 0.40, 50.0);
    this._velocity = new THREE.Vector3(0, 0, 0);

    this._animations = {};
    this._input = new CharacterKeyController();
    this._stateMachine = new CharacterFSM(
      new CharacterControlMiddleware(this._animations));

    this._LoadCharacter();
  }

  _LoadCharacter() {
    //Loading the character
    const loader = new FBXLoader();
    loader.load('./character/characterGirl.fbx', (fbx) => {
      fbx.scale.setScalar(0.1);
      fbx.traverse(c => {
        c.castShadow = true;
      });

      this._target = fbx;
      this._params.scene.add(this._target);

      this._mixer = new THREE.AnimationMixer(this._target);

      this._manager = new THREE.LoadingManager();
      this._manager.onLoad = () => {
        this._stateMachine.setState('idle');
      };

      //Loading animations
      const _OnLoad = (animName, animation) => {
        const clip = animation.animations[0];
        const action = this._mixer.clipAction(clip);

        this._animations[animName] = {
          clip: clip,
          action: action,
        };
      };

      const loader = new FBXLoader(this._manager);
      loader.load('./animations/walking.fbx', (e) => { _OnLoad('walk', e); });
      loader.load('./animations/running.fbx', (e) => { _OnLoad('run', e); });
      loader.load('./animations/standing.fbx', (e) => { _OnLoad('idle', e); });
      loader.load('./animations/dancing.fbx', (e) => { _OnLoad('dance', e); });
    });
  }

  //Adding some velocity to the animation; Time in seconds
  Update(time) {
    if (!this._target) {
      return;
    }

    this._stateMachine.Update(time, this._input);

    const velocity = this._velocity;
    const frameDecceleration = new THREE.Vector3(
      velocity.x * this._decceleration.x,
      velocity.y * this._decceleration.y,
      velocity.z * this._decceleration.z
    );
    frameDecceleration.multiplyScalar(time);
    frameDecceleration.z = Math.sign(frameDecceleration.z) * Math.min(
      Math.abs(frameDecceleration.z), Math.abs(velocity.z));

    velocity.add(frameDecceleration);

    const controlObject = this._target;
    const _Q = new THREE.Quaternion();
    const _A = new THREE.Vector3();
    const _R = controlObject.quaternion.clone();

    const acc = this._acceleration.clone();
    if (this._input._keys.shift) {
      acc.multiplyScalar(2.0);
    }

    if (this._stateMachine._currentState && this._stateMachine._currentState.Name == 'dance') {
      acc.multiplyScalar(0.0);
    }

    if (this._input._keys.forward) {
      velocity.z += acc.z * time;
    }
    if (this._input._keys.backward) {
      velocity.z -= acc.z * time;
    }
    if (this._input._keys.left) {
      _A.set(0, 1, 0);
      _Q.setFromAxisAngle(_A, 4.0 * Math.PI * time * this._acceleration.y);
      _R.multiply(_Q);
    }
    if (this._input._keys.right) {
      _A.set(0, 1, 0);
      _Q.setFromAxisAngle(_A, 4.0 * -Math.PI * time * this._acceleration.y);
      _R.multiply(_Q);
    }

    controlObject.quaternion.copy(_R);

    const oldPosition = new THREE.Vector3();
    oldPosition.copy(controlObject.position);

    const forward = new THREE.Vector3(0, 0, 1);
    forward.applyQuaternion(controlObject.quaternion);
    forward.normalize();

    const sideways = new THREE.Vector3(1, 0, 0);
    sideways.applyQuaternion(controlObject.quaternion);
    sideways.normalize();

    sideways.multiplyScalar(velocity.x * time);
    forward.multiplyScalar(velocity.z * time);

    controlObject.position.add(forward);
    controlObject.position.add(sideways);

    oldPosition.copy(controlObject.position);

    if (this._mixer) {
      this._mixer.update(time);
    }
  }
};
