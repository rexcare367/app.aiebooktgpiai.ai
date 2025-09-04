import { useState, useEffect, useRef, useCallback } from "react";
import { useDispatch } from "react-redux";
import { useHistory, useLocation } from "react-router-dom";
import { searchBooks } from "../../../../store/actions/book";
import StorageUtil from "../../../../utils/serviceUtils/storageUtil";
import { SearchBoxProps, SearchBoxState, SearchBoxHandlers } from "../types";

export const useSearchBox = (props: SearchBoxProps) => {
  const dispatch = useDispatch();
  const history = useHistory();
  const location = useLocation();
  const searchBoxRef = useRef<HTMLInputElement>(null);

  const [state, setState] = useState<SearchBoxState>({
    inputValue: props.keyword || "",
    isFocused: false,
    isComposing: false,
  });

  // Update input value when keyword prop changes
  useEffect(() => {
    setState(prev => ({ ...prev, inputValue: props.keyword || "" }));
  }, [props.keyword]);

  // Focus search box when nav search is active
  useEffect(() => {
    if (props.isNavSearch) {
      searchBoxRef.current?.focus();
    }
  }, [props.isNavSearch]);

  const handleSearch = useCallback((value: string) => {
    setState(prev => ({ ...prev, inputValue: value }));
    // Uncomment when search functionality is needed
    // dispatch(searchBooks(value));
    // props.handleSearchKeyword(value);
    // props.handleSearch(true);
  }, [dispatch, props]);

  const handleKeyDown = useCallback((event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      const value = searchBoxRef.current?.value || "";
      const trimmedValue = value.trim();
      handleSearch(trimmedValue);

      // Update URL with search keyword
      const searchParams = new URLSearchParams(location.search);

      if (trimmedValue) {
        searchParams.set("keyword", trimmedValue);
      } else {
        searchParams.delete("keyword");
      }

      const queryString = searchParams.toString();
      history.replace({
        pathname: location.pathname,
        search: queryString ? `?${queryString}` : "",
        hash: location.hash,
      });
    }
  }, [handleSearch, location, history]);

  const handleCancel = useCallback(() => {
    if (props.isNavSearch) {
      props.handleSearchList(null);
    }
    props.handleSearch(false);
    if (searchBoxRef.current) {
      searchBoxRef.current.value = "";
    }
    handleSearch("");
  }, [props, handleSearch]);

  const handleFocus = useCallback((event: React.FocusEvent<HTMLInputElement>) => {
    const target = event.target;
    target.style.borderColor = 'var(--active-theme-color)';
    target.style.boxShadow = '0 0 0 2px var(--active-theme-light)';
    
    setState(prev => ({ ...prev, isFocused: true }));
    
    if (props.mode === "nav") {
      props.handleNavSearchState("focused");
    }
  }, [props]);

  const handleBlur = useCallback((event: React.FocusEvent<HTMLInputElement>) => {
    const target = event.target;
    target.style.borderColor = 'var(--border-color)';
    target.style.boxShadow = 'none';
    
    setState(prev => ({ ...prev, isFocused: false }));
  }, []);

  const handleCompositionStart = useCallback(() => {
    if (StorageUtil.getReaderConfig("isNavLocked") === "yes") {
      return;
    }
    
    StorageUtil.setReaderConfig("isTempLocked", "yes");
    StorageUtil.setReaderConfig("isNavLocked", "yes");
    setState(prev => ({ ...prev, isComposing: true }));
  }, []);

  const handleCompositionEnd = useCallback(() => {
    if (StorageUtil.getReaderConfig("isTempLocked") === "yes") {
      StorageUtil.setReaderConfig("isNavLocked", "");
      StorageUtil.setReaderConfig("isTempLocked", "");
    }
    setState(prev => ({ ...prev, isComposing: false }));
  }, []);

  const handlers: SearchBoxHandlers = {
    handleSearch,
    handleKeyDown,
    handleCancel,
    handleFocus,
    handleBlur,
    handleCompositionStart,
    handleCompositionEnd,
  };

  return {
    state,
    handlers,
    searchBoxRef,
  };
};
