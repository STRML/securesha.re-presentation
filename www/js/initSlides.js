/* global qrcode, Reveal, io, zoom, hljs*/
var remoteServer = "http://securesha.re:8008";
// generate our random hash
var uid = "qazwsxedcrfvtgbyhnujmikolp1234567890".split('').sort(function(){return 0.5-Math.random();}).join('');

// we need this to generate the URL
var createQrCode = function(text) {
  var qr = qrcode(5, 'M');
  qr.addData(text);
  qr.make();

  return qr.createImgTag(10);
};

// make qr code
document.getElementById('qr').innerHTML = createQrCode(remoteServer + '/remote.html#'+uid);

// connected?
var connected = false;

// create presentation
Reveal.initialize({
  controls: true,
  keyboard: true,
  progress: true,
  history: true,
  center: true,
  width: 1280,
  height: 800,
  // Optional libraries used to extend on reveal.js
  dependencies: [
    { src: 'js/classList.js', condition: function() { return !document.body.classList; } },
    { src: 'plugin/markdown/marked.js', condition: function() { return !!document.querySelector( '[data-markdown]' ); } },
    { src: 'plugin/markdown/markdown.js', condition: function() { return !!document.querySelector( '[data-markdown]' ); } },
    { src: 'plugin/highlight/highlight.js', async: true, callback: function() { hljs.initHighlightingOnLoad(); } },
    { src: 'plugin/zoom-js/zoom.js', async: true, condition: function() { return !!document.body.classList; } },
    { src: 'plugin/notes/notes.js', async: true, condition: function() { return !!document.body.classList; } }
  ]
});

// connect to server
var socket = io.connect(remoteServer);

// identify with server
socket.on('identify', function() {
  socket.emit('identity', {
    type: 'viewer',
    uid: uid
  });
});

// connected and ready
socket.on('ready', function() {
  if (!connected) {
    Reveal.right();
    connected = true;
  }
});

// lose connection
socket.on('disconnected', function() {
  // lost the remote
  window.alert('lost connection.');
});

// register moves
var proxyMethods = ['right', 'left', 'up', 'down', 'next', 'prev'];
socket.on('msg', function(data){
  var msg = data.msg;
  if (proxyMethods.indexOf(msg) !== -1){
    Reveal[msg]();
  } else if (msg === 'zoom') {
    var el = document.querySelector(".present code");
    zoom.to({element: el, pan: false});
  } else if (msg.indexOf('zoom') === 0 && msg.length > 4){
    var direction = msg.slice(4);
    panScreen(direction);
  } else if (msg === "overview") {
    Reveal.toggleOverview();
  }
});

function panScreen(direction) {
  var scrollOffset = getScrollOffset();
  var scrollAmount = 14; // magicnum
  if (direction === "up") {
    window.scroll( scrollOffset.x, scrollOffset.y - scrollAmount );
  }
  // Down
  else if( direction === "down") {
    window.scroll( scrollOffset.x, scrollOffset.y + scrollAmount );
  }

  // Left
  if(direction === "left") {
    window.scroll( scrollOffset.x - scrollAmount, scrollOffset.y );
  }
  // Right
  else if(direction === "right") {
    window.scroll( scrollOffset.x + scrollAmount, scrollOffset.y );
  }
}

function getScrollOffset() {
  return {
    x: window.scrollX !== undefined ? window.scrollX : window.pageXOffset,
    y: window.scrollY !== undefined ? window.scrollY : window.pageXYffset
  };
}
