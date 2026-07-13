export const rupeeToPaisa = (rupees: number): number => {
  return Math.round(rupees * 100);
};

export const paisaToRupee = (paisa: number): number => {
  return paisa / 100;
};
