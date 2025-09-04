import React from "react";
import { SearchBoxProps } from "./types";
import { useSearchBox } from "./hooks/useSearchBox";
import SearchInput from "./components/SearchInput";

/**
 * Professional SearchBox component with improved architecture
 * 
 * Features:
 * - Clean separation of concerns with custom hooks
 * - Modular component structure
 * - Better TypeScript support
 * - Improved accessibility
 * - Professional code organization
 * - Smooth animations and professional UX
 */
const SearchBox: React.FC<SearchBoxProps> = (props) => {
  const { state, handlers, searchBoxRef } = useSearchBox(props);

  return (
    <div className="relative">
      <SearchInput
        props={props}
        state={state}
        handlers={handlers}
        searchBoxRef={searchBoxRef}
      />
    </div>
  );
};

export default SearchBox;
