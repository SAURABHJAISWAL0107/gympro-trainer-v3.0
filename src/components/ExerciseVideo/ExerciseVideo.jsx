// GymPro Trainer — Exercise Video Demo Component
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, ExternalLink } from 'lucide-react';
import './ExerciseVideo.css';

export default function ExerciseVideo({ exercise, onClose }) {
  const [playing, setPlaying] = useState(false);

  if (!exercise) return null;

  const hasVideo = exercise.videoUrl && exercise.videoUrl.length > 0;

  // Extract YouTube video ID
  const getYouTubeId = (url) => {
    if (!url) return null;
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
    return match ? match[1] : null;
  };

  const videoId = getYouTubeId(exercise.videoUrl);

  return (
    <AnimatePresence>
      <motion.div
        className="bottom-sheet-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />
      <motion.div
        className="bottom-sheet video-sheet"
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 400 }}
      >
        <div className="bottom-sheet-handle" />
        
        <div className="video-header">
          <h3 className="video-title">{exercise.name}</h3>
          <button className="btn-ghost" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Video Player */}
        {hasVideo && videoId ? (
          <div className="video-container">
            {!playing ? (
              <div className="video-placeholder" onClick={() => setPlaying(true)}>
                <img
                  src={`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`}
                  alt={exercise.name}
                  className="video-thumbnail"
                />
                <div className="video-play-overlay">
                  <div className="video-play-btn">
                    <Play size={32} fill="white" />
                  </div>
                </div>
              </div>
            ) : (
              <iframe
                className="video-iframe"
                src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
                title={exercise.name}
                allow="autoplay; encrypted-media"
                allowFullScreen
              />
            )}
          </div>
        ) : (
          <div className="video-no-video">
            <span className="video-no-icon">🎬</span>
            <p>No demo video available for this exercise</p>
          </div>
        )}

        {/* Exercise Info */}
        <div className="video-info">
          <div className="video-info-row">
            <span className="video-info-label">Muscle Group</span>
            <span className="video-info-value">{exercise.muscleGroup}</span>
          </div>
          {exercise.secondaryMuscles && (
            <div className="video-info-row">
              <span className="video-info-label">Secondary</span>
              <span className="video-info-value">{exercise.secondaryMuscles}</span>
            </div>
          )}
          <div className="video-info-row">
            <span className="video-info-label">Equipment</span>
            <span className="video-info-value">{exercise.equipment}</span>
          </div>
          <div className="video-info-row">
            <span className="video-info-label">Pattern</span>
            <span className="video-info-value">{exercise.movementPattern}</span>
          </div>
        </div>

        {hasVideo && (
          <a
            href={exercise.videoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary video-external-btn"
          >
            <ExternalLink size={16} /> Watch on YouTube
          </a>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
