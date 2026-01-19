// src/views/monitoring/service/mock-api-service.ts
import type { MachineData, ZoneType, StoredItem } from "./monitoring-model";

// 네트워크 지연 시간 시뮬레이션 (0.5초 딜레이)
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// ★ 백엔드 API를 대신하는 함수입니다.
// 나중에 이 함수 내부만 axios.get(...)으로 바꾸면 됩니다.
export const fetchMonitoringData = async (): Promise<MachineData[]> => {
  await delay(500); // 로딩 중인 척 0.5초 대기

  const data: MachineData[] = [];

  // 데이터 생성 설정값 (DB에서 가져온다고 가정)
  const CELL_W = 28;
  const CELL_H = 18;
  const GAP = 4;
  const BIG_W = 40;
  const BIG_H = 60;

  // 전체 레이아웃 좌표 설정 (기존 generateLayout 안에 있던 내용)
  const layoutConfig = [
    // === [상단 구역] 빨간색 세로 라인 ===
    { id: "A-01", type: "STORAGE_A", x: 60, y: 50, rows: 16, cols: 1 },
    { id: "A-02", type: "STORAGE_A", x: 100, y: 50, rows: 16, cols: 1 },
    { id: "A-03", type: "STORAGE_A", x: 140, y: 50, rows: 16, cols: 1 },
    { id: "A-04", type: "STORAGE_A", x: 230, y: 50, rows: 16, cols: 1 },
    { id: "A-05", type: "STORAGE_A", x: 270, y: 50, rows: 16, cols: 1 },
    { id: "A-06", type: "STORAGE_A", x: 310, y: 50, rows: 16, cols: 1 },
    { id: "A-07", type: "STORAGE_A", x: 410, y: 50, rows: 16, cols: 1 },
    { id: "A-08", type: "STORAGE_A", x: 450, y: 50, rows: 16, cols: 1 },
    { id: "A-09", type: "STORAGE_A", x: 490, y: 50, rows: 16, cols: 1 },
    { id: "A-10", type: "STORAGE_A", x: 580, y: 50, rows: 16, cols: 1 },
    { id: "A-11", type: "STORAGE_A", x: 620, y: 50, rows: 16, cols: 1 },
    { id: "A-12", type: "STORAGE_A", x: 660, y: 50, rows: 16, cols: 1 },
    { id: "A-13", type: "STORAGE_A", x: 760, y: 50, rows: 16, cols: 1 },
    { id: "A-14", type: "STORAGE_A", x: 800, y: 50, rows: 16, cols: 1 },
    { id: "A-15", type: "STORAGE_A", x: 840, y: 50, rows: 10, cols: 1 },

    // === [대기 구역] 주황색 라인 ===
    { id: "STG-L1", type: "STAGING", x: 20, y: 50, rows: 16, cols: 1, w: 20 },
    { id: "STG-M1", type: "STAGING", x: 190, y: 50, rows: 16, cols: 1, w: 20 },
    { id: "STG-M2", type: "STAGING", x: 360, y: 50, rows: 16, cols: 1, w: 20 },
    { id: "STG-M3", type: "STAGING", x: 540, y: 50, rows: 16, cols: 1, w: 20 },
    { id: "STG-M4", type: "STAGING", x: 720, y: 50, rows: 16, cols: 1, w: 20 },

    // === [하단 중앙] 가로 긴 대기 구역 ===
    {
      id: "STG-HZ",
      type: "STAGING",
      x: 60,
      y: 430,
      rows: 1,
      cols: 20,
      w: 30,
      h: 20,
    },

    // === [하단 좌측] 파란색 구역 ===
    {
      id: "B-TOP",
      type: "STORAGE_B",
      x: 250,
      y: 480,
      rows: 1,
      cols: 7,
      w: BIG_W,
      h: BIG_H,
    },
    {
      id: "B-BOT",
      type: "STORAGE_B",
      x: 250,
      y: 610,
      rows: 1,
      cols: 6,
      w: BIG_W,
      h: BIG_H,
    },

    // === [하단 우측] 초록색 구역 ===
    {
      id: "C-BOT",
      type: "STORAGE_C",
      x: 530,
      y: 610,
      rows: 1,
      cols: 7,
      w: BIG_W,
      h: BIG_H,
    },

    // === [하단 대기 구역] 주황색 ===
    {
      id: "STG-B",
      type: "STAGING",
      x: 250,
      y: 570,
      rows: 1,
      cols: 7,
      w: BIG_W,
      h: 15,
    },
    {
      id: "STG-C",
      type: "STAGING",
      x: 570,
      y: 570,
      rows: 1,
      cols: 7,
      w: BIG_W,
      h: 15,
    },
  ] as const;

  layoutConfig.forEach((cfg) => {
    const _w = cfg.w || CELL_W;
    const _h = cfg.h || CELL_H;

    for (let r = 0; r < cfg.rows; r++) {
      for (let c = 0; c < cfg.cols; c++) {
        const x = cfg.x + c * (_w + GAP);
        const y = cfg.y + r * (_h + GAP);

        // 셀마다 다른 데이터 시뮬레이션
        const curLoad = Math.floor(Math.random() * 101);
        const items: StoredItem[] = Array.from({
          length: Math.floor(curLoad / 20),
        }).map((_, idx) => ({
          itemId: `ITM-${idx}`,
          itemName: "Part",
          lotId: "L-1",
          quantity: 10,
          inDate: "2025-01-20",
        }));

        data.push({
          id: `${cfg.id}-${r}-${c}`,
          zone: cfg.id,
          zoneType: cfg.type as ZoneType,
          x,
          y,
          width: _w,
          height: _h,
          status: ["RUN", "IDLE", "DOWN", "PM"][
            Math.floor(Math.random() * 4)
          ] as any,
          maxCapacity: 100,
          currentLoad: curLoad,
          items: items,
        });
      }
    }
  });

  return data; // 완성된 데이터 배열 반환
};
