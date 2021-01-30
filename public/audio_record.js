let mic;
let soundRec;
let soundFile;

let id;
let submit_id_button;

let phrase_label;

let recording_interface;
let play_phrase_button;
let record_button; ////EF3E36;
let play_recorded_button;
let upload_button;

let phrase;
let phrase_audio;

let phrases_to_record;
let currrent_phrase_index;

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
  id_label.elt.innerHTML = "Numéro du sujet: " + id;
}

// Send id to server. Get list of phrases back. Pick a phrase as the first
async function sendSubjectID(to_send) {
  const data = {id: to_send};
  const options = {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(data)
  }
  const response = await fetch('/subject', options);
  phrases_to_record = await response.json();
  phrase = phrases_to_record[0];
  phrase_audio = loadSound("data/" + phrase + ".wav", function() {
    console.log("successfully loaded " + phrase);
    play_phrase_button.style('background-color', '#FCBA04');
  });

  clearFirstPage();
  createRecordingInterface();
}

function createRecordingInterface() {
  phrase_label = select('#phrase_info');
  phrase_label.style('visibility', 'visible');
  phrase_label.elt.innerHTML = "Nombre de phrases qui restent: " + phrases_to_record.length;


  mic = new p5.AudioIn();
  mic.start();
  soundRec = new p5.SoundRecorder();
  soundRec.setInput(mic)
  soundFile = new p5.SoundFile();

  play_phrase_button = select('#play_ref');
  play_phrase_button.style('visibility', 'visible');
  play_phrase_button.style('background-color', 'FCBA04');
  play_phrase_button.style('clear', 'left');
  play_phrase_button.mouseClicked((mouseEvent)=>{
    phrase_audio.play();
  });


  record_button = select('#record');
  record_button.style('visibility', 'visible');
  record_button.style('background-color', 'grey');

  record_button.mouseClicked((mouseEvent)=>{
    if (getAudioContext().state != 'running') {
      userStartAudio();
    }

    if (soundRec.recording == false) {
      console.log("Start recording");
      record_button.style('background-color', 'EF3E36');

      soundRec.record(soundFile);
    }

    else {
      console.log("Stop recording");
      record_button.style('background-color', 'grey');

      // change playback button to orange to show that it can be used
      play_recorded_button.style('background-color', '#745B9A');
      soundRec.stop();
    }
  });

  play_recorded_button = select('#play_recorded');
  play_recorded_button.style('visibility', 'visible');
  play_recorded_button.style('background-color', 'grey');
  play_recorded_button.mouseClicked((mouseEvent)=>{
    if (soundRec.recording) {
      soundRec.stop();
      record_button.style('background-color', 'grey');
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

    let filename = phrase + "-s" + id;
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
    // clear the phrase audio
    phrase_audio = null;
    // remove the phrase we just recorded from the list to record
    phrases_to_record.splice(0, 1);

    if (phrases_to_record.length == 0) {
      clearRecordingInterface();
      createP("DONE!");
    }
    else {
      // pick a new phrase to record
      //current_phrase_index = floor(random(phrases_to_record.length));
      // change label of how many phrases are left:
      phrase_label.elt.innerHTML =  "Nombre de phrases qui restent: " + phrases_to_record.length;

      // disable all buttons
      play_phrase_button.style('background-color', 'grey');
      record_button.style('background-color', 'grey');
      play_recorded_button.style('background-color', 'grey');
      upload_button.style('background-color', 'grey');

      // load new phrase
      phrase = phrases_to_record[0];
      phrase_audio = loadSound("data/" + phrase + ".wav", function() {
        console.log("successfully loaded " + phrase);
        play_phrase_button.style('background-color', '#FCBA04');
      });
    }
  }

  function clearRecordingInterface() {
    play_phrase_button.remove();
    record_button.remove();
    play_recorded_button.remove();
    upload_button.remove();
    id_label.remove();
    phrase_label.remove();
  }

}
