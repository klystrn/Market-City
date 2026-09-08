"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  AudioLines,
  Pause,
  Play,
  Volume2,
  X,
  SkipForward,
  Radio as RadioIcon,
} from "lucide-react";
import {
  RecordedMusic,
  BrowserTTS,
  preferredVoice,
  type VoiceOption,
} from "@/services/radio";
import type { Snapshot } from "@/domain/types";
import { marketBulletin, newsBulletin } from "@/services/bulletins";
import library from "@/data/music-library.json";
export default function Radio({ snapshot }: { snapshot: Snapshot }) {
  const [open, setOpen] = useState(false),
    [playing, setPlaying] = useState(false),
    [blocked, setBlocked] = useState(false),
    [volume, setVolume] = useState(0.35),
    [station, setStation] = useState("jazz"),
    [trackIndex, setTrackIndex] = useState(0),
    [bulletin, setBulletin] = useState(""),
    [error, setError] = useState(""),
    [broadcasts, setBroadcasts] = useState(true),
    [news, setNews] = useState(true),
    [voices, setVoices] = useState<VoiceOption[]>([]),
    [voiceURI, setVoiceURI] = useState("");
  const audio = useRef<HTMLAudioElement>(null),
    music = useRef<RecordedMusic | null>(null),
    tts = useRef<BrowserTTS | null>(null),
    intent = useRef(true),
    operation = useRef(0),
    welcomed = useRef(false),
    announced = useRef(new Set<string>()),
    failed = useRef(new Set<string>()),
    timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const current = library.find((s) => s.id === station)!,
    track = current.tracks[trackIndex % Math.max(1, current.tracks.length)];
  const src = track
    ? `${process.env.NEXT_PUBLIC_BASE_PATH || ""}${track.url}`
    : undefined;
  const finish = useCallback(() => {
    music.current?.duck(false);
    if (timer.current) clearTimeout(timer.current);
  }, []);
  const announce = useCallback(
    (text: string) => {
      setBulletin(text);
      finish();
      music.current?.duck(true);
      tts.current ??= new BrowserTTS();
      if (!tts.current.speak(text, finish, voiceURI, Math.min(1, volume * 2))) {
        finish();
        setError(
          "Speech is unavailable in this browser. The bulletin is shown as text.",
        );
      } else timer.current = setTimeout(finish, 45000);
    },
    [finish, voiceURI, volume],
  );
  const start = useCallback(async () => {
    if (!audio.current?.getAttribute("src")) return;
    const version = ++operation.current;
    intent.current = true;
    music.current ??= new RecordedMusic(audio.current);
    try {
      await music.current.play();
      if (version !== operation.current) return;
      setPlaying(true);
      setBlocked(false);
      setError("");
    } catch (e) {
      if (version !== operation.current) return;
      const name = (e as Error).name;
      if (name === "AbortError") return;
      setPlaying(false);
      setBlocked(name === "NotAllowedError");
      if (name !== "NotAllowedError")
        setError("This track could not play. Try the next track.");
    }
  }, []);
  const pause = useCallback(() => {
    operation.current++;
    intent.current = false;
    music.current?.pause();
    tts.current?.cancel();
    finish();
    setPlaying(false);
    setBlocked(false);
  }, [finish]);
  useEffect(() => {
    if (!audio.current) return;
    music.current ??= new RecordedMusic(audio.current);
    music.current.setVolume(volume);
  }, [volume]);
  useEffect(() => {
    if (intent.current && src) void start();
    const pending = operation;
    return () => {
      pending.current++;
    };
  }, [src, start]);
  useEffect(() => {
    if (!blocked) return;
    const unlock = (e: Event) => {
      if (e.target instanceof Element && e.target.closest(".radio-controls"))
        return;
      if (intent.current) void start();
    };
    window.addEventListener("click", unlock, { once: true });
    window.addEventListener("keydown", unlock, { once: true });
    return () => {
      window.removeEventListener("click", unlock);
      window.removeEventListener("keydown", unlock);
    };
  }, [blocked, start]);
  useEffect(() => {
    if (!("speechSynthesis" in window)) return;
    const update = () =>
      setVoices(
        window.speechSynthesis
          .getVoices()
          .filter((v) => /^en[-_]/i.test(v.lang))
          .map((v) => ({
            name: v.name,
            lang: v.lang,
            voiceURI: v.voiceURI,
            default: v.default,
          })),
      );
    update();
    window.speechSynthesis.addEventListener("voiceschanged", update);
    return () =>
      window.speechSynthesis.removeEventListener("voiceschanged", update);
  }, []);
  useEffect(
    () => () => {
      operation.current++;
      music.current?.pause();
      tts.current?.cancel();
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );
  useEffect(() => {
    if (!open) return;
    const dismiss = (e: MouseEvent) => {
      if (e.target instanceof Element && !e.target.closest(".radio-wrap"))
        setOpen(false);
    };
    const escape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("click", dismiss, true);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("click", dismiss, true);
      document.removeEventListener("keydown", escape);
    };
  }, [open]);
  const readNews = useCallback(() => {
    const story = snapshot.news.find(
      (n) =>
        n.significance >= 0.6 &&
        !announced.current.has(n.id) &&
        (snapshot.market.dataStatus === "demo"
          ? n.dataStatus === "demo"
          : n.dataStatus !== "demo"),
    );
    if (story) {
      announced.current.add(story.id);
      announce(newsBulletin(story, snapshot.companies));
    }
  }, [snapshot, announce]);
  useEffect(() => {
    if (!playing || !broadcasts || welcomed.current) return;
    const welcome = setTimeout(() => {
      welcomed.current = true;
      announce(marketBulletin(snapshot));
    }, 1800);
    return () => clearTimeout(welcome);
  }, [playing, broadcasts, announce, snapshot]);
  const previousSession = useRef(snapshot.market.session);
  useEffect(() => {
    const changed = previousSession.current !== snapshot.market.session;
    previousSession.current = snapshot.market.session;
    if (
      changed &&
      playing &&
      broadcasts &&
      (snapshot.market.session === "regular" ||
        snapshot.market.session === "after-hours")
    )
      announce(marketBulletin(snapshot, snapshot.market.session));
  }, [snapshot, playing, broadcasts, announce]);
  useEffect(() => {
    if (!playing || !news) return;
    const interval = setInterval(() => {
      if (!document.hidden) readNews();
    }, 90000);
    return () => clearInterval(interval);
  }, [playing, news, readNews]);
  function next() {
    if (!audio.current || !current.tracks.length) return;
    audio.current.currentTime = 0;
    if (current.tracks.length === 1) {
      if (intent.current) void start();
    } else setTrackIndex((i) => (i + 1) % current.tracks.length);
  }
  function changeStation(value: string) {
    operation.current++;
    music.current?.pause();
    tts.current?.cancel();
    finish();
    setPlaying(false);
    failed.current.clear();
    setStation(value);
    setTrackIndex(0);
  }
  function trackError() {
    if (!track) return;
    failed.current.add(track.url);
    if (failed.current.size >= current.tracks.length) {
      pause();
      setError("No playable tracks in this station. Choose another station.");
    } else {
      setError("Skipping an unavailable track.");
      next();
    }
  }
  const automatic = preferredVoice(voices);
  return (
    <div className="radio-wrap">
      <audio
        ref={audio}
        src={src}
        preload="none"
        onEnded={next}
        onError={trackError}
        aria-label="Market City station audio"
      />
      {open && (
        <section className="glass radio-panel" aria-label="Market City Radio">
          <div className="panel-heading">
            <span className="eyebrow">MC RADIO</span>
            <button
              className="icon-button"
              onClick={() => setOpen(false)}
              aria-label="Close radio"
            >
              <X size={16} />
            </button>
          </div>
          <div className="radio-art">
            <RadioIcon size={32} />
            <div>
              <h3>{current.name}</h3>
              <p>{current.tracks.length} tracks · your music library</p>
            </div>
          </div>
          <p className="radio-track" title={track?.title}>
            {track?.title ?? "Add tracks to this station"}
          </p>
          <label className="field-label">
            Station
            <select
              value={station}
              onChange={(e) => changeStation(e.target.value)}
            >
              {library.map((s) => (
                <option key={s.id} value={s.id} disabled={!s.tracks.length}>
                  {s.name}
                  {s.tracks.length ? "" : " · coming soon"}
                </option>
              ))}
            </select>
          </label>
          <div className="radio-controls">
            <button
              className="round-button"
              onClick={() => (playing ? pause() : void start())}
              aria-label={playing ? "Pause radio" : "Play radio"}
            >
              {playing ? <Pause size={18} /> : <Play size={18} />}
            </button>
            <button
              className="icon-button"
              onClick={next}
              aria-label="Next track"
            >
              <SkipForward size={18} />
            </button>
            <Volume2 size={17} />
            <input
              aria-label="Radio volume"
              type="range"
              min="0"
              max="1"
              step=".01"
              value={volume}
              onChange={(e) => setVolume(Number(e.target.value))}
            />
          </div>
          <label className="toggle-row">
            Market broadcasts
            <input
              type="checkbox"
              checked={broadcasts}
              onChange={(e) => {
                setBroadcasts(e.target.checked);
                if (!e.target.checked) {
                  tts.current?.cancel();
                  finish();
                }
              }}
            />
          </label>
          <label className="toggle-row">
            News headlines
            <input
              type="checkbox"
              checked={news}
              onChange={(e) => {
                setNews(e.target.checked);
                if (!e.target.checked) {
                  tts.current?.cancel();
                  finish();
                }
              }}
            />
          </label>
          <label className="field-label">
            Presenter voice
            <select
              value={voiceURI}
              onChange={(e) => setVoiceURI(e.target.value)}
            >
              <option value="">
                Auto · {automatic?.name ?? "browser voice"}
              </option>
              {voices.map((v) => (
                <option key={v.voiceURI} value={v.voiceURI}>
                  {v.name}
                </option>
              ))}
            </select>
          </label>
          <p className="fine-print">
            Warm delivery · natural English voices preferred when available.
          </p>
          <button
            className="text-button bulletin-button"
            onClick={() => announce(marketBulletin(snapshot))}
          >
            Listen to market bulletin <AudioLines size={15} />
          </button>
          <button className="text-button bulletin-button" onClick={readNews}>
            Read next headline
          </button>
          {bulletin && (
            <p className="bulletin-text" role="status">
              {bulletin}
            </p>
          )}
          {blocked && (
            <p className="fine-print" role="status">
              Jazz is ready. Your browser needs a click or keypress to start
              sound.
            </p>
          )}
          {error && (
            <p className="error-text" role="status">
              {error}
            </p>
          )}
          <p className="fine-print">
            News every 90 seconds while playing. God headlines are fictional.
            Pause stops music and speech.
          </p>
        </section>
      )}
      <button
        className={`glass radio-pill ${playing ? "is-playing" : ""}`}
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        <AudioLines size={18} />
        <span>{current.name}</span>
        <span className="radio-status">
          {playing ? "ON AIR" : blocked ? "CLICK TO START" : "OFF"}
        </span>
      </button>
    </div>
  );
}
