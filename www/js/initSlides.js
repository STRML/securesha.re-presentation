var remoteServer = "http://securesha.re:8008"
// generate our random hash
var uid = "qazwsxedcrfvtgbyhnujmikolp1234567890".split('').sort(function(){return 0.5-Math.random()}).join('');

// we need this to generate the URL
var create_qrcode = function(text) {
  var qr = qrcode(5, 'M');
  qr.addData(text);
  qr.make();

  return qr.createImgTag(10);
};

// make qr code
document.getElementById('qr').innerHTML = create_qrcode(remoteServer + '/remote.html#'+uid);

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
socket.on('identify', function(data) {
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
  alert('lost connection.');
});

// register moves
socket.on('right', function() { Reveal.right(); });
socket.on('left', function() { Reveal.left(); });
socket.on('up', function() { Reveal.up(); });
socket.on('down', function() { Reveal.down(); });
socket.on('next', function() { Reveal.next(); });
socket.on('prev', function() { Reveal.prev(); });
socket.on('zoom', function() { 
  var el = document.querySelector(".present .zoomable");
  zoom.to({element: el, pan: false}); 
});
socket.on('overview', function() { Reveal.toggleOverview(); });