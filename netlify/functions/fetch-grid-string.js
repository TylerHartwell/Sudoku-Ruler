import fetch from "node-fetch"

export async function handler(event, context) {
  const sudoku_api_url = "https://youdosudoku.com/api/"

  try {
    const response = await fetch(sudoku_api_url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
        // "Access-Control-Allow-Origin": "*",
        // "Access-Control-Allow-Headers": "Content-Type",
        // "Access-Control-Allow-Methods": "GET, POST"
      },
      body: JSON.stringify({
        difficulty: "hard",
        solution: true,
        array: false
      })
    })

    if (!response.ok) {
      return {
        statusCode: response.status,
        body: JSON.stringify({ error: `HTTP error! Status: ${response.status}` })
      }
    }

    const data = await response.json()

    if (!data || !data.puzzle) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "Invalid response format" })
      }
    }

    return {
      statusCode: 200,
      body: JSON.stringify(data.puzzle)
    }
  } catch (error) {
    console.error("Error fetching or processing data:", error.message)
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    }
  }
}
