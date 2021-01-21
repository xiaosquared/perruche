let mic;
let soundRec;
let soundFile;

let title;
let id_input;
let id_label;
let id;
let submit_id_button;

let phrase_label;

let play_phrase_button;
let record_button;
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
  title = createElement("h1", "Record audio reproductions");

  id_label = createP("Subject #:");
  id_input = createInput('');

  submit_id_button = createButton("Submit");
  submit_id_button.mouseClicked((mouseEvent)=>{
    id = id_input.value();
    sendSubjectID(id_input.value());
  });
}

function clearFirstPage() {
  //title.remove();
  id_input.remove();
  submit_id_button.remove();
  console.log(id_label);
  id_label.elt.innerHTML = "Subject #: " + id;
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
  current_phrase_index = floor(random(phrases_to_record.length));
  phrase = phrases_to_record[current_phrase_index];
  phrase_audio = loadSound("data/" + phrase + ".mp3", function() {
    console.log("successfully loaded " + phrase);
    play_phrase_button.style('background-color', 'green');
  });

  clearFirstPage();
  createRecordingInterface();
}

function createRecordingInterface() {
  phrase_label = createP("Phrases remaining: " + phrases_to_record.length);

  mic = new p5.AudioIn();
  mic.start();
  soundRec = new p5.SoundRecorder();
  soundRec.setInput(mic)
  soundFile = new p5.SoundFile();

  createP();

  play_phrase_button = createDiv("Play phrase");
  play_phrase_button.size(100, 50);
  play_phrase_button.style('background-color', 'green');
  play_phrase_button.mouseClicked((mouseEvent)=>{
    phrase_audio.play();
  });

  createP();

  record_button = createDiv("Record voice");
  record_button.size(100,50);
  record_button.style('background-color', 'grey');

  record_button.mouseClicked((mouseEvent)=>{
    if (getAudioContext().state != 'running') {
      userStartAudio();
    }

    if (soundRec.recording == false) {
      console.log("Start recording");
      record_button.style('background-color', 'red');

      soundRec.record(soundFile);
    }

    else {
      console.log("Stop recording");
      record_button.style('background-color', 'grey');

      // change playback button to orange to show that it can be used
      play_recorded_button.style('background-color', 'orange');
      soundRec.stop();
    }
  });

  createP();

  play_recorded_button = createDiv("Play recorded");
  play_recorded_button.size(100, 50);
  play_recorded_button.style('background-color', 'grey');
  play_recorded_button.mouseClicked((mouseEvent)=>{
    if (soundRec.recording) {
      soundRec.stop();
      record_button.style('background-color', 'grey');
    }
    if (soundFile.isLoaded() && !soundFile.isPlaying()) {
      upload_button.style('background-color', 'pink');
      soundFile.play();
    }
  });

  createP();

  upload_button = createDiv("Upload File");
  upload_button.size(100, 50);
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
    phrases_to_record.splice(current_phrase_index, 1);

    if (phrases_to_record.length == 0) {
      clearRecordingInterface();
      createP("DONE!");
    }

    // pick a new phrase to record
    current_phrase_index = floor(random(phrases_to_record.length));
    // change label of how many phrases are left:
    phrase_label.elt.innerHTML = "Phrases remaining: " + phrases_to_record.length;

    // disable all buttons
    play_phrase_button.style('background-color', 'grey');
    record_button.style('background-color', 'grey');
    play_recorded_button.style('background-color', 'grey');
    upload_button.style('background-color', 'grey');

    // load new phrase
    phrase = phrases_to_record[current_phrase_index];
    phrase_audio = loadSound("data/" + phrase + ".mp3", function() {
      console.log("successfully loaded " + phrase);
      play_phrase_button.style('background-color', 'green');
    });
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
