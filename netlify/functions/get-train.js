const handler = async function (event) {
  const { start, end } = event.queryStringParameters || {};

  if (!start || !end) {
    return { statusCode: 400, body: JSON.stringify({ msg: 'Missing required query params: start, end' }) };
  }

  try {
    const response = await fetch(`https://www3.septa.org/api/NextToArrive/index.php?req1=${encodeURIComponent(start)}&req2=${encodeURIComponent(end)}&req3=2`, {
      headers: { Accept: 'application/json' },
    });

    if (!response.ok) {
      return { statusCode: response.status, body: response.statusText };
    }

    const data = await response.json();

    return {
      statusCode: 200,
      body: JSON.stringify({ data }),
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ msg: error.message }),
    };
  }
};

module.exports = { handler };
