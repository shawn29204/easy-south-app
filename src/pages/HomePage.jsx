// File: /src/pages/HomePage.jsx
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import RelocationChatAssistant from '../components/RelocationChatAssistant';

const YOUR_AI_FUNCTION_URL = 'https://ai-concierge-backend.vercel.app/api/askAI';
const YOUR_IMAGE_FUNCTION_URL = 'https://ai-concierge-backend.vercel.app/api/generateImage';
const SESSION_STORAGE_KEY = 'easy-south-session-v2';

function serialiseConversation(messages = []) {
  return messages.map((message) => ({
    id: message.id,
    role: message.role,
    text: message.text,
    createdAt: message.createdAt,
    attachments: (message.attachments || []).map((file) => ({
      id: file.id,
      name: file.name,
      size: file.size,
      type: file.type,
      previewDataUrl: file.previewDataUrl || null,
    })),
  }));
}

function mapConversationForApi(messages = []) {
  return messages.map((message) => ({
    ...message,
    attachments: (message.attachments || []).map((file) => ({
      id: file.id,
      name: file.name,
      size: file.size,
      type: file.type,
    })),
  }));
}

const generateSessionId = () => {
  if (typeof window !== 'undefined' && window.crypto && typeof window.crypto.randomUUID === 'function') {
    return window.crypto.randomUUID();
  }
  const random = Math.random().toString(16).slice(2, 10);
  return `session-${Date.now()}-${random}`;
};

const HomePage = () => {
  const navigate = useNavigate();
  const [sessionId, setSessionId] = useState(null);
  const [conversation, setConversation] = useState([]);
  const [apiError, setApiError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [recommendation, setRecommendation] = useState(null);
  const [visionImage, setVisionImage] = useState(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [imageError, setImageError] = useState(null);
  const lastImageKeyRef = useRef(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    try {
      const stored = window.localStorage.getItem(SESSION_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.sessionId) {
          setSessionId(parsed.sessionId);
        } else {
          setSessionId(generateSessionId());
        }
        if (Array.isArray(parsed.conversation)) {
          setConversation(parsed.conversation);
        }
        if (parsed.recommendation) {
          setRecommendation(parsed.recommendation);
        }
        if (parsed.visionImage) {
          setVisionImage(parsed.visionImage);
        }
      } else {
        setSessionId(generateSessionId());
      }
    } catch (error) {
      console.warn('Unable to load stored session. Starting fresh.', error);
      setSessionId(generateSessionId());
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    if (!sessionId) {
      return;
    }
    const payload = {
      sessionId,
      conversation,
      recommendation,
      visionImage,
    };
    window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(payload));
  }, [sessionId, conversation, recommendation, visionImage]);

  const askAi = useCallback(async (messages) => {
    if (!sessionId) {
      setSessionId(generateSessionId());
    }

    const payload = {
      sessionId: sessionId || generateSessionId(),
      conversation: mapConversationForApi(serialiseConversation(messages)),
    };

    const response = await fetch(YOUR_AI_FUNCTION_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Failed to reach Bright Star service.' }));
      throw new Error(errorData.message || 'Failed to reach Bright Star service.');
    }

    return response.json();
  }, [sessionId]);

  const handleConversationChange = useCallback((messages) => {
    setConversation(serialiseConversation(messages));
  }, []);

  const triggerVisionImage = useCallback(async (prompt, city) => {
    if (!prompt) {
      return;
    }
    const cacheKey = `${city || 'unknown'}|${prompt}`;
    if (lastImageKeyRef.current === cacheKey) {
      return;
    }
    lastImageKeyRef.current = cacheKey;
    setIsGeneratingImage(true);
    setImageError(null);
    try {
      const response = await fetch(YOUR_IMAGE_FUNCTION_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, aspectRatio: '16:9' }),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unable to craft visual inspiration.' }));
        throw new Error(errorData.message || 'Unable to craft visual inspiration.');
      }
      const data = await response.json();
      setVisionImage({
        imageDataUrl: data.imageDataUrl,
        promptUsed: data.promptUsed,
        city,
      });
    } catch (error) {
      console.error('Image generation error:', error);
      setImageError(error.message || 'Unable to craft visual inspiration.');
    } finally {
      setIsGeneratingImage(false);
    }
  }, []);

  const decoratedAskAi = useCallback(async (messages) => {
    setIsLoading(true);
    setApiError(null);
    try {
      const result = await askAi(messages);

      if (result.recommendedCity) {
        const recommendationPayload = {
          city: result.recommendedCity,
          rationale: result.rationale,
          summaryBullets: result.summaryBullets || [],
          imagePrompt: result.imagePrompt,
          cityDetails: result.cityDetails || null,
          userAnswerCount: result.userAnswerCount,
        };
        setRecommendation(recommendationPayload);

        if (result.imagePrompt) {
          triggerVisionImage(result.imagePrompt, result.recommendedCity);
        }
      }

      return result;
    } catch (error) {
      setApiError(error.message || 'We could not reach Bright Star right now.');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [askAi, triggerVisionImage]);

  const handlePlanRequest = useCallback(() => {
    navigate('/plan-request', { state: { conversation, recommendation, visionImage } });
  }, [navigate, conversation, recommendation, visionImage]);

  const brightStarStats = useMemo(() => ({
    totalMessages: conversation.length,
    userMessages: conversation.filter((msg) => msg.role === 'user').length,
  }), [conversation]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#070218]">
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 -left-40 h-[28rem] w-[28rem] rounded-full bg-gradient-to-br from-[#ff2e92] via-[#6f2bff] to-[#13d8ff] opacity-40 blur-3xl" />
        <div className="absolute bottom-[-160px] right-[-140px] h-[32rem] w-[32rem] rounded-full bg-gradient-to-br from-[#32d5ff] via-[#ff4db5] to-[#7d30ff] opacity-40 blur-3xl" />
        <div className="absolute inset-0 bg-polkadot-grid opacity-30 mix-blend-screen" />
      </div>

      <div className="relative z-10 text-gray-900">
        <header className="flex flex-col items-center gap-6 px-6 pt-10 pb-6 text-center">
          <div className="w-full flex items-center justify-between max-w-5xl mx-auto">
            <button
              type="button"
              className="inline-flex items-center gap-3 rounded-full border border-white/40 bg-white/70 px-4 py-2 text-base font-semibold text-gray-800 shadow-sm hover:bg-white"
              onClick={() => setIsMenuOpen(true)}
            >
              <span aria-hidden>☰</span>
              Menu
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-full bg-orange-600 px-6 py-3 text-lg font-semibold text-white shadow-lg shadow-orange-600/40 hover:bg-orange-700"
              onClick={handlePlanRequest}
            >
              Start My Plan
              <span aria-hidden>→</span>
            </button>
          </div>
          <div className="max-w-3xl mx-auto">
            <span className="inline-flex items-center text-sm tracking-widest uppercase font-semibold text-orange-600 bg-orange-100/90 px-5 py-2 rounded-full mb-4">
              Bright Star Relocation · Easy South
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white drop-shadow">
              The friendliest path to your Southern forever home.
            </h1>
            <p className="mt-6 text-lg md:text-xl text-white/85 leading-relaxed">
              Share how you want life to feel. Bright Star listens, remembers, and handcrafts a move plan that matches your pace, budget, and heart.
            </p>
            <p className="mt-5 text-base md:text-lg text-white/80 font-medium">
              {brightStarStats.userMessages >= 4
                ? 'You’re ready for a tailored city match—keep refining or request your plan anytime.'
                : `Answer ${Math.max(0, 4 - brightStarStats.userMessages)} more questions for your Bright Star city recommendation.`}
            </p>
          </div>
        </header>

        {apiError && (
          <div className="max-w-3xl mx-auto mt-6 px-6">
            <div className="bg-red-100/90 border border-red-200 text-red-700 text-base rounded-2xl px-5 py-3 backdrop-blur">
              {apiError}
            </div>
          </div>
        )}

        <section id="bright-star-chat" className="px-4 pb-16 flex justify-center">
          <RelocationChatAssistant
            conversation={conversation}
            askAi={decoratedAskAi}
            onConversationChange={handleConversationChange}
            onRequestPlan={handlePlanRequest}
            isLoading={isLoading}
            recommendation={recommendation}
            visionImage={visionImage}
            isGeneratingImage={isGeneratingImage}
            imageError={imageError}
          />
        </section>

        <section className="bg-orange-600 text-white py-14">
          <div className="max-w-4xl mx-auto text-center px-6 space-y-6">
            <h2 className="text-3xl md:text-4xl font-semibold">Ready when you are.</h2>
            <p className="text-lg md:text-xl text-white/90">
              Bright Star turns your notes into an easy-to-follow relocation blueprint—complete with neighborhoods to explore, people to meet, and next step timelines.
            </p>
            <button
              type="button"
              onClick={handlePlanRequest}
              className="inline-flex items-center gap-2 bg-white text-orange-700 font-semibold px-6 py-3 rounded-full shadow hover:bg-orange-50 transition"
            >
              Request my plan summary
              <span aria-hidden>→</span>
            </button>
          </div>
        </section>
      </div>

      {/* Slide-out menu */}
      <div
        className={`fixed inset-0 z-50 transition ${isMenuOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}
        aria-hidden={!isMenuOpen}
      >
        <div
          className={`absolute inset-0 bg-black/50 transition-opacity ${isMenuOpen ? 'opacity-100' : 'opacity-0'}`}
          onClick={() => setIsMenuOpen(false)}
        />
        <aside
          className={`absolute inset-y-0 left-0 w-80 sm:w-96 bg-white shadow-2xl border-r border-orange-100 flex flex-col ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300`}
        >
          <div className="flex items-center justify-between px-6 py-5 border-b border-orange-100">
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest text-orange-600">Bright Star</p>
              <h2 className="text-xl font-bold text-gray-900">Relocation Companion</h2>
            </div>
            <button
              type="button"
              className="rounded-full bg-orange-50 px-3 py-2 text-orange-600 hover:bg-orange-100"
              onClick={() => setIsMenuOpen(false)}
              aria-label="Close menu"
            >
              ✕
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 text-base text-gray-700 leading-relaxed">
            <section>
              <h3 className="text-lg font-semibold text-gray-900">How Bright Star helps</h3>
              <ul className="mt-3 space-y-3">
                <li>
                  <strong className="block text-gray-900">Curated city matches</strong>
                  We weigh commute, climate, medical care, and budget needs to surface the right neighborhoods.
                </li>
                <li>
                  <strong className="block text-gray-900">Lifestyle mood-boarding</strong>
                  Upload listings or snapshots—Bright Star captures the look and feel you want.
                </li>
                <li>
                  <strong className="block text-gray-900">Gentle guidance</strong>
                  Step-by-step next actions with trusted partners who understand senior moves.
                </li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-gray-900">Tips for sharing</h3>
              <p>Tell us about routines, medical considerations, loved ones nearby, and the spaces that feel like home.</p>
              <p className="mt-3 text-sm text-gray-500">Need urgent support? Email <a href="mailto:Shawn@EasySouth.living" className="text-orange-600 hover:text-orange-700">Shawn@EasySouth.living</a>.</p>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-gray-900">Privacy promise</h3>
              <p>Photos, notes, and personal details stay with Bright Star’s concierge team and are never shared without your say-so.</p>
            </section>
          </div>

          <div className="px-6 py-6 border-t border-orange-100 bg-orange-50/70">
            <button
              type="button"
              className="w-full inline-flex justify-center items-center gap-2 rounded-full bg-orange-600 px-5 py-3 text-white text-lg font-semibold shadow hover:bg-orange-700"
              onClick={handlePlanRequest}
            >
              Request my plan summary
              <span aria-hidden>→</span>
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default HomePage;
