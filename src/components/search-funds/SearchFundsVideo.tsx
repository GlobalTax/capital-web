import { motion } from 'framer-motion';
import { Play, Clock } from 'lucide-react';
import { useState } from 'react';

export const SearchFundsVideo = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  
  // Placeholder - replace with actual video URL when available
  const videoId = null; // e.g., 'dQw4w9WgXcQ' for YouTube
  const hasVideo = Boolean(videoId);

  if (!hasVideo) {
    return (
      <section className="py-20 bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto text-center"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              ¿Qué son los Search Funds?
            </h2>
            <p className="text-lg text-slate-300 mb-8">
              En menos de 3 minutos, entiende cómo funciona este modelo de adquisición y por qué es ideal para pymes rentables.
            </p>

            <div className="relative aspect-video max-w-3xl mx-auto rounded-xl overflow-hidden bg-slate-800/50 border border-slate-700">
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mb-4">
                  <Play className="w-10 h-10 text-primary ml-1" />
                </div>
                <div className="flex items-center gap-2 text-slate-400">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm">Video próximamente</span>
                </div>
              </div>
              
              {/* Decorative elements */}
              <div className="absolute top-4 left-4 w-3 h-3 rounded-full bg-red-500/50" />
              <div className="absolute top-4 left-10 w-3 h-3 rounded-full bg-yellow-500/50" />
              <div className="absolute top-4 left-16 w-3 h-3 rounded-full bg-green-500/50" />
            </div>

            <p className="mt-6 text-sm text-slate-400">
              ¿Prefieres hablar con un experto? <a href="/contacto" className="text-primary hover:underline">Agenda una llamada</a>
            </p>
          </motion.div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-gradient-to-br from-slate-900 to-slate-800">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto text-center"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            ¿Qué son los Search Funds?
          </h2>
          <p className="text-lg text-slate-300 mb-8">
            En menos de 3 minutos, entiende cómo funciona este modelo de adquisición.
          </p>

          <div className="relative aspect-video max-w-3xl mx-auto rounded-xl overflow-hidden shadow-2xl">
            {!isPlaying ? (
              <button
                onClick={() => setIsPlaying(true)}
                className="absolute inset-0 flex items-center justify-center bg-slate-900 group"
              >
                <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Play className="w-10 h-10 text-primary-foreground ml-1" fill="currentColor" />
                </div>
              </button>
            ) : (
              <iframe
                src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
                title="¿Qué son los Search Funds?"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 w-full h-full"
              />
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default SearchFundsVideo;
