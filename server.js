const express = require('express'); //make express available
const app = express(); //invoke express
const multer  = require('multer') //use multer to upload blob data
const upload = multer(); // set multer to be the upload variable (just like express, see above ( include it, then use it/set it up))
const fs = require('fs'); //use the file system so we can save files
const glob = require('glob'); // find files with wildcard matching


app.use(express.json(({limit: '1mb'})));
app.post('/subject', (request, response)=> {
  console.log("Got subject id: " + request.body.id);

  // get available phrases
  let phrases = glob.sync('public/data/*.mp3', {});
  let phrases_to_record = [];
  phrases.forEach((item, index) => {
    let item2 = item.split('/');
    phrases_to_record.push(item2[item2.length-1].split('.')[0]);
  });

  const path = 'public/uploads/s'+request.body.id;
  if (fs.existsSync(path)) {
    // Subject's folder already exists
    // Look at which phrases have already been recorded and remove them from phrase_names
    let my_recordings = glob.sync(path+'/*.wav', {});
    phrases_to_record.forEach((item, index) => {
      let isRecorded = alreadyRecorded(item, my_recordings);
      if (isRecorded) {
        phrases_to_record.splice(index, 1);
      }
    });
  } else {
    // New subject. Create folder to store files
    fs.mkdirSync(path, 0744);
  }
  response.json(phrases_to_record);
});

// Helper function to see which phrases have already been recorded
function alreadyRecorded(phrase, my_recordings) {
  for (let i = 0; i < my_recordings.length; i++) {
    if (my_recordings[i].includes(phrase)) {
      return true;
    }
  }
  return false;
}

app.post('/upload', upload.single('soundBlob'), function (req, res, next) {
  // console.log(req.file); // see what got uploaded
  let subject = req.file.originalname.split("-")[1]

  // where to save the file to. make sure the incoming name has a .wav extension
  let uploadLocation = __dirname + '/public/uploads/' + subject + "/" + req.file.originalname + ".wav";

  fs.writeFileSync(uploadLocation, Buffer.from(new Uint8Array(req.file.buffer))); // write the blob to the server as a file
  res.sendStatus(200); //send back that everything went ok
});

//serve out any static files in our public HTML folder
app.use(express.static('public'))

//makes the app listen for requests on port 3000
app.listen(3000, function(){
  console.log("app listening on port 3000!")
});
