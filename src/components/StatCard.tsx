// src/components/StatCard.tsx
import { useEffect, useState, useRef } from "react";
import { useTheme } from "../context/ThemeContext";

interface StatCardProps {
  title: string;
  value: number;
  total?: number;
  icon: React.ComponentType<{ className?: string }>;
  gradient: string;
  subtitle?: string;
  showProgress?: boolean;
  delay?: number;
  valueLabel?: string;  // Label for the value row (default: "Used")
  remainingLabel?: string;  // Label for the remaining row (default: "Available")
  hideTotal?: boolean;  // Hide the /total in the value row
}

// Custom hook for counting animation - syncs with progress ring
const useCountAnimation = (end: number, duration: number = 1500, delay: number = 0) => {
  const [count, setCount] = useState(0);
  const [progress, setProgress] = useState(0); // 0 to 1 for ring animation
  const [hasStarted, setHasStarted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasStarted) {
          setHasStarted(true);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [hasStarted]);

  useEffect(() => {
    if (!hasStarted) return;

    const timeout = setTimeout(() => {
      let startTime: number;
      const startValue = 0;

      const animate = (currentTime: number) => {
        if (!startTime) startTime = currentTime;
        const elapsed = currentTime - startTime;
        const currentProgress = Math.min(elapsed / duration, 1);

        // Easing function for smooth deceleration - same for both number and ring
        const easeOutQuart = 1 - Math.pow(1 - currentProgress, 4);
        const currentCount = Math.round((startValue + (end - startValue) * easeOutQuart) * 100) / 100;

        setCount(currentCount);
        setProgress(easeOutQuart); // Update progress for ring animation

        if (currentProgress < 1) {
          requestAnimationFrame(animate);
        }
      };

      requestAnimationFrame(animate);
    }, delay);

    return () => clearTimeout(timeout);
  }, [end, duration, delay, hasStarted]);

  return { count, progress, ref };
};

const StatCard = ({
  title,
  value,
  total = 100,
  icon: Icon,
  gradient,
  subtitle,
  showProgress = true,
  delay = 0,
  valueLabel = "Used",
  remainingLabel = "Available",
  hideTotal = false
}: StatCardProps) => {
  const { formatCurrency } = useTheme();
  const { count: animatedValue, progress, ref } = useCountAnimation(value, 1500, delay);

  // Calculate percentage based on the animated value
  const percentage = total > 0 ? Math.min((animatedValue / total) * 100, 100) : 0;

  // Calculate the final percentage for the ring (what we're animating towards)
  const finalPercentage = total > 0 ? Math.min((value / total) * 100, 100) : 0;

  const circumference = 2 * Math.PI * 40;
  // Use progress to animate the ring in sync with the number
  const strokeDashoffset = circumference - (progress * finalPercentage / 100) * circumference;

  // Get mellow color from gradient
  const getColor = () => {
    if (gradient.includes("purple")) return { main: "#a78bfa", muted: "rgba(167, 139, 250, 0.15)" };
    if (gradient.includes("green")) return { main: "#6ee7b7", muted: "rgba(110, 231, 183, 0.15)" };
    if (gradient.includes("blue")) return { main: "#7dd3fc", muted: "rgba(125, 211, 252, 0.15)" };
    if (gradient.includes("orange")) return { main: "#fdba74", muted: "rgba(253, 186, 116, 0.15)" };
    if (gradient.includes("red")) return { main: "#fca5a5", muted: "rgba(252, 165, 165, 0.15)" };
    if (gradient.includes("cyan")) return { main: "#67e8f9", muted: "rgba(103, 232, 249, 0.15)" };
    return { main: "#c4b5fd", muted: "rgba(196, 181, 253, 0.15)" };
  };

  const color = getColor();

  return (
    <div
      ref={ref}
      className="stat-card glass-card"
      style={{
        "--accent-color": color.main,
        "--accent-muted": color.muted,
        animationDelay: `${delay}ms`
      } as React.CSSProperties}
    >
      <div className="stat-card-content">
        {/* Left side - Ring Progress */}
        {showProgress && (
          <div className="stat-ring-container">
            <svg className="stat-ring" viewBox="0 0 100 100">
              {/* Background ring */}
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="rgba(255,255,255,0.06)"
                strokeWidth="8"
              />
              {/* Progress ring */}
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke={color.main}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                transform="rotate(-90 50 50)"
                className="stat-ring-progress"
                style={{
                  filter: `drop-shadow(0 0 4px ${color.muted})`,
                }}
              />
            </svg>
            {/* Icon in center - no background */}
            <div className="stat-ring-icon-wrapper" style={{ color: color.main }}>
              <Icon className="stat-ring-icon-svg" />
            </div>
          </div>
        )}

        {/* Right side - Stats */}
        <div className="stat-info">
          <span className="stat-title">{title}</span>
          <div className="stat-value-row">
            <span className="stat-value-large" style={{ color: color.main }}>
              {formatCurrency(animatedValue)}
            </span>
            {!hideTotal && total && total !== 100 && (
              <span className="stat-total">/{formatCurrency(total)}</span>
            )}
          </div>
          <div className="stat-percentage">{percentage.toFixed(0)}% {subtitle || "used"}</div>
          <div className="stat-details">
            <div className="stat-detail-row">
              <span className="stat-detail-dot" style={{ background: color.main }} />
              <span className="stat-detail-label">{valueLabel}</span>
              <span className="stat-detail-value">{formatCurrency(animatedValue)}</span>
            </div>
            <div className="stat-detail-row">
              <span className="stat-detail-dot stat-detail-dot-available" />
              <span className="stat-detail-label">{remainingLabel}</span>
              <span className="stat-detail-value">{formatCurrency(total - animatedValue)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatCard;
