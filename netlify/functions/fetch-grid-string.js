const fetch = require("node-fetch")

exports.handler = async function (event, context) {
  const sudoku_api_url = "https://youdosudoku.com/api/"

  try {
    const response = await fetch(sudoku_api_url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
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

    const data = response.data

    if (!data || !data.puzzle) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "Invalid response format" })
      }
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ puzzle: data.puzzle })
    }
  } catch (error) {
    console.error("Error fetching or processing data:", error.message)
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    }
  }
}
