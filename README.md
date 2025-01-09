# perruche

Simple interface for audio recording in experiments.


Clone repository and install NPM (node.js package manager)

```
git clone git@github.com:xiaosquared/perruche.git
cd perruche
npm install
```

Run the app
```
node server.js
```

In a browser, go to:

localhost:3000 - for vocal reproduction of reference files. Reference phrases are presented one at a time in a random order. Users can listen to the curent reference as many times as desired and record themselves pronouncing the reference. Users may listen to the previously recorded file and choose whether to rerecord or save the file. After saving a reproduction, a new reference phrase is shown if there are still reference phrases remaining.

localhost:3000/lecture.html - phrases show up on the screen for subjects to read

