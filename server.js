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
  // Check to see if files.txt exists in the folder
  let phrases = fs.readFileSync('public/data/files.txt').toString().split("\n");
  let phrases_to_record = [];
  phrases.forEach((item, index) => {
    let item2 = item.split('/');
    phrases_to_record.push(item2[item2.length-1].split('.')[0]);
  });

  const path = 'public/uploads/s'+request.body.id;
  if (!fs.existsSync(path)) {
    fs.mkdirSync(path, 0744);
  }

  phrases_to_record = shufflePhrases(phrases_to_record);

  response.json(phrases_to_record);
});

app.post('/subject_lecture', (request, response)=> {
  console.log("Got subject id: " + request.body.id);

  // get available phrases
  // Check to see if files.txt exists in the folder
  let phrases = fs.readFileSync('public/data/files_lecture.txt').toString().split("\n");
  let phrases_to_record = [];

  const path = 'public/uploads/s'+request.body.id;
  if (!fs.existsSync(path)) {
    fs.mkdirSync(path, 0744);
  }

  phrases_to_record = shufflePhrases(phrases);
  console.log(phrases_to_record)


  response.json(phrases_to_record);
});



function shufflePhrases(phrases) {
  // Randomize phrases
  // first an array half the length of phrases with incrementing numbers
  let order = Array.from(Array(phrases.length/2).keys());
  // shuffle it
  for (let i = order.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [order[i], order[j]] = [order[j], order[i]];
  }

  let experiment_phrases = [];
  // Populate experiment_phrases based on order array
  for (let i = 0; i < order.length; i ++) {
    let index = order[i] * 2;
    let p1 = phrases[index];
    let p2 = phrases[index+1];

    // 50% chance of having either first
    if (Math.floor(Math.random() * Math.floor(2)) >= 1) {
      experiment_phrases.push(p2);
      experiment_phrases.push(p1);
    } else {
      experiment_phrases.push(p1);
      experiment_phrases.push(p2);
    }
  }

  return experiment_phrases;
}

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
  //console.log(req.file); // see what got uploaded
  let subject = req.file.originalname.split("-")[2];

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
