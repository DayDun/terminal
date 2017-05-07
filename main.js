/*
  Greethings, this is my cool text block. Feel free to touch it
*/

var charSet = [
  "\u0000", "\u263a", "\u263b", "\u2665", "\u2666", "\u2663", "\u2660", "\u2022", "\u25d8", "\u25cb", "\u25d9", "\u2642", "\u2640", "\u266a", "\u266b", "\u263c",
  "\u25ba", "\u25c4", "\u2195", "\u203c", "\u00b6", "\u00a7", "\u25ac", "\u21a8", "\u2191", "\u2193", "\u2192", "\u2190", "\u221f", "\u2194", "\u25b2", "\u25bc",
  " ", "!", "\"", "#", "$", "%", "&", "'", "(", ")", "*", "+", ",",  "-", ".", "/",
  "0", "1", "2",  "3", "4", "5", "6", "7", "8", "9", ":", ";", "<",  "=", ">", "?",
  "@", "A", "B",  "C", "D", "E", "F", "G", "H", "I", "J", "K", "L",  "M", "N", "O",
  "P", "Q", "R",  "S", "T", "U", "V", "W", "X", "Y", "Z", "[", "\\", "]", "^", "_",
  "`", "a", "b",  "c", "d", "e", "f", "g", "h", "i", "j", "k", "l",  "m", "n", "o",
  "p", "q", "r",  "s", "t", "u", "v", "w", "x", "y", "z", "{", "|",  "}", "~", "⌂",
  "Ç", "ü", "é",  "â", "ä", "à", "å", "ç", "ê", "ë", "è", "ï", "î",  "ì", "Ä", "Å",
  "É", "æ", "Æ",  "ô", "ö", "ò", "û", "ù", "ÿ", "Ö", "Ü", "¢", "£",  "¥", "₧", "ƒ",
  "á", "í", "ó",  "ú", "ñ", "Ñ", "ª", "º", "¿", "⌐", "¬", "½", "¼",  "¡", "«", "»",
  "░", "▒", "▓", "│", "┤", "╡", "╢", "╖", "╕", "╣", "║", "╗", "╝", "╜", "╛", "┐",
  "└", "┴", "┬", "├", "─", "┼", "╞", "╟", "╚", "╔", "╩", "╦", "╠", "═", "╬", "╧",
  "╨", "╤", "╥", "╙", "╘", "╒", "╓", "╫", "╪", "┘", "┌", "█", "▄", "▌", "▐", "▀",
  "α", "ß", "Γ", "π", "Σ", "σ", "µ", "τ", "Φ", "Θ", "Ω", "δ", "∞", "φ", "ε", "∩",
  "≡", "±", "≥", "≤", "⌠", "⌡", "÷", "≈", "°", "∙", "·", "√", "ⁿ", "²", "■", "\u00a0"
];

var api = {
  setCursorPos: function(x, y) {
    if (typeof x == "number" && x >= 0 && x < computers[0].width) {
      computers[0].cursorPos[0] = x;
    }
    if (typeof y == "number" && y >= 0 && y < computers[0].height) {
      computers[0].cursorPos[1] = y;
    }
  },
  print: function(text, x, y, bgColor, fgColor) {
    computers[0].print(text, x, y, bgColor, fgColor);
  },
  println: function(text, x, y, bgColor, fgColor) {
    computers[0].println(text, x, y, bgColor, fgColor);
  },
  debug: function() {
    console.log.apply(null, arguments);
  },
  clear: function(color) {
    computers[0].clear(color);
  }
};

var computers = [];
var activeComputer = 0;

function Computer() {
  this.id = computers.push(this) - 1;
  this.width = 50;
  this.height = 20;
  this.cursorPos = [0, 0];
  this.bgColor = 0x0;
  this.fgColor = 0xf;
  this.monitor = new Uint8Array(this.width * this.height * 3);
  this.plugin = new jailed.Plugin("http://daydun.com/terminal/plugin.js", api);
}

Computer.prototype.resize = function(width, height) {
  this.width = width;
  this.height = height;
  if (activeComputer == this.id) {
    // TODO: handle canvas resize
  }
};

Computer.prototype.clear = function(color) {
  if (typeof color != "number" || color < 0 || color >= 256) {
    color = this.bgColor;
  }
  for (var i=0; i<this.width * this.height; i++) {
    switch(Math.floor(i / (this.width / this.height))) {
      case 0:
        this.monitor[i] = 0;
        break;
      case 1:
        this.monitor[i] = color;
        break;
      case 2:
        this.monitor[i] = this.fgColor;
        break;
    }
  }
  renderer.clear(color);
};

Computer.prototype.print = function(text, x, y, bgColor, fgColor) {
  if (typeof x != "number" || x < 0 || x >= this.width) {
    x = this.cursorPos[0];
  }
  if (typeof y != "number" || y < 0 || y >= this.height) {
    y = this.cursorPos[1];
  }
  var index = x + y * this.width;
  if (typeof bgColor != "number" || bgColor < 0 || bgColor >= 256) {
    bgColor = this.bgColor;
  }
  if (typeof fgColor != "number" || fgColor < 0 || fgColor >= 256) {
    fgColor = this.fgColor;
  }
  if (text && typeof text == "number" && text >= 0 && text < 256) {
    text = [text];
  } else if (typeof text == "string" && text.length) {
    var array = [];
    for (var i=0; i<text.length; i++) {
      array.push(charSet.indexOf(text.charAt(i)) || 0);
    }
    text = array;
  } else {
    text = [0];
  }
  for (var j=0; j<text.length; j++) {
    this.monitor[(index + j) % (this.width * this.height)] = text[j];
    this.monitor[((index + j) % (this.width * this.height)) * (this.width * this.height)] = bgColor;
    this.monitor[((index + j) % (this.width * this.height)) * (this.width * this.height * 2)] = fgColor;
    renderer.drawChar(text[j], (index + j) % this.width, Math.floor((index + j) / this.width) % this.height, bgColor, fgColor);
  }
  this.cursorPos[0] = (x + text.length) % this.width;
  this.cursorPos[1] = Math.floor((index + text.length) / this.width) % this.height;
}

Computer.prototype.println = function(text, x, y, bgColor, fgColor) {
  if (typeof x != "number" || x < 0 || x >= this.width) {
    x = this.cursorPos[0];
  }
  this.print(text, x, y, bgColor, fgColor);
  this.cursorPos[0] = x;
  this.cursorPos[1] = (this.cursorPos[1] + 1) % this.height;
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
/*function tintChar(char, color) {
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
  this.canvas.width = 50 * fontSize[0];
  this.canvas.height = 20 * fontSize[1];
  this.ctx = canvas.getContext("2d");
  this.ctx.imageSmoothingEnabled = false;
  this.clear(0);
  
  this.random();
}

Renderer.prototype.random = function() {
  for (var i=0; i<30; i++) {
    for (var j=0; j<50; j++) {
      this.drawChar(Math.floor(Math.random() * 256), j, i, 0x0, 0xf);
    }
  }
};

Renderer.prototype.getColor = function(index) {
  return "#" + ("000000" + palette[index].toString(16)).slice(-6);
};

Renderer.prototype.clear = function(color) {
  this.ctx.fillStyle = this.getColor(color);
  this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
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