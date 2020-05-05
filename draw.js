function getBodyRect() {
  const { width, height} = document.body.getBoundingClientRect();
  return { x: width, y: height };
}

let BR = getBodyRect();
let canvasPos = {
  x: BR.x/2,
  y: BR.y/4
};

const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');

const gifts = {};
let giftIdx = 0;
let gifter;

const settings = {
  giftSize: BR.x/10 < 50 ? BR.x/10 : 50,
  gravity: 0.3,
  maxLife: 100,
  walls: {
    left: BR.x*.05,
    right: BR.x,
    bottom: BR.y
  }
};

canvas.width = BR.x;
canvas.height = BR.y;
canvas.style.cursor = 'none';
document.body.appendChild(canvas);
ctx.fillRect(0,0, BR.x, BR.y);

function Gift(id) {
  this.x = canvasPos.x-settings.giftSize * 0.75;
  this.y = canvasPos.y;
  
  this.vx = Math.random() * 20 - 10;
  this.vy = Math.random() * 20 - 5;
  
  this.id = id;
  gifts[id] = this;
}

Gift.prototype.draw = function() {
  this.x += this.vx;
  this.y += this.vy;
  this.vy += settings.gravity;

  ctx.clearRect(settings.walls.left, settings.walls.bottom, BR.x, BR.y);
  ctx.font = `${settings.giftSize}px Aerial`;
  ctx.fillText(String.fromCodePoint('0x1f381'),this.x,this.y)
  
  if( (this.y + settings.giftSize) > settings.walls.bottom ) {
    this.vy *= -0.3;
    this.vx *= 0.75;
    this.y = settings.walls.bottom - settings.giftSize;
  }
  if( (this.x + settings.giftSize) < settings.walls.left ) {
    this.vx *= -1;
    this.x = settings.walls.left - settings.giftSize;
  }

  if( (this.x + settings.giftSize) > settings.walls.right ) {
    this.vx *= -1;
    this.x = settings.walls.right - settings.giftSize;
  }
  this.vy += settings.gravity;
  
}

Gift.prototype.babycheck = function() {
  if(this.y <= settings.walls.bottom && this.y > settings.walls.bottom - Baby.babySize - 70 && this.x >= Baby.x && this.x <= Baby.x + settings.giftSize && this.x < settings.walls.right){
    babyFaceChanger(Baby.babyType);
    if(!Baby.run){
      Baby.run = true;
      Baby.vx = Baby.vx*2;
    }
    delete gifts[this.id];
    if(Baby.inLove){
      clearTimeout(Baby.inLove);
    }
    Baby.inLove = setTimeout( () => {
      Baby.run = false;
      Baby.vx = Baby.vx/2;
      babyFaceChanger(Baby.babyType);
    },300);
  }
}

function babyFaceChanger(type) {
  const face = type ? {a: '0x1f476', r: '0x1f60d'} : {a: '0x1f6b6', r: '0x1f3c3'};
  return Baby.babyFace = Baby.run ? face.r : face.a;
}
const Baby = {
  inLove: undefined,
  babySize: settings.giftSize*2,
  babyType: false,
  babyFace: '0x1f6b6',
  lookR: true,
  run: false,
  x: 0,
  vx: BR.x/100,
  y: (settings.walls.bottom - 50),
  draw: function() {
    this.x += this.vx;
    if( this.x < settings.walls.left -this.babySize) {
      this.vx *= -1;
      this.lookR = true;
      this.x = settings.walls.left + this.babySize/8;
    }
    if( this.x - this.babySize/8 > settings.walls.right) {
      this.vx *= -1;
      this.lookR = false;
      this.x = settings.walls.right - this.babySize;
    }
    ctx.save();
    ctx.font = `${this.babySize}px Aerial`;
    ctx.scale(this.lookR ? -1 : 1,1);
    ctx.fillText(String.fromCodePoint(this.babyFace),this.x*(this.lookR ? -1 : 1),this.y)
    ctx.restore();
  }
}
window.requestFrame = (function() {
  return  window.requestAnimationFrame       || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame    ||
    function( callback ){
      window.setTimeout(callback, 1000 / 60);
    };
})();


function render() {
  ctx.fillStyle = "lightGreen";
  ctx.fillRect(0, 0, BR.x, BR.y);
  
  Baby.draw();
  for(const i in gifts){
    if(gifts[i]){
      gifts[i].draw();
      
      if(gifts[i]){
        gifts[i].babycheck();
      }
    }
  }
  ctx.font = `${settings.giftSize*1.4}px Aerial`;
  ctx.fillText(String.fromCodePoint('0x1F9D9'),canvasPos.x-75, canvasPos.y+25);
  requestFrame(render);
}

render();

function reRender() {
  BR = getBodyRect();
  canvas.width = BR.x;
  canvas.height = BR.y;
  settings.giftSize = BR.x/10 < 50 ? BR.x/10 : 50;
  settings.walls = {
    left: BR.x*.05,
    right: BR.x,
    bottom: BR.y
  }
  Baby.babySize = settings.giftSize*2;
  Baby.x = 0;
  Baby.y = (BR.y - 50);
  Baby.vx = BR.x/100;
}

window.addEventListener('resize',function() {
  reRender();
});

['mousemove', 'touchmove'].forEach( event => {
  canvas.addEventListener(event, (ev) => {
    const target = /touch/.test(ev.type) ? ev.targetTouches[0] : ev;
    canvasPos.x = target.clientX;
    canvasPos.y = target.clientY;
  });
});

['mousedown', 'touchstart'].forEach( event => {
  canvas.addEventListener(event, () => {
    gifter = setInterval( () => {new Gift(giftIdx++)},1000/100);
  });
});

['mouseup', 'touchend'].forEach( event => {
  canvas.addEventListener(event, () => {
    if(gifter) {
      clearInterval(gifter);
    }
  });
});

window.addEventListener('keyup', ev => {
  switch(ev.keyCode){
    case 82:
      babyFaceChanger(!Baby.babyType);
      return Baby.babyType = !Baby.babyType;
    default:
      return false;
  }
})