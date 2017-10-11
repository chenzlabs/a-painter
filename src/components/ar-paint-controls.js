AFRAME.registerSystem('ar-paint-controls', {
  numberStrokes: 0
});

/* globals AFRAME THREE */
AFRAME.registerComponent('ar-paint-controls', {
  dependencies: ['brush', 'raycaster'],

  init: function () {
    var el = this.el;
    this.controller = null;

    this.size = el.sceneEl.renderer.getSize();
    this.pointer = new THREE.Vector2();
    // normalized device coordinates position
    this.pointerNdc = new THREE.Vector2();

    this.numberStrokes = 0;

    this.raycaster = el.components.raycaster.raycaster;
    // this.el.components.raycaster.showLine = true;
    this.ray = this.raycaster.ray;
    this.intersection = null;

    el.object3D.visible = false;

    document.querySelector('[ar-ui]').addEventListener('activate', this.activate.bind(this));
    document.querySelector('[ar-ui]').addEventListener('deactivate', this.deactivate.bind(this));
  },
  activate: function () {
    this.startHandler = this.paintStart.bind(this);
    this.moveHandler = this.paintMove.bind(this);
    this.endHandler = this.paintEnd.bind(this);
    if (this.el.sceneEl.isMobile) {
      window.addEventListener('touchstart', this.startHandler);
      window.addEventListener('touchmove', this.moveHandler);
      window.addEventListener('touchend', this.endHandler);
    } else {
      window.addEventListener('mousedown', this.startHandler);
      window.addEventListener('mousemove', this.moveHandler);
      window.addEventListener('mouseup', this.endHandler);
    }
  },
  deactivate: function () {
    if (this.el.sceneEl.isMobile) {
      window.removeEventListener('touchstart', this.startHandler);
      window.removeEventListener('touchmove', this.moveHandler);
      window.removeEventListener('touchend', this.endHandler);
    } else {
      window.removeEventListener('mousedown', this.startHandler);
      window.removeEventListener('mousemove', this.moveHandler);
      window.removeEventListener('mouseup', this.endHandler);
    }
  },
  paintStart: function (e) {
    var el = this.el;
    this.paintMove(e);
    if (this.intersection !== null) {
      return;
    }
    if (!el.components.brush.active) {
      el.components.brush.sizeModifier = 1;
      el.components.brush.startNewStroke();
      el.components.brush.active = true;
    }
    el.object3D.visible = true;
  },
  getIntersectObjects: function () {
    var intersectObjects = [];
    for (var i = 0; i < document.querySelector('[ar-ui]').children.length; i++) {
      var element = document.querySelector('[ar-ui]').children[i];
      intersectObjects.push(element.object3D);
    }
    return intersectObjects;
  },
  paintMove: function (e) {
    var el = this.el;
    this.size = this.el.sceneEl.renderer.getSize();
    var t = e;
    if (e.touches) {
      t = e.touches[0];
    }
    this.pointer.set(t.clientX, t.clientY);
    this.pointerNdc.x = (t.clientX / this.size.width) * 2 - 1;
    this.pointerNdc.y = -(t.clientY / this.size.height) * 2 + 1;

    this.raycaster.setFromCamera(this.pointerNdc, this.el.sceneEl.camera);

    var intersections = this.raycaster.intersectObjects(this.getIntersectObjects(), true);
    this.intersection = (intersections.length) > 0 ? intersections[ 0 ] : null;
    if (this.intersection !== null) {
      return;
    }

    el.object3D.position.copy(this.ray.direction);
    el.object3D.position.multiplyScalar(0.75);
    el.object3D.position.add(this.ray.origin);
    el.object3D.updateMatrixWorld();
  },
  paintEnd: function (e) {
    var el = this.el;
    if (el.components.brush.active) {
      el.components.brush.currentStroke = null;
      el.components.brush.active = false;
    }
    el.object3D.visible = false;
  },
  play: function () {
  },

  pause: function () {
  },
  tick: function (t) {
    this.el.object3D.lookAt(this.el.sceneEl.camera.getWorldPosition());
  }
});