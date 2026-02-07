export async function callApi(endpoint, method = "GET", body = null) {
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const options = {
    method,
    headers: { "Content-Type": "application/json" }
  };
  if (body) options.body = JSON.stringify(body);

  const res = await fetch(`${API_URL}${endpoint}`, options);
  return res.json();
}
