export const getTokenPrice = async (token: string) => {
  const url = `https://api.coingecko.com/api/v3/simple/price?ids=${token}&vs_currencies=usd`;
  const tokenResponse = await fetch(url, {
    method: "GET",
    headers: {
      accept: "application/json",
      "x-cg-demo-api-key": "CG-Z3pqWii1eUdBsE57FJLE8TFV",
    },
  });
  return tokenResponse;
};
