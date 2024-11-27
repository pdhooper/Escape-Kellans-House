// Audio asset URLs
const AUDIO_URLS = {
  bgMusic: '/assets/audio/horror-ambience.mp3',
  footsteps: '/assets/audio/footsteps.mp3',
  doorCreak: '/assets/audio/door-creak.mp3',
  kellanScream: '/assets/audio/monster-scream.mp3',
  heartbeat: '/assets/audio/heartbeat.mp3'
};

class AudioManager {
  constructor() {
    this.sounds = {};
    this.initialized = false;
  }

  init() {
    if (this.initialized) return;
    
    Object.entries(AUDIO_URLS).forEach(([key, url]) => {
      const audio = new Audio();
      audio.src = url;
      this.sounds[key] = audio;
    });

    // Configure audio settings
    this.sounds.bgMusic.loop = true;
    this.sounds.bgMusic.volume = 0.3;
    this.sounds.footsteps.volume = 0.2;
    this.sounds.doorCreak.volume = 0.4;
    this.sounds.kellanScream.volume = 0.5;
    this.sounds.heartbeat.volume = 0.0;
    this.sounds.heartbeat.loop = true;

    this.initialized = true;
  }

  play(soundName) {
    if (!this.initialized || !this.sounds[soundName]) return;
    
    try {
      // If the sound is already playing, reset it
      const sound = this.sounds[soundName];
      sound.currentTime = 0;
      sound.play().catch(error => {
        console.warn(`Failed to play ${soundName}:`, error);
      });
    } catch (error) {
      console.warn(`Error playing ${soundName}:`, error);
    }
  }

  setVolume(soundName, volume) {
    if (!this.initialized || !this.sounds[soundName]) return;
    this.sounds[soundName].volume = Math.max(0, Math.min(1, volume));
  }

  stopAll() {
    if (!this.initialized) return;
    Object.values(this.sounds).forEach(sound => {
      sound.pause();
      sound.currentTime = 0;
    });
  }
}

export const audioManager = new AudioManager();