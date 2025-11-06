'use client';

import React from 'react';
import './LockIcon.css';

/**
 * Component biểu tượng ổ khóa với khả năng hiển thị trạng thái đóng/mở
 * @param {boolean} isLocked - Trạng thái khóa (true: đóng, false: mở)
 * @param {string} size - Kích thước biểu tượng ('small', 'medium', 'large')
 * @param {function} onClick - Hàm xử lý khi click (optional)
 * @param {string} className - CSS class bổ sung (optional)
 * @param {boolean} animated - Có animation chuyển đổi hay không (default: true)
 */
const LockIcon = ({ 
  isLocked = false, 
  size = 'medium', 
  onClick = null, 
  className = '', 
  animated = true,
  title = null
}) => {
  const handleClick = () => {
    if (onClick && typeof onClick === 'function') {
      onClick(!isLocked);
    }
  };

  const getTitle = () => {
    if (title) return title;
    return isLocked ? 'Tài khoản bị khóa' : 'Tài khoản hoạt động';
  };

  return (
    <div 
      className={`lock-icon ${size} ${isLocked ? 'locked' : 'unlocked'} ${animated ? 'animated' : ''} ${onClick ? 'clickable' : ''} ${className}`}
      onClick={handleClick}
      title={getTitle()}
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
        className="lock-svg"
      >
        {/* Thân ổ khóa */}
        <rect 
          x="3" 
          y="11" 
          width="18" 
          height="11" 
          rx="2" 
          ry="2" 
          stroke="currentColor" 
          strokeWidth="2"
          className="lock-body"
        />
        
        {/* Móc khóa - thay đổi theo trạng thái */}
        <path 
          d={isLocked 
            ? "M7 11V7C7 5.67392 7.52678 4.40215 8.46447 3.46447C9.40215 2.52678 10.6739 2 12 2C13.3261 2 14.5979 2.52678 15.5355 3.46447C16.4732 4.40215 17 5.67392 17 7V11" 
            : "M7 11V7C7 5.67392 7.52678 4.40215 8.46447 3.46447C9.40215 2.52678 10.6739 2 12 2C13.3261 2 14.5979 2.52678 15.5355 3.46447C16.4732 4.40215 17 5.67392 17 7"
          }
          stroke="currentColor" 
          strokeWidth="2"
          className="lock-shackle"
        />
        
        {/* Dấu hiệu mở khóa (chỉ hiển thị khi unlocked) */}
        {!isLocked && (
          <g className="unlock-indicator">
            <path 
              d="M17 7L21 3" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round"
              className="unlock-line"
            />
            <circle 
              cx="20" 
              cy="4" 
              r="1.5" 
              fill="currentColor"
              className="unlock-dot"
            />
          </g>
        )}
        
        {/* Chấm khóa ở giữa */}
        <circle 
          cx="12" 
          cy="16.5" 
          r="1.5" 
          fill="currentColor"
          className="lock-dot"
        />
      </svg>
      
      {/* Overlay effect khi hover */}
      <div className="lock-overlay"></div>
    </div>
  );
};

export default LockIcon;