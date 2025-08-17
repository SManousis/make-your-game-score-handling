export class AudioManager {
    constructor(samplePaths, poolSize = 5) {
        this.context = new AudioContext();
        this.samplePaths = samplePaths;
        this.sampleBuffers = {};
        this.pools = {};
        this.poolSize = poolSize;
        this.cooldowns = {};
        this.musicBufferCache = {};
        // this.musicState = { // bundle these to single objet to assing in a single step to avoid race conditions
        //     bgMusic: null,
        //     prevBgMusic: null
        // };
        this.sources = []
        this.musicLoopTimer = null;
        this.musicOffset = 0;
        this.startTime = null;
        this.isPlaying = false;
        this.latencyCompensation = isSafari() ? 0 : 0.05;
        this.locks = {};
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


    async playSample(name, { gain = 1.0, pan = 0.0, throttleMs = 0, pitchRandom = null, reduction = 0, fadeTime = 0 } = {}) {
        if (!reduction) fadeTime = 0;
        if (!this.locks) this.locks = {}; // init lock storage

        if (this.locks[name]) return; // Skip if already processing this sample
        this.locks[name] = true;

        try {
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
            this.duckMusic(source.buffer.duration, reduction, fadeTime)
            source.start(this.context.currentTime + fadeTime);

            slot.started = this.context.currentTime;
            slot.playing = true;
            slot.source = source;
            source.onended = () => {
                slot.playing = false;
            };
        } finally {
            this.locks[name] = false;
        }
    }


    killSamples() {
        for (const name in this.pools) {
            const slots = this.pools[name];

            slots.forEach(slot => {
                if (slot.playing && slot.source) {
                    try {
                        slot.source.stop();
                    } catch (e) {
                        // Handle if already stopped or error occurs
                        console.warn(`Failed to stop ${name} slot`, e);
                    }
                    slot.playing = false; // Optionally mark it as stopped
                }
            });
        }
    }

    duckMusic(duration, reduction, fadeTime) {
        // if (!this.musicState.bgMusic || reduction === 0) return;
        if (this.sources.length === 0 || reduction === 0) return;

        const now = this.context.currentTime;
        for (let i = 0; i < this.sources.length; i++) {
            const s = this.sources[i];
            const volume = s.gainNode.gain.value;

            s.gainNode.gain.linearRampToValueAtTime(volume - reduction, now + fadeTime);
            s.gainNode.gain.linearRampToValueAtTime(volume, now + fadeTime * 3 + duration);
        }
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

        const scheduleLoop = (startTime) => {
            this.startTime = startTime;
            const source = context.createBufferSource();
            const gainNode = context.createGain();
            source.buffer = buffer;
            gainNode.gain.value = volume;

            source.connect(gainNode).connect(context.destination);
            source.start(startTime, this.musicOffset);
            this.musicOffset = 0;

            this.sources.push({ source, gainNode })

            const nextStartTime = startTime + loopDuration - overlap - this.latencyCompensation;
            this.musicLoopTimer = setTimeout(() => {
                scheduleLoop(nextStartTime);
            }, (loopDuration - overlap - 1) * 1000); // run the new scheduleLoop one sec ahead of time
        };

        const now = context.currentTime;
        scheduleLoop(now);
    }

    pauseMusic() {
        if (!this.isPlaying) return;
        clearTimeout(this.musicLoopTimer);
        this.isPlaying = false;

        this.musicOffset = this.context.currentTime - this.startTime;
        for (let i = 0; i < this.sources.length; i++) {
            const s = this.sources[i];
            if (s?.source) {
                s.source.stop()
                s.source = null;
            }
        };

        this.sources = []
    }


    stopMusic(fadeTime) {
        clearTimeout(this.musicLoopTimer);
        this.isPlaying = false;
        this.musicOffset = 0;

        const now = this.context.currentTime;
        for (let i = 0; i < this.sources.length; i++) {
            const s = this.sources[i];
            if (fadeTime) {
                s.gainNode.gain.linearRampToValueAtTime(0, now + fadeTime);
                setTimeout(() => {
                    s.source.stop();
                }, fadeTime * 1000);
            } else {
                s.source.stop();
            }
            s.source = null;
        };

        this.sources = [];

    }

    setMusicVolume(vol) { // TODO: Use this ??
        for (let i = 0; i < this.sources.length; i++) {
            const s = this.sources[i];
            if (s?.source) s.gainNode.gain.value = vol;
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
