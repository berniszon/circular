var _ = require('underscore');
// var $ = require('jquery');
// var I = require('immutable');
// var models = require('./orbital/models');
var PIXI = require('pixi.js');


var _SPEED = 2000;
var SPEED = 1 / _SPEED
var MAX_CIRCLE_RADIUS = 300;
var CIRCLE_COUNT = 12;
var POINT_COUNT = 12;

var POINT_PERIOD = CIRCLE_COUNT * _SPEED

window.randFrom = function (start, stop) {
  return Math.random()*(stop-start) + start;
};

var period = function (continuos) {
  return continuos - Math.floor(continuos);
}

var orbit = function (baseRadius) {
  var closure = baseRadius;
  return function (t) {
    return baseRadius - t / CIRCLE_COUNT;
  }
}



var point = function (creationTime, offset) {
  var _offset = offset
  var _creationTime = creationTime
  return function (t) {
    while (t - _creationTime > POINT_PERIOD) {
      _creationTime += POINT_PERIOD;
    }
    var r = (1.0 - (t - _creationTime) * SPEED / CIRCLE_COUNT) * MAX_CIRCLE_RADIUS;
    var o = 2.0 * Math.PI * period((t - _creationTime) * SPEED) + _offset;

    return [o, r];
  }
}

var orbits = []
for (i = 0; i < CIRCLE_COUNT; i++) {
  orbits.push(orbit((i + 1) / CIRCLE_COUNT));
}

var points = []
for (i = 0; i < POINT_COUNT; i++) {
  points.push(point(i * -_SPEED, i * Math.PI / 6.0));
}

var render = function(stage, renderer, time, timedelta) {
  // updating model
  var t = period(SPEED * time);
  var o = orbits.map( function (f) { return f(t); } );
  var p = points.map( function (f) { return f(time); } );
  
  // clearing screen
  stage.removeChildren();
  renderer.render(stage);

  // drawing
  var graphics = new PIXI.Graphics();
  graphics.lineStyle(1, 0xFF0000);

  _.each(o, function (r) { graphics.drawCircle(0, 0, MAX_CIRCLE_RADIUS * r); });

  graphics.beginFill(0xFF0000, 1.0);
  _.each(p, function (p) { graphics.drawCircle(Math.cos(p[0]) * p[1], Math.sin(p[0]) * p[1], 5); } );
  graphics.endFill();
  
  stage.addChild(graphics);
  renderer.render(stage);
}

var startTime = (new Date()).getTime()
var lastFrame = 0

window.onload = function() {
  var $gameContainer = $('#gameContainer');
  var width = $gameContainer.width();
  var height = $gameContainer.height();
  var stage = new PIXI.Container(0xFFFFFF, true);
  stage.position.x = width/2;
  stage.position.y = height/2;
	var renderer = PIXI.autoDetectRenderer(width, height);

	document.getElementById('gameContainer').appendChild(renderer.view);

  var drawLoop = function(window, stage, renderer) {
    var time = (new Date()).getTime() - startTime
    var timedelta = time - lastFrame
    render(stage, renderer, time, timedelta)
    lastFrame = time

    window.requestAnimationFrame(function () {
      drawLoop(window, stage, renderer)
    });
  }

  drawLoop(window, stage, renderer);
};
