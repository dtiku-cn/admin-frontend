import { ReactNode } from 'react';

export interface SystemConfig {
  id: number | null;
  version: number;
  key: string;
  key_desc: string;
  value?: any;
  created?: string | null;
  modified?: string | null;
}

export interface ScheduleTask {
  id: number | null;
  version: number;
  ty: string;
  desc: string;
  active: boolean;
  context: any;
  run_count: number;
  instances: any;
  created?: string | null;
  modified?: string | null;
}

export interface KeyPoint {
  id: number,
  name: string,
  pid: number,
  exam_id: number,
  paper_type: number,
}

export interface MenuItem {
  key: string;
  icon?: ReactNode;
  label: string;
  children?: MenuItem[];
}

export interface ExamCategory {
  id: number;
  name: string;
  prefix: string;
  pid: number;
}

export interface Label {
  id: number;
  name: string;
  pid: number;
  exam_id: number;
  paper_type: number;
  hidden: boolean;
}

export interface UserQuery {
  name?: string;
  expired?: boolean;
}

export interface User {
  id: number;
  name: string;
  wechat_id: string;
  gender: boolean;
  avatar: string;
  expired: string;
  created: string;
  modified: string;
}

export interface PageResult<T> {
  content: T[];
  size: number;
  page: number;
  total_elements: number;
  total_pages: number;
}

export interface UserStatsByDay {
  day: string;
  count: number;
}

export interface TextSimilarityResult {
  [key: string]: number;
}

export interface WebTextExtractResult {
  readability_page: any,
  dom_smoothie_article: any,
}