import React, { useState, useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { useHistory, useLocation } from "react-router-dom";
import { SearchBoxProps } from "./interface";
import { searchBooks } from "../../store/actions/book";
import StorageUtil from "../../utils/serviceUtils/storageUtil";

const SearchBox: React.FC<SearchBoxProps> = (props) => {
  const dispatch = useDispatch();
  const history = useHistory();
  const location = useLocation();
  const [inputValue, setInputValue] = useState(props.keyword || "");
  const searchBoxRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setInputValue(props.keyword || "");
  }, [props.keyword]);

  useEffect(() => {
    if (props.isNavSearch) {
      searchBoxRef.current?.focus();
    }
  }, [props.isNavSearch]);

  const handleSearch = (value: string) => {
    setInputValue(value);
    // dispatch(searchBooks(value));
    // props.handleSearchKeyword(value);
    // props.handleSearch(true);
  };

  const handleKey = (event: React.KeyboardEvent) => {
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
  };

  const handleCancel = () => {
    if (props.isNavSearch) {
      props.handleSearchList(null);
    }
    props.handleSearch(false);
    if (searchBoxRef.current) {
      searchBoxRef.current.value = "";
    }
    handleSearch("");
  };

  return (
    <div className="relative">
      <input
        ref={searchBoxRef}
        className="search-input rounded-xl pl-3 text-sm outline-none border-none w-full md:h-10 h-8"
        style={
          props.mode === "nav"
            ? {
                width: props.width,
                height: props.height,
                paddingRight: "30px",
              }
            : {backgroundColor: 'var(--bg-color-2)',
              color: 'var(--text-color)',
              border: '1px solid var(--border-color)'}
          }
        value={inputValue}
        onChange={(e) => handleSearch(e.target.value)}
        onKeyDown={handleKey}
        placeholder={
          props.isNavSearch || props.mode === "nav"
            ? props.t("Search")
            : props.tabMode === "note"
            ? props.t("Search")
            : props.tabMode === "digest"
            ? props.t("Search")
            : props.t("Search")
        }
        onFocus={(e) => {
          e.target.style.borderColor = 'var(--active-theme-color)';
          e.target.style.boxShadow = '0 0 0 2px var(--active-theme-light)';
          props.mode === "nav" && props.handleNavSearchState("focused");
        }}
        onBlur={(e) => {
          e.target.style.borderColor = 'var(--border-color)';
          e.target.style.boxShadow = 'none';
        }}
        onCompositionStart={() => {
          if (StorageUtil.getReaderConfig("isNavLocked") === "yes") {
            return;
          } else {
            StorageUtil.setReaderConfig("isTempLocked", "yes");
            StorageUtil.setReaderConfig("isNavLocked", "yes");
          }
        }}
        onCompositionEnd={() => {
          if (StorageUtil.getReaderConfig("isTempLocked") === "yes") {
            StorageUtil.setReaderConfig("isNavLocked", "");
            StorageUtil.setReaderConfig("isTempLocked", "");
          }
        }}
      />
      <span
        className="icon-close absolute right-2 top-1/2 transform -translate-y-1/2 cursor-pointer"
        style={{
          ...(props.mode === "nav" ? { right: "-9px", top: "14px" } : {}),
          color: 'var(--text-color-2)'
        }}
        onClick={() => {
          handleCancel();
        }}
      ></span>
    </div>
  );
};

export default SearchBox;
