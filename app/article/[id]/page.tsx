'use client';

import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { archivalGrid, photoEssay } from '@/lib/data';
import Lenis from 'lenis';

if (typeof window !== "undefined") {
  gsap.registerPlugin(useGSAP);
}

export default function ArticlePage() {
    const params = useParams();
    const router = useRouter();
    const container = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    
    // Add Lenis and Custom Cursor
    useEffect(() => {
        const lenis = new Lenis({
          lerp: 0.1,
          smoothWheel: true,
          syncTouch: true,
        });
        function raf(time: number) {
          lenis.raf(time);
          requestAnimationFrame(raf);
        }
        requestAnimationFrame(raf);
        
        const cursor = document.getElementById('cursor');
        const moveCursor = (e: MouseEvent) => {
            if (cursor) {
                gsap.to(cursor, { x: e.clientX, y: e.clientY, duration: 0.1, ease: 'power2.out' });
            }
        };
        window.addEventListener('mousemove', moveCursor);
        
        return () => {
            lenis.destroy();
            window.removeEventListener('mousemove', moveCursor);
        };
    }, []);

    // Instead of state, compute directly
    let found = archivalGrid.find(a => a.id === params.id);
    if (!found) {
        const photoStr = String(params.id).replace('photo-', '');
        const p = photoEssay.find(p => p.img === photoStr);
        if (p) found = { ...p, id: `photo-${p.img}`, vol: 'PE' };
    }
    const article = found || archivalGrid[0];

    useGSAP(() => {
        if (!article) return;
        // Full screen image reveal
        const tl = gsap.timeline();
        
        tl.fromTo('.hero-banner',
            { height: '100vh', clipPath: 'inset(10% 10% 10% 10%)' }, 
            { height: '60vh', clipPath: 'inset(0% 0% 0% 0%)', duration: 1.2, ease: "power4.inOut" }
        )
        .fromTo('.article-content > *', 
            { y: 50, opacity: 0 }, 
            { y: 0, opacity: 1, duration: 0.8, stagger: 0.1, ease: 'power3.out'},
            "-=0.4"
        );
    }, { scope: container });

    const handleBack = (e: React.MouseEvent) => {
        e.preventDefault();
        gsap.to(container.current, { opacity: 0, duration: 0.5, onComplete: () => router.push('/') });
    }

    if (!article) return <div className="min-h-screen bg-[#0A0A0A]"></div>;

    return (
        <main ref={container} className="min-h-screen bg-[#0A0A0A] text-white overflow-x-hidden selection:bg-white/30 cursor-none">
            {/* Custom Cursor */}
            <div className="fixed top-0 left-0 w-4 h-4 bg-white rounded-full pointer-events-none z-[110] mix-blend-difference transform -translate-x-1/2 -translate-y-1/2 hidden md:block mix-blend-difference" id="cursor"></div>

            <nav className="fixed top-8 left-6 md:left-12 z-50 mix-blend-difference">
                <Link href="/" onClick={handleBack} className="text-[10px] uppercase tracking-[0.3em] font-bold text-white hover:opacity-50 transition-opacity duration-700">
                    {"<-"} Back to Archive
                </Link>
            </nav>

            <div className="hero-banner relative w-full h-[60vh] overflow-hidden">
                <Image src={`https://picsum.photos/seed/${article.img}/1920/1080`} alt={article.title} fill priority sizes="100vw" className="object-cover grayscale" referrerPolicy="no-referrer" />
                <div className="absolute inset-0 bg-black/40"></div>
                <div className="absolute bottom-12 left-12">
                   <span className="text-[10px] uppercase tracking-[0.3em] font-semibold text-white/60 drop-shadow-md mb-4 block">Vol. {article.vol}</span>
                   <h1 className="text-5xl md:text-8xl font-black uppercase tracking-tighter drop-shadow-md">{article.title}</h1>
                </div>
            </div>

            <div ref={contentRef} className="article-content max-w-4xl mx-auto px-6 md:px-12 py-32 text-lg text-white/70 leading-relaxed font-light">
                <p className="text-2xl font-medium text-white mb-16 uppercase tracking-tight leading-snug">
                   {article.desc}
                </p>
                <p className="mb-8">
                   Brutalist architecture, a style that emerged in the 1950s and grew out of the early-20th century modernist movement, is characterized by its massive, monolithic and blocky appearance with a rigid geometric style and large-scale use of poured concrete. The term comes from the French phrase &quot;béton brut,&quot; meaning raw concrete.
                </p>
                <p className="mb-8">
                   While often polarizing, brutalism represents a moment of utopian vision. Buildings were designed not just as shelters or workspaces, but as social experiments. The honesty of the materials—leaving concrete exposed, showcasing the marks of the formwork—was meant to reflect a society that was transparent, egalitarian, and rooted in functional reality.
                </p>
                <div className="my-16 border-l-2 border-white/20 pl-8 py-4">
                    <p className="text-3xl font-medium text-white italic">&quot;The structure must be expressed. The material must be respected.&quot;</p>
                </div>
                <p>
                   Today, these structures stand as monuments to a bygone era of public investment and audacious planning. As many face demolition, documenting them becomes crucial. They are not merely buildings; they are artifacts of an ideological ambition that sought to reshape the human experience through concrete and scale.
                </p>
            </div>
        </main>
    )
}
