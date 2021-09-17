import axios from 'axios'

export const getPieceInfo = async (id) => {
  const query = `
  query Objkt($id: bigint!) {
    hic_et_nunc_token_by_pk(id: $id) {
      swaps(where: {status: {_eq: "0"}}, order_by: {price: asc}) {
        price
        id
      }
    }
  }
`;

  const fetchGraphQL = async (operationsDoc, operationName, variables) => {
    const result = await axios.post(
      "https://api.hicdex.com/v1/graphql",
      JSON.stringify({
        query: operationsDoc,
        variables: variables,
        operationName: operationName
      })
    );

    return await result
  }

  try {
    const { data } = await fetchGraphQL(query, "Objkt", { "id": id });
    const result = data.data.hic_et_nunc_token_by_pk
    result.swaps.sort((a, b) => {
      return Number(a.price) - Number(b.price)
    })
    if (result.swaps.length && result.swaps[0]) {
      return result.swaps[0]
    } else {
      return false
    }
  } catch {
    return false
  }
}

