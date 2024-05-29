export async function handler(event, context) {
  try {
    const sudoku_api_url = "https://youdosudoku.com/api/"

    const response = await fetch(sudoku_api_url)
    // const response = await fetch(sudoku_api_url, {
    //   method: "POST",
    //   headers: {
    //     "Content-Type": "application/json"
    //   },
    //   body: JSON.stringify({
    //     difficulty: "hard",
    //     solution: false,
    //     array: false
    //   })
    // })

    if (!response.ok) {
      throw new Error(`PROXY RESPONSE NOT OKAY: ${response.status}`)
    }

    const data = await response.json()
    console.log("DATA: ", data)

    if (!data || !data.puzzle) {
      throw new Error(`NO PUZZLE DATA: ${response.status}`)
    }

    return {
      statusCode: 200,
      body: JSON.stringify(data.puzzle)
    }
  } catch (error) {
    console.error("ERROR CATCH PROXY: ", error.message)
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    }
  }
}
