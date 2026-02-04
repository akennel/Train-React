const handler = async function () {
  try {
    const response = await fetch('https://www3.septa.org/api/TrainView/index.php', {
      headers: { Accept: 'application/json' },
    })
    if (!response.ok) {
      return { statusCode: response.status, body: response.statusText }
    }

    const data = await response.json()

    return {
      statusCode: 200,
      body: JSON.stringify({ data: data }),
    }

  } catch (error) {
    console.log(error)
    return {
      statusCode: 500,
      body: JSON.stringify({ msg: error.message }),
    }
  }
}

module.exports = { handler }
