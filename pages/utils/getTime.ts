/**
 * 시간 구하기.
 * @param date 문자열
 * @param long 더 길게?
 */
export default (date: string, long?: boolean): string => {
  const YYYYMMDD = (time: Date): string => `${time.getFullYear()}.${(time.getMonth() + 1).toString().padStart(2, "0")}.${time.getDate()}`;

  const time = new Date(date);
  const now = new Date();

  const longText = `${time.getHours().toString().padStart(2, "0")}:${time.getMinutes().toString().padStart(2, "0")}:${time.getSeconds().toString().padStart(2, "0")}`;
  const result = `${YYYYMMDD(time)}`;

  if (YYYYMMDD(now) === result) {
    return `오늘 ${longText}`;
  }
  
  return `${result}${long ? ` ${longText}` : ""}`;
}