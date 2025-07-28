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

    async playMusicLoop(url, volume = 1.0, overlapDuration = 7.742) {
        const res = await fetch(url);
        const arrayBuffer = await res.arrayBuffer();
        let buffer;
        // const buffer = await this.context.decodeAudioData(arrayBuffer);
        try {
            buffer = await this.context.decodeAudioData(arrayBuffer);
        } catch (e) {
            console.error(`Failed to decode ${url}:`, e);
        }
        if (!buffer) {
            console.error(`Decoded buffer is null for ${url}`);
            return;
        }

        // this.stopMusic(); // clean up if something is already playing

        const scheduleNext = () => {
            const now = this.context.currentTime;

            // Create nodes
            const source = this.context.createBufferSource();
            const gainNode = this.context.createGain();
            source.buffer = buffer;
            source.connect(gainNode).connect(this.context.destination);

            gainNode.gain.value = volume;

            source.start();

            // Store for stopping
            this.bgMusic = { source, gainNode };

            // Schedule next instance
            this.musicLoopTimer = setTimeout(() => {
                scheduleNext();
            }, (buffer.duration - overlapDuration) * 1000); // ms
        };

        scheduleNext();
    }


    stopMusic() {
        if (this.bgMusic?.source) {
            const now = this.context.currentTime;
            this.bgMusic.gainNode.gain.linearRampToValueAtTime(0, now + 1)
            this.bgMusic.source.stop();
        }
        if (this.musicLoopTimer) {
            clearTimeout(this.musicLoopTimer);
            this.musicLoopTimer = null;
        }
        this.bgMusic = null;
    }

    setMusicVolume(vol) {
        if (this.bgMusic?.gainNode) {
            this.bgMusic.gainNode.gain.value = vol;
        }
    }
}
