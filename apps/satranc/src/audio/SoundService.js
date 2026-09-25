export class SoundService {
  constructor(progress) {
    this.progress = progress;
    this.context = null;
  }

  play(type = "click") {
    if (!this.progress.state.settings.sound) return;
    this.context ||= new AudioContext();
    const osc = this.context.createOscillator();
    const gain = this.context.createGain();
    const tones = {
      click: [520, 0.045],
      move: [340, 0.08],
      success: [720, 0.15],
      error: [140, 0.14],
      badge: [880, 0.22]
    };
    const [frequency, duration] = tones[type] || tones.click;
    osc.frequency.value = frequency;
    osc.type = type === "error" ? "sawtooth" : "sine";
    gain.gain.setValueAtTime(0.0001, this.context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.14, this.context.currentTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, this.context.currentTime + duration);
    osc.connect(gain).connect(this.context.destination);
    osc.start();
    osc.stop(this.context.currentTime + duration);
  }

  /**
   * Metni yüksek sesle okur.
   *
   * Sesli anlatımın KENDİ ayarı vardır (`voice`); ses efektlerinin ayarına
   * (`sound`) bakılmaz. Sınıfta gürültü olmasın diye efekt seslerini kapatan
   * öğretmen, çocuğun okuma desteğini de kapatmış olmamalıdır — 1-2. sınıfta
   * henüz akıcı okuyamayan çocuk dersi yalnızca dinleyerek takip eder.
   */
  speak(text) {
    if (!this.progress.state.settings.voice || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "tr-TR";
    utterance.rate = 0.92;
    utterance.pitch = 1.12;
    window.speechSynthesis.speak(utterance);
  }
}
