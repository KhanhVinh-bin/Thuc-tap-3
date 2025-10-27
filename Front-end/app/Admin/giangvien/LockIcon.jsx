import React from 'react';
import './LockIcon.css';

const LockIcon = ({ 
  isLocked = false, 
  size = 'medium', 
  onClick = null, 
  className = '', 
  animated = true,
  title = ''
}) => {
  const sizeClass = `lock-icon-${size}`;
  const stateClass = isLocked ? 'lock-icon-locked' : 'lock-icon-unlocked';
  const clickableClass = onClick ? 'lock-icon-clickable' : '';
  const animatedClass = animated ? 'lock-icon-animated' : '';

  const handleClick = () => {
    if (onClick) {
      onClick();
    }
  };

  return (
    <div 
      className={`lock-icon ${sizeClass} ${stateClass} ${clickableClass} ${animatedClass} ${className}`}
      onClick={handleClick}
      title={title}
      role={onClick ? 'button' : 'img'}
      tabIndex={onClick ? 0 : -1}
      onKeyDown={(e) => {
        if (onClick && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          handleClick();
        }
      }}
    >
      <svg 
        viewBox="0 0 24 24" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="lock-icon-svg"
      >
        {/* Thân ổ khóa */}
        <rect 
          x="5" 
          y="11" 
          width="14" 
          height="10" 
          rx="2" 
          ry="2" 
          className="lock-body"
        />
        
        {/* Chấm tròn trên thân ổ khóa */}
        <circle 
          cx="12" 
          cy="16" 
          r="1.5" 
          className="lock-dot"
        />
        
        {/* Thanh cài khóa - thay đổi dựa trên trạng thái */}
        <path 
          d={isLocked 
            ? "M8 11V7C8 5.34315 9.34315 4 11 4H13C14.6569 4 16 5.34315 16 7V11" 
            : "M8 11V7C8 5.34315 9.34315 4 11 4H13C14.6569 4 16 5.34315 16 7V9"
          }
          className="lock-shackle"
        />
        
        {/* Dấu hiệu mở khóa - chỉ hiển thị khi không bị khóa */}
        {!isLocked && (
          <g className="unlock-indicator">
            {/* Đường line chéo */}
            <line 
              x1="16" 
              y1="7" 
              x2="20" 
              y2="3" 
              className="unlock-line"
            />
            {/* Chấm tròn ở cuối đường line */}
            <circle 
              cx="20" 
              cy="3" 
              r="1" 
              className="unlock-dot"
            />
          </g>
        )}
        
        {/* Overlay effect khi hover */}
        <rect 
          x="5" 
          y="11" 
          width="14" 
          height="10" 
          rx="2" 
          ry="2" 
          className="lock-overlay"
          fill="transparent"
        />
      </svg>
    </div>
  );
};

export default LockIcon;