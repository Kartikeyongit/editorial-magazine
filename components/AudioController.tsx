'use client';

import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

export default function AudioController() {
    const [isMuted, setIsMuted] = useState(true);
    const isMutedRef = useRef(isMuted);
    const audioCtxRef = useRef<AudioContext | null>(null);
    const gainNodeRef = useRef<GainNode | null>(null);

    useEffect(() => {
        isMutedRef.current = isMuted;
    }, [isMuted]);

    const initAudio = () => {
        if (!audioCtxRef.current) {
            const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
            audioCtxRef.current = new AudioContext();
            
            // Ambient drone
            gainNodeRef.current = audioCtxRef.current.createGain();
            gainNodeRef.current.gain.value = 0;
            gainNodeRef.current.connect(audioCtxRef.current.destination);

            const osc1 = audioCtxRef.current.createOscillator();
            const osc2 = audioCtxRef.current.createOscillator();
            const filter = audioCtxRef.current.createBiquadFilter();

            osc1.type = 'sine';
            osc1.frequency.value = 55; // Low A
            
            osc2.type = 'triangle';
            osc2.frequency.value = 110; 
            
            filter.type = 'lowpass';
            filter.frequency.value = 400;

            osc1.connect(filter);
            osc2.connect(filter);
            filter.connect(gainNodeRef.current);
            
            osc1.start();
            osc2.start();

            // Sound Effects Global Listeners
            const playBlip = (freq: number) => {
                if (!audioCtxRef.current || isMutedRef.current) return;
                const hitOsc = audioCtxRef.current.createOscillator();
                const hitGain = audioCtxRef.current.createGain();
                hitOsc.type = 'sine';
                hitOsc.frequency.value = freq;
                hitOsc.connect(hitGain);
                hitGain.connect(audioCtxRef.current.destination);
                
                const now = audioCtxRef.current.currentTime;
                hitOsc.start(now);
                hitGain.gain.setValueAtTime(0.1, now);
                hitGain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
                hitOsc.stop(now + 0.1);
            };

            const playClick = () => {
                if (!audioCtxRef.current || isMutedRef.current) return;
                const hitOsc = audioCtxRef.current.createOscillator();
                const hitGain = audioCtxRef.current.createGain();
                hitOsc.type = 'square';
                hitOsc.frequency.value = 800; // higher pitched click
                hitOsc.connect(hitGain);
                hitGain.connect(audioCtxRef.current.destination);
                
                const now = audioCtxRef.current.currentTime;
                hitOsc.start(now);
                hitGain.gain.setValueAtTime(0.1, now);
                hitGain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
                hitOsc.stop(now + 0.05);
            };

            // attach listeners to magnetic items and links
            const interactables = document.querySelectorAll('.magnetic, a, button, .cursor-pointer');
            interactables.forEach((el) => {
                el.addEventListener('mouseenter', () => playBlip(440));
                el.addEventListener('click', () => playClick());
            });
        }
    };

    useEffect(() => {
        if (!isMuted) {
            initAudio();
            if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
                audioCtxRef.current.resume();
            }
            if (gainNodeRef.current) {
                gsap.to(gainNodeRef.current.gain, { value: 0.05, duration: 2 });
            }
        } else {
            if (gainNodeRef.current) {
                 gsap.to(gainNodeRef.current.gain, { value: 0, duration: 1 });
            }
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isMuted]);

    return (
        <button 
           onClick={() => setIsMuted(!isMuted)} 
           className="magnetic fixed bottom-12 right-12 z-[160] hidden md:flex items-center gap-3 group"
        >
            <span className="text-[10px] uppercase tracking-[0.3em] font-semibold text-white/50 group-hover:text-white transition-colors duration-700">
               {isMuted ? 'UNMUTE' : 'MUTE'}
            </span>
            <div className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center group-hover:border-white mix-blend-difference bg-black/20 backdrop-blur-md transition-colors duration-700">
                {isMuted ? (
                    <div className="w-2 h-2 bg-white/50 rounded-full group-hover:bg-white transition-colors duration-700"></div>
                ) : (
                    <div className="flex gap-[2px] items-end h-3">
                       <div className="w-[2px] bg-white h-full animate-[pulse_1s_ease-in-out_infinite]"></div>
                       <div className="w-[2px] bg-white h-2/3 animate-[pulse_1s_ease-in-out_infinite_0.2s]"></div>
                       <div className="w-[2px] bg-white h-full animate-[pulse_1s_ease-in-out_infinite_0.4s]"></div>
                    </div>
                )}
            </div>
        </button>
    );
}
