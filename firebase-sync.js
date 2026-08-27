const firebaseConfig = {
  apiKey: "AIzaSyAo5rP9tfhsX9cpKTu8VBZaXQ7hqQk1za0",
  authDomain: "starbase-flight-feud.firebaseapp.com",
  databaseURL: "https://starbase-flight-feud-default-rtdb.firebaseio.com",
  projectId: "starbase-flight-feud",
  storageBucket: "starbase-flight-feud.firebasestorage.app",
  messagingSenderId: "636489369400",
  appId: "1:636489369400:web:6afa08626e5260dc7ca3cd",
  measurementId: "G-B7EBJH2YM0"
};

firebase.initializeApp(firebaseConfig);

const flightFeudDatabase = firebase.database();

window.flightFeudFirebase = {
  database: flightFeudDatabase
};

/* =========================================
   FIREBASE → LOCAL GAME MIRROR
========================================= */

flightFeudDatabase
  .ref("game/state")
  .on("value", (snapshot) => {
    const state = snapshot.val();

    if (!state) {
      return;
    }

    const safeState = {
      ...state,
      scores: state.scores || {},
      strikes: state.strikes || {},
      revealed: state.revealed || {},
      winner: state.winner || ""
    };

    localStorage.setItem(
      "flight-feud-state",
      JSON.stringify(safeState)
    );

    window.dispatchEvent(
      new Event("flight-feud-firebase-update")
    );
  });

flightFeudDatabase
  .ref("game/transmissions")
  .on("value", (snapshot) => {
    const transmissions =
      snapshot.val();

    if (transmissions === null) {
      localStorage.setItem(
        "flight-feud-transmissions",
        JSON.stringify([])
      );
    } else {
      localStorage.setItem(
        "flight-feud-transmissions",
        JSON.stringify(transmissions)
      );
    }

    window.dispatchEvent(
      new Event("flight-feud-firebase-update")
    );
  });

console.log("🔥 Flight Feud Firebase connected");