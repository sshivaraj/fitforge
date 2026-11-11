// Android app only: Android WebView has no Web Speech API, so this provides a small
// speechSynthesis / SpeechSynthesisUtterance stand-in backed by the native TextToSpeech
// engine (window.AndroidTTS, injected by MainActivity). In a normal browser it does nothing.
(function () {
  "use strict";
  var B = window.AndroidTTS;
  if (!B) return;

  var listeners = {}, seq = 0, active = 0, voices = [];

  function Utterance(text) {
    this.text = text || ""; this.rate = 1; this.pitch = 1; this.volume = 1;
    this.voice = null; this.lang = "en-US"; this.onstart = null; this.onend = null; this.onerror = null;
  }

  function loadVoices() {
    try { voices = JSON.parse(B.voices()) || []; } catch (e) { voices = []; }
    return voices;
  }

  var synth = {
    speaking: false, pending: false, paused: false, onvoiceschanged: null,
    getVoices: function () { return voices.length ? voices : loadVoices(); },
    speak: function (u) {
      var id = "u" + (++seq);
      listeners[id] = u; active++; synth.speaking = true;
      B.speak(id, String(u.text), +u.rate || 1, +u.pitch || 1, u.voice ? u.voice.voiceURI : "");
    },
    cancel: function () {
      listeners = {}; active = 0; synth.speaking = false;
      B.stop();
    },
    pause: function () {}, resume: function () {}
  };

  window.__ttsEvent = function (type, id) {
    var u = listeners[id];
    if (!u) return;
    if (type === "start") { if (u.onstart) u.onstart(); return; }
    delete listeners[id];
    active = Math.max(0, active - 1);
    if (!active) synth.speaking = false;
    var cb = type === "end" ? u.onend : (u.onerror || u.onend);
    if (cb) cb();
  };
  window.__ttsReady = function () {
    loadVoices();
    if (typeof synth.onvoiceschanged === "function") synth.onvoiceschanged();
  };

  window.SpeechSynthesisUtterance = Utterance;
  try { Object.defineProperty(window, "speechSynthesis", { value: synth, configurable: true, writable: true }); }
  catch (e) { window.speechSynthesis = synth; }
})();
