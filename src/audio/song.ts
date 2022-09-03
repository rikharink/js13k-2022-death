export interface Song {
  kick: { index: number; notes: Bar[] };
  hh: { index: number; notes: Bar[] };
}

export type Bar = boolean[];
