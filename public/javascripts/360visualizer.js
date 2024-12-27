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
  var visualizer = document.getElementById('visualizer');
  if (images.length > 0) {
    visualizer.src = '/uploads/' + images[0];
  }

  var currentIndex = 0;
  var isDragging = false;
  var startX = 0;

  visualizer.addEventListener('mousedown', function(event) {
    isDragging = true;
    startX = event.clientX;
  });

  document.addEventListener('mouseup', function() {
    isDragging = false;
  });

  document.addEventListener('mousemove', function(event) {
    if (isDragging) {
      var deltaX = event.clientX - startX;
      if (Math.abs(deltaX) > 10) { // Change image every 10 pixels moved
        startX = event.clientX;
        currentIndex = (currentIndex + (deltaX > 0 ? 1 : -1) + images.length) % images.length;
        visualizer.src = '/uploads/' + images[currentIndex];
      }
    }
  });

  // Prevent default drag behavior
  visualizer.addEventListener('dragstart', function(event) {
    event.preventDefault();
  });
}