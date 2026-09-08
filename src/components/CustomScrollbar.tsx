import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface CustomScrollbarProps {
  scrollContainerRef: React.RefObject<HTMLDivElement>;
}

const CustomScrollbar: React.FC<CustomScrollbarProps> = ({ scrollContainerRef }) => {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [thumbHeight, setThumbHeight] = useState(60);
  const [isVisible, setIsVisible] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);
  const dragStartYRef = useRef(0);
  const dragStartScrollTopRef = useRef(0);

  const updateScroll = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const { scrollTop, scrollHeight, clientHeight } = container;
    const maxScroll = scrollHeight - clientHeight;

    if (maxScroll <= 0) {
      setIsVisible(false);
      return;
    }

    setIsVisible(true);
    const progress = scrollTop / maxScroll;
    setScrollProgress(progress);

    const ratio = clientHeight / scrollHeight;
    const minThumbHeight = 50;
    const calculatedHeight = Math.max(minThumbHeight, ratio * clientHeight);
    setThumbHeight(calculatedHeight);
  }, [scrollContainerRef]);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    updateScroll();
    container.addEventListener('scroll', updateScroll);
    window.addEventListener('resize', updateScroll);

    const resizeObserver = new ResizeObserver(() => updateScroll());
    resizeObserver.observe(container);

    return () => {
      container.removeEventListener('scroll', updateScroll);
      window.removeEventListener('resize', updateScroll);
      resizeObserver.disconnect();
    };
  }, [scrollContainerRef, updateScroll]);

  const scrollTo = (progress: number) => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const maxScroll = container.scrollHeight - container.clientHeight;
    container.scrollTo({ top: progress * maxScroll, behavior: 'smooth' });
  };

  const handleThumbMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const container = scrollContainerRef.current;
    if (!container) return;
    setIsDragging(true);
    dragStartYRef.current = e.clientY;
    dragStartScrollTopRef.current = container.scrollTop;
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const container = scrollContainerRef.current;
      const track = trackRef.current;
      if (!container || !track) return;

      const trackHeight = track.clientHeight - thumbHeight;
      if (trackHeight <= 0) return;

      const deltaY = e.clientY - dragStartYRef.current;
      const scrollDelta = (deltaY / trackHeight) * (container.scrollHeight - container.clientHeight);
      container.scrollTop = dragStartScrollTopRef.current + scrollDelta;
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, thumbHeight, scrollContainerRef]);

  const handleTrackClick = (e: React.MouseEvent) => {
    const track = trackRef.current;
    if (!track) return;
    const rect = track.getBoundingClientRect();
    const clickY = e.clientY - rect.top;
    const clickProgress = clickY / rect.height;
    const thumbCenter = scrollProgress + thumbHeight / (track.clientHeight);
    if (clickY < scrollProgress * track.clientHeight || clickY > (scrollProgress * track.clientHeight) + thumbHeight) {
      scrollTo(clickProgress - (thumbHeight / track.clientHeight) / 2);
    }
  };

  const handleArrowDown = () => {
    const container = scrollContainerRef.current;
    if (!container) return;
    container.scrollBy({ top: container.clientHeight * 0.5, behavior: 'smooth' });
  };

  const handleArrowUp = () => {
    const container = scrollContainerRef.current;
    if (!container) return;
    container.scrollBy({ top: -container.clientHeight * 0.5, behavior: 'smooth' });
  };

  const thumbTop = scrollProgress * (100 - (thumbHeight / (trackRef.current?.clientHeight || 1)) * 100);
  const showScrollbar = isVisible && (isHovered || isDragging || scrollProgress > 0);

  return (
    <div
      className={`fixed left-3 top-1/2 -translate-y-1/2 z-50 flex flex-col items-center gap-2 transition-all duration-500 ${
        showScrollbar ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* سهم علوي */}
      <button
        onClick={handleArrowUp}
        className="w-9 h-9 rounded-full bg-white/15 backdrop-blur-md border border-white/25 flex items-center justify-center text-white/80 hover:bg-emerald-500/40 hover:border-emerald-400/60 hover:text-white transition-all duration-300 shadow-lg"
        aria-label="تمرير لأعلى"
      >
        <ChevronUp className="w-5 h-5" />
      </button>

      {/* المسار والمؤشر */}
      <div
        ref={trackRef}
        onClick={handleTrackClick}
        className="relative w-1.5 rounded-full bg-white/10 backdrop-blur-sm cursor-pointer overflow-hidden"
        style={{ height: 'clamp(180px, 40vh, 320px)' }}
      >
        <div
          onMouseDown={handleThumbMouseDown}
          onClick={(e) => e.stopPropagation()}
          className={`absolute left-1/2 -translate-x-1/2 w-3 rounded-full cursor-pointer transition-all duration-300 ${
            isDragging
              ? 'bg-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.7)] scale-110'
              : isHovered
              ? 'bg-emerald-300/90 shadow-[0_0_10px_rgba(110,231,183,0.5)]'
              : 'bg-white/40'
          }`}
          style={{
            height: `${thumbHeight}px`,
            top: `${thumbTop}%`,
          }}
        />
      </div>

      {/* سهم سفلي */}
      <button
        onClick={handleArrowDown}
        className="w-9 h-9 rounded-full bg-white/15 backdrop-blur-md border border-white/25 flex items-center justify-center text-white/80 hover:bg-emerald-500/40 hover:border-emerald-400/60 hover:text-white transition-all duration-300 shadow-lg"
        aria-label="تمرير لأسفل"
      >
        <ChevronDown className="w-5 h-5" />
      </button>
    </div>
  );
};

export default CustomScrollbar;
