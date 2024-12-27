// filepath: /c:/Users/User/Documents/AdrianDev/360visualizer/public/javascripts/360visualizer.js
document.addEventListener('DOMContentLoaded', function() {
  var form = document.getElementById('form');
  if (form) {
    form.addEventListener('submit', function(event) {
      event.preventDefault();
      var formData = new FormData(this);
      var xhr = new XMLHttpRequest();
      xhr.open('POST', '/upload', true);
      xhr.onload = function() {
        if (xhr.status === 200) {
          document.getElementById('message').textContent = 'Files uploaded successfully';
          loadVisualizer();
        } else {
          document.getElementById('message').textContent = 'Failed to upload files';
        }
      };
      xhr.send(formData);
    });
  }
});

function loadVisualizer() {
  var xhr = new XMLHttpRequest();
  xhr.open('GET', '/files', true);
  xhr.onload = function() {
    if (xhr.status === 200) {
      var files = JSON.parse(xhr.responseText);
      var images = files.filter(file => /\.(jpg|jpeg|png|gif)$/i.test(file));
      console.log(images); // This will log the array of image filenames
      createVisualizer(images);
    } else {
      console.error('Failed to load files');
    }
  };
  xhr.send();
}

function createVisualizer(images) {
  const visualizer = document.getElementById('visualizer');
  const preloaded = [];

  // Preload all images
  images.forEach(file => {
    const img = new Image();
    img.src = '/uploads/' + file;
    preloaded.push(img);
  });

  let currentIndex = 0;
  let isDragging = false;
  let startX = 0;

  // Show the first image after preload
  if (preloaded.length > 0) {
    visualizer.src = preloaded[0].src;
  }

  visualizer.addEventListener('mousedown', event => {
    isDragging = true;
    startX = event.clientX;
  });

  document.addEventListener('mouseup', () => {
    isDragging = false;
  });

  document.addEventListener('mousemove', event => {
    if (isDragging) {
      const deltaX = event.clientX - startX;
      if (Math.abs(deltaX) > 10) {
        startX = event.clientX;
        currentIndex = (currentIndex + (deltaX > 0 ? 1 : -1) + preloaded.length) % preloaded.length;
        visualizer.src = preloaded[currentIndex].src;
      }
    }
  });

  visualizer.addEventListener('dragstart', event => {
    event.preventDefault();
  });
}