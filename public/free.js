let mic;
let soundRec;
let soundFile;

let id;
let submit_id_button;

let phrase_label;

let recording_interface;
let record_button; ////EF3E36;
let play_recorded_button;
let upload_button;

let phrase;
let phrase_id;
let phrase_index = 0;

let phrases_to_record;
let currrent_phrase_index;
let hint_text;

let hint_label;
let my_img;

function preload() {
  soundFormats("mp3");
}

function setup() {
  createFirstPage();
}

function createFirstPage() {

  submit_id_button = select('#upload_subject');
  submit_id_button.mouseClicked((mouseEvent)=>{
    id = select('#subject_input').value();
    sendSubjectID(id);
  });
}

function clearFirstPage() {
  select('#subject_field').remove();
  id_label = select('#subject_info');
  id_label.style('visibility', 'visible');
  id_label.elt.innerHTML = "Subject ID: " + id + ", ";
}

// Send id to server. Get list of phrases back. Pick a phrase as the first
async function sendSubjectID(to_send) {
  const data = {id: to_send};
  const options = {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(data)
  }
  const response = await fetch('/subject_lecture', options);
  phrases_to_record = await response.json();

  let phrase_info = phrases_to_record[phrase_index].split(',');
  phrase = phrase_info[1];
  phrase_id = phrase_info[0].split('-')[0];
  hint_text = phrase_info[2];
  img_filename = phrase_info[3];

  select('#current_phrase').elt.innerHTML = phrase;
  select('#current_phrase').style("visibility", "visible");
  select('#hint').elt.innerHTML = "Hint: " + hint_text;
  select('#my_img').elt.src = 'data/img/' + img_filename;
  select('#my_img').style("visibility", "visible");
  console.log("Phrase : " + phrase);

  clearFirstPage();
  createRecordingInterface();
}

function createRecordingInterface() {
  mic = new p5.AudioIn();
  mic.start();
  soundRec = new p5.SoundRecorder();
  soundRec.setInput(mic)
  soundFile = new p5.SoundFile();

  phrase_label = select('#phrase_info');
  phrase_label.style('visibility', 'visible');
  phrase_label.elt.innerHTML = "Phrases remaining: " + phrases_to_record.length;

  hint_label = select('#hint');
  my_img = select('#my_img');

  record_button = select('#record');
  record_button.style('visibility', 'visible');
  record_button.style('background-color', 'F6938E');

  record_button.mouseClicked((mouseEvent)=>{
    if (getAudioContext().state != 'running') {
      userStartAudio();
    }

    if (soundRec.recording == false) {
      console.log("Start recording");
      record_button.style('background-color', 'EF3E36');
      record_button.elt.innerHTML = "Recording in progress...";
      soundRec.record(soundFile);

      play_recorded_button.style('background-color', '#745B9A');
    }

    else {
      console.log("Stop recording");

      soundRec.stop();
      record_button.style('background-color', 'F6938E');
      record_button.elt.innerHTML = "Record my voice";
    }
  });

  play_recorded_button = select('#play_recorded');
  play_recorded_button.style('visibility', 'visible');
  play_recorded_button.style('background-color', 'grey');
  play_recorded_button.mouseClicked((mouseEvent)=>{
    if (soundRec.recording) {
      soundRec.stop();
      record_button.style('background-color', 'F6938E');
      record_button.elt.innerHTML = "Record my voice";
    }
    if (soundFile.isLoaded() && !soundFile.isPlaying()) {
      upload_button.style('background-color', '#1B998B');
      soundFile.play();
    }
  });

  upload_button = select('#save_recorded');
  upload_button.style('visibility', 'visible');
  upload_button.style('background-color', 'grey');
  upload_button.mouseClicked((mouseEvent)=>{
    console.log("Upload file");

    let soundBlob = soundFile.getBlob(); //get the recorded soundFile's blob & store it in a variable
    let formdata = new FormData(); // create data to upload to the server

    let filename = phrase_index + "-" + phrase_id + "-s" + id + "-free";
    formdata.append('soundBlob', soundBlob, filename); // append the sound blob and the name of the file. third argument will show up on the server as req.file.originalname

    // Now send blob to server
    let serverUrl = '/upload';
    let httpRequestOptions = {
      method: 'POST',
      body: formdata,
      headers: new Headers({
        'enctype': 'multipart/form-data' // the enctype is important to work with multer on the server
      })
    };

    // use p5 to make the POST request at our URL and with our options
    httpDo(
      serverUrl,
      httpRequestOptions,
      (successStatusCode)=>{ //if we were successful...
        console.log("uploaded recording successfully: " + successStatusCode);

        initNewPhrase();
      },
      (error)=>{console.error(error);}
    )

  });

  function initNewPhrase() {
    // increment phrase index
    phrase_index++;

    if (phrase_index == phrases_to_record.length) {
      clearRecordingInterface();
      let fin = createP("END!");
      fin.style("font-size", 120);
      fin.style('margin-top', '-40');
      let thanks = createP("of this part");
      thanks.style("font-size", 30);

      select('#my_img').remove();
      select('#hint').remove();
    }
    else {
      // pick a new phrase to record
      //current_phrase_index = floor(random(phrases_to_record.length));
      // change label of how many phrases are left:
      let phrases_left = phrases_to_record.length-phrase_index;
      phrase_label.elt.innerHTML =  "Phrases remaining: " + phrases_left;

      // disable all buttons
      record_button.style('background-color', 'F6938E');
      play_recorded_button.style('background-color', 'grey');
      upload_button.style('background-color', 'grey');

      // load new phrase
      let phrase_info = phrases_to_record[phrase_index].split(',');
      phrase = phrase_info[1];
      phrase_id = phrase_info[0].split('-')[0];
      hint_text = phrase_info[2];
      img_filename = phrase_info[3];

      select('#current_phrase').elt.innerHTML = phrase;
      hint_label.elt.innerHTML = "Hint: " + hint_text;
      my_img.elt.src = 'data/img/' + img_filename;

      console.log("New phraseeee: " + phrase);
    }
  }

  function clearRecordingInterface() {
    record_button.remove();
    play_recorded_button.remove();
    upload_button.remove();
    id_label.remove();
    phrase_label.remove();
    select('#current_phrase').remove();
  }

}
