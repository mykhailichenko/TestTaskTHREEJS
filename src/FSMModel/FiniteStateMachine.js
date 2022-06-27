import { IdleState, DanceState, RunState, WalkState } from "./States.js";

//Abstract class for state management of animations
class FiniteStateMachine {
  constructor() {
    this._states = {};
    this._currentState = null;
  }

  _addState(name, type) {
    this._states[name] = type;
  }

  setState(name) {
    const prevState = this._currentState;

    if (prevState) {
      if (prevState.Name == name) {
        return;
      }
      prevState.Exit();
    }

    const state = new this._states[name](this);

    this._currentState = state;
    state.Enter(prevState);
  }

  Update(timeElapsed, input) {
    if (this._currentState) {
      this._currentState.Update(timeElapsed, input);
    }
  }
};


export default class CharacterFSM extends FiniteStateMachine {
  constructor(proxy) {
    super();
    this._proxy = proxy;
    this._Initialize();
  }

  _Initialize() {
    this._addState('idle', IdleState);
    this._addState('walk', WalkState);
    this._addState('dance', DanceState);
    this._addState('run', RunState);
  }
};
