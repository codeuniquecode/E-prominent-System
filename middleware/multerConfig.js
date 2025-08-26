const multer = require('multer');
const storage = multer.diskStorage({
    destination:function(req, file, cb){
        cb(null,'./storage'); // if any file is uploaded, upload it to storage folder
    },
    filename : function(req,file,cb){
        cb(null, Date.now()+"-"+file.originalname); // file ko name same hal vaneko
        //so data lai unqiue banauna date vayei ni halne
    }

})
module.exports = {multer, storage}