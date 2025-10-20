import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Hero */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-6 py-16 text-center bg-[radial-gradient(circle_at_50%_0%,rgba(138,43,226,0.15),transparent_60%)]" style={{ backgroundImage: 'linear-gradient(180deg, #1a1a2e 0%, #0a0a0a 100%)' }}>
        <h1 className="font-extrabold leading-tight tracking-tight max-w-5xl mb-6" style={{ fontSize: 'clamp(2.4rem,6vw,4.5rem)', letterSpacing: '-0.06em' }}>
          Feeling frustrated that your hair just refuses to grow — no matter what you use?
        </h1>
        <p className="opacity-85 font-light max-w-3xl mb-8" style={{ fontSize: 'clamp(1rem,2.2vw,1.3rem)', lineHeight: 1.7 }}>
          You've spent time, money, and hope on oils, creams, and "miracle" products... yet your edges still look thin and your hairline hasn't bounced back.
          <br className="hidden md:block" />
          It's not that your hair can't grow — something's blocking it.
        </p>
        <button
          onClick={() => navigate('/quiz')}
          className="relative inline-flex items-center justify-center rounded-full px-10 py-4 font-semibold text-white shadow-2xl transition-transform duration-300"
          style={{
            backgroundImage: 'linear-gradient(135deg, #ff6b6b 0%, #ff8e53 50%, #feca57 100%)',
            boxShadow: '0 20px 60px rgba(255,107,107,0.5)'
          }}
          aria-label="Start the Quiz"
        >
          <span>Start the Quiz</span>
          <ArrowRight className="w-5 h-5 ml-3" />
        </button>
        <div className="mt-8 flex flex-col items-center gap-2">
          <div className="text-sm opacity-80 text-center">
            ✓ Takes 3 mins ✓ Completely free ✓ Immediate recommendations
          </div>
          <div className="text-sm opacity-80 font-medium">Made by nature and backed by science.</div>
        </div>
      </section>

      {/* Section: 3 Cards */}
      <section className="min-h-screen flex flex-col items-center justify-center px-6 py-20">
        <h2 className="text-center font-extrabold mb-16 max-w-4xl" style={{ fontSize: 'clamp(2rem,5vw,3.5rem)', letterSpacing: '-0.04em' }}>
          We're going to uncover and improve these 3 key things
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-6xl w-full">
          {[
            { icon: '🔬', title: 'Your Hair Growth Blockers', text: "What's silently stopping your hair from responding." },
            { icon: '🔍', title: 'Your Daily Hair Care Gaps', text: 'Small habits that may be slowing down your results.' },
            { icon: '💡', title: 'Your Personalized Growth Strategy', text: 'The exact steps to restart and speed up your hair growth.' },
          ].map((c) => (
            <div key={c.title} className="rounded-2xl p-10 border border-white/10 bg-white/5 backdrop-blur-md transition-transform duration-300 hover:-translate-y-2 hover:border-[rgba(138,43,226,0.4)]">
              <div className="w-[70px] h-[70px] mx-auto mb-6 rounded-full flex items-center justify-center text-2xl" style={{ backgroundImage: 'linear-gradient(135deg,#fbbf24,#f59e0b)' }}>
                {c.icon}
              </div>
              <h3 className="text-xl font-bold mb-3">{c.title}</h3>
              <p className="text-white/75 leading-relaxed">{c.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Science Section */}
      <section className="min-h-screen flex flex-col items-center justify-center px-6 py-20" style={{ backgroundImage: 'linear-gradient(180deg, #0a0a0a 0%, #1a1a2e 50%, #0a0a0a 100%)' }}>
        <h2 className="text-center font-extrabold mb-10 max-w-4xl" style={{ fontSize: 'clamp(2rem,5vw,3.5rem)' }}>
          This isn't guesswork. It's backed by science.
        </h2>
        <p className="text-center max-w-3xl text-white/80 leading-8 mb-10" style={{ fontSize: 'clamp(1rem,2vw,1.2rem)' }}>
          Your answers are mapped against proven scalp and hair growth principles to help you finally break the cycle of frustration. We designed this quiz using insights from:
        </p>
        <div className="max-w-3xl w-full text-left bg-white/5 border-l-4 border-[#fbbf24] rounded-xl p-8 backdrop-blur">
          <ul className="space-y-5 text-white/85">
            <li className="flex gap-3"><span className="text-green-400 font-bold">✓</span> <span>Trichology research on scalp health and hair follicle stimulation</span></li>
            <li className="flex gap-3"><span className="text-green-400 font-bold">✓</span> <span>Clinical studies on hair loss patterns in African women, including traction alopecia and breakage from protective styling</span></li>
            <li className="flex gap-3"><span className="text-green-400 font-bold">✓</span> <span>Behavioral hair-care studies showing how daily routines affect long-term growth and retention</span></li>
          </ul>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-10 mt-10 opacity-80">
          <div className="flex items-center gap-2"><span className="text-yellow-400">⚡</span><span>Backed by Research</span></div>
          <div className="flex items-center gap-2"><span className="text-yellow-400">⚡</span><span>Made for African Hair</span></div>
          <div className="flex items-center gap-2"><span className="text-yellow-400">⚡</span><span>AI Results-Focused</span></div>
        </div>
        <div className="mt-10">
          <button
            onClick={() => navigate('/quiz')}
            className="rounded-full px-10 py-4 font-semibold text-white"
            style={{ backgroundImage: 'linear-gradient(135deg, #ff6b6b 0%, #ff8e53 50%, #feca57 100%)', boxShadow: '0 20px 60px rgba(255,107,107,0.5)' }}
            aria-label="Start the Quiz"
          >
            Start the Quiz
            <ArrowRight className="inline w-5 h-5 ml-2" />
          </button>
          <div className="mt-4 text-sm opacity-80">✓ Takes 3 mins · ✓ Completely free · ✓ Immediate recommendations</div>
        </div>
      </section>

      {/* Mobile sticky CTA */}
      <div className="md:hidden fixed bottom-4 left-0 right-0 flex justify-center px-4">
        <button
          onClick={() => navigate('/quiz')}
          className="w-full max-w-md inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-white"
          style={{ backgroundImage: 'linear-gradient(135deg, #ff6b6b 0%, #ff8e53 50%, #feca57 100%)' }}
          aria-label="Start the Quiz"
        >
          Start the Quiz
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default Index;
