import React, { useRef, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Download, Share2, Sparkles, Award, Building, TrendingUp, Coins, Star, CheckCircle } from 'lucide-react';

interface StartupData {
  childName: string;
  startupName: string;
  schoolName: string;
  revenue: number;
  profit: number;
  level: number;
  totalXP: number;
  valuation?: number;
  teamSize?: number;
  monthsActive?: number;
}

interface Props {
  data: StartupData;
  onClose?: () => void;
}

export default function ShareCard({ data, onClose }: Props) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isShared, setIsShared] = useState(false);

  const handleDownload = useCallback(async () => {
    setIsDownloading(true);
    try {
      // Dynamically import html2canvas (use a simple canvas-based approach as fallback)
      let html2canvas: any;
      try {
        const mod = await import('html2canvas');
        html2canvas = mod.default;
      } catch {
        // Fallback: use the HTML content as a data URL via jspdf
        const { default: jsPDF } = await import('jspdf');
        const { default: html2canvasModule } = await import('html2canvas');
        html2canvas = html2canvasModule;
      }

      if (!cardRef.current) return;

      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        backgroundColor: '#0f172a',
        allowTaint: false,
        useCORS: true,
        logging: false,
        width: cardRef.current.scrollWidth,
        height: cardRef.current.scrollHeight,
      });

      // Create download link
      const link = document.createElement('a');
      link.download = `${data.childName.replace(/\s+/g, '_')}_startup_achievement.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.error('Failed to generate share card:', err);
      // Fallback: open a print-friendly version
      if (cardRef.current) {
        const html = cardRef.current.outerHTML;
        const win = window.open('', '_blank');
        if (win) {
          win.document.write(`
            <html>
              <head>
                <style>
                  body { background: #0f172a; display: flex; justify-content: center; padding: 40px; }
                  * { margin: 0; padding: 0; box-sizing: border-box; }
                </style>
              </head>
              <body>${html}</body>
            </html>
          `);
          win.document.close();
          win.focus();
          win.print();
        }
      }
    } finally {
      setIsDownloading(false);
    }
  }, [data]);

  const handleShare = useCallback(async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: `${data.childName} built a startup!`,
          text: `My child ${data.childName} built "${data.startupName}" on CampusEdge! They made virtual ₹${data.revenue.toLocaleString()} in revenue! 🚀`,
          url: window.location.origin + '/parent',
        });
        setIsShared(true);
      } else {
        // Fallback: copy text to clipboard
        await navigator.clipboard.writeText(
          `🚀 My child ${data.childName} built "${data.startupName}" on CampusEdge!\n\n` +
          `💰 Revenue: ₹${data.revenue.toLocaleString()}\n` +
          `📈 Profit: ₹${data.profit.toLocaleString()}\n` +
          `⭐ Level: ${data.level}\n\n` +
          `They're learning real entrepreneurial skills! Check it out → ${window.location.origin}`
        );
        setIsShared(true);
        setTimeout(() => setIsShared(false), 2000);
      }
    } catch {
      // User cancelled share
    }
  }, [data]);

  return (
    <div className="space-y-4">
      {/* Share Card */}
      <div
        ref={cardRef}
        className="relative overflow-hidden rounded-2xl border border-purple-500/20 bg-gradient-to-br from-slate-900 via-slate-900 to-purple-950/30"
        style={{ width: '400px', maxWidth: '100%' }}
      >
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-emerald-500/8 rounded-full blur-3xl" />

        <div className="relative z-10 p-6 space-y-5">
          {/* Header Badge */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="inline-flex items-center gap-1.5 bg-gradient-to-r from-purple-600/20 to-emerald-600/20 border border-purple-400/20 rounded-full px-3 py-1"
          >
            <Sparkles className="h-3.5 w-3.5 text-purple-400" />
            <span className="text-[9px] font-bold text-purple-300 uppercase tracking-wider">
              Young Entrepreneur
            </span>
          </motion.div>

          {/* Main Content */}
          <div className="text-center space-y-2">
            <div className="text-5xl mb-2">🚀</div>
            <h2 className="text-2xl font-bold text-white font-display tracking-tight">
              {data.startupName}
            </h2>
            <p className="text-sm text-slate-400">
              Built by <span className="text-emerald-400 font-bold">{data.childName}</span>
            </p>
            <p className="text-[10px] text-slate-500 uppercase tracking-wider">
              {data.schoolName}
            </p>
          </div>

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-transparent via-purple-500/20 to-transparent" />

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-800/50 rounded-xl p-3.5 text-center border border-slate-700/30">
              <Coins className="h-5 w-5 text-emerald-400 mx-auto mb-1" />
              <p className="text-lg font-bold text-white">₹{data.revenue.toLocaleString()}</p>
              <p className="text-[9px] text-slate-500 uppercase tracking-wider">Revenue</p>
            </div>
            <div className="bg-slate-800/50 rounded-xl p-3.5 text-center border border-slate-700/30">
              <TrendingUp className="h-5 w-5 text-yellow-400 mx-auto mb-1" />
              <p className="text-lg font-bold text-yellow-400">₹{data.profit.toLocaleString()}</p>
              <p className="text-[9px] text-slate-500 uppercase tracking-wider">Profit</p>
            </div>
            <div className="bg-slate-800/50 rounded-xl p-3.5 text-center border border-slate-700/30">
              <Star className="h-5 w-5 text-purple-400 mx-auto mb-1" />
              <p className="text-lg font-bold text-white">Level {data.level}</p>
              <p className="text-[9px] text-slate-500 uppercase tracking-wider">Entrepreneur</p>
            </div>
            <div className="bg-slate-800/50 rounded-xl p-3.5 text-center border border-slate-700/30">
              <Award className="h-5 w-5 text-amber-400 mx-auto mb-1" />
              <p className="text-lg font-bold text-white">{data.totalXP} XP</p>
              <p className="text-[9px] text-slate-500 uppercase tracking-wider">Total XP</p>
            </div>
          </div>

          {/* Additional Info */}
          {data.valuation && data.valuation > 0 && (
            <div className="bg-gradient-to-r from-purple-600/10 to-emerald-600/10 rounded-xl p-3 border border-purple-400/10 text-center">
              <p className="text-[10px] text-slate-500 uppercase tracking-wider">Virtual Valuation</p>
              <p className="text-xl font-bold text-purple-300">₹{data.valuation.toLocaleString()}</p>
            </div>
          )}

          {/* Achievement Row */}
          <div className="flex items-center justify-center gap-4 text-[10px] text-slate-500">
            <span className="flex items-center gap-1">
              <CheckCircle className="h-3 w-3 text-emerald-400" />
              Capstone Complete
            </span>
            <span className="flex items-center gap-1">
              <Building className="h-3 w-3 text-blue-400" />
              Business Ready
            </span>
          </div>

          {/* Footer */}
          <div className="text-center pt-2 border-t border-slate-800/60">
            <p className="text-[9px] text-slate-600 uppercase tracking-widest font-semibold">
              CampusEdge · Building India's Entrepreneurs
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleDownload}
          disabled={isDownloading}
          className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-semibold py-2.5 rounded-xl text-xs transition-all flex items-center justify-center gap-2"
        >
          <Download className={`h-4 w-4 ${isDownloading ? 'animate-bounce' : ''}`} />
          {isDownloading ? 'Generating...' : 'Download as Image'}
        </button>
        <button
          onClick={handleShare}
          className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 rounded-xl text-xs transition-all flex items-center justify-center gap-2"
        >
          <Share2 className="h-4 w-4" />
          {isShared ? 'Copied!' : 'Share on WhatsApp'}
        </button>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="w-full text-xs text-slate-500 hover:text-slate-300 py-2 transition-colors"
        >
          Close
        </button>
      )}

      <p className="text-[10px] text-slate-600 text-center">
        Share this achievement with family and friends! 🎉
      </p>
    </div>
  );
}
