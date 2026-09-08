export interface MusicProvider {
  play(): Promise<void>;
  pause(): void;
  setVolume(value: number): void;
  duck(value: boolean): void;
  dispose(): void;
}
// A single streamed HTML audio element; never decode the whole music library into memory.
export class RecordedMusic implements MusicProvider {
  private volume = 0.35;
  private ducked = false;
  constructor(private audio: HTMLAudioElement) {}
  play() {
    return this.audio.play();
  }
  pause() {
    this.audio.pause();
  }
  setVolume(value: number) {
    this.volume = Math.max(0, Math.min(1, value));
    this.audio.volume = this.volume * (this.ducked ? 0.1 : 1);
  }
  duck(value: boolean) {
    this.ducked = value;
    this.setVolume(this.volume);
  }
  dispose() {
    this.pause();
    this.audio.removeAttribute("src");
    this.audio.load();
  }
}
export interface VoiceOption {
  name: string;
  lang: string;
  voiceURI: string;
  default: boolean;
}
export function preferredVoice<T extends VoiceOption>(
  voices: T[],
): T | undefined {
  const score = (v: T) =>
    (/natural|neural|premium|enhanced/i.test(v.name) ? 100 : 0) +
    (/aria|jenny|sonia|samantha/i.test(v.name) ? 35 : 0) +
    (/google.*english/i.test(v.name) ? 30 : 0) +
    (/zira/i.test(v.name) ? 15 : 0) +
    (v.default ? 5 : 0) +
    (/en-US/i.test(v.lang) ? 3 : 0);
  return voices
    .filter((v) => /^en[-_]/i.test(v.lang))
    .sort((a, b) => score(b) - score(a))[0];
}
export interface TTSProvider {
  speak(
    text: string,
    onEnd: () => void,
    voiceURI?: string,
    volume?: number,
  ): boolean;
  cancel(): void;
}
export class BrowserTTS implements TTSProvider {
  speak(text: string, onEnd: () => void, voiceURI = "", volume = 0.7) {
    if (!("speechSynthesis" in window)) return false;
    window.speechSynthesis.cancel();
    const voices = window.speechSynthesis.getVoices();
    const voice =
      voices.find((v) => v.voiceURI === voiceURI) ?? preferredVoice(voices);
    const utterance = new SpeechSynthesisUtterance(text);
    if (voice) utterance.voice = voice;
    utterance.lang = voice?.lang ?? "en-US";
    utterance.rate = 1.04;
    utterance.pitch = 1.08;
    utterance.volume = Math.max(0, Math.min(1, volume));
    utterance.onend = onEnd;
    utterance.onerror = onEnd;
    window.speechSynthesis.speak(utterance);
    return true;
  }
  cancel() {
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
  }
}
