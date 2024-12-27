// filepath: /c:/Users/User/Documents/AdrianDev/360visualizer/app.js
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var multer = require('multer');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var fs = require('fs');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

// Configure multer storage
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
});

var upload = multer({ storage: storage });

// Function to clear uploads folder
function clearUploadsFolder(callback) {
  const uploadDir = path.join(__dirname, 'uploads');
  fs.readdir(uploadDir, (err, files) => {
    if (err) {
      console.error('Unable to scan files:', err);
      return callback(err);
    }
    let deletePromises = files.map(file => {
      return new Promise((resolve, reject) => {
        fs.unlink(path.join(uploadDir, file), err => {
          if (err) {
            console.error('Error deleting file:', err);
            reject(err);
          } else {
            resolve();
          }
        });
      });
    });
    Promise.all(deletePromises)
      .then(() => callback(null))
      .catch(callback);
  });
}

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

app.post('/upload', (req, res, next) => {
  clearUploadsFolder(err => {
    if (err) {
      return res.status(500).send('Error al limpiar el folder de uploads');
    }
    next();
  });
}, upload.array('files', 12), (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).send('No se subieron los archivos.');
  }
  res.status(200).send('Archivos subidos exitosamente');
});

// Add this route before the 404 error handler
app.get('/files', (req, res) => {
  const uploadDir = path.join(__dirname, 'uploads');
  fs.readdir(uploadDir, (err, files) => {
    if (err) {
      return res.status(500).send('No se pueden escanear los archivos');
    }
    res.json(files);
  });
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;