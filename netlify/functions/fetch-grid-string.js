import fetch from "node-fetch"

export async function handler(event, context) {
  console.log("EVENT: ", event.path, event.httpMethod, event.body)
  if (event.httpMethod !== "POST") {
    throw new Error("NOT A POST REQUEST")
  }
  console.log("TEST: ", JSON.stringify(JSON.parse(event.body)))

  try {
    const requestBody = JSON.parse(event.body)
    const sudoku_api_url = "https://youdosudoku.com/api/"

    // const response = await fetch(sudoku_api_url)
    const response = await fetch(sudoku_api_url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(requestBody)
    })
    console.log("Response Status:", response.status)
    console.log("Response Headers:", response.headers)

    if (!response.ok) {
      throw new Error(`PROXY RESPONSE NOT OKAY: ${response.status}`)
    }

    const data = await response.json()
    console.log("data: ", data)

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
