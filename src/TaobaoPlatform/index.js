import URL from '../libs/URL';
import Blob from '../libs/Blob';
import atob from '../libs/atob';
import EventTarget from '../libs/EventTarget';
import XMLHttpRequest from './XMLHttpRequest';
import copyProperties from '../libs/copyProperties';

function OffscreenCanvas() {
  return my.createOffscreenCanvas();
}

export class TaobaoPlatform {
  constructor(canvas) {
    const systemInfo = my.getSystemInfoSync();

    this.canvas = canvas;

    this.document = {
      createElementNS(_, type) {
        if (type === 'canvas') return canvas;
        if (type === 'img') return canvas.createImage();
      },
    };

    this.window = {
      innerWidth: systemInfo.windowWidth,
      innerHeight: systemInfo.windowHeight,
      devicePixelRatio: systemInfo.pixelRatio,
      AudioContext: function () {},
      URL: new URL(),
      requestAnimationFrame: this.canvas.requestAnimationFrame,
      cancelAnimationFrame: this.canvas.cancelAnimationFrame,
    };

    [this.canvas, this.document, this.window].forEach(i => {
      copyProperties(i.constructor.prototype, EventTarget.prototype);
    });

    this.patchCanvas();

    this.onDeviceMotionChange = e => {
      e.type = 'deviceorientation';
      this.window.dispatchEvent(e);
    };
  }

  patchCanvas() {
    Object.defineProperty(this.canvas, 'style', {
      get() {
        return {
          width: this.width + 'px',
          height: this.height + 'px',
        };
      },
    });

    Object.defineProperty(this.canvas, 'clientHeight', {
      get() {
        return this.height;
      },
    });

    Object.defineProperty(this.canvas, 'clientWidth', {
      get() {
        return this.width;
      },
    });
  }

  getGlobals() {
    return {
      atob: atob,
      Blob: Blob,
      window: this.window,
      document: this.document,
      HTMLCanvasElement: undefined,
      XMLHttpRequest: XMLHttpRequest,
      OffscreenCanvas: OffscreenCanvas,
      createImageBitmap: undefined,
    };
  }

  enableDeviceOrientation() {
    my.onDeviceMotionChange(this.onDeviceMotionChange);
  }

  disableDeviceOrientation() {
    my.offDeviceMotionChange(this.onDeviceMotionChange);
  }

  dispose() {
    this.disableDeviceOrientation();
    this.onDeviceMotionChange = null
    this.document = null;
    this.window = null;
    this.canvas = null;
  }
}
