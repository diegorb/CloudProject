/** Author: Diego Ramírez Barba
 *  The physics of this project are based on https://p5js.org/examples/motion-bouncy-bubbles.html (Keith Peters)
 */

// A list of points 
var particles = [];
var bg;
let numberofParticles;
let particleSize = 30;
let border = 20;
let gravity = 0.03;
let friction = -0.9;
let spring = 0.1;
let mic;
let amp = 5;
var scoreElem;
var scoreRecord;
var maxScore;

function setup() {
  createCanvas(window.innerWidth - border, window.innerHeight - border - 20);
  bg = loadImage('./utils/navidad.jpg');

  fetch('/record', {method: 'GET'})
  .then(function(response) {
    if(response.ok) return response.json();
    throw new Error('Request failed.');
  })
  .then(function(data) {
    if(data) {
      maxScore = data.record;
    }
    else {
      maxScore = 0;
    }
  })
  .catch(function(error) {
    console.log(error);
  });

  resetSketch();
  var button = createButton("reset");
  button.mousePressed(resetSketch);
  button.position(10, window.innerHeight - border - 20);

  scoreElem = createSpan('Score = 0');
  scoreElem.position(window.innerWidth - border - 300, 0);
  scoreElem.id = 'score';
  scoreElem.style('color', 'black');

  scoreRecord = createSpan('Record = 0');
  scoreRecord.position(window.innerWidth - border - 150, 0);
  scoreRecord.id = 'record';
  scoreRecord.style('color', 'black');
}

function resetSketch(){
  // Create an Audio input
  mic = new p5.AudioIn();
  mic.start();
  numberofParticles = 0;
  particles = [];
   // Create a random set of points
  for (let i = 0; i < numberofParticles; i++) {
    particles[i] = new Particle(
      random(0, width - particleSize),
      random(0, height - particleSize),
      random(20,50),
      i,
      particles 
    );     
  }
}

function draw(){
  background(bg);

  if(maxScore){
    scoreRecord.html('Record = ' + (maxScore));
  }
  
   // Create a random set of particles
  particles.forEach(particle => {
    particle.move();
    particle.display();
    particle.collide();
  });
}

// Add a new particle into the System
function mouseClicked() {
  scoreElem.html('Score = ' + (numberofParticles + 1));
  if(numberofParticles + 1 > maxScore){
    maxScore = numberofParticles + 1;
    // update record in the db
    saveNewRecord(maxScore);
  }
  numberofParticles += 1;
  //console.log(`${numberofParticles}`);
  particles.push(new Particle(mouseX, mouseY, random(20,50), numberofParticles, particles));
}

function Particle(xin, yin, din, idin, oin) {
  this.x = xin;
  this.y = yin;
  var vx = 0;
  var vy = 0;
  this.diameter = din;
  this.id = idin;
  this.others = oin;

  this.collide = function() {
    for (var i = this.id + 1; i < numberofParticles; i++) {
      var dx = this.others[i].x - this.x;
      var dy = this.others[i].y - this.y;
      var distance = sqrt(dx * dx + dy * dy);
      var minDist = this.others[i].diameter / 2 + this.diameter / 2;
      if (distance < minDist) {
        var angle = atan2(dy, dx);
        var targetX = this.x + cos(angle) * minDist;
        var targetY = this.y + sin(angle) * minDist;
        var ax = (targetX - this.others[i].x) * spring;
        var ay = (targetY - this.others[i].y) * spring;
        vx -= ax;
        vy -= ay;
        this.others[i].vx += ax;
        this.others[i].vy += ay;
      }
    }
  };
  this.move = function() {
    vy += gravity;
    this.x += vx;
    this.y += vy;
    if (this.x + this.diameter / 2 > width) {
      this.x = width - this.diameter / 2;
      vx *= friction;
    } else if (this.x - this.diameter / 2 < 0) {
      this.x = this.diameter / 2;
      vx *= friction;
    }
    if (this.y + this.diameter / 2 > height) {
      this.y = height - this.diameter / 2;
      vy *= friction;
    } else if (this.y - this.diameter / 2 < 0) {
      this.y = this.diameter / 2;
      vy *= friction;
    }
  };

  this.display = function() {
    noStroke();
    fill((mic.getLevel() * 255 * amp),0,0);
    ellipse(this.x, this.y, this.diameter, this.diameter);
  };
}

function saveNewRecord(val) {
  fetch('/record', {
  method: 'PUT',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({record: val})
})
.then(res => res.text())
}