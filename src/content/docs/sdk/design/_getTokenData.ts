export interface TokenData {
  name: string;
  value: string;
  comment?: string;
}

export const getTokenData = (data: any) => {
  const results: TokenData[] = [];

  walk(results, '-', data);

  return results;
};

const walk = (results: TokenData[], currentName: string, data: any) => {
  if (data.value) {
    results.push({
      name: currentName,
      value: data.value,
      comment: data.comment || null,
    });
    return;
  }

  Object.entries(data).forEach((entry) => {
    walk(results, `${currentName}-${entry[0]}`, entry[1]);
  });
};
