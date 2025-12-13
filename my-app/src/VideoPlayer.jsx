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
  ListVideo,
  Loader2,
  AlertCircle
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
  const [orientation, setOrientation] = useState('Horizontal');
  const [showPlaylist, setShowPlaylist] = useState(false);
  const [currentVideo, setCurrentVideo] = useState(0);
  const [showThumbnail, setShowThumbnail] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [seekAnimation, setSeekAnimation] = useState({ show: false, direction: null });
  const [videoError, setVideoError] = useState(false);
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  
  const controlsTimeoutRef = useRef(null);
  const leftTapRef = useRef({ count: 0, timer: null });
  const rightTapRef = useRef({ count: 0, timer: null });

  const defaultVideo = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';
  const playlist = [
    { id: 1, title: 'Demo Video 1', duration: '10:24', src: defaultVideo },
    { id: 2, title: 'Demo Video 2', duration: '8:15', src: defaultVideo },
    { id: 3, title: 'Demo Video 3', duration: '12:30', src: defaultVideo },
    { id: 4, title: 'Demo 4', duration: '5:45', src: 'https://sample.mp4' },
    { id: 5, title: 'Demo 5', duration: '7:20', src: defaultVideo },
  ];

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => setCurrentTime(video.currentTime || 0);
    const handleLoadedMetadata = () => setDuration(video.duration || 0);
    const handleEnded = () => setIsPlaying(false);
    const handleWaiting = () => setIsLoading(true);
    const handleCanPlay = () => {
      setIsLoading(false);
      setVideoError(false);
    };
    const handleSeeking = () => setIsLoading(true);
    const handleSeeked = () => setIsLoading(false);
    const handlePlaying = () => {
      setIsLoading(false);
      setVideoError(false);
    };
    const handleError = () => {
      setIsLoading(false);
      setVideoError(true);
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('ended', handleEnded);
    video.addEventListener('waiting', handleWaiting);
    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('seeking', handleSeeking);
    video.addEventListener('seeked', handleSeeked);
    video.addEventListener('playing', handlePlaying);
    video.addEventListener('error', handleError);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('waiting', handleWaiting);
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('seeking', handleSeeking);
      video.removeEventListener('seeked', handleSeeked);
      video.removeEventListener('playing', handlePlaying);
      video.removeEventListener('error', handleError);
    };
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    
    setVideoError(false);
    
    if (isFirstLoad) {
      setShowThumbnail(true);
      setIsLoading(false);
      setIsFirstLoad(false);
    } else {
      setShowThumbnail(false);
      setIsLoading(true);
      video.load();
      video.play().then(() => {
        setIsPlaying(true);
      }).catch(() => {
        setIsPlaying(false);
      });
    }
    setCurrentTime(0);
  }, [currentVideo]);

  useEffect(() => {
    const onFullChange = () => {
      const fs = !!document.fullscreenElement;
      const wasFullscreen = isFullscreen;
      setIsFullscreen(fs);
      if (!fs) {
        setOrientation('Horizontal');
        setShowSettings(false);
        setShowPlaylist(false);
        if (wasFullscreen && videoRef.current && !videoRef.current.paused) {
          videoRef.current.pause();
          setIsPlaying(false);
        }
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
  }, [isFullscreen]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && videoRef.current && !videoRef.current.paused) {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  const togglePlay = () => {
    if (!videoRef.current || videoError) return;
    if (showThumbnail) {
      setShowThumbnail(false);
      setIsLoading(true);
    }
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
      console.warn('Screen orientation lock not supported:', err);
    }
  };

  const unlockOrientation = () => {
    try {
      if (window.screen.orientation && window.screen.orientation.unlock) {
        window.screen.orientation.unlock();
      }
    } catch (err) {
      console.warn('Screen orientation unlock failed:', err);
    }
  };

  const toggleFullscreen = async (orient = 'Horizontal') => {
    const container = playerContainerRef.current;
    if (!container) return;

    if (!document.fullscreenElement) {
      setOrientation(orient);
      try {
        await container.requestFullscreen();
        setIsFullscreen(true);
        await lockOrientation(orient);
      } catch (err) {
        console.warn('Error requesting fullscreen:', err);
      }
    } else {
      if (orient && orient !== orientation) {
        setOrientation(orient);
        await lockOrientation(orient);
      } else {
        try {
          unlockOrientation();
          await document.exitFullscreen();
          setIsFullscreen(false);
          setOrientation('Horizontal');
        } catch (err) {
          console.warn('Error exiting fullscreen:', err);
        }
      }
    }
    setShowSettings(false);
  };

  const changeOrientation = async (orient) => {
    setOrientation(orient);
    if (isFullscreen) {
      await lockOrientation(orient);
    }
  };

  const skipTime = (seconds) => {
    if (videoRef.current) {
      videoRef.current.currentTime += seconds;
      showSeekAnimation(seconds < 0 ? 'left' : 'right');
    }
  };

  const showSeekAnimation = (direction) => {
    setSeekAnimation({ show: true, direction });
    setTimeout(() => {
      setSeekAnimation({ show: false, direction: null });
    }, 500);
  };

  const handleDoubleTapLeft = () => {
    if (videoRef.current) {
      videoRef.current.currentTime -= 10;
      showSeekAnimation('left');
    }
  };

  const handleDoubleTapRight = () => {
    if (videoRef.current) {
      videoRef.current.currentTime += 10;
      showSeekAnimation('right');
    }
  };

  const handleLeftZoneTap = (e) => {
    e.stopPropagation();
    leftTapRef.current.count++;
    if (leftTapRef.current.timer) clearTimeout(leftTapRef.current.timer);
    leftTapRef.current.timer = setTimeout(() => {
      if (leftTapRef.current.count >= 2) {
        handleDoubleTapLeft();
      }
      leftTapRef.current.count = 0;
    }, 300);
  };

  const handleRightZoneTap = (e) => {
    e.stopPropagation();
    rightTapRef.current.count++;
    if (rightTapRef.current.timer) clearTimeout(rightTapRef.current.timer);
    rightTapRef.current.timer = setTimeout(() => {
      if (rightTapRef.current.count >= 2) {
        handleDoubleTapRight();
      }
      rightTapRef.current.count = 0;
    }, 300);
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

  const handleControlsAreaClick = (e) => {
    e.stopPropagation();
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 3000);
  };

  const progress = duration ? (currentTime / duration) * 100 : 0;

  const innerStyle = { width: '100%', height: '100%' };

  const isVertical = orientation === 'Vertical' && isFullscreen;

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
          <div style={innerStyle} className="relative flex items-center justify-center">
            <video
              ref={videoRef}
              className={`bg-black ${isFullscreen ? 'w-full h-full object-contain' : 'w-full aspect-video'}`}
              src={playlist[currentVideo].src}
            />

            {showThumbnail && (
              <div 
                className={`absolute ${isVertical ? 'w-full h-full' : 'inset-0'} transition-opacity duration-500`}
                style={{
                  backgroundImage: 'url(/thumbnail.jpg)',
                  backgroundSize: isVertical ? 'contain' : 'cover',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat',
                  filter: 'blur(4px)',
                  backgroundColor: 'black',
                }}
              />
            )}

            {showThumbnail && !videoError && (
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40">
                <button
                  onClick={togglePlay}
                  className="w-24 h-24 bg-purple-600 rounded-full flex items-center justify-center hover:bg-purple-700 transition-all transform hover:scale-110 shadow-2xl z-10"
                >
                  <Play className="w-12 h-12 text-white ml-2" fill="white" />
                </button>
              </div>
            )}

            {videoError && (
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-80 z-40">
                <div className="text-center p-6 max-w-md">
                  <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                  <h3 className="text-white text-xl font-bold mb-2">Error</h3>
                  <p className="text-gray-300">There is some problem in running the video. Kindly use another Source.</p>
                </div>
              </div>
            )}

            {isLoading && !showThumbnail && !videoError && (
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 pointer-events-none z-30">
                <Loader2 className="w-16 h-16 text-purple-500 animate-spin" />
              </div>
            )}

            {!showThumbnail && !isPlaying && !isLoading && !videoError && (
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 transition-opacity">
                <button
                  onClick={togglePlay}
                  className="w-24 h-24 bg-purple-600 rounded-full flex items-center justify-center hover:bg-purple-700 transition-all transform hover:scale-110 shadow-2xl"
                >
                  <Play className="w-12 h-12 text-white ml-2" fill="white" />
                </button>
              </div>
            )}

            {!videoError && (
              <>
                <div 
                  className="absolute left-0 top-0 bottom-0 w-1/3 z-20"
                  onClick={handleLeftZoneTap}
                />
                <div 
                  className="absolute right-0 top-0 bottom-0 w-1/3 z-20"
                  onClick={handleRightZoneTap}
                />
              </>
            )}

            {seekAnimation.show && seekAnimation.direction === 'left' && (
              <div className="absolute left-8 top-1/2 -translate-y-1/2 flex items-center gap-2 text-white z-30 pointer-events-none animate-seek-left">
                <div className="flex items-center gap-1 bg-black bg-opacity-60 rounded-full px-4 py-2">
                  <SkipBack className="w-8 h-8" />
                  <span className="text-lg font-bold">10s</span>
                </div>
              </div>
            )}

            {seekAnimation.show && seekAnimation.direction === 'right' && (
              <div className="absolute right-8 top-1/2 -translate-y-1/2 flex items-center gap-2 text-white z-30 pointer-events-none animate-seek-right">
                <div className="flex items-center gap-1 bg-black bg-opacity-60 rounded-full px-4 py-2">
                  <span className="text-lg font-bold">10s</span>
                  <SkipForward className="w-8 h-8" />
                </div>
              </div>
            )}

            <div 
              className={`absolute bottom-0 left-0 right-0 z-50 bg-gradient-to-t from-black via-black/90 to-transparent transition-opacity duration-300 ${showControls || !isPlaying ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
              onClick={handleControlsAreaClick}
            >
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

            {showPlaylist && (
              <div className="absolute top-0 right-0 bottom-0 w-80 bg-gray-900 bg-opacity-95 backdrop-blur-sm p-6 overflow-y-auto z-40">
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
        </div>

        {!isFullscreen && (
          <div className="mt-6 text-white">
            <h2 className="text-2xl font-bold mb-2">{playlist[currentVideo].title}</h2>
            <p className="text-gray-400">An advanced video player with modern UI and premium features</p>
          </div>
        )}
      </div>

      <style>{`
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

        body {
          margin: 0;
        }

        @keyframes seekLeft {
          0% { opacity: 0; transform: translateY(-50%) translateX(20px); }
          30% { opacity: 1; transform: translateY(-50%) translateX(0); }
          100% { opacity: 0; transform: translateY(-50%) translateX(-20px); }
        }

        @keyframes seekRight {
          0% { opacity: 0; transform: translateY(-50%) translateX(-20px); }
          30% { opacity: 1; transform: translateY(-50%) translateX(0); }
          100% { opacity: 0; transform: translateY(-50%) translateX(20px); }
        }

        .animate-seek-left {
          animation: seekLeft 0.5s ease-out forwards;
        }

        .animate-seek-right {
          animation: seekRight 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
