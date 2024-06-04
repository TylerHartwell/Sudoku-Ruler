import fetch from "node-fetch"

export async function handler(event, context) {
  // if (event.httpMethod !== "POST") {
  //   return {
  //     statusCode: 405,
  //     body: "Method Not Allowed"
  //   }
  // }

  const sudoku_api_url = "https://youdosudoku.com/api/"

  // const myHeaders = new Headers()
  // myHeaders.append("Content-Type", "application/json")

  // const raw = JSON.stringify({
  //   difficulty: "hard",
  //   solution: false,
  //   array: false
  // })

  // const requestOptions = {
  //   method: "POST",
  //   headers: myHeaders,
  //   body: raw,
  //   redirect: "follow"
  // }

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

    // const response = await fetch("https://youdosudoku.com/api/", requestOptions)

    if (!response.ok) {
      throw new Error(`PROXY RESPONSE NOT OKAY: ${response.status}`)
    }

    console.log("RESPONSE: ", response)

    let data = await response.text()
    console.log("DATA: ", data)
    data = JSON.parse(data)

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
      body: JSON.stringify({ error: error.message }),
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type"
      }
    }
  }
}
