import { ReactNode } from "react";

export interface TabItem {
  key: string;
  title: string;
  icon: ReactNode;
}

export interface MenuItem {
  key: string;
  icon: ReactNode;
  label: string;
  children?: Omit<MenuItem, "icon">[];
}
