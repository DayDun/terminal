function mod(n, m) {
  return ((n % m) + m) % m;
}

var api = {
  print: function(text, x, y, bgColor, fgColor) {
    computers[0].print(text, x, y, bgColor, fgColor);
  },
  clear: function(color) {
    computers[0].clear(color);
  },
  clearln: function(line, color) {
    computers[0].clearln(line, color);
  },
  setSize: function(width, height) {
    
  }
};

var computers = [];
var activeComputer = 0;

function Computer() {
  this.id = computers.push(this) - 1;
  this.width = 80;
  this.height = 30;
  this.cursorPos = [0, 0];
  this.bgColor = 0x0;
  this.fgColor = 0xf;
  this.monitor = new Uint8Array(this.width * this.height * 3);
  
  this.plugin = new jailed.Plugin("http://daydun.com/terminal/plugin.js", api);
  this.plugin.whenConnected(function() {
    window.addEventListener("keypress", function(event) {
      if (event.which != 13) {
        this.plugin.remote.event("char", {char: event.key});
      }
    }.bind(this));
    window.addEventListener("keydown", function(event) {
      this.plugin.remote.event("key", {key: event.which});
      if (event.which == 8) {
        event.preventDefault();
      }
    }.bind(this));
  }.bind(this));
}

Computer.prototype.resize = function(width, height) {
  this.width = width;
  this.height = height;
  if (activeComputer == this.id) {
    // TODO: handle canvas resize
  }
};
Computer.prototype.runFile = function(path) {
  var file = this.getFile(path);
  if (file) {
    this.plugin.remote.run(file);
  }
};
Computer.prototype.clear = function(color) {
  renderer.clear(color);
};
Computer.prototype.clearln = function(line, color) {
  renderer.clearln(line, color);
};
Computer.prototype.print = function(text, x, y, bgColor, fgColor) {
  var index = x + y * this.width;
  for (var j=0; j<text.length; j++) {
    this.monitor[(index + j) % (this.width * this.height)] = text[j];
    this.monitor[((index + j) % (this.width * this.height)) * (this.width * this.height)] = bgColor;
    this.monitor[((index + j) % (this.width * this.height)) * (this.width * this.height * 2)] = fgColor;
    renderer.drawChar(text[j], mod((index + j), this.width), mod(Math.floor((index + j) / this.width), this.height), bgColor, fgColor);
  }
}

// FILESYSTEM

var renderer;

var palette = [
  0x000000,
  0x0000aa,
  0x00aa00,
  0x00aaaa,
  0xaa0000,
  0xaa00aa,
  0xaa5500,
  0xaaaaaa,
  0x555555,
  0x5555ff,
  0x55ff55,
  0x55ffff,
  0xff5555,
  0xff55ff,
  0xffff55,
  0xffffff
];

var font = new Image();
    font.src = "font_ibm_vga8.png";
var fontCanvas = document.createElement("canvas");
var fontCtx = fontCanvas.getContext("2d");
font.onload = function() {
  fontCanvas.width = font.width;
  fontCanvas.height = font.height * palette.length;
  fontCtx.drawImage(font, 0, 0);
  var imageData = fontCtx.getImageData(0, 0, font.width, font.height);
  for (var i=0; i<palette.length; i++) {
    
    for (var j=0; j<imageData.data.length; j++) {
      if (imageData.data[j * 4 + 3] !== 0) {
        imageData.data[j * 4    ] = palette[i] >> 16 & 0xff;
        imageData.data[j * 4 + 1] = palette[i] >> 8  & 0xff;
        imageData.data[j * 4 + 2] = palette[i]       & 0xff;
      }
    }
    fontCtx.putImageData(imageData, 0, font.height * i);
  }
};
var fontSize = [8, 16];


/*var tintCanvas = document.createElement("canvas");
tintCanvas.width = fontSize[0];
tintCanvas.height = fontSize[1];
var tintCtx = tintCanvas.getContext("2d");
/ *function tintChar(char, color) {
  tintCtx.fillStyle = "#" + ("000000" + color.toString(16)).slice(-6);
  tintCtx.fillRect(0, 0, fontSize[0], fontSize[1]);
  tintCtx.globalCompositeOperation = "destination-atop";
  tintCtx.drawImage(font, (char % 32) * fontSize[0], Math.floor(char / 32) * fontSize[1], fontSize[0], fontSize[1], 0, 0, fontSize[0], fontSize[1]);
  return tintCanvas;
}* /
function tintChar(char, color) {
  var imageData = fontCtx.getImageData((char % 32) * fontSize[0], Math.floor(char / 32) * fontSize[1], fontSize[0], fontSize[1]);
  for (var i=0; i<imageData.data.length; i++) {
    if (imageData.data[i * 4 + 3] !== 0) {
      imageData.data[i * 4    ] = color >> 16 & 0xff;
      imageData.data[i * 4 + 1] = color >> 8  & 0xff;
      imageData.data[i * 4 + 2] = color       & 0xff;
    }
  }
  var canvas = document.createElement("canvas");
  canvas.width = fontSize[0];
  canvas.height = fontSize[1];
  var ctx = canvas.getContext("2d");
  ctx.putImageData(imageData, 0, 0);
  return canvas;
}*/

window.addEventListener("load", function() {
  new Computer();
  renderer = new Renderer(0);
});

function Renderer(computer) {
  this.computer = computer;
  this.canvas = document.getElementById("canvas");
  this.canvas.width = 80 * fontSize[0];
  this.canvas.height = 30 * fontSize[1];
  this.ctx = canvas.getContext("2d");
  this.ctx.imageSmoothingEnabled = false;
  this.clear(0);
}

Renderer.prototype.getColor = function(index) {
  return "#" + ("000000" + palette[index].toString(16)).slice(-6);
};
Renderer.prototype.clear = function(color) {
  this.ctx.fillStyle = this.getColor(color);
  this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
};
Renderer.prototype.clearln = function(line, color) {
  this.ctx.fillStyle = this.getColor(color);
  this.ctx.fillRect(0, line * fontSize[1], this.canvas.width, fontSize[1]);
};
Renderer.prototype.drawChar = function(char, x, y, bgColor, fgColor) {
  this.ctx.fillStyle = this.getColor(bgColor);
  this.ctx.fillRect(x * fontSize[0], y * fontSize[1], fontSize[0], fontSize[1]);
  this.ctx.drawImage(
    //tintChar(char, palette[fgColor]),
    fontCanvas,
    (char % 32) * fontSize[0],
    Math.floor(char / 32) * fontSize[1] + (font.height * fgColor),
    fontSize[0], fontSize[1],
    x * fontSize[0], y * fontSize[1],
    fontSize[0], fontSize[1]
  );
};