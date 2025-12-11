import React, { useState, useRef, useEffect } from 'react';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Settings,
  SkipBack,
  SkipForward,
  Repeat,
  ListVideo
} from 'lucide-react';

export default function VideoPlayer() {
  const videoRef = useRef(null);
  const playerContainerRef = useRef(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [orientation, setOrientation] = useState('Horizontal'); // 'Horizontal' || 'Vertical'
  const [showPlaylist, setShowPlaylist] = useState(false);
  const [currentVideo, setCurrentVideo] = useState(0);
  const controlsTimeoutRef = useRef(null);

  const playlist = [
    { id: 1, title: 'Demo Video 1', duration: '10:24', src: '' },
    { id: 2, title: 'Demo Video 2', duration: '8:15', src: '' },
    { id: 3, title: 'Demo Video 3', duration: '12:30', src: '' },
    { id: 4, title: 'Demo 4', duration: '5:45', src: 'https://sample.mp4' },
    { id: 5, title: 'Demo 5', duration: '7:20', src: '' },
  ];

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => setCurrentTime(video.currentTime || 0);
    const handleLoadedMetadata = () => setDuration(video.duration || 0);
    const handleEnded = () => setIsPlaying(false);

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('ended', handleEnded);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('ended', handleEnded);
    };
  }, []);

  // Keep isFullscreen in sync with real fullscreen state and reset orientation when exiting
  useEffect(() => {
    const onFullChange = () => {
      const fs = !!document.fullscreenElement;
      setIsFullscreen(fs);
      if (!fs) {
        // when user exits fullscreen via ESC or other, revert to Horizontal and unlock orientation
        setOrientation('Horizontal');
        setShowSettings(false);
        setShowPlaylist(false);
        // Unlock screen orientation when exiting fullscreen
        try {
          if (window.screen.orientation && window.screen.orientation.unlock) {
            window.screen.orientation.unlock();
          }
        } catch (err) {
          console.warn('Screen orientation unlock failed:', err);
        }
      }
    };
    document.addEventListener('fullscreenchange', onFullChange);
    return () => document.removeEventListener('fullscreenchange', onFullChange);
  }, []);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (e) => {
    const seekTime = (e.target.value / 100) * duration;
    if (videoRef.current) {
      videoRef.current.currentTime = seekTime;
      setCurrentTime(seekTime);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    if (isMuted) {
      videoRef.current.volume = volume;
      setIsMuted(false);
    } else {
      videoRef.current.volume = 0;
      setIsMuted(true);
    }
  };

  // Lock screen orientation using Screen Orientation API (like YouTube does)
  const lockOrientation = async (orient) => {
    try {
      if (window.screen.orientation && window.screen.orientation.lock) {
        if (orient === 'Vertical') {
          await window.screen.orientation.lock('portrait');
        } else {
          await window.screen.orientation.lock('landscape');
        }
      }
    } catch (err) {
      // Screen orientation lock may not be supported or allowed
      console.warn('Screen orientation lock not supported:', err);
    }
  };

  // Unlock screen orientation
  const unlockOrientation = () => {
    try {
      if (window.screen.orientation && window.screen.orientation.unlock) {
        window.screen.orientation.unlock();
      }
    } catch (err) {
      console.warn('Screen orientation unlock failed:', err);
    }
  };

  // Toggle fullscreen and optionally set orientation. When requesting fullscreen, we request the player container.
  const toggleFullscreen = async (orient = 'Horizontal') => {
    const container = playerContainerRef.current;
    if (!container) return;

    // If not fullscreen: request and set orientation
    if (!document.fullscreenElement) {
      setOrientation(orient);
      try {
        await container.requestFullscreen();
        setIsFullscreen(true);
        // Lock the screen orientation after entering fullscreen
        await lockOrientation(orient);
      } catch (err) {
        console.error('Error requesting fullscreen:', err);
      }
    } else {
      // Already fullscreen: if orientation change requested, only change orientation state; otherwise exit
      if (orient && orient !== orientation) {
        setOrientation(orient);
        // Lock to new orientation
        await lockOrientation(orient);
      } else {
        try {
          unlockOrientation();
          await document.exitFullscreen();
          setIsFullscreen(false);
          setOrientation('Horizontal');
        } catch (err) {
          console.error('Error exiting fullscreen:', err);
        }
      }
    }
    setShowSettings(false);
  };

  const changeOrientation = async (orient) => {
    // This function updates orientation state and locks screen orientation
    setOrientation(orient);
    if (isFullscreen) {
      await lockOrientation(orient);
    }
  };

  const skipTime = (seconds) => {
    if (videoRef.current) {
      videoRef.current.currentTime += seconds;
    }
  };

  const changePlaybackRate = (rate) => {
    setPlaybackRate(rate);
    if (videoRef.current) videoRef.current.playbackRate = rate;
    setShowSettings(false);
  };

  const formatTime = (time) => {
    if (!time || isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 3000);
  };

  const progress = duration ? (currentTime / duration) * 100 : 0;

  // No CSS rotation needed - we use the Screen Orientation API to actually lock device orientation
  // This makes the system UI (status bar, navigation, volume) rotate properly like YouTube
  const innerStyle = { width: '100%', height: '100%' };

  return (
    <div
      className={`${isFullscreen ? 'fixed inset-0 z-50 bg-black' : 'min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900'} flex items-center justify-center ${isFullscreen ? '' : 'p-4'}`}
    >
      <div className={`${isFullscreen ? 'w-full h-full' : 'w-full max-w-6xl'}`}>
        <div
          ref={playerContainerRef}
          className={`relative bg-black overflow-hidden ${isFullscreen ? 'w-full h-full' : 'rounded-2xl shadow-2xl'}`}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => isPlaying && setShowControls(false)}
        >
          {/* Inner wrapper for fullscreen content */}
          <div style={innerStyle} className="relative">
            {/* Video Element */}
            <video
              ref={videoRef}
              className={`bg-black ${isFullscreen ? 'w-full h-full object-contain' : 'w-full aspect-video'}`}
              onClick={togglePlay}
              poster="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1920' height='1080'%3E%3Crect fill='%23111' width='1920' height='1080'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%23666' font-size='48' font-family='Arial'%3ESample Video%3C/text%3E%3C/svg%3E"
            >
              <source src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" type="video/mp4" />
            </video>

            {/* Center Play Button Overlay */}
            {!isPlaying && (
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 transition-opacity">
                <button
                  onClick={togglePlay}
                  className="w-24 h-24 bg-purple-600 rounded-full flex items-center justify-center hover:bg-purple-700 transition-all transform hover:scale-110 shadow-2xl"
                >
                  <Play className="w-12 h-12 text-white ml-2" fill="white" />
                </button>
              </div>
            )}

            {/* Controls Overlay */}
            <div className={`absolute bottom-0 left-0 right-0 z-50 bg-gradient-to-t from-black via-black/90 to-transparent transition-opacity duration-300 ${showControls || !isPlaying ? 'opacity-100' : 'opacity-0'}`}>
              {/* Progress Bar */}
              <div className="px-6 pt-8 pb-2">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={progress}
                  onChange={handleSeek}
                  className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                  style={{
                    background: `linear-gradient(to right, #9333ea 0%, #9333ea ${progress}%, #374151 ${progress}%, #374151 100%)`
                  }}
                />
              </div>

              {/* Control Buttons */}
              <div className="flex items-center justify-between px-6 pb-4">
                <div className="flex items-center gap-4">
                  <button onClick={togglePlay} className="text-white hover:text-purple-400 transition">
                    {isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8" />}
                  </button>

                  <button onClick={() => skipTime(-10)} className="text-white hover:text-purple-400 transition">
                    <SkipBack className="w-6 h-6" />
                  </button>

                  <button onClick={() => skipTime(10)} className="text-white hover:text-purple-400 transition">
                    <SkipForward className="w-6 h-6" />
                  </button>

                  <button onClick={toggleMute} className="text-white hover:text-purple-400 transition">
                    {isMuted || volume === 0 ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
                  </button>

                  <span className="text-white text-sm font-medium">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </span>
                </div>

                <div className="flex items-center gap-4 relative">
                  <button
  onClick={() => {
    if (!isFullscreen) return;
    setShowSettings(false);
    setShowPlaylist(!showPlaylist);
  }}
  className={`text-white transition ${
    isFullscreen ? "hover:text-purple-400" : "opacity-40 cursor-not-allowed"
  }`}
>
  <ListVideo className="w-6 h-6" />
</button>

                  <button
  onClick={() => {
    if (!isFullscreen) return;
    setShowPlaylist(false);
    setShowSettings(!showSettings);
  }}
  className={`text-white transition ${
    isFullscreen ? "hover:text-purple-400" : "opacity-40 cursor-not-allowed"
  }`}
>
  <Settings className="w-6 h-6" />
</button>

                  <button
  onClick={() => {
    if (isFullscreen) {
      document.exitFullscreen();
    } else {
      toggleFullscreen('Horizontal');
    }
  }}
  className="text-white hover:text-purple-400 transition"
>
  {isFullscreen ? <Minimize className="w-6 h-6" /> : <Maximize className="w-6 h-6" />}
</button>

                  {/* Settings Menu */}
                  {showSettings && (
                    <div className="absolute bottom-full right-0 mb-2 bg-gray-900 rounded-lg shadow-2xl p-4 min-w-56">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-white text-sm font-semibold">Playback Speed</div>
                        <button onClick={() => setShowSettings(false)} className="text-gray-400 hover:text-white">
                          ✕
                        </button>
                      </div>
                      <div className="grid grid-cols-3 gap-1">
                        {[0.5, 0.75, 1, 1.25, 1.5, 2].map(rate => (
                          <button
                            key={rate}
                            onClick={() => changePlaybackRate(rate)}
                            className={`px-2 py-1.5 rounded text-sm transition ${playbackRate === rate ? 'bg-purple-600 text-white' : 'text-gray-300 hover:bg-gray-800'}`}
                          >
                            {rate}x
                          </button>
                        ))}
                      </div>
                      <div className="text-white text-sm mt-3 mb-2 font-semibold border-t border-gray-700 pt-3">Fullscreen Mode</div>
                      {/* Horizontal/Vertical selection - clicking Vertical will request fullscreen + rotate */}
                      <button
                        onClick={() => { changeOrientation('Horizontal'); toggleFullscreen('Horizontal'); }}
                        className={`block w-full text-left px-3 py-2 rounded transition ${orientation === 'Horizontal' ? 'bg-purple-600 text-white' : 'text-gray-300 hover:bg-gray-800'}`}
                      >
                        Horizontal
                      </button>
                      <button
                        onClick={() => { changeOrientation('Vertical'); toggleFullscreen('Vertical'); }}
                        className={`block w-full text-left px-3 py-2 rounded transition ${orientation === 'Vertical' ? 'bg-purple-600 text-white' : 'text-gray-300 hover:bg-gray-800'}`}
                      >
                        Vertical
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Playlist Sidebar (still inside rotated wrapper so it rotates too) */}
            {showPlaylist && (
              <div className="absolute top-0 right-0 bottom-0 w-80 bg-gray-900 bg-opacity-95 backdrop-blur-sm p-6 overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-white font-bold text-lg">Playlist</h3>
                  <button onClick={() => setShowPlaylist(false)} className="text-gray-400 hover:text-white">
                    ✕
                  </button>
                </div>
                <div className="space-y-2">
                  {playlist.map((video, idx) => (
                    <div
                      key={video.id}
                      onClick={() => { setCurrentVideo(idx); setShowPlaylist(false); }}
                      className={`p-4 rounded-lg cursor-pointer transition ${currentVideo === idx ? 'bg-purple-600' : 'bg-gray-800 hover:bg-gray-700'}`}
                    >
                      <div className="text-white font-medium">{video.title}</div>
                      <div className="text-gray-400 text-sm mt-1">{video.duration}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          {/* end rotatedInner wrapper */}
        </div>

        {/* Video Title and Info (shown only when not fullscreen) */}
        {!isFullscreen && (
          <div className="mt-6 text-white">
            <h2 className="text-2xl font-bold mb-2">{playlist[currentVideo].title}</h2>
            <p className="text-gray-400">An advanced video player with modern UI and premium features</p>
          </div>
        )}
      </div>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #9333ea;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(147, 51, 234, 0.5);
        }
        .slider::-moz-range-thumb {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #9333ea;
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 8px rgba(147, 51, 234, 0.5);
        }

        /* Ensure body doesn't scroll when in pseudo-fullscreen (container is truly fullscreen via Fullscreen API) */
        :global(body) {
          margin: 0;
        }
      `}</style>
    </div>
  );
}