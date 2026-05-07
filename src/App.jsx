import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, useScroll, useSpring, useTransform } from 'framer-motion';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  BookOpen,
  HandHeart,
  Mic,
  MessageCircle,
  Sparkles,
  Users,
  Vote,
} from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const fadeUp = {
  hidden: { opacity: 0, y: 44, filter: 'blur(14px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] },
  },
};

function useLenis() {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.35,
      smoothWheel: true,
      wheelMultiplier: 0.82,
      touchMultiplier: 1.15,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);
    return () => lenis.destroy();
  }, []);
}

function useAttentionMoments() {
  const [fastScroll, setFastScroll] = useState(false);
  const [idle, setIdle] = useState(false);

  useEffect(() => {
    let lastY = window.scrollY;
    let fastTimer;
    let idleTimer;
    let idleHideTimer;

    const resetIdle = () => {
      setIdle(false);
      clearTimeout(idleTimer);
      clearTimeout(idleHideTimer);
      idleTimer = setTimeout(() => {
        setIdle(true);
        idleHideTimer = setTimeout(() => setIdle(false), 3600);
      }, 9000);
    };

    const onScroll = () => {
      const delta = Math.abs(window.scrollY - lastY);
      if (delta > 135) {
        setFastScroll(true);
        clearTimeout(fastTimer);
        fastTimer = setTimeout(() => setFastScroll(false), 2200);
      }
      lastY = window.scrollY;
      resetIdle();
    };

    const events = ['scroll', 'mousemove', 'keydown', 'touchstart'];
    events.forEach((event) => window.addEventListener(event, resetIdle, { passive: true }));
    window.addEventListener('scroll', onScroll, { passive: true });
    resetIdle();

    return () => {
      events.forEach((event) => window.removeEventListener(event, resetIdle));
      window.removeEventListener('scroll', onScroll);
      clearTimeout(fastTimer);
      clearTimeout(idleTimer);
      clearTimeout(idleHideTimer);
    };
  }, []);

  return { fastScroll, idle };
}

function AmbientStage() {
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '34%']);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.75, 1], [0.2, 0.42, 0.28, 0.54]);
  const micDrift = useMemo(
    () =>
      Array.from({ length: 10 }, (_, index) => ({
        id: index,
        left: `${(index * 17 + 8) % 96}%`,
        delay: `${(index * 2.7) % 15}s`,
        duration: `${22 + (index % 6) * 4}s`,
        scale: 0.72 + (index % 4) * 0.12,
      })),
    [],
  );

  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden">
      <motion.div className="aurora" style={{ y, opacity }} />
      <div className="mic-drift-field" aria-hidden="true">
        {micDrift.map((item) => (
          <div
            key={item.id}
            className="mic-drift"
            style={{
              left: item.left,
              animationDelay: item.delay,
              animationDuration: item.duration,
              transform: `scale(${item.scale})`,
            }}
          >
            <div className="mic-drift-inner">
              <Mic size={14} />
              <span>Election date: May 9</span>
            </div>
          </div>
        ))}
      </div>
      <div className="cinema-sweep" />
      <div className="grain" />
      <div className="scanline" />
      <div className="letterbox top" />
      <div className="letterbox bottom" />
    </div>
  );
}

function ProgressRail() {
  const { scrollYProgress } = useScroll();
  const scaleY = useSpring(scrollYProgress, { stiffness: 120, damping: 28 });

  return (
    <div className="fixed right-4 top-1/2 z-40 hidden h-44 w-px -translate-y-1/2 overflow-hidden rounded-full bg-white/10 md:block">
      <motion.div className="origin-top bg-cyan-200/80" style={{ scaleY, height: '100%' }} />
    </div>
  );
}

function CursorSpotlight() {
  useEffect(() => {
    const onMove = (event) => {
      document.documentElement.style.setProperty('--cursor-x', `${event.clientX}px`);
      document.documentElement.style.setProperty('--cursor-y', `${event.clientY}px`);
    };

    window.addEventListener('pointermove', onMove);
    return () => window.removeEventListener('pointermove', onMove);
  }, []);

  return <div className="cursor-spotlight" aria-hidden="true" />;
}

function ElectionBadge() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.2, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
      className="election-badge"
    >
      <Vote size={15} />
      <span>May 9</span>
    </motion.div>
  );
}

function Opening({ onConnected }) {
  const [greeting, setGreeting] = useState('');
  const [hiAccepted, setHiAccepted] = useState(false);
  const connectionRef = useRef(null);
  const timedGreeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  }, []);

  useEffect(() => {
    if (!hiAccepted) return;

    const timer = window.setTimeout(() => {
      connectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 900);

    return () => window.clearTimeout(timer);
  }, [hiAccepted]);

  const handleGreetingChange = (event) => {
    const value = event.target.value;
    setGreeting(value);

    if (!hiAccepted && value.trim().toLowerCase() === 'hi') {
      setHiAccepted(true);
      onConnected();
    }
  };

  return (
    <header className="relative z-10">
      <section className="scene opening-scene min-h-screen">
        <div className="opening-greeting">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="type-hi"
          >
            <span className="typed-word">
              Hi<span className="cursor">.</span>
            </span>
            <span className="hi-emojis">👋 ✨</span>
          </motion.div>
          <motion.p
            initial={{ opacity: 0, y: 18, filter: 'blur(10px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ delay: 2.35, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="timed-greeting"
          >
            {timedGreeting}.
          </motion.p>
        </div>
      </section>

      <section className="scene min-h-screen">
        <motion.div
          variants={{
            visible: { transition: { staggerChildren: 1.15 } },
          }}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.75 }}
          className="max-w-5xl text-center"
        >
          {["That's it?", 'No hi back?', 'That’s rude 😐'].map((line, index) => (
            <motion.p
              key={line}
              variants={fadeUp}
              className={`cinema-line ${index === 2 ? 'micro-wobble text-white/75' : ''}`}
            >
              {line}
            </motion.p>
          ))}
        </motion.div>
      </section>

      <section className="scene min-h-screen">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.55 }}
          className="flex max-w-4xl flex-col items-center text-center"
        >
          <motion.p variants={fadeUp} className="cinema-line">
            Come on...
          </motion.p>
          <motion.p variants={fadeUp} className="cinema-line text-white/65">
            Say hi.
          </motion.p>
          <motion.div
            variants={fadeUp}
            animate={hiAccepted ? { scale: [1, 1.035, 1], borderColor: 'rgba(165, 243, 252, 0.38)' } : {}}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
            className="hi-input-shell mt-12"
          >
            <div className="flex size-12 items-center justify-center rounded-full bg-cyan-300/10 text-cyan-100">
              <Mic size={22} />
            </div>
            <label className="sr-only" htmlFor="hi-input">
              Type Hi
            </label>
            <input
              id="hi-input"
              value={greeting}
              onChange={handleGreetingChange}
              disabled={hiAccepted}
              className="hi-input"
              placeholder="Type Hi"
              autoComplete="off"
              inputMode="text"
            />
          </motion.div>
          {hiAccepted && (
            <motion.div
              initial={{ opacity: 0, y: 20, filter: 'blur(12px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ delay: 0.25, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              className="mt-16 space-y-3"
            >
              <p className="text-2xl text-white md:text-4xl">There you go.</p>
              <p className="text-xl text-white/55 md:text-3xl">Now we’re connected.</p>
            </motion.div>
          )}
        </motion.div>
      </section>

      {hiAccepted && (
        <section ref={connectionRef} className="scene min-h-[115vh]">
          <motion.div
            initial={{ opacity: 0, scale: 0.94, filter: 'blur(20px)' }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="text-center"
          >
            <p className="text-[clamp(4rem,17vw,15rem)] font-black leading-none tracking-normal text-white">
              Connection.
            </p>
            <p className="mx-auto mt-8 max-w-2xl text-balance text-xl leading-relaxed text-white/60 md:text-3xl">
              That’s where communication begins.
            </p>
          </motion.div>
        </section>
      )}
    </header>
  );
}

function Journey() {
  const steps = [
    ['01', 'The first meeting', 'A nervous smile. A speech note folded like classified evidence.'],
    ['02', 'The first brave attempt', 'A voice shakes. People still listen. That changes everything.'],
    ['03', 'Feedback becomes fuel', 'Not criticism. A map. A mirror. A surprisingly kind plot twist.'],
    ['04', 'Confidence finds rhythm', 'The room gets smaller. The voice gets clearer. The member grows.'],
  ];

  return (
    <section className="story-section">
      <div className="section-kicker gsap-reveal">Personal growth journey</div>
      <h2 className="section-title gsap-reveal">Nobody arrives confident. We become it together.</h2>
      <div className="timeline">
        {steps.map(([number, title, body], index) => (
          <motion.article
            key={number}
            initial={{ opacity: 0, x: index % 2 === 0 ? -56 : 56, rotate: index % 2 === 0 ? -1.2 : 1.2 }}
            whileInView={{ opacity: 1, x: 0, rotate: 0 }}
            transition={{ duration: 0.92, ease: [0.16, 1, 0.3, 1] }}
            viewport={{ once: true, amount: 0.55 }}
            className="timeline-card"
          >
            <span>{number}</span>
            <div>
              <h3>{title}</h3>
              <p>{body}</p>
            </div>
          </motion.article>
        ))}
      </div>
    </section>
  );
}

function Vision() {
  return (
    <section className="story-section min-h-[120vh] justify-center">
      <div className="mx-auto max-w-6xl">
        <div className="section-kicker gsap-reveal">The vision</div>
        {[
          'What if every member felt heard? :)',
          'What if meetings felt warm?',
          'What if education felt less scary?',
        ].map((line, index) => (
          <motion.h2
            key={line}
            initial={{ opacity: 0, y: 80, scale: 0.96, rotateX: 14 }}
            whileInView={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
            transition={{ duration: 0.95, delay: index * 0.12, ease: [0.16, 1, 0.3, 1] }}
            viewport={{ once: true, amount: 0.7 }}
            className={`vision-line vision-line-${index + 1}`}
          >
            {line}
          </motion.h2>
        ))}
      </div>
    </section>
  );
}

function ScratchReveal() {
  const canvasRef = useRef(null);
  const cardRef = useRef(null);
  const scratchEstimateRef = useRef(0);
  const progressStateRef = useRef(0);
  const [scratched, setScratched] = useState(false);
  const [fullyRevealed, setFullyRevealed] = useState(false);
  const [scratchProgress, setScratchProgress] = useState(0);
  const [photoMissing, setPhotoMissing] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const card = cardRef.current;
    if (!canvas || !card) return;

    const drawCover = () => {
      const rect = card.getBoundingClientRect();
      const ratio = window.devicePixelRatio || 1;
      canvas.width = rect.width * ratio;
      canvas.height = rect.height * ratio;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;

      const ctx = canvas.getContext('2d');
      ctx.scale(ratio, ratio);
      const foil = ctx.createLinearGradient(0, 0, rect.width, rect.height);
      foil.addColorStop(0, '#0d1117');
      foil.addColorStop(0.22, '#2a2520');
      foil.addColorStop(0.48, '#b08a3c');
      foil.addColorStop(0.64, '#272019');
      foil.addColorStop(1, '#10141c');
      ctx.fillStyle = foil;
      ctx.fillRect(0, 0, rect.width, rect.height);

      ctx.save();
      ctx.rotate(-0.48);
      for (let x = -rect.height; x < rect.width * 1.8; x += 15) {
        ctx.fillStyle = x % 45 === 0 ? 'rgba(255,255,255,0.13)' : 'rgba(0,0,0,0.12)';
        ctx.fillRect(x, 0, 6, rect.height * 1.8);
      }
      ctx.restore();

      for (let i = 0; i < 170; i += 1) {
        ctx.fillStyle = i % 3 === 0 ? 'rgba(255,255,255,0.11)' : 'rgba(251,191,36,0.09)';
        ctx.beginPath();
        ctx.arc(Math.random() * rect.width, Math.random() * rect.height, Math.random() * 1.4, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.fillStyle = 'rgba(0,0,0,0.32)';
      ctx.fillRect(0, 0, rect.width, 58);
      ctx.fillStyle = 'rgba(251,191,36,0.95)';
      ctx.font = '900 13px Inter, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('VPE RECHARGE CARD', 22, 35);
      ctx.fillStyle = 'rgba(255,255,255,0.56)';
      ctx.font = '800 11px Inter, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText('VALID MAY 9', rect.width - 22, 35);
      ctx.strokeStyle = 'rgba(255,255,255,0.22)';
      ctx.setLineDash([7, 8]);
      ctx.strokeRect(18, 76, rect.width - 36, rect.height - 152);
      ctx.setLineDash([]);
      ctx.fillStyle = 'rgba(255,255,255,0.82)';
      ctx.font = '900 18px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Scratch to reveal who I am', rect.width / 2, rect.height / 2 - 8);
      ctx.fillStyle = 'rgba(251,191,36,0.9)';
      ctx.font = '750 12px Inter, sans-serif';
      ctx.fillText('partial scratch opens the whole card', rect.width / 2, rect.height / 2 + 20);

      scratchEstimateRef.current = 0;
      progressStateRef.current = 0;
      setScratchProgress(0);
    };

    drawCover();
    const resizeObserver = new ResizeObserver(drawCover);
    resizeObserver.observe(card);
    return () => resizeObserver.disconnect();
  }, []);

  const scratchAt = (clientX, clientY) => {
    const canvas = canvasRef.current;
    if (!canvas || fullyRevealed) return;
    const rect = canvas.getBoundingClientRect();
    const ratio = window.devicePixelRatio || 1;
    const ctx = canvas.getContext('2d');
    const x = (clientX - rect.left) * ratio;
    const y = (clientY - rect.top) * ratio;

    ctx.save();
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x, y, 38 * ratio, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    if (!scratched) setScratched(true);

    const totalArea = canvas.width * canvas.height;
    const scratchArea = Math.PI * (38 * ratio) ** 2;
    scratchEstimateRef.current += (scratchArea / totalArea) * 1.35;

    const nextProgress = Math.min(100, Math.round(scratchEstimateRef.current * 100));
    if (nextProgress !== progressStateRef.current) {
      progressStateRef.current = nextProgress;
      setScratchProgress(nextProgress);
    }

    if (scratchEstimateRef.current > 0.22) {
      setFullyRevealed(true);
      canvas.classList.add('is-cleared');
      window.setTimeout(() => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }, 420);
    }
  };

  const handlePointerMove = (event) => {
    if (event.buttons !== 1 && event.pointerType !== 'touch') return;
    scratchAt(event.clientX, event.clientY);
  };

  const handlePointerDown = (event) => {
    scratchAt(event.clientX, event.clientY);
  };

  return (
    <section className="scratch-section">
      <motion.div
        initial={{ opacity: 0, y: 60, filter: 'blur(16px)' }}
        whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        viewport={{ once: true, amount: 0.55 }}
        className="scratch-copy"
      >
        <p className="section-kicker">Before the name reveal</p>
        <h2>First, scratch the mystery.</h2>
        <p>
          Some campaigns introduce a candidate. This one makes you work for it. Sorry for that. Yes, this was
          unnecessary. But memorable things usually are.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.94, rotate: -1.5 }}
        whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
        transition={{ delay: 0.18, duration: 1, ease: [0.16, 1, 0.3, 1] }}
        viewport={{ once: true, amount: 0.45 }}
        className={`scratch-card ${scratched ? 'is-scratched' : ''} ${fullyRevealed ? 'is-revealed' : ''}`}
        ref={cardRef}
      >
        <div className="scratch-reveal">
          <div className="portrait-frame">
            {!photoMissing && <img src="/sudhan.jpg" alt="TM Sudhan" onError={() => setPhotoMissing(true)} />}
            {photoMissing && (
              <div className="portrait-fallback">
                <span>TM</span>
                <strong>Sudhan</strong>
              </div>
            )}
          </div>
          <div className="reveal-message">
            <span>The person under the card</span>
            <h3>A listener before a leader.</h3>
            <p>I want to hear what members need, notice who is holding back, and turn education into moments people remember.</p>
          </div>
        </div>
        {!fullyRevealed && (
          <div className="scratch-progress" aria-hidden="true">
            <span style={{ width: `${Math.max(8, scratchProgress)}%` }} />
          </div>
        )}
        <div className="scratch-sparks" aria-hidden="true">
          <i />
          <i />
          <i />
          <i />
        </div>
        <canvas
          ref={canvasRef}
          className="scratch-canvas"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
        />
      </motion.div>
    </section>
  );
}

function CandidateIntro() {
  return (
    <section className="candidate-section">
      <motion.div
        initial={{ opacity: 0, y: 60, filter: 'blur(18px)' }}
        whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        viewport={{ once: true, amount: 0.58 }}
        className="candidate-copy"
      >
        <p className="section-kicker">The person asking for your vote</p>
        <h2>
          I am <span>TM Sudhan</span>.
        </h2>
        <p className="candidate-role">Standing for Vice President Education.</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        whileInView={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.25, duration: 1, ease: [0.16, 1, 0.3, 1] }}
        viewport={{ once: true, amount: 0.48 }}
        className="listening-orbit"
      >
        <div className="orbit-ring" />
        <div className="listener-core">
          <Mic size={32} />
          <span>Listening first</span>
        </div>
        <div className="voice-chip chip-one">your ideas</div>
        <div className="voice-chip chip-two">your goals</div>
        <div className="voice-chip chip-three">your courage</div>
      </motion.div>

      <motion.p
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        viewport={{ once: true, amount: 0.65 }}
        className="candidate-line"
      >
        A guy who loves hearing people before asking them to speak.
      </motion.p>
      <motion.p
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.58, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        viewport={{ once: true, amount: 0.65 }}
        className="candidate-note"
      >
        I may not have all the perfect words, but I do care about creating a space where everyone gets to find theirs.
      </motion.p>
    </section>
  );
}

function Plan() {
  const promises = [
    {
      title: 'For the member who is still nervous',
      body: 'I want education to feel like a hand on the shoulder before it becomes a stage light.',
      icon: HandHeart,
    },
    {
      title: 'For the member who has a story',
      body: 'I want every meeting to make space for voices that usually wait quietly at the edge of the room.',
      icon: Mic,
    },
    {
      title: 'For the club we are becoming',
      body: 'I want growth to feel personal, memorable, and human. Not a checklist. A journey.',
      icon: Users,
    },
  ];

  return (
    <section className="promise-section">
      <div className="section-kicker gsap-reveal">VP Education plan</div>
      <h2 className="section-title gsap-reveal">My promise is simple: nobody should feel invisible here.</h2>
      <div className="promise-stage">
        {promises.map(({ title, body, icon: Icon }, index) => (
          <motion.article
            key={title}
            initial={{
              opacity: 0,
              x: index % 2 === 0 ? -52 : 52,
              y: 28,
              filter: 'blur(16px)',
            }}
            whileInView={{ opacity: 1, x: 0, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: 0.95, delay: index * 0.16, ease: [0.16, 1, 0.3, 1] }}
            viewport={{ once: true, amount: 0.45 }}
            className={`promise-card promise-card-${index + 1}`}
          >
            <div className="promise-icon">
              <Icon size={22} />
            </div>
            <h3>{title}</h3>
            <p>{body}</p>
          </motion.article>
        ))}
      </div>
      <motion.div
        initial={{ opacity: 0, y: 44 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        viewport={{ once: true, amount: 0.6 }}
        className="promise-closing"
      >
        <Sparkles size={20} />
        <p>
          If I become VPE, I will not just schedule speeches. I will help create moments where people leave the room
          thinking, “I did not know I could say that out loud.”
        </p>
      </motion.div>
      <motion.p
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        viewport={{ once: true, amount: 0.6 }}
        className="honest-line"
      >
        I will make mistakes, learn fast, listen better, and keep showing up.
      </motion.p>
    </section>
  );
}

function Closing() {
  return (
    <section className="ending">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.6 }}
        className="mx-auto max-w-5xl text-center"
      >
        <motion.p variants={fadeUp} className="cinema-line text-white/70">
          You scrolled this far.
        </motion.p>
        <motion.p variants={fadeUp} className="cinema-line mt-7">
          Imagine how far we can grow together.
        </motion.p>
        <motion.div variants={fadeUp} className="mx-auto my-16 h-px w-24 bg-cyan-100/50" />
        <motion.p variants={fadeUp} className="mx-auto max-w-3xl text-balance text-2xl leading-relaxed text-white/75 md:text-4xl">
          Leadership is not about holding a role.
        </motion.p>
        <motion.p variants={fadeUp} className="mx-auto mt-4 max-w-3xl text-balance text-2xl leading-relaxed text-white/75 md:text-4xl">
          It is about helping others discover their voice.
        </motion.p>
        <motion.div
          variants={fadeUp}
          whileHover={{ scale: 1.035, y: -4 }}
          whileTap={{ scale: 0.98 }}
          className="final-vote"
        >
          <Vote size={24} />
          <strong>If possible, vote for me.</strong>
        </motion.div>
        <motion.p variants={fadeUp} className="best-line">
          I will give my best.
        </motion.p>
        <motion.p variants={fadeUp} className="human-ending">
          Not because I am perfect. Because I am willing to work for this.
        </motion.p>
        <motion.p variants={fadeUp} className="election-ending">
          Election day: May 9
        </motion.p>
      </motion.div>
    </section>
  );
}

function FloatingPrompts({ fastScroll, idle }) {
  return (
    <>
      <motion.div
        initial={false}
        animate={{ opacity: fastScroll ? 1 : 0, y: fastScroll ? 0 : 18 }}
        className="moment-toast"
      >
        Whoa whoa... at least pretend to enjoy this 😭
      </motion.div>
      <motion.div
        initial={false}
        animate={{ opacity: idle ? 1 : 0, y: idle ? 0 : 18 }}
        className="idle-card"
      >
        <MessageCircle size={18} />
        <div>
          <p>Still here?</p>
          <span>Good. Attention span unlocked.</span>
        </div>
      </motion.div>
    </>
  );
}

export default function App() {
  const appRef = useRef(null);
  const [connected, setConnected] = useState(false);
  const { fastScroll, idle } = useAttentionMoments();
  useLenis();

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.utils.toArray('.gsap-reveal').forEach((element) => {
        gsap.fromTo(
          element,
          { autoAlpha: 0, y: 38, filter: 'blur(12px)' },
          {
            autoAlpha: 1,
            y: 0,
            filter: 'blur(0px)',
            duration: 1,
            ease: 'power3.out',
            scrollTrigger: { trigger: element, start: 'top 82%' },
          },
        );
      });

      gsap.to('.aurora', {
        rotate: 9,
        scale: 1.08,
        scrollTrigger: { trigger: appRef.current, start: 'top top', end: 'bottom bottom', scrub: 1.2 },
      });
    }, appRef);

    return () => ctx.revert();
  }, []);

  return (
    <main ref={appRef} className="relative min-h-screen overflow-x-clip bg-[#050505] text-white">
      <CursorSpotlight />
      <AmbientStage />
      <ProgressRail />
      <ElectionBadge />
      <FloatingPrompts fastScroll={fastScroll} idle={idle} />
      <Opening onConnected={() => setConnected(true)} />
      {connected && (
        <>
          <Journey />
          <Vision />
          <ScratchReveal />
          <CandidateIntro />
          <Plan />
          <Closing />
        </>
      )}
      <BookOpen className="pointer-events-none fixed bottom-5 left-5 z-30 hidden text-white/25 md:block" size={18} />
    </main>
  );
}
