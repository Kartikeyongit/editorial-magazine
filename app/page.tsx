'use client';

import React, { useRef, useEffect, useState } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Image from 'next/image';
import Link from 'next/link';
import Lenis from 'lenis';
import { manifestText, archivalGrid, photoEssay, corePrinciples, contributors } from '@/lib/data';
import AudioController from '@/components/AudioController';

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

export default function Page() {
  const container = useRef<HTMLDivElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const menuTl = useRef<gsap.core.Timeline | null>(null);

  useEffect(() => {
    const lenis = new Lenis({
      lerp: 0.1,
      smoothWheel: true,
      syncTouch: true,
    });

    (window as any).lenis = lenis;

    lenis.on('scroll', ScrollTrigger.update);

    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });
    
    gsap.ticker.lagSmoothing(0);

    const savedPos = sessionStorage.getItem('homeScrollPos');
    if (savedPos) {
      // Small timeout to ensure DOM is ready and GSAP scrolltriggers are calculated
      setTimeout(() => {
        lenis.scrollTo(parseInt(savedPos, 10), { immediate: true });
        sessionStorage.removeItem('homeScrollPos');
      }, 50);
    }

    const handleLinkClick = (e: MouseEvent) => {
      const link = (e.target as HTMLElement).closest('a');
      if (link && link.href.includes('/article/')) {
         sessionStorage.setItem('homeScrollPos', window.scrollY.toString());
      }
    };
    document.addEventListener('click', handleLinkClick);

    return () => {
      lenis.destroy();
      document.removeEventListener('click', handleLinkClick);
    };
  }, []);

  useEffect(() => {
    if (menuTl.current) {
      if (menuOpen) menuTl.current.play();
      else menuTl.current.reverse();
    }
  }, [menuOpen]);

  useGSAP(() => {
    let mm = gsap.matchMedia();

    // Menu Timeline
    menuTl.current = gsap.timeline({ paused: true })
      .to('.menu-overlay', { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.8, ease: 'expo.inOut' })
      .from('.menu-link', { y: '100%', opacity: 0, stagger: 0.1, duration: 0.6, ease: 'power3.out' }, "-=0.4");

    // Scroll Progress Bar
    gsap.to('.scroll-progress', {
      scaleX: 1,
      ease: "none",
      scrollTrigger: {
        trigger: document.documentElement,
        start: "top top",
        end: "bottom bottom",
        scrub: 0.3
      }
    });

    // 0. Custom Cursor & Magnetic Elements
    const cursor = document.querySelector('.custom-cursor');
    const follower = document.querySelector('.custom-cursor-follower');
    
    const cleanups: (() => void)[] = [];

    if (cursor && follower) {
      const xTo = gsap.quickTo(cursor, "x", { duration: 0.1, ease: "power3" });
      const yTo = gsap.quickTo(cursor, "y", { duration: 0.1, ease: "power3" });
      const xToF = gsap.quickTo(follower, "x", { duration: 0.4, ease: "power3" });
      const yToF = gsap.quickTo(follower, "y", { duration: 0.4, ease: "power3" });

      const onMouseMoveWindow = (e: MouseEvent) => {
        xTo(e.clientX);
        yTo(e.clientY);
        xToF(e.clientX);
        yToF(e.clientY);
      };
      
      window.addEventListener('mousemove', onMouseMoveWindow);
      cleanups.push(() => window.removeEventListener('mousemove', onMouseMoveWindow));

      const hoverElements = gsap.utils.toArray('button, a, .group, .magnetic');
      hoverElements.forEach((el: any) => {
          const onEnter = (e: any) => {
              gsap.to(cursor, { scale: 3, backgroundColor: "transparent", border: "1px solid white", duration: 0.2 });
              if (e.target.closest('.archival-item')) {
                  gsap.to(follower, { opacity: 1, duration: 0.2 });
              }
          };
          const onLeave = () => {
              gsap.to(cursor, { scale: 1, backgroundColor: "white", border: "none", duration: 0.2 });
              gsap.to(follower, { opacity: 0, duration: 0.2 });
          };
          el.addEventListener('mouseenter', onEnter);
          el.addEventListener('mouseleave', onLeave);
          cleanups.push(() => {
              el.removeEventListener('mouseenter', onEnter);
              el.removeEventListener('mouseleave', onLeave);
          });
      });
      
      const magElements = gsap.utils.toArray('.magnetic');
      magElements.forEach((el: any) => {
          const onMove = (e: MouseEvent) => {
              const rect = el.getBoundingClientRect();
              const x = e.clientX - rect.left - rect.width / 2;
              const y = e.clientY - rect.top - rect.height / 2;
              gsap.to(el, { x: x * 0.3, y: y * 0.3, duration: 0.3, ease: 'power2.out' });
          };
          const onLeave = () => {
              gsap.to(el, { x: 0, y: 0, duration: 0.7, ease: 'elastic.out(1, 0.3)' });
          };
          el.addEventListener('mousemove', onMove);
          el.addEventListener('mouseleave', onLeave);
          cleanups.push(() => {
              el.removeEventListener('mousemove', onMove);
              el.removeEventListener('mouseleave', onLeave);
          });
      });
    }

    // 1. Preloader & Hero Reveal Sequence
    if ((window as any).lenis) (window as any).lenis.stop();
    window.scrollTo(0, 0); // ensure we're at the top
    
    const tl = gsap.timeline({
      onComplete: () => {
        if ((window as any).lenis) (window as any).lenis.start();
      }
    });
    
    const progress = { val: 0 };
    tl.to(progress, {
      val: 100,
      duration: 1.8,
      ease: "power1.inOut",
      onUpdate: () => {
        const counter = document.querySelector('.preloader-counter');
        if (counter) counter.innerHTML = `${Math.round(progress.val)}%`;
        gsap.set('.preloader-bar', { width: `${progress.val}%` });
      }
    })
    .to('.preloader-title-inner', { yPercent: -100, duration: 0.6, ease: "power3.inOut", stagger: 0.05 }, "+=0.2")
    .to('.preloader-counter', { opacity: 0, duration: 0.3 }, "-=0.3")
    .to('.preloader', { yPercent: -100, duration: 0.8, ease: "power4.inOut" })
    .fromTo(".hero-text", 
      { y: 80, opacity: 0, rotateX: 45 },
      { y: 0, opacity: 1, rotateX: 0, duration: 1.2, stagger: 0.15, ease: "power4.out" },
      "-=0.4"
    )
    .fromTo(".hero-sub",
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 1, ease: "power3.out" },
      "-=0.8"
    )
    .fromTo(".hero-shape",
      { scale: 0, opacity: 0, rotation: 180 },
      { scale: 1, opacity: 1, rotation: 0, duration: 1.5, ease: "back.out(1.5)", stagger: 0.2 },
      "-=1.2"
    );

    // 2. Vertical ScrollTrigger Cards
    const cards = gsap.utils.toArray('.feature-card');
    cards.forEach((card: any, i) => {
      gsap.fromTo(card, 
        { y: 60, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: "power2.out",
          scrollTrigger: {
            trigger: card,
            start: "top 85%",
            toggleActions: "play none none reverse",
          }
        }
      );
    });

    // 3. Floating Animation for abstract shapes
    gsap.to(".float-anim", {
      y: -20,
      rotation: 5,
      duration: 3,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
      stagger: 0.5
    });

    // 4. Horizontal Scroll Section
    mm.add("(min-width: 768px)", () => {
      const scrollSection = document.querySelector('.horizontal-container');
      const scrollWrapper = document.querySelector('.horizontal-wrapper');
      if (scrollSection && scrollWrapper) {
        const getScrollAmount = () => -(scrollWrapper.scrollWidth - window.innerWidth);
        
        gsap.to(scrollWrapper, {
          x: getScrollAmount,
          ease: "none",
          scrollTrigger: {
            trigger: scrollSection,
            start: "top top",
            end: () => `+=${scrollWrapper.scrollWidth}`,
            pin: true,
            scrub: true,
            invalidateOnRefresh: true,
          }
        });
      }
    });

    // 5. Word reveal for manifesto
    const splitText = gsap.utils.toArray('.manifesto-text span');
    if (splitText.length > 0) {
      gsap.fromTo(splitText,
        { opacity: 0.2, y: 20 },
        {
          opacity: 1,
          y: 0,
          stagger: 0.1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: '.manifesto-section',
            start: "top 80%",
            end: "bottom 60%",
            scrub: true,
          }
        }
      );
    }

    // 6. Grid items animation (Archival Section)
    const gridItems = gsap.utils.toArray('.archival-item');
    if (gridItems.length > 0) {
      gsap.fromTo(gridItems,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "power3.out",
          stagger: 0.15,
          scrollTrigger: {
            trigger: '.archival-section',
            start: "top 85%",
          }
        }
      );
    }

    // 7. Marquee Animation
    const marqueeInner = document.querySelector('.marquee-inner');
    if (marqueeInner) {
      gsap.to(marqueeInner, {
        xPercent: -50,
        ease: "none",
        duration: 30,
        repeat: -1,
      });
    }

    // 8. Large Photo Reveal (Clip Path)
    const revealImage = document.querySelector('.reveal-image-container');
    if (revealImage) {
      gsap.fromTo(revealImage, 
        { clipPath: "inset(40% 40% 40% 40%)" },
        { 
          clipPath: "inset(0% 0% 0% 0%)",
          ease: "none",
          scrollTrigger: {
            trigger: '.reveal-section',
            start: "top center",
            end: "bottom center",
            scrub: true,
          }
        }
      );
    }
    
    // 9. Kinetic Text
    const kineticTexts = gsap.utils.toArray('.kinetic-text');
    kineticTexts.forEach((text: any, index) => {
      gsap.to(text, {
        x: index % 2 === 0 ? '-10vw' : '10vw',
        ease: 'none',
        scrollTrigger: {
          trigger: '.kinetic-section',
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        }
      });
    });

    // 10. Contributors List items
    const contributors = gsap.utils.toArray('.contributor-row');
    contributors.forEach((row: any) => {
        gsap.fromTo(row,
            { opacity: 0, x: -50 },
            { 
               opacity: 1, 
               x: 0, 
               duration: 0.8,
               ease: "power3.out",
               scrollTrigger: {
                   trigger: row,
                   start: "top 90%",
               }
            }
        );
    });

    // 11. Parallax Images
    const parallaxImgs = gsap.utils.toArray('.parallax-img');
    if (parallaxImgs.length > 0) {
      parallaxImgs.forEach((img: any) => {
        const speed = parseFloat(img.getAttribute('data-speed') || "1");
        gsap.to(img, {
          y: () => -100 * speed,
          ease: "none",
          scrollTrigger: {
            trigger: '.parallax-container',
            start: "top bottom",
            end: "bottom top",
            scrub: true
          }
        });
      });
    }

    // 12. Stacked Cards
    mm.add("(min-width: 768px)", () => {
      const stackCards = gsap.utils.toArray('.stack-card');
      if (stackCards.length > 0) {
        stackCards.forEach((card: any, i) => {
          if (i !== stackCards.length - 1) { // Don't scale down the very last one
            gsap.to(card, {
              scale: 0.9,
              opacity: 0.3,
              filter: "blur(4px)",
              scrollTrigger: {
                trigger: card,
                start: "top 15%",
                endTrigger: '.stack-container',
                end: "bottom bottom",
                scrub: true,
              }
            });
          }
        });
      }
    });

    // 13. Hover Reveal Effect (Image Slice)
    const archivalItems = gsap.utils.toArray('.archival-item');
    archivalItems.forEach((item: any) => {
       const img = item.querySelector('.hover-reveal-img');
       if (img) {
          gsap.set(img, { clipPath: 'inset(50% 50% 50% 50%)' });
          item.addEventListener('mouseenter', () => {
             gsap.to(img, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.6, ease: 'power3.out' });
          });
          item.addEventListener('mouseleave', () => {
             gsap.to(img, { clipPath: 'inset(50% 50% 50% 50%)', duration: 0.6, ease: 'power3.out' });
          });
       }
    });

    return () => {
       cleanups.forEach(cleanup => cleanup());
    };
  }, { scope: container });

  return (
    <main ref={container} className="relative w-full overflow-hidden bg-[#0A0A0A] text-white font-sans cursor-none selection:bg-white/30 selection:text-white">
      <AudioController />

      {/* --- GLOBAL SCROLL PROGRESS --- */}
      <div className="fixed top-0 left-0 w-full h-[2px] bg-white/10 z-[190] pointer-events-none">
         <div className="scroll-progress h-full bg-white origin-left scale-x-0"></div>
      </div>

      {/* --- FULLSCREEN MENU OVERLAY --- */}
      <div className={`fixed inset-0 z-[150] ${menuOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}>
         <div className="menu-overlay absolute inset-0 bg-[#0A0A0A] flex flex-col justify-center items-center" style={{ clipPath: 'inset(0% 0% 100% 0%)' }}>
             <nav className="flex flex-col text-center gap-4 md:gap-8 mt-8 md:mt-16 w-full px-6">
                {['Editorial', 'Features', 'Issues', 'Archive', 'About'].map((item, i) => (
                    <div key={i} className="overflow-hidden p-6 -m-6">
                       <a href={`#${item.toLowerCase()}`} onClick={(e) => { 
                          e.preventDefault(); 
                          setMenuOpen(false); 
                          const target = document.querySelector(`#${item.toLowerCase()}`);
                          if (target && (window as any).lenis) {
                             (window as any).lenis.scrollTo(target);
                          }
                       }} className="menu-link block text-[13vw] sm:text-[10vw] md:text-8xl font-black uppercase tracking-tighter hover:text-white/50 transition-colors duration-700 pointer-events-auto leading-[0.85] pb-2">{item}</a>
                    </div>
                ))}
             </nav>
             <div className="absolute bottom-12 left-12 text-[10px] uppercase tracking-[0.3em] text-white/40 font-semibold">
                Network Online
             </div>
             <div className="absolute bottom-12 right-12 text-[10px] uppercase tracking-[0.3em] text-white/40 font-semibold">
                v2.0.4
             </div>
         </div>
      </div>

      {/* --- CUSTOM CURSOR --- */}
      <div className="custom-cursor fixed top-0 left-0 w-4 h-4 bg-white rounded-full pointer-events-none z-[180] mix-blend-difference transform -translate-x-1/2 -translate-y-1/2 hidden md:block"></div>
      <div className="custom-cursor-follower text-[10px] uppercase tracking-widest font-bold fixed top-0 left-0 pointer-events-none z-[180] text-white transform -translate-x-1/2 -translate-y-1/2 mt-8 hidden md:block opacity-0">EXPLORE</div>

      {/* --- PRELOADER --- */}
      <div className="preloader fixed inset-0 z-[170] bg-[#111] flex flex-col items-center justify-center text-white">
        <div className="overflow-hidden">
          <h1 className="text-5xl md:text-8xl font-black uppercase tracking-tighter z-10 flex">
            <span className="preloader-title-inner block">THE</span>
            <span className="preloader-title-inner block ml-4">ARCHIVE</span>
          </h1>
        </div>
        <div className="preloader-counter text-[10px] tracking-[0.5em] font-semibold mt-8 text-white/40">0%</div>
        <div className="absolute bottom-0 left-0 w-full h-[2px] bg-white/10">
          <div className="preloader-bar h-full bg-white w-0" style={{ transformOrigin: 'left' }}></div>
        </div>
      </div>
      
      {/* --- HERO SECTION --- */}
      <section className="relative flex flex-col justify-center min-h-screen px-6 md:px-12 border-b border-white/10 overflow-hidden">
        {/* Navigation roughly adapted to match styling theme */}
        <nav className={`fixed top-0 left-0 w-full flex justify-between items-center px-6 md:px-12 py-2 border-b z-[160] pointer-events-none transition-colors duration-500 ${menuOpen ? 'border-transparent bg-transparent' : 'border-white/10 backdrop-blur-md bg-[#0A0A0A]/70'}`}>
          <div className="flex items-center gap-4 hero-sub magnetic cursor-pointer p-4 -ml-4 pointer-events-auto">
            <div className="w-10 h-10 bg-white text-black flex items-center justify-center font-black rounded-sm">A</div>
            <span className="text-xs tracking-[0.3em] font-semibold uppercase hidden sm:block">THE ARCHIVE</span>
          </div>
          <div className="flex items-center gap-4 hero-sub pointer-events-auto">
            <button onClick={() => setMenuOpen(!menuOpen)} className="magnetic px-8 py-3 border border-white/20 text-white text-[11px] font-bold tracking-widest uppercase hover:bg-white hover:text-black transition-[background-color,color] duration-700 min-w-[120px]">
              {menuOpen ? 'Close' : 'Menu'}
            </button>
            <button className="magnetic px-8 py-3 border border-white/20 text-white text-[11px] font-bold tracking-widest uppercase hover:bg-white hover:text-black transition-[background-color,color] duration-700 hidden sm:block">
              Subscribe
            </button>
          </div>
        </nav>

        <div className="relative z-10 w-full max-w-7xl mx-auto flex flex-col justify-center perspective-1000 mt-30">
          
          <div className="overflow-hidden py-2" style={{ lineHeight: 0.85 }}>
            <h1 className="hero-text block text-[15vw] md:text-[140px] leading-[0.85] font-black uppercase tracking-tighter">
              RADICAL
            </h1>
          </div>
          <div className="overflow-hidden py-2" style={{ lineHeight: 0.85 }}>
            <h1 className="hero-text block text-[15vw] md:text-[140px] leading-[0.85] font-black uppercase tracking-tighter text-transparent" style={{ WebkitTextStroke: "1px rgba(255,255,255,0.4)" }}>
              FUTURES.
            </h1>
          </div>
          <p className="hero-sub mt-12 text-lg text-white/50 max-w-lg leading-relaxed">
            Exploring the intersection of brutalist architecture, digital sanctuaries, and the evolving landscape of modern human interaction.
          </p>
          
          <div className="hero-sub mt-20 flex gap-8">
            <div className="flex flex-col">
              <span className="text-[40px] font-light">04<span className="text-sm">/</span></span>
              <span className="text-[9px] uppercase tracking-widest text-white/30">Volume</span>
            </div>
            <div className="flex flex-col border-l border-white/20 pl-8">
              <span className="text-[40px] font-light">24<span className="text-sm">/</span></span>
              <span className="text-[9px] uppercase tracking-widest text-white/30">Year</span>
            </div>
            <div className="flex flex-col border-l border-white/20 pl-8 hidden sm:flex">
                <span className="text-[40px] font-light">128<span className="text-sm">pg</span></span>
                <span className="text-[9px] uppercase tracking-widest text-white/30">Edition</span>
            </div>
          </div>
        </div>
      </section>

      {/* --- MANIFESTO SECTION --- */}
      <section id="editorial" className="manifesto-section px-6 md:px-12 py-40 max-w-7xl mx-auto border-b border-white/10 flex flex-col items-center text-center">
        <span className="text-[10px] uppercase tracking-[0.5em] text-white/40 block mb-12 font-semibold">Editorial Note</span>
        <h2 className="manifesto-text text-3xl md:text-5xl lg:text-7xl font-sans font-medium leading-tight md:leading-[1.1] max-w-5xl tracking-tight">
          {manifestText.split(" ").map((word, i) => (
            <span key={i} className="inline-block mr-[1.5vw] mb-4">{word}</span>
          ))}
        </h2>
      </section>

      {/* --- VERTICAL FEATURE SECTION --- */}
      <section id="features" className="px-6 md:px-12 py-32 max-w-7xl mx-auto border-b border-white/10">
        <div className="mb-20">
            <span className="text-[10px] uppercase tracking-[0.5em] text-white/40 block mb-4 font-semibold">Table of Contents</span>
            <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-none">Featured<br/>Articles.</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 border-t border-l border-white/10">
          {[
            { title: "Concrete Dreams", desc: "An architectural deep-dive into the resurgence of mid-century brutalism in urban centers." },
            { title: "Silicon Silence", desc: "How to disconnect in an era of ubiquitous computing and find peace offline." },
            { title: "The New Meta", desc: "Digital fashion and the blurring line between physical garments and virtual identity." }
          ].map((feature, i) => (
            <div key={i} className="feature-card p-10 border-r border-b border-white/10 flex flex-col justify-between group hover:bg-white/5 transition-[background-color] duration-700 cursor-pointer min-h-[320px]">
              <div className="flex justify-between items-start mb-16">
                <div className="w-12 h-12 border border-white/20 flex items-center justify-center float-anim group-hover:bg-white transition-[background-color] duration-700">
                  <div className="w-2 h-2 bg-white group-hover:bg-black transition-[background-color] duration-700"></div>
                </div>
                <span className="text-[10px] opacity-40 uppercase tracking-widest">0{i + 1} / Article</span>
              </div>
              <div>
                <h3 className="text-2xl font-bold uppercase mb-4 tracking-tight">{feature.title}</h3>
                <p className="text-[11px] text-white/40 uppercase tracking-[0.15em] leading-relaxed">{feature.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* --- ARCHIVAL GRID SECTION --- */}
      <section id="archive" className="archival-section px-6 md:px-12 py-32 max-w-7xl mx-auto border-b border-white/10">
        <div className="mb-16">
            <span className="text-[10px] uppercase tracking-[0.5em] text-white/40 block mb-4 font-semibold">From the Archives</span>
            <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-none">Curated<br/>Fragments.</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {archivalGrid.map((item, i) => {
            const isLarge = i === 0;
            const isWide = i === 3;
            
            return (
              <Link key={i} href={`/article/${item.id}`} className={`${isLarge ? 'md:col-span-2 md:row-span-2' : isWide ? 'md:col-span-2' : 'md:col-span-1'} archival-item bg-[#111] border border-white/10 p-8 flex flex-col justify-between ${isLarge ? 'min-h-[400px] md:min-h-[600px]' : 'min-h-[250px] md:min-h-[300px]'} relative overflow-hidden group cursor-pointer block`}>
                <Image src={`https://picsum.photos/seed/${item.img}/800/800`} alt={item.title} fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" className="object-cover opacity-20 grayscale transition-transform duration-700 group-hover:scale-105" referrerPolicy="no-referrer" />
                <div className="hover-reveal-img absolute inset-0 z-0 pointer-events-none">
                   <Image src={`https://picsum.photos/seed/${item.img}/800/800`} alt={item.title} fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" className="object-cover opacity-80" referrerPolicy="no-referrer" />
                </div>
                <div className="relative z-10 flex justify-between w-full">
                   <span className="text-[10px] uppercase tracking-[0.3em] text-white/60 drop-shadow-md bg-black/40 px-2 py-1 rounded backdrop-blur-md">Vol. {item.vol}</span>
                   <div className="w-8 h-8 rounded-full border border-white/30 flex items-center justify-center backdrop-blur-md bg-black/20 group-hover:bg-white group-hover:text-black transition-[background-color,color] duration-700">
                     <span className="text-xs">+</span>
                   </div>
                </div>
                <div className="relative z-10 mt-auto bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 -mx-8 -mb-8 pt-12">
                  <h3 className={`${isLarge ? 'text-3xl' : 'text-xl'} font-black uppercase tracking-tighter mb-2 drop-shadow-md`}>{item.title}</h3>
                  <p className="text-[11px] text-white/90 uppercase tracking-widest leading-relaxed drop-shadow-md max-w-sm line-clamp-2">{item.desc}</p>
                </div>
              </Link>
            )
          })}
          
          <div className="md:col-span-2 archival-item bg-[#111] border border-white/10 p-8 flex flex-col justify-between min-h-[250px]">
            <div className="flex justify-between items-start mb-6">
              <span className="text-[10px] uppercase tracking-[0.3em] text-white/40">Quote</span>
              <span className="text-xl text-white/20 font-black">&quot;</span>
            </div>
            <div>
              <p className="text-xl md:text-2xl font-medium tracking-tight mb-4 text-white/80">&quot;Space is the breath of art. We must learn to design the emptiness as much as the form.&quot;</p>
              <p className="text-[9px] uppercase tracking-widest text-white/40">— Frank Lloyd Wright</p>
            </div>
          </div>

          <div className="md:col-span-2 archival-item bg-[#111] border border-white/10 p-8 flex flex-col justify-between min-h-[250px] relative">
            <span className="text-[10px] uppercase tracking-[0.3em] text-white/40">Statistic</span>
            <div className="mt-8">
               <span className="text-5xl font-light block mb-2">84<span className="text-lg text-white/40">%</span></span>
               <p className="text-[10px] uppercase tracking-widest text-white/40">Of modern concrete structures will outlast their original purpose.</p>
            </div>
          </div>
        </div>
      </section>

      {/* --- STACKED CARDS SECTION --- */}
      <section id="issues" className="stack-container relative py-20 md:py-32 px-6 md:px-12 max-w-5xl mx-auto md:block">
         <div className="mb-16 md:mb-32 text-center">
            <span className="text-[10px] uppercase tracking-[0.5em] text-white/40 block mb-4 font-semibold">Core Principles</span>
            <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-none">The Foundation.</h2>
         </div>
         
         {[...corePrinciples].map((card, i) => (
           <div key={i} className="stack-card sticky w-full min-h-[30vh] md:min-h-[40vh] bg-[#111] border border-white/20 p-8 md:p-16 mb-12 md:mb-24 flex flex-col justify-between" style={{ zIndex: i, top: `${15 + (i * 2)}vh` }}>
              <div className="flex justify-between items-start">
                 <span className="text-[10px] uppercase tracking-[0.3em] text-white/40">Principle {i + 1}</span>
                 <span className="text-6xl md:text-8xl font-black text-transparent opacity-50" style={{ WebkitTextStroke: "1px rgba(255,255,255,0.3)" }}>0{i + 1}</span>
              </div>
              <div className="max-w-2xl mt-8 md:mt-0">
                 <h3 className="text-3xl md:text-5xl font-black uppercase tracking-tighter mb-4 md:mb-6">{card.title}</h3>
                 <p className="text-sm md:text-lg text-white/60 font-light leading-relaxed">{card.desc}</p>
              </div>
           </div>
         ))}
      </section>

      {/* --- KINETIC TYPOGRAPHY SECTION --- */}
      <section className="kinetic-section py-32 overflow-hidden bg-white text-black border-b border-black/10">
        <div className="flex flex-col gap-4">
          <h2 className="kinetic-text text-7xl md:text-[12vw] font-black uppercase tracking-tighter leading-none whitespace-nowrap -ml-[10vw]">Pushing Boundaries</h2>
          <h2 className="kinetic-text text-7xl md:text-[12vw] font-black uppercase tracking-tighter leading-none whitespace-nowrap ml-[10vw] text-transparent" style={{ WebkitTextStroke: "2px black" }}>Defying Gravity</h2>
          <h2 className="kinetic-text text-7xl md:text-[12vw] font-black uppercase tracking-tighter leading-none whitespace-nowrap -ml-[5vw]">Shaping Reality</h2>
        </div>
      </section>

      {/* --- LARGE PHOTO REVEAL SECTION --- */}
      <section className="reveal-section h-[150vh] relative border-b border-white/10">
        <div className="sticky top-0 h-screen w-full flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center z-0">
             <h2 className="text-6xl md:text-[8vw] font-black uppercase tracking-tighter text-white/10">Expand.</h2>
          </div>
          <div className="reveal-image-container w-full h-full relative z-10" style={{ clipPath: "inset(40% 40% 40% 40%)" }}>
             <Image src="https://picsum.photos/seed/fullwidth/1920/1080" alt="Full Width" fill sizes="100vw" className="object-cover grayscale" referrerPolicy="no-referrer" />
          </div>
        </div>
      </section>

      {/* --- HORIZONTAL SCROLL SECTION --- */}
      <section className="horizontal-container md:h-screen relative flex items-center border-b border-white/10 md:shadow-2xl py-24 md:py-0 overflow-hidden">
        <div className="absolute top-12 left-12 z-10 flex gap-4 items-center">
            <div className="w-4 h-4 border border-white/40 animate-pulse"></div>
            <h2 className="text-[10px] font-semibold text-white/40 uppercase tracking-[0.5em]">Photo Essay</h2>
        </div>
        
        {/* The wrapper that smoothly moves leftwards mapped to vertical scroll */}
        <div className="horizontal-wrapper flex flex-col md:flex-row gap-8 md:gap-12 px-6 md:px-[10vw] mt-16 md:mt-0 md:flex-nowrap items-center md:h-full w-full md:w-max">
          {photoEssay.map((item, i) => (
             <Link href={`/article/photo-${item.img}`} key={i} className="w-full md:w-[45vw] h-[50vh] md:h-[65vh] shrink-0 border border-white/10 p-0 bg-[#000] relative group flex flex-col justify-between overflow-hidden cursor-pointer block">
                <Image src={`https://picsum.photos/seed/${item.img}/1200/800`} alt={item.title} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover opacity-30 group-hover:opacity-80 transition-opacity duration-700 grayscale" referrerPolicy="no-referrer" />
                <div className="relative z-10 p-8 md:p-12 flex justify-between items-start h-full flex-col">
                    <div className="flex justify-between items-start w-full">
                       <div className="text-[10px] uppercase tracking-[0.3em] text-white/80 mix-blend-difference">Plate 0{i + 1}</div>
                       <div className="text-4xl md:text-6xl font-black text-transparent transition-all duration-500 group-hover:scale-110 drop-shadow-md" style={{ WebkitTextStroke: "1px rgba(255,255,255,0.6)" }}>0{i + 1}</div>
                    </div>
                    <div>
                       <h3 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-4 mix-blend-difference pb-2 border-b border-white/20">{item.title}</h3>
                       <p className="text-[11px] uppercase tracking-widest text-white max-w-sm mix-blend-difference drop-shadow-md">{item.desc}</p>
                    </div>
                </div>
             </Link>
          ))}
        </div>
      </section>

      {/* --- PARALLAX GALLERY SECTION --- */}
      <section className="parallax-container relative h-[120vh] overflow-hidden border-b border-white/10 flex items-center justify-center">
          <div className="absolute inset-0 z-0">
            <div className="parallax-img absolute top-[10%] left-[5%] w-[35vw] h-[45vh] grayscale opacity-30" data-speed="1.2">
               <Image src="https://picsum.photos/seed/px1/800/1000" alt="Parallax 1" fill sizes="(max-width: 768px) 50vw, 35vw" className="object-cover" referrerPolicy="no-referrer" />
            </div>
            <div className="parallax-img absolute top-[30%] right-[5%] w-[25vw] h-[55vh] grayscale opacity-40" data-speed="0.6">
               <Image src="https://picsum.photos/seed/px2/600/1200" alt="Parallax 2" fill sizes="(max-width: 768px) 50vw, 25vw" className="object-cover" referrerPolicy="no-referrer" />
            </div>
            <div className="parallax-img absolute bottom-[-10%] left-[20%] w-[45vw] h-[35vh] grayscale opacity-20" data-speed="1.8">
               <Image src="https://picsum.photos/seed/px3/1200/800" alt="Parallax 3" fill sizes="(max-width: 768px) 50vw, 45vw" className="object-cover" referrerPolicy="no-referrer" />
            </div>
          </div>
          <h2 className="relative z-10 text-[15vw] md:text-[12vw] font-black uppercase tracking-tighter text-white mix-blend-exclusion leading-none">
            Perspective.
          </h2>
      </section>

      {/* --- CONTRIBUTORS SECTION --- */}
      <section id="about" className="px-6 md:px-12 py-32 max-w-7xl mx-auto border-b border-white/10">
        <div className="mb-20 grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
              <span className="text-[10px] uppercase tracking-[0.5em] opacity-40 block mb-4 font-semibold">The Collective</span>
              <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-none">Voices in<br/>Print.</h2>
            </div>
            <div className="flex items-end">
              <p className="text-sm opacity-50 leading-relaxed max-w-md uppercase tracking-widest">A diverse network of architects, thinkers, photographers, and critics shaping the discourse of contemporary design.</p>
            </div>
        </div>
        
        <div className="border-t border-white/10 flex flex-col">
          {contributors.map((person, i) => (
             <div key={i} className="contributor-row flex flex-col sm:flex-row sm:items-center justify-between py-8 border-b border-white/10 group cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 px-4 -mx-4 transition-[background-color] duration-700">
                <div className="text-[10px] uppercase tracking-[0.3em] opacity-40 w-48 mb-4 sm:mb-0">{person.role}</div>
                <div className="text-3xl md:text-5xl font-black uppercase tracking-tighter group-hover:pl-4 transition-all duration-700">{person.name}</div>
                <div className="text-[10px] uppercase tracking-[0.3em] opacity-40 mt-4 sm:mt-0 text-right">{person.location}</div>
             </div>
          ))}
        </div>
      </section>

      {/* --- MARQUEE DIVIDER --- */}
      <section className="py-8 border-b border-white/10 overflow-hidden bg-black/10 flex items-center mix-blend-difference">
        <div className="marquee-container whitespace-nowrap flex w-full">
            <div className="marquee-inner flex font-black text-6xl uppercase tracking-tighter text-transparent" style={{ WebkitTextStroke: "1px rgba(255,255,255,0.2)" }}>
               {[...Array(6)].map((_, i) => (
                  <span key={i} className="mx-8 opacity-50">ARCHIVE</span>
               ))}
            </div>
        </div>
      </section>

      {/* --- NEWSLETTER CTA --- */}
      <section className="px-6 md:px-12 py-32 max-w-7xl mx-auto border-b border-white/10">
        <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between mb-16 gap-8">
          <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none">Stay<br/>Informed.</h2>
          <p className="text-[11px] uppercase tracking-[0.2em] opacity-40 max-w-xs leading-loose">Join our secure dispatch for exclusive editorial releases and early access to print runs. No spam, just architecture.</p>
        </div>
        <div className="relative group w-full min-h-[80px]">
        {!isSubscribed ? (
          <form className="absolute inset-0 w-full" onSubmit={(e) => { e.preventDefault(); setIsSubscribed(true); }}>
             <input required type="email" placeholder="ENTER EMAIL ADDRESS" className="w-full bg-transparent border-b-2 border-white/20 pb-4 text-[6vw] md:text-5xl font-black uppercase tracking-tight focus:outline-none transition-[opacity] duration-700 placeholder:opacity-20 hover:placeholder:opacity-50" />
             <button type="submit" className="magnetic absolute right-0 bottom-6 md:bottom-6 text-[11px] font-bold uppercase tracking-[0.2em] hover:opacity-60 transition-[opacity] duration-700 bg-[#0A0A0A] bg-opacity-80 backdrop-blur-sm md:bg-transparent pl-4 pb-2 md:pb-0">Submit -{">"}</button>
          </form>
         ) : (
          <div className="absolute inset-0 w-full flex items-center justify-start border-b-2 border-white/20 pb-4">
             <span className="text-[6vw] md:text-5xl font-black uppercase tracking-tight opacity-50">Transmission Confirmed.</span>
          </div>
         )}
        </div>
      </section>

      {/* --- OUTRO SECTION --- */}
      <section className="py-40 px-6 md:px-12 text-center feature-card flex flex-col items-center justify-center min-h-[60vh]">
        <h2 className="text-[12vw] md:text-8xl font-black uppercase tracking-tighter mb-8 block leading-none">Get the print.</h2>
        <p className="text-[11px] uppercase tracking-[0.2em] opacity-40 max-w-2xl mx-auto mb-16 leading-loose">
          Experience the tactile sensation of heavy paperweight and high-contrast ink. Available in limited quantities.
        </p>
        <button className="magnetic px-10 py-5 border border-white bg-white text-black text-[11px] font-bold tracking-[0.2em] uppercase hover:bg-transparent hover:text-white transition-colors duration-700">
          Order Now
        </button>
      </section>

      {/* Footer Bar */}
      <footer className="py-6 min-h-[5rem] flex flex-col sm:flex-row items-center px-6 md:px-12 justify-between border-t border-white/10 text-[10px] tracking-[0.2em] opacity-40 uppercase font-medium gap-4">
        <div>Platform: Print & Digital Integration</div>
      </footer>

    </main>
  );
}
