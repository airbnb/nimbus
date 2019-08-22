const { EventEmitter } = require('events');
const Storage = require('dom-storage');

global.localStorage = new Storage(null, { strict: false });

global.sessionStorage = new Storage(null, { strict: true });

global.BroadcastChannel = class BroadcastChannel {
  constructor(name) {
    this.emitter = new EventEmitter();
    this.name = name;
  }

  postMessage(data) {
    this.emitter.emit('message', { data });
  }

  addEventListener(name, listener) {
    this.emitter.on(name, listener);
  }

  removeEventListener(name, listener) {
    this.emitter.removeListener(name, listener);
  }

  close() {
    this.emitter.removeAllListeners();
  }
};
