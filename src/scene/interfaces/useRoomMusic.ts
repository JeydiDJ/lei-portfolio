import { useCallback, useEffect, useRef, useState } from "react";

export const roomTracks = ["Midterms"];

/** Client-supplied music; fetch/decode on Play, then reuse the decoded recording. */
export default function useRoomMusic() {
  const context = useRef<AudioContext | null>(null);
  const source = useRef<AudioBufferSourceNode | null>(null);
  const gain = useRef<GainNode | null>(null);
  const analyser = useRef<AnalyserNode | null>(null);
  const recording = useRef<Promise<AudioBuffer> | null>(null);
  const buffer = useRef<AudioBuffer | null>(null);
  const offset = useRef(0);
  const startedAt = useRef(0);
  const samples = useRef(new Uint8Array(64));
  const request = useRef(0);
  const busy = useRef(false);
  const channel = useRef<BroadcastChannel | null>(null);
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [volume, setVolume] = useState(0.25);
  const [error, setError] = useState("");
  const getEnergy = useCallback(() => {
    if (!analyser.current) return 0;
    analyser.current.getByteTimeDomainData(samples.current);
    let energy = 0;
    for (const sample of samples.current) energy += ((sample - 128) / 128) ** 2;
    return Math.min(1, Math.sqrt(energy / samples.current.length) * 14);
  }, []);
  const stop = () => {
    request.current++;
    const current = source.current;
    source.current = null;
    busy.current = false;
    if (current && context.current) {
      if (buffer.current)
        offset.current =
          (offset.current + context.current.currentTime - startedAt.current) %
          buffer.current.duration;
      // A retiring source must be silent before a replacement can start.
      // Cancel the scheduled fade-in as well: it must not restore the old gain.
      if (gain.current) {
        gain.current.gain.cancelScheduledValues(context.current.currentTime);
        gain.current.gain.setValueAtTime(0, context.current.currentTime);
        gain.current.disconnect();
      }
      current.disconnect();
      current.stop();
    }
    gain.current = null;
    setPlaying(false);
    setLoading(false);
  };
  const play = async (restart = false) => {
    stop();
    if (restart) offset.current = 0;
    const ticket = request.current;
    busy.current = true;
    setLoading(true);
    setError("");
    try {
      const audio = context.current ?? new AudioContext();
      context.current = audio;
      await audio.resume();
      if (ticket !== request.current) return;
      recording.current ??= fetch("/audio/parungo-midterms.mp3")
        .then(async (response) => {
          if (!response.ok) throw new Error("Recording unavailable");
          return audio.decodeAudioData(await response.arrayBuffer());
        })
        .catch((error: unknown) => {
          recording.current = null;
          throw error;
        });
      const decoded = await recording.current;
      if (ticket !== request.current) return;
      buffer.current = decoded;
      channel.current?.postMessage("claim-playback");
      const next = audio.createBufferSource();
      next.buffer = decoded;
      next.loop = true;
      const level = audio.createGain();
      level.gain.setValueAtTime(0, audio.currentTime);
      level.gain.linearRampToValueAtTime(volume, audio.currentTime + 0.25);
      if (!analyser.current) {
        analyser.current = audio.createAnalyser();
        analyser.current.fftSize = 64;
        analyser.current.smoothingTimeConstant = 0.8;
        analyser.current.connect(audio.destination);
      }
      next.connect(level).connect(analyser.current);
      next.onended = () => {
        next.disconnect();
        level.disconnect();
        if (source.current === next) {
          source.current = null;
          gain.current = null;
          busy.current = false;
          setPlaying(false);
        }
      };
      gain.current = level;
      source.current = next;
      startedAt.current = audio.currentTime;
      next.start(0, offset.current);
      setLoading(false);
      setPlaying(true);
    } catch {
      if (ticket !== request.current) return;
      setError("Audio unavailable. Tap Play to retry.");
      busy.current = false;
      setLoading(false);
      setPlaying(false);
    }
  };
  const stopCurrent = useRef(stop);
  stopCurrent.current = stop;
  useEffect(() => {
    if (typeof BroadcastChannel === "undefined") return;
    const playback = new BroadcastChannel("leila-portfolio-speaker");
    channel.current = playback;
    playback.onmessage = (event) => {
      if (event.data === "claim-playback") stopCurrent.current();
    };
    return () => {
      playback.close();
      channel.current = null;
    };
  }, []);
  useEffect(() => {
    const audio = context.current;
    if (audio && gain.current && playing)
      gain.current.gain.setTargetAtTime(volume, audio.currentTime, 0.05);
  }, [volume, playing]);
  useEffect(
    () => () => {
      request.current++;
      source.current?.disconnect();
      source.current?.stop();
      source.current = null;
      gain.current?.disconnect();
      gain.current = null;
      busy.current = false;
      analyser.current?.disconnect();
      void context.current?.close();
      context.current = null;
      analyser.current = null;
      recording.current = null;
    },
    [],
  );
  return {
    playing,
    loading,
    track: 0,
    volume,
    getEnergy,
    error,
    toggle: () => {
      // React may not have rendered yet after a rapid second press.
      if (source.current || busy.current) stop();
      else void play();
    },
    next: () => {
      void play(true);
    },
    quieter: () => setVolume((value) => Math.max(0, value - 0.1)),
    louder: () => setVolume((value) => Math.min(1, value + 0.1)),
  };
}
