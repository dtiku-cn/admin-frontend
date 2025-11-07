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
  raw_html: string,
  readability_page: any,
  dom_smoothie_article: any,
}

export interface WebTextLabelResponse {
  text: string;
  labeled_text: LabelSentence[];
}

export interface LabelSentence {
  sentence: string,
  label?: string,
}

export interface SearchItem {
  url: string;
  title: string;
  desc: string;
}

export enum FromTypeDesc {
  fenbi = '粉笔',
  huatu = '华图',
  offcn = '中公',
  chinagwy = 'ChinaGWY',
  mock_exam = '模考',
}

export type FromType = keyof FromTypeDesc;

// 支付订单相关类型
export enum OrderStatusDesc {
  created = '已创建',
  paid = '已付款',
  canceled = '已取消',
  refunded = '已退款',
}

export type OrderStatus = keyof typeof OrderStatusDesc;

export const ORDER_STATUS_COLORS: Record<OrderStatus, 'default' | 'success' | 'error' | 'warning'> = {
  created: 'default',
  paid: 'success',
  canceled: 'error',
  refunded: 'warning',
};

export enum OrderLevelDesc {
  monthly = '月度',
  quarterly = '季度',
  half_year = '半年',
  annual = '一年',
}

export type OrderLevel = keyof typeof OrderLevelDesc;

export enum PayFromDesc {
  alipay = '支付宝',
  wechat = '微信',
}

export type PayFrom = keyof typeof PayFromDesc;

export interface PayOrder {
  id: number;
  user_id: number;
  user_name?: string;
  user_avatar?: string;
  level: OrderLevel;
  pay_from: PayFrom;
  resp: any;
  confirm: string | null;
  status: OrderStatus;
  created: string;
  modified: string;
}

export interface PayOrderQuery {
  user_id?: number;
  status?: OrderStatus;
  pay_from?: PayFrom;
}

export interface PayStatsByDay {
  day: string;
  paid_count: number;
  paid_amount: number;
  unpaid_user_count: number;
}

export interface PayStats {
  stats: PayStatsByDay[];
  unpaid_user_count: number;
}