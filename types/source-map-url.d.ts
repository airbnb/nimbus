declare module 'source-map-url' {
  class SMU {
    removeFrom(code: string): string;
  }

  const smu: SMU;
  export default smu;
}
