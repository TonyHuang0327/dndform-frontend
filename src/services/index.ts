//TOFIX: 這裡是假的，應該要從後端取得，之後會改成async function
export const apiOcrList = () => {
    return [
      { id: 1, name: "交通票" },
      { id: 2, name: "收據" },
      { id: 3, name: "運輸票" },
      { id: 4, name: "其他" },
    ];
  };