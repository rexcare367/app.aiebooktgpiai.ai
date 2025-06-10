import React from "react";
import { SearchBoxProps } from "./interface";
import StorageUtil from "../../utils/serviceUtils/storageUtil";

class SearchBox extends React.Component<SearchBoxProps> {
  componentDidMount() {
    if (this.props.isNavSearch) {
      let searchBox: any = document.querySelector(".search-input");
      searchBox && searchBox.focus();
    }
  }
  handleMouse = () => {
    let value = (this.refs.searchBox as any).value;
    this.props.handleSearchKeyword(value.trim());
  };

  handleKey = (event: any) => {
    if (event.keyCode !== 13) {
      return;
    }
    let value = (this.refs.searchBox as any).value;
    this.props.handleSearchKeyword(value.trim());
  };
  search = async (q: string) => {
    this.props.handleNavSearchState("searching");
    let searchList = await this.props.htmlBook.rendition.doSearch(q);
    this.props.handleNavSearchState("pending");
    this.props.handleSearchList(
      searchList.map((item: any) => {
        item.excerpt = item.excerpt.replace(q, `<span class="text-blue-500">${q}</span>`);
        return item;
      })
    );
  };

  handleCancel = () => {
    if (this.props.isNavSearch) {
      this.props.handleSearchList(null);
    }
    this.props.handleSearch(false);
    (document.querySelector(".search-input") as HTMLInputElement).value = "";
  };

  render() {
    return (
      <div className="relative">
        <input
          type="text"
          ref="searchBox"
          className="search-input rounded-xl bg-gray-100 text-black placeholder-black pl-3 text-sm outline-none border-none w-full md:h-10 h-8"
          onKeyDown={(event) => {
            this.handleKey(event);
          }}
          onFocus={() => {
            this.props.mode === "nav" && this.props.handleNavSearchState("focused");
          }}
          placeholder={
            this.props.isNavSearch || this.props.mode === "nav"
              ? this.props.t("Search")
              : this.props.tabMode === "note"
              ? this.props.t("Search")
              : this.props.tabMode === "digest"
              ? this.props.t("Search")
              : this.props.t("Search")
          }
          style={
            this.props.mode === "nav"
              ? {
                  width: this.props.width,
                  height: this.props.height,
                  paddingRight: "30px",
                }
              : {}
          }
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
        {this.props.isSearch ? (
          <span
            className="absolute top-0 right-0 text-[15px] w-10 h-full cursor-pointer flex items-center justify-center hover:rounded-full"
            onClick={() => {
              this.handleCancel();
            }}
            style={this.props.mode === "nav" ? { right: "-9px", top: "14px" } : {}}
          >
            <span className="icon-close"></span>
          </span>
        ) : (
          <span className="absolute top-0 right-0 text-[15px] w-10 h-full cursor-pointer flex items-center justify-center">
            <span
              className="icon-search text-[22px] inline-block opacity-60 cursor-pointer"
              style={this.props.mode === "nav" ? { right: "5px" } : {}}
              onClick={() => {
                this.handleMouse();
              }}
            ></span>
          </span>
        )}
      </div>
    );
  }
}

export default SearchBox;
