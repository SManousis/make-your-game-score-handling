class AudioManager {
    constructor(samplePaths, poolSize = 5) {
        this.context = new AudioContext();
        this.samplePaths = samplePaths;
        this.sampleBuffers = {};
        this.pools = {};
        this.poolSize = poolSize;
        this.cooldowns = {}; // for throttling
        this.bgMusic = null;
        this.musicLoopTimer = null;
        this.musicOffset = 0;
        this.startTime = null;
        this.isPlaying = false;
    }

    async loadAll() {
        const entries = Object.entries(this.samplePaths);
        for (const [name, url] of entries) {
            const res = await fetch(url);
            const arrayBuffer = await res.arrayBuffer();
            const buffer = await this.context.decodeAudioData(arrayBuffer);
            this.sampleBuffers[name] = buffer;

            // Build pool of AudioBuffers
            this.pools[name] = new Array(this.poolSize).fill().map(() => ({
                playing: false,
            }));
        }
    }

    playSample(name, { gain = 1.0, pan = 0.0, throttleMs = 0, pitchRandom = null } = {}) {
        const buffer = this.sampleBuffers[name];
        if (!buffer) return;

        // Throttle check
        const now = Date.now();
        if (throttleMs > 0 && this.cooldowns[name] && now - this.cooldowns[name] < throttleMs) {
            return;
        }
        this.cooldowns[name] = now;

        // Find a free slot in pool
        const pool = this.pools[name];
        const slot = pool.find(s => !s.playing);
        if (!slot) {
            // Find the oldest playing slot (earliest started time)
            let oldest = pool.reduce((a, b) => (a.started < b.started ? a : b));
            if (oldest.source) {
                try {
                    oldest.source.stop(); // stop it
                } catch (e) {
                    // silently ignore if already stopped
                }
            }
            oldest.playing = false;
            slot = oldest;
        }

        const source = this.context.createBufferSource();
        const gainNode = this.context.createGain();
        const panNode = this.context.createStereoPanner();

        source.buffer = buffer;
        gainNode.gain.value = gain;
        panNode.pan.value = pan;

        // 🔁 Optional pitch randomization
        if (pitchRandom && pitchRandom.length === 2) {
            const [min, max] = pitchRandom;
            source.playbackRate.value = min + Math.random() * (max - min);
        }

        source.connect(gainNode).connect(panNode).connect(this.context.destination);
        source.start();

        slot.playing = true;
        source.onended = () => {
            slot.playing = false;
        };
    }


    async resume() {
        if (this.context.state === "suspended") {
            await this.context.resume();
        }
    }

    async getOrLoadMusicBuffer(url) {
        if (this.musicBufferCache[url]) return this.musicBufferCache[url];

        try {
            const res = await fetch(url);
            const arrayBuffer = await res.arrayBuffer();
            const buffer = await this.context.decodeAudioData(arrayBuffer);
            this.musicBufferCache[url] = buffer;
            return buffer;
        } catch (e) {
            console.error(`Failed to load or decode ${url}`, e);
            return null;
        }
    }


    async playMusicLoop(url, volume = 1.0, overlapDuration = 7.742) {
        if (this.isPlaying === true) return;

        const buffer = await this.getOrLoadMusicBuffer(url);
        if (!buffer) return;

        const scheduleNext = () => {

            // Create nodes
            const source = this.context.createBufferSource();
            const gainNode = this.context.createGain();
            source.buffer = buffer;
            source.connect(gainNode).connect(this.context.destination);

            gainNode.gain.value = volume;

            const offSet = this.musicOffset || 0;
            const durationToPlay = buffer.duration - offSet;

            this.startTime = this.context.currentTime - offSet;
            source.start(0, offSet);

            this.isPlaying = true;

            // Store for stopping
            this.bgMusic = { source, gainNode };

            // Schedule next instance
            this.musicLoopTimer = setTimeout(() => {
                scheduleNext();
            }, (durationToPlay - overlapDuration) * 1000); // ms
        };

        scheduleNext();
    }

    pauseMusic() {
        if (!this.isPlaying || !this.bgMusic?.source) return;

        this.musicOffset = this.context.currentTime - this.startTime;

        this.bgMusic.source.stop();
        clearTimeout(this.musicLoopTimer);
        this.isPlaying = false;
    }

    stopMusic() {
        if (this.bgMusic?.source) {
            const now = this.context.currentTime;
            this.bgMusic.gainNode.gain.linearRampToValueAtTime(0, now + 1)
            this.bgMusic.source.stop();
        }
        clearTimeout(this.musicLoopTimer);
        this.bgMusic = null;
        this.isPlaying = false;
        this.musicOffset = 0;
    }

    setMusicVolume(vol) {
        if (this.bgMusic?.gainNode) {
            this.bgMusic.gainNode.gain.value = vol;
        }
    }
}

export default AudioManager;
