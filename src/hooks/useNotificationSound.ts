/**
 * Notification Sound Hook
 * Audio alerts for new messages
 */

import { useCallback, useRef, useEffect, useState } from 'react';

type SoundType = 'message' | 'send' | 'error' | 'success';

// Sound URLs (using Web Audio API for simple tones)
const SOUND_FREQUENCIES: Record<SoundType, { freq: number; duration: number; type: OscillatorType }> = {
  message: { freq: 800, duration: 150, type: 'sine' },
  send: { freq: 600, duration: 100, type: 'sine' },
  error: { freq: 300, duration: 200, type: 'square' },
  success: { freq: 1000, duration: 100, type: 'sine' },
};

export const useNotificationSound = () => {
  const audioContextRef = useRef<AudioContext | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [volume, setVolume] = useState(0.3);

  // Initialize AudioContext on first user interaction
  const initAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioContextRef.current;
  }, []);

  // Play a tone
  const playTone = useCallback((type: SoundType) => {
    if (!soundEnabled) return;

    try {
      const ctx = initAudioContext();
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const { freq, duration, type: oscType } = SOUND_FREQUENCIES[type];
      
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      oscillator.type = oscType;
      oscillator.frequency.setValueAtTime(freq, ctx.currentTime);
      
      // Envelope for smooth sound
      gainNode.gain.setValueAtTime(0, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.01);
      gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + duration / 1000);
      
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + duration / 1000);
    } catch (err) {
      console.warn('Audio playback failed:', err);
    }
  }, [soundEnabled, volume, initAudioContext]);

  // Convenience methods
  const playMessageSound = useCallback(() => playTone('message'), [playTone]);
  const playSendSound = useCallback(() => playTone('send'), [playTone]);
  const playErrorSound = useCallback(() => playTone('error'), [playTone]);
  const playSuccessSound = useCallback(() => playTone('success'), [playTone]);

  // Load settings from localStorage
  useEffect(() => {
    const savedEnabled = localStorage.getItem('soundEnabled');
    const savedVolume = localStorage.getItem('soundVolume');
    
    if (savedEnabled !== null) setSoundEnabled(savedEnabled === 'true');
    if (savedVolume !== null) setVolume(parseFloat(savedVolume));
  }, []);

  // Save settings to localStorage
  const toggleSound = useCallback(() => {
    setSoundEnabled(prev => {
      const newValue = !prev;
      localStorage.setItem('soundEnabled', String(newValue));
      return newValue;
    });
  }, []);

  const updateVolume = useCallback((newVolume: number) => {
    setVolume(newVolume);
    localStorage.setItem('soundVolume', String(newVolume));
  }, []);

  return {
    soundEnabled,
    volume,
    toggleSound,
    updateVolume,
    playMessageSound,
    playSendSound,
    playErrorSound,
    playSuccessSound,
    playTone,
  };
};

export default useNotificationSound;
