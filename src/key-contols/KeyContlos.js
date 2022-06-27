//Simple key controller
export default class CharacterKeyController {
  constructor() {
    this._Initialize();
  }

  _Initialize() {
    this._keys = {
      forward: false,
      backward: false,
      left: false,
      right: false,
      space: false,
      shift: false,
    };
    document.addEventListener('keydown', (e) => this._onKeyDown(e), false);
    document.addEventListener('keyup', (e) => this._onKeyUp(e), false);
  }

  _onKeyDown(event) {
    switch (event.keyCode) {
      case 87: // w (forward)
        this._keys.forward = true;
        break;
      case 65: // a (left)
        this._keys.left = true;
        break;
      case 83: // s (backward)
        this._keys.backward = true;
        break;
      case 68: // d (right)
        this._keys.right = true;
        break;
      case 32: // space (dance)
        this._keys.space = true;
        break;
      case 16: // shift (run)
        this._keys.shift = true;
        break;
    }
  }

  _onKeyUp(event) {
    switch(event.keyCode) {
      case 87: // w (forward)
        this._keys.forward = false;
        break;
      case 65: // a (left)
        this._keys.left = false;
        break;
      case 83: // s (backward)
        this._keys.backward = false;
        break;
      case 68: // d (right)
        this._keys.right = false;
        break;
      case 32: // space (dance)
        this._keys.space = false;
        break;
      case 16: // shift (run)
        this._keys.shift = false;
        break;
    }
  }
};
