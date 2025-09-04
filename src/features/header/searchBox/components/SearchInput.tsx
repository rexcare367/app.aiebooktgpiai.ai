import React from "react";
import { SearchBoxProps, SearchBoxState, SearchBoxHandlers } from "../types";

interface SearchInputProps {
  props: SearchBoxProps;
  state: SearchBoxState;
  handlers: SearchBoxHandlers;
  searchBoxRef: React.RefObject<HTMLInputElement>;
}

const SearchInput: React.FC<SearchInputProps> = ({ props, state, handlers, searchBoxRef }) => {
  const getPlaceholderText = () => {
    if (props.isNavSearch || props.mode === "nav") {
      return props.t("Search");
    }
    
    switch (props.tabMode) {
      case "note":
      case "digest":
        return props.t("Search");
      default:
        return props.t("Search");
    }
  };

  const getInputStyles = () => {
    const baseStyles = {
      backgroundColor: 'var(--bg-color-2)',
      color: 'var(--text-color)',
      border: '1px solid var(--border-color)',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      paddingLeft: '40px', // Space for search icon
    };

    if (props.mode === "nav") {
      return {
        height: props.height,
        paddingRight: state.inputValue ? "60px" : "30px", // Space for clear icon when there's input
        ...baseStyles,
      };
    }

    return {
      ...baseStyles,
      paddingRight: state.inputValue ? "40px" : "12px", // Space for clear icon when there's input
    };
  };

  const getContainerStyles = () => {
    return {
      position: 'relative' as const,
      display: 'flex',
      alignItems: 'center',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    };
  };

  return (
    <div style={getContainerStyles()}>
      {/* Search Icon */}
      <div 
        className="absolute left-3 z-10 pointer-events-none"
        style={{
          color: 'var(--text-color-2)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          transform: state.isFocused ? 'scale(1.1)' : 'scale(1)',
          opacity: state.isFocused ? 1 : 0.7,
        }}
      >
        <svg 
          width="16" 
          height="16" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="8"></circle>
          <path d="m21 21-4.35-4.35"></path>
        </svg>
      </div>

      <input
        ref={searchBoxRef}
        className="search-input rounded-xl text-sm outline-none border-none w-40 md:w-60 md:h-10 h-8 focus:w-48 md:focus:w-64"
        style={getInputStyles()}
        value={state.inputValue}
        onChange={(e) => handlers.handleSearch(e.target.value)}
        onKeyDown={handlers.handleKeyDown}
        onFocus={handlers.handleFocus}
        onBlur={handlers.handleBlur}
        onCompositionStart={handlers.handleCompositionStart}
        onCompositionEnd={handlers.handleCompositionEnd}
        placeholder={getPlaceholderText()}
        aria-label="Search"
        role="searchbox"
      />

      {/* Clear Icon - Only show when there's input */}
      {state.inputValue && (
        <div 
          className="absolute right-3 z-10 cursor-pointer"
          onClick={handlers.handleCancel}
          style={{
            color: 'var(--text-color-2)',
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            transform: 'scale(1)',
            opacity: 0.8,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = '1';
            e.currentTarget.style.transform = 'scale(1.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = '0.8';
            e.currentTarget.style.transform = 'scale(1)';
          }}
          role="button"
          tabIndex={0}
          aria-label="Clear search"
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              handlers.handleCancel();
            }
          }}
        >
          <svg 
            width="16" 
            height="16" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </div>
      )}
    </div>
  );
};

export default SearchInput;
