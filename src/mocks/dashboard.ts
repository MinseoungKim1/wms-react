export interface DashboardStat {
  title: string;
  value: string | number;
  change: string;
  icon: string; // 이모지 사용
  type: "inbound" | "outbound" | "stock" | "alert";
}

// 이 변수 이름이 바로 'dashboardStats' 입니다!
export const dashboardStats: DashboardStat[] = [
  {
    title: "금일 입고 예정",
    value: "120 건",
    change: "+5건",
    icon: "🚛",
    type: "inbound",
  },
  {
    title: "출고 지시 대기",
    value: "45 건",
    change: "-2건",
    icon: "📦",
    type: "outbound",
  },
  {
    title: "총 재고 수량",
    value: "14,500 EA",
    change: "변동없음",
    icon: "🏭",
    type: "stock",
  },
  {
    title: "재고 부족 알림",
    value: "3 건",
    change: "주의 필요",
    icon: "🚨",
    type: "alert",
  },
];
