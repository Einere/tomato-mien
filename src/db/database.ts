export { TomatoMienDB } from "./TomatoMienDB";
import { TomatoMienDB } from "./TomatoMienDB";

export const db = new TomatoMienDB();

// 모듈 로드 시 즉시 DB 연결 시작 (lazy open 대신 eager open)
// React mount + useEffect 스케줄링 동안 DB open이 병렬로 진행됨
export const dbReady = db.open().catch(err => {
  console.error("[DB] Failed to open:", err);
});
