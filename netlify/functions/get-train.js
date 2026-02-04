const handler = async function (event) {
  try {
    const { start, end } = event.queryStringParameters;
    const response = await fetch(`https://www3.septa.org/api/NextToArrive/index.php?req1=${encodeURIComponent(start)}&req2=${encodeURIComponent(end)}&req3=2`, {
      headers: { Accept: 'application/json' },
    })
    if (!response.ok) {
      // NOT res.status >= 200 && res.status < 300
      return { statusCode: response.status, body: response.statusText }
    }

    const data = await response.json()

    return {
    statusCode: 200,
    body: JSON.stringify({ data: data }),
    }

    } catch (error) {
    // output to netlify function log
    console.log(error)
    return {
      statusCode: 500,
      // Could be a custom message or object i.e. JSON.stringify(err)
      body: JSON.stringify({ msg: error.message }),
    }
  }
}

module.exports = { handler }