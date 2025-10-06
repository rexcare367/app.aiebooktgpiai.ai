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

  return (
    <div className="relative flex items-center transition-all duration-300 ease-out dark:text-white">
      {/* Search Icon */}
      <div 
        className={`absolute left-3 z-10 pointer-events-none text-text-2 transition-all duration-300 ease-out ${
          state.isFocused ? 'scale-110 opacity-100' : 'scale-100 opacity-70'
        }`}
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
        className={`rounded-xl text-sm border-2 bg-transparent !border-gray-200 dark:!border-transparent/20 transition-all duration-300 ease-out pl-10 ${
          props.mode === "nav" 
            ? `${props.height} ${state.inputValue ? 'pr-15' : 'pr-8'}` 
            : `${state.inputValue ? 'pr-10' : 'pr-3'}`
        } w-40 md:w-60 md:h-10 h-8 focus:w-48 md:focus:w-64`}
        value={state.inputValue}
        onChange={(e) => handlers.handleSearch(e.target.value)}
        onKeyDown={handlers.handleKeyDown}
        onCompositionStart={handlers.handleCompositionStart}
        onCompositionEnd={handlers.handleCompositionEnd}
        placeholder={getPlaceholderText()}
        aria-label="Search"
        role="searchbox"
      />

      {/* Clear Icon - Only show when there's input */}
      {state.inputValue && (
        <div 
          className="absolute right-3 z-10 cursor-pointer text-text-2 transition-all duration-200 ease-out scale-100 opacity-80 hover:opacity-100 hover:scale-110"
          onClick={handlers.handleCancel}
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
