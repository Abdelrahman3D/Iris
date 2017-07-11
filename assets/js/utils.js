export const imgMul = (n, lhs, rhs, c) => {
  const d = lhs.data[n];
  const e = rhs.data[n];

  for (let i = 0; i < d.cols * d.rows; i++) {
    d.data[i] = c * (d.data[i] + e.data[i]);
  }
};

export const imgSub = (a, b) => {
  const adata = a.data;
  const bdata = b.data;
  const w = a.cols;
  const h = a.rows;
  const n = w * h;
  for (let i = 0; i < n; ++i) {
    bdata[i] -= adata[i];
  }
};

export const imgAdd = (a, b) => {
  const adata = a.data;
  const bdata = b.data;
  const w = a.cols;
  const h = a.rows;
  const n = w * h;

  for (let i = 0; i < n; ++i) {
    adata[i] += bdata[i];
  }
};
