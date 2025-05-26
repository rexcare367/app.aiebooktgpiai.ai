import React, { useState } from "react";
import { ArrowLeftIcon, ArrowRightIcon, XIcon } from "lucide-react";
import "./welcomeScreen.css";

interface WelcomeScreenProps {
  onClose: () => void;
  isExiting: boolean;
}

const StartBtn = () => {
  return (
    <button
      className="flex items-center justify-center rounded-full bg-gradient-to-r transition-all duration-100 py-3 px-6 text-white
       from-pink-500 to-purple-500
       hover:from-pink-600 hover:to-purple-600"
    >
      Get Started
    </button>
  );
};

const slides = [
  {
    id: "welcome",
    icon: "/assets/icon.png",
    title: "Welcome to AI eBook Library Tanjung Piai!",
    subtitle: "Get ready for an amazing reading adventure! 📚✨",
    backgroundIcons: ["📚", "🎨", "🌟", "✨", "🎭", "🎪"],
  },
  {
    id: "sponsor1",
    icon: "/assets/sponsor1.PNG",
    title: "Our First Amazing Sponsor!",
    subtitle: "Making education accessible for everyone",
    backgroundIcons: ["🎓", "📖", "💫", "🌈", "🎯", "🎊"],
  },
  {
    id: "sponsor2",
    icon: "/assets/sponsor2.PNG",
    title: "One More Special Friend!",
    subtitle: "Empowering young minds through reading",
    backgroundIcons: ["🚀", "⭐", "🎨", "📚", "🎭", "🌟"],
    action: <StartBtn />,
  },
];

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onClose, isExiting }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [slideDirection, setSlideDirection] = useState<"right" | "left">("right");

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setSlideDirection("right");
      setCurrentSlide((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentSlide > 0) {
      setSlideDirection("left");
      setCurrentSlide((prev) => prev - 1);
    }
  };

  const slide = slides[currentSlide];
  const isLastSlide = currentSlide === slides.length - 1;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      {/* Gradient background - light/dark mode aware */}
      <div className="absolute inset-0 bg-gradient-to-b from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900 dark:to-gray-900" />

      <div
        className={`welcome-screen-container bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm w-full h-full sm:w-[800px] sm:h-auto sm:rounded-3xl shadow-2xl mx-auto transition-all duration-500 relative ${
          isExiting ? "opacity-0 scale-95" : "opacity-100 scale-100"
        }`}
      >
        {/* Decorative border */}
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-purple-200 via-pink-200 to-yellow-200 dark:from-purple-800 dark:via-pink-800 dark:to-yellow-800 opacity-30 dark:opacity-20 animate-gradient decorative-border" />

        {/* Navigation Arrows */}
        {currentSlide > 0 && (
          <button
            onClick={handlePrev}
            className="
              nav-button prev
              absolute left-4 top-1/2 -translate-y-1/2
              w-12 h-12 flex items-center justify-center
              rounded-full bg-gradient-to-r from-pink-500 to-purple-500
              hover:from-pink-600 hover:to-purple-600
              transition-colors shadow-xl dark:shadow-2xl
              z-10 group
            "
          >
            <ArrowLeftIcon className="text-white" />
          </button>
        )}
        {!isLastSlide && (
          <button
            onClick={handleNext}
            className="
              nav-button next
              absolute right-4 top-1/2 -translate-y-1/2
              w-12 h-12 flex items-center justify-center
              rounded-full bg-gradient-to-r from-pink-500 to-purple-500
              hover:from-pink-600 hover:to-purple-600
              transition-colors shadow-xl dark:shadow-2xl
              z-10 group
            "
          >
            <ArrowRightIcon className="text-white" />
            {/* <span className="text-3xl text-white transition-colors">→</span> */}
          </button>
        )}

        {/* Close button - only on last slide */}
        {isLastSlide && (
          <button
            onClick={onClose}
            className="close-button absolute top-6 right-6 flex items-center justify-center rounded-full transition-all z-20"
          >
            <XIcon />
          </button>
        )}

        {/* Content container */}
        <div
          className={`welcome-content relative flex flex-col items-center transition-all duration-500 ${
            slideDirection === "right" ? "slide-in-right" : "slide-in-left"
          }`}
        >
          {/* Floating stars around icon */}
          <div className="absolute top-4 right-12 text-xl animate-spin-slow">✨</div>
          <div className="absolute top-16 left-12 text-xl animate-bounce">⭐</div>
          <div className="absolute top-8 left-20 text-xl animate-ping">🌟</div>

          {/* Icon with glow effect */}
          <div className="welcome-image-container">
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-200 to-pink-200 rounded-full blur-xl opacity-50 dark:opacity-30 animate-pulse" />
            <img src={slide.icon} alt="Welcome" className="relative object-contain" />
          </div>

          {/* Title and subtitle */}
          <div className="text-center space-y-2">
            <h1 className="welcome-title bg-gradient-to-r from-pink-500 via-purple-500 to-orange-500 dark:from-pink-300 dark:via-purple-300 dark:to-orange-300 bg-clip-text text-transparent animate-gradient">
              {slide.title}
            </h1>

            <p className="welcome-subtitle text-gray-600 dark:text-gray-300 drop-shadow">{slide.subtitle}</p>
            <div className="w-full flex justify-center items-center pt-3" onClick={onClose}>
              {slide.action}
            </div>
          </div>

          {/* Progress dots */}
          <div className="flex space-x-2 mt-4">
            {slides.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                  index === currentSlide
                    ? "bg-gradient-to-r from-pink-500 to-orange-500 animate-pulse"
                    : "bg-gray-300 dark:bg-gray-600"
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Floating background elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {[...Array(8)].map((_, i) => {
          const icons = ["✨", "⭐", "🌟", "🎈", "🎨", "📚", "🌈", "🎭"];
          return (
            <div
              key={i}
              className="absolute text-2xl animate-float"
              style={{
                left: `${Math.random() * 90 + 5}%`,
                top: `${Math.random() * 90 + 5}%`,
                animationDelay: `${i * 0.7}s`,
                opacity: 0.3,
                transform: `rotate(${Math.random() * 360}deg)`,
              }}
            >
              {icons[i]}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WelcomeScreen;
