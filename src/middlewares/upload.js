// "use strict";

// const multer = require("multer");

// module.exports = multer({
//   // dest:'./uploads' //direk bi klasore kaydetemk icin bunu kullanabiliriz evet
//   //ama ozaman cok fazla ayar yapamiyoruz
//   //upload klasoru direk olustu.

//   storage: multer.diskStorage({
//     destination: "./uploads",
//     filename: function (req, file, returnCallBack) {
//       // console.log('file', file)
//       // returnCallBack -> success te calismasi gerekn fonsiyon
//       returnCallBack(null, Date.now() + "-" + file.originalname);
//     },
//   }),
//   limits: {
//     fileSize: 5 * 1024 * 1024, // 5 MB limit
//   },
// });

"use strict";
const multer = require("multer");

// Multer hafıza depolama ayarları (disk yerine hafızada tutar)
const storage = multer.diskStorage({
    filename: function (req, file, cb) {
        cb(null, file.originalname)
    }
});
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB limit
  },
});

module.exports = upload;



// "use strict";
// const multer = require("multer");

// // Multer hafıza depolama ayarları (disk yerine hafızada tutar)
// const storage = multer.memoryStorage();
// const upload = multer({
//   storage: storage,
//   limits: {
//     fileSize: 5 * 1024 * 1024, // 5 MB limit
//   },
// });

// module.exports = upload;
