// Size of canvas. These get updated to fill the whole browser.
let width = 150;
let height = 150;
let count =0;
const numBoids = 100;
const visualRange = 75;

var boids = [];

function initBoids() {
  let randomNumber = Math.random(); // generate a random number between 0 and 1
  let variable;


  for (var i = 0; i < numBoids; i += 1) {
    
    if (randomNumber < 0.1) {
      variable = 1; // assign 1 if the random number is less than 0.5
    } else {
      variable = 2; // assign 2 if the random number is greater than or equal to 0.5
    } 
    console.log(variable);

    boids[boids.length] = {
      x: Math.random() * width,
      y: Math.random() * height,
      dx: Math.random() * 10 - 5,
      dy: Math.random() * 10 - 5,
      type: Math.random() < 0.2 ? 1 : 2,
      history: [],
    };
    console.log(boids[boids.length-1].type);
  }
}

function distance(boid1, boid2) {
  return Math.sqrt(
    (boid1.x - boid2.x) * (boid1.x - boid2.x) +
      (boid1.y - boid2.y) * (boid1.y - boid2.y),
  );
}

// TODO: This is naive and inefficient.
function nClosestBoids(boid, n) {
  // Make a copy
  const sorted = boids.slice();
  // Sort the copy by distance from `boid`
  sorted.sort((a, b) => distance(boid, a) - distance(boid, b));
  // Return the `n` closest
  return sorted.slice(1, n + 1);
}

// Called initially and whenever the window resizes to update the canvas
// size and width/height variables.
function sizeCanvas() {
  const canvas = document.getElementById("boids");
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = width;
  canvas.height = height;
}

// Constrain a boid to within the window. If it gets too close to an edge,
// nudge it back in and reverse its direction.
function keepWithinBounds(boid) {
  if (boid.type !=3){
  const margin = 200;
  const turnFactor = 1;

  if (boid.x < margin) {
    boid.dx += turnFactor;
  }
  if (boid.x > width - margin) {
    boid.dx -= turnFactor
  }
  if (boid.y < margin) {
    boid.dy += turnFactor;
  }
  if (boid.y > height - margin) {
    boid.dy -= turnFactor;
  }
}
}

// Find the center of mass of the other boids and adjust velocity slightly to
// point towards the center of mass.
function flyTowardsCenter(boid) {
  if (boid.type !=3){
  const centeringFactor = 0.005; // adjust velocity by this %

  let centerX = 0;
  let centerY = 0;
  let numNeighbors = 0;

  for (let otherBoid of boids) {
    if ((distance(boid, otherBoid) < visualRange) && (boid.type == otherBoid.type)&&(boid.type !== 3)) {
      console.log(boid.type+ "type");
      centerX += otherBoid.x;
      centerY += otherBoid.y;
      numNeighbors += 1;
    }
  }

  if (numNeighbors) {
    centerX = centerX / numNeighbors;
    centerY = centerY / numNeighbors;

    boid.dx += (centerX - boid.x) * centeringFactor;
    boid.dy += (centerY - boid.y) * centeringFactor;
  }
}
}

function findBoidIndex(boidsArray, boid) {
  for (let i = 0; i < boidsArray.length; i++) {
    if (boidsArray[i].x === boid.x && boidsArray[i].y === boid.y && boidsArray[i].z === boid.z) {
      return i;
    }
  }
  return -1; // boid not found in array
}

// Move away from other boids that are too close to avoid colliding
function avoidOthers(boid) {
  const minDistance = 20; // The distance to stay away from other boids
  const avoidFactor = 0.05; // Adjust velocity by this %
  let moveX = 0;
  let moveY = 0;
  let flag =1;
  let obj={
  x: boid.x,
  y: boid.y,
  dx: boid.dx,
  dy: boid.dy,
  type: 3,
  history: [],
}

  const x = findBoidIndex(boids,boid);
  console.log(x);
  for (let otherBoid of boids) {
    if (otherBoid !== boid) {
      if ((distance(boid, otherBoid) < minDistance))  {
       

        moveX += boid.x - otherBoid.x;
        moveY += boid.y - otherBoid.y;
        if((boid.type != otherBoid.type)&&( boid.type==2)&&(otherBoid.type !=3)){
          flag=2;

      }
       

      
      }
      }
    
  }
  if(flag==2){
       boids.splice(x,1);
       boids.push(obj);
       flag=1;
  }
  else{
  boid.dx += moveX * avoidFactor;
  boid.dy += moveY * avoidFactor;}
}


// Find the average velocity (speed and direction) of the other boids and
// adjust velocity slightly to match.
function matchVelocity(boid) {


  const matchingFactor = 0.05; // Adjust by this % of average velocity

  let avgDX = 0;
  let avgDY = 0;
  let numNeighbors = 0;

  for (let otherBoid of boids) {
    if ((distance(boid, otherBoid) < visualRange) && (boid.type == otherBoid.type)) {
      avgDX += otherBoid.dx;
      avgDY += otherBoid.dy;
      numNeighbors += 1;
    }
  }

  if (numNeighbors) {
    avgDX = avgDX / numNeighbors;
    avgDY = avgDY / numNeighbors;

    boid.dx += (avgDX - boid.dx) * matchingFactor;
    boid.dy += (avgDY - boid.dy) * matchingFactor;
  }
}


// Speed will naturally vary in flocking behavior, but real animals can't go
// arbitrarily fast.
function limitSpeed(boid) {
  
  const speedLimit = 1;

  const speed = Math.sqrt(boid.dx * boid.dx + boid.dy * boid.dy);
  if (speed > speedLimit) {
    boid.dx = (boid.dx / speed) * speedLimit;
    boid.dy = (boid.dy / speed) * speedLimit;
  }

}

const DRAW_TRAIL = false;

function drawBoid(ctx, boid) {
  const angle = Math.atan2(boid.dy, boid.dx);
  ctx.translate(boid.x, boid.y);
  ctx.rotate(angle);
  ctx.translate(-boid.x, -boid.y);
  if (boid.type== 1){
  ctx.fillStyle = "#558cf4";}
  else{
    ctx.fillStyle = "#FF0000";
  }
  ctx.beginPath();
  if (boid.type !=3){
  ctx.moveTo(boid.x, boid.y);
  ctx.lineTo(boid.x - 15, boid.y + 5);
  ctx.lineTo(boid.x - 15, boid.y - 5);
  ctx.lineTo(boid.x, boid.y);
}
  else{
    ctx.arc(boid.x, boid.y, 10, 0, 2 * Math.PI);
  }
  ctx.fill();
  ctx.setTransform(1, 0, 0, 1, 0, 0);

  if (DRAW_TRAIL) {
    ctx.strokeStyle = "#558cf466";
    ctx.beginPath();
    ctx.moveTo(boid.history[0][0], boid.history[0][1]);
    for (const point of boid.history) {
      ctx.lineTo(point[0], point[1]);
    }
    ctx.stroke();
  }

}
function Birthrate(){
  count++;
  let obj={
    x: Math.random() * width,
      y: Math.random() * height,
      dx: Math.random() * 10 - 5,
      dy: Math.random() * 10 - 5,
      type:2 ,
      history: [],
  }
  if (count==50){
  boids.push(obj);
  count =0;
  }

}
// Main animation loop
function animationLoop() {
  // Update each boid
  for (let boid of boids) {
    // Update the velocities according to each rule
    if (boid.type !=3){
    flyTowardsCenter(boid);
    avoidOthers(boid);
    matchVelocity(boid);
    limitSpeed(boid);
    keepWithinBounds(boid);
    
    // Update the position based on the current velocity
    boid.x += boid.dx;
    boid.y += boid.dy;
    boid.history.push([boid.x, boid.y])
    boid.history = boid.history.slice(-50);
  }
  }
  Birthrate();
  // Clear the canvas and redraw all the boids in their current positions
  const ctx = document.getElementById("boids").getContext("2d");
  ctx.clearRect(0, 0, width, height);
  for (let boid of boids) {
    drawBoid(ctx, boid);
  }

  // Schedule the next frame
  window.requestAnimationFrame(animationLoop);
}

window.onload = () => {
  // Make sure the canvas always fills the whole window
  window.addEventListener("resize", sizeCanvas, false);
  sizeCanvas();

  // Randomly distribute the boids to start
  initBoids();

  // Schedule the main animation loop
  window.requestAnimationFrame(animationLoop);
};
