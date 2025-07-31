export default class AudioManager {
    constructor(samplePaths, poolSize = 5) {
        this.context = new AudioContext();
        this.samplePaths = samplePaths;
        this.sampleBuffers = {};
        this.pools = {};
        this.poolSize = poolSize;
        this.cooldowns = {}; // for throttling
        this.musicBufferCache = {};
        this.bgMusic = null;
        this.musicLoopTimer = null;
        this.musicOffset = 0;
        this.startTime = null;
        this.isPlaying = false;
        this.latencyCompensation = isSafari() ? 0 : 0.05;
    }

    async loadSamples() {
        const entries = Object.entries(this.samplePaths);
        for (const [name, url] of entries) {
            try {
                const res = await fetch(url);
                if (!res.ok) {
                    throw new Error(`Failed to fetch ${url}: ${res.status} ${res.statusText}`);
                }

                const arrayBuffer = await res.arrayBuffer();
                const buffer = await this.context.decodeAudioData(arrayBuffer);
                this.sampleBuffers[name] = buffer;

                // Build pool of AudioBuffers
                this.pools[name] = new Array(this.poolSize).fill().map(() => ({
                    playing: false,
                }));
            } catch (err) {
                console.error(`Error loading sample "${name}" from ${url}:`, err);
                // Optionally: mark as failed, or continue without it
                this.sampleBuffers[name] = null;
                this.pools[name] = [];
            }
        }
    }


    playSample(name, { gain = 1.0, pan = 0.0, throttleMs = 0, pitchRandom = null } = {}) {
        const buffer = this.sampleBuffers[name];
        if (!buffer) return;

        const now = Date.now();
        if (throttleMs > 0 && this.cooldowns[name] && now - this.cooldowns[name] < throttleMs) {
            return;
        }
        this.cooldowns[name] = now;

        const pool = this.pools[name];
        let slot = pool.find(s => !s.playing);
        if (!slot) {
            let oldest = pool.reduce((a, b) => (a.started < b.started ? a : b));
            if (oldest.source) {
                try {
                    oldest.source.stop();
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
        if (this.isPlaying) {
            this.stopMusic();
        }

        const buffer = await this.getOrLoadMusicBuffer(url);
        if (!buffer) return;

        const context = this.context;
        const loopDuration = buffer.duration;
        const overlap = overlapDuration;

        this.isPlaying = true;
        this.musicOffset = 0;

        const scheduleLoop = (startTime) => {
            const source = context.createBufferSource();
            const gainNode = context.createGain();
            source.buffer = buffer;
            gainNode.gain.value = volume;

            source.connect(gainNode).connect(context.destination);
            source.start(startTime, this.musicOffset);

            this.bgMusic = { source, gainNode };

            const nextStartTime = startTime + loopDuration - overlap - this.latencyCompensation;
            this.musicLoopTimer = setTimeout(() => {
                scheduleLoop(nextStartTime);
            }, (loopDuration - overlap - 1) * 1000); // run the new scheduleLoop ahead of time
        };

        const now = context.currentTime;
        scheduleLoop(now);
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


function isSafari() {
    const ua = navigator.userAgent;
    return /^((?!chrome|android).)*safari/i.test(ua);
}

export function xToPan(x, width = 1800) {
    const clampedX = Math.max(0, Math.min(x, width));
    return (clampedX / width) * 2 - 1;
}

export const audioManager = new AudioManager({
    bubble: "./assets/audio/bubble.mp3",
    catching_sandwich: "./assets/audio/catching_sandwich.mp3",
    cicada_hit: "./assets/audio/cicada_hit.mp3",
    cicada_swarm: "./assets/audio/cicada_swarm.mp3",
    game_over: "./assets/audio/game_over.mp3",
    health_short: "./assets/audio/health_short.mp3",
    health: "./assets/audio/health.mp3",
    lazer_short: "./assets/audio/lazer_short.mp3",
    lazer: "./assets/audio/lazer.mp3",
    tick: "./assets/audio/time_tick.mp3",
    turtle_hit: "./assets/audio/turtle_hit.mp3",
    vending_rising: "./assets/audio/vending_rising.mp3",
}, 4);

export const track1 = { url: "./assets/audio/mario.mp3", overlapDuration: 7.742 }

// Must call this by a user event driven event on start-up
export async function audioSetUp() {
    audioManager.resume();
    await audioManager.loadSamples();
    await audioManager.getOrLoadMusicBuffer("./assets/audio/mario.mp3");
}
