import fetch from "node-fetch"

export async function handler(event, context) {
  // if (event.httpMethod !== "POST") {
  //   return {
  //     statusCode: 405,
  //     body: "Method Not Allowed"
  //   }
  // }

  const sudoku_api_url = "https://youdosudoku.com/api/"

  try {
    console.log("Received event: ", event)

    const response = await fetch(sudoku_api_url)
    // const response = await fetch(sudoku_api_url, {
    //   method: "POST",
    //   headers: {
    //     // "Accept": "application/json",
    //     "Content-Type": "application/json"
    //   },
    //   body: JSON.parse(event.body)
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
      body: JSON.stringify(data.puzzle),
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type"
      }
    }
  } catch (error) {
    console.error("ERROR CATCH PROXY: ", error.message)
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    }
  }
}
