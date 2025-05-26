//src/containers/sidebar/interface.tsx
import { RouteComponentProps } from "react-router";

export interface SidebarProps extends RouteComponentProps<any> {
  mode: string;
  isCollapsed: boolean;
  shelfIndex: number;
  shelf: string;

  handleMode: (mode: string) => void;
  handleSearch: (isSearch: boolean) => void;
  handleCollapse: (isCollapsed: boolean) => void;
  handleSortDisplay: (isSortDisplay: boolean) => void;
  handleSelectBook: (isSelectBook: boolean) => void;
  handleShelfIndex: (shelfIndex: number) => void;
  handleShelf: (shelf: string) => void;
  t: (title: string) => string;
  handleSearchKeyword: (keyword: string) => void;
  handleSearchResults: (results: any[]) => void;
}

export interface SidebarState {
  index: number;
  hoverIndex: number;
  hoverShelf: string;
  isCollapsed: boolean;
  isCollpaseShelf: boolean;
  isCollpaseLanguages: boolean;
  shelfIndex: number;
  isOpenDelete: boolean;
  isMobile: boolean;
  isHide: boolean;
}
