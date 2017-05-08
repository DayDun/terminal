Math.mod = function(n, m) {
  return ((n % m) + m) % m;
};


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


var Keys = {
  backspace: 8,
  enter: 13,
  end: 35,
  home: 36,
  left: 37,
  up: 38,
  right: 39,
  down: 40,
  delete: 46
};

var eventListeners = {
  "keyPress": [],
  "keyDown": []
};
function addListener(event, action) {
  if (event in eventListeners) {
    eventListeners[event].push(action);
  } else {
    eventListeners[event] = [action];
  }
}
function removeListener(event, action) {
  if (event in eventListeners) {
    eventListeners[event].splice(eventListeners[event].indexOf(action), 1);
  }
}
function fireEvent(event, data) {
  if (event in eventListeners) {
    for (var i=0; i<eventListeners[event].length; i++) {
      eventListeners[event][i](data);
    }
  }
}


var computer = {};
computer.width = 80;
computer.height = 30;
computer.cursorPos = [0, 0];
computer.bgColor = 0;
computer.fgColor = 15;
computer.monitor = new Uint8Array(computer.width * computer.height * 3);

computer.files = [
`
// TODO: Support Insert text mode and text selection
function read(history, callback) {
  var output = "";
  var pos = 0;
  var caret = false;

  var x = term.getCursorPos()[0];
  var y = term.getCursorPos()[1];

  function draw(index, drawCaret) {
    if (drawCaret) {
      term.print(output.charAt(index) || 0, x + index, y, 15, 0);
    } else {
      term.print(output.charAt(index) || 0, x + index, y);
    }
  }

  function redraw() {
    term.print(output, x, y);
    if (caret) {
      term.print(output.charAt(pos) || 0, x + pos, y, 15, 0);
    }
  }

  var charListener = function(data) {
    output = output.slice(0, pos) + data.char + output.slice(pos);
    pos++;
    enableCaret();
    redraw();
  };
  var keyListener = function(data) {
    switch(data.key) {
      case Keys.enter:
        removeListener("char", charListener);
        removeListener("key", keyListener);
        clearTimeout(caretTimeout);
        draw(pos);
        callback(output);
        break;
      case Keys.backspace:
        if (pos > 0) {
          output = output.slice(0, pos - 1) + output.slice(pos);
          pos--;
          draw(output.length);
          draw(output.length + 1);
          enableCaret();
          redraw();
        }
        break;
      case Keys.delete:
        output = output.slice(0, pos) + output.slice(pos + 1);
        enableCaret();
        draw(output.length);
        redraw();
        break;
      case Keys.left:
        if (pos > 0) {
          pos--;
          enableCaret();
          draw(pos + 1);
        }
        break;
      case Keys.right:
        if (pos < output.length) {
          pos++;
          enableCaret();
          draw(pos - 1);
        }
        break;
      case Keys.home:
        draw(pos);
        pos = 0;
        enableCaret();
        break;
      case Keys.end:
        draw(pos);
        pos = output.length;
        enableCaret();
        break;
    }
  };
  addListener("char", charListener);
  addListener("key", keyListener);
  var toggleCaret = function() {
    caret = !caret;
    draw(pos, caret);
    caretTimeout = setTimeout(toggleCaret, 500);
  };
  var caretTimeout = setTimeout(toggleCaret, 500);
  function enableCaret() {
    clearTimeout(caretTimeout);
    caret = true;
    draw(pos, caret);
    caretTimeout = setTimeout(toggleCaret, 500);
  }
}

var path = "/";

term.println("DayDun Terminal 0.1");
term.print(path + ">");

var caretStart = term.getCursorPos();

function parseInput(output) {
  term.setCursorPos(0, caretStart[1] + Math.floor((caretStart[0] + output.length) / term.getSize()[0]) + 1);
  /*output = output.split(" ");
  if (output[0] == "hello") {
    term.println("hello world!");
  } else if (output[0] == "help") {
    term.println("hello");
    term.println("help");
    term.println("ls");
  } else if (output[0] == "ls") {
    term.println("init shell");
  }*/
  try {
    eval(output);
  } catch(e) {
    term.println("error", null, null, null, 0xc);
  }
  term.print(path + ">");
  caretStart = term.getCursorPos();
  read(48, parseInput);
}

read(48, parseInput);
`
];
computer.fileSystem = {
  init: {id: 0},
  shell: {children: {
    main: {id: 1},
    programs: {children: {
      cd: {id: 2},
      clear: {id: 3},
      copy: {id: 4},
      delete: {id: 5},
      edit: {id: 6},
      help: {id: 7},
      javascript: {id: 8},
      list: {id: 8},
      mkdir: {id: 9},
      move: {id: 10},
      rename: {id: 11}
    }}
  }}
};
computer.getPath = function(path) {
  var nodes = path.split("/").filter(String);
  var node = {children: this.fileSystem};
  for (var i=0; i<nodes.length; i++) {
    if (nodes[i] in node.children) {
      node = node.children[nodes[i]];
      if (!("children" in node)) {
        if (i == nodes.length - 1) {
          break;
        } else {
          return false;
        }
      }
    } else {
      return false;
    }
  }
  return node;
};

var os = {};
os.getFile = function(path) {
  var file = computer.getPath(path);
  if (file && "id" in file) {
    return computer.files[file.id];
  } else {
    return false;
  }
};
os.runFile = function(path) {
  var file = os.getFile(path);
  if (file) {
    run(file);
  }
};

var term = {};
term.clear = function(color) {
  if (typeof color != "number" || color < 0 || color >= 256) {
    color = computer.bgColor;
  }
  application.remote.clear(color);
  
  for (var i=0; i<computer.width * computer.height; i++) {
    computer.monitor[i] = 0;
    computer.monitor[i + (computer.width * computer.height)] = color;
    computer.monitor[i + (computer.width * computer.height * 1)] = computer.fgColor;
  }
};
term.clearln = function(line, color) {
  if (typeof line != "number") {
    line = computer.cursorPos[1];
  }
  if (typeof color != "number" || color < 0 || color >= 256) {
    color = computer.bgColor;
  }
  application.remote.clearln(Math.mod(line, computer.height), color);
  
  for (var i=Math.mod(line, computer.height) * computer.width; i<Math.mod(line + 1, computer.height) * computer.width; i++) {
    computer.monitor[i] = 0;
    computer.monitor[i + (computer.width * computer.height)] = color;
    computer.monitor[i + (computer.width * computer.height * 2)] = computer.fgColor;
  }
};
term.getCursorPos = function() {
  return computer.cursorPos;
};
term.setCursorPos = function(x, y) {
  if (typeof x == "number") {
    computer.cursorPos[0] = Math.mod(x, computer.width);
  }
  if (typeof y == "number") {
    computer.cursorPos[1] = Math.mod(y, computer.height);
  }
  return computer.cursorPos;
};
term.getSize = function() {
  return [computer.width, computer.height];
};
term.setSize = function(width, height) {
  if (typeof width == "number" && width >= 1) {
    computer.width = width;
  }
  if (typeof height == "number" && height >= 1) {
    computer.height = height;
  }
  application.remote.setSize(computer.width, computer.height);
  return [computer.width, computer.height];
};
term.print = function(text, x, y, bgColor, fgColor) {
  if (typeof x != "number") {
    x = computer.cursorPos[0];
  }
  if (typeof y != "number") {
    y = computer.cursorPos[1];
  }
  
  if (typeof bgColor != "number" || bgColor < 0 || bgColor >= 256) {
    bgColor = computer.bgColor;
  }
  if (typeof fgColor != "number" || fgColor < 0 || fgColor >= 256) {
    fgColor = computer.fgColor;
  }
  
  if (typeof text == "number") {
    text = [[text]];
  } else if (typeof text == "string" && text.length) {
    var array = [];
    var textArray = [];
    for (var i=0; i<text.length; i++) {
      if (text.charAt(i) == "\n") {
        array.push(textArray);
        textArray = [];
      } else {
        textArray.push(charSet.indexOf(text.charAt(i)) || 0);
      }
    }
    array.push(textArray);
    text = array;
  } else {
    text = [[0]];
  }
  
  computer.cursorPos = [x, y];
  for (var j=0; j<text.length; j++) {
    application.remote.print(text[j], computer.cursorPos[0], computer.cursorPos[1], bgColor, fgColor);
    
    computer.cursorPos[1] += Math.floor((x + text[j].length) / computer.width);
    if (j == text.length - 1) {
      computer.cursorPos[0] = Math.mod(x + text[j].length, computer.width);
    } else {
      computer.cursorPos[0] = x;
      computer.cursorPos[1]++;
    }
  }
  
};
term.println = function(text, x, y, bgColor, fgColor) {
  term.print(text + "\n", x, y, bgColor, fgColor);
};
term.scroll = function(amount, wrap) {
  for (var i=0; i<computer.height; i++) {
    for (var j=0; j<computer.width; j++) {
      if (wrap) {
        computer.monitor[Math.mod(i - amount, computer.height) * computer.width + j] = computer.monitor[i * computer.width + j];
      } else {
        computer.monitor[(i - amount) * computer.width + j] = computer.monitor[i * computer.width + j];
      }
    }
  }
};


var run = function(code) {
  var indexedDB = void 0;
  var location = void 0;
  var navigator = void 0;
  var onerror = void 0;
  var onmessage = void 0;
  var performance = void 0;
  var webkitIndexedDB = void 0;
  var postMessage = void 0;
  var close = void 0;
  var openDatabase = void 0;
  var openDatabaseSync = void 0;
  var webkitRequestFileSystem = void 0;
  var webkitRequestFileSystemSync = void 0;
  var webkitResolveLocalFileSystemSyncURL = void 0;
  var webkitResolveLocalFileSystemURL = void 0;
  var addEventListener = void 0;
  var dispatchEvent = void 0;
  var removeEventListener = void 0;
  var dump = void 0;
  var onoffline = void 0;
  var ononline = void 0;
  var importScripts = void 0;
  var console = void 0;
  var isSecureContext = void 0;
  var onrejectionhandled = void 0;
  var onunhandledrejection = void 0;
  var self = void 0;

  var eventListeners = void 0;
  var computer = void 0;
  var charSet = void 0;
  var run = void 0;

  // crypto

  var application = void 0;

  try {
    eval(code);
  } catch(e) {
    debug(e);
    term.println(e.message, null, null, 0, 0xC);
  }
}.bind({});

application.setInterface({
  run: run,
  event: function(event, data) {
    fireEvent(event, data);
  }
});

function debug() {
  self.console.log.apply(null, arguments);
}


os.runFile("/init");