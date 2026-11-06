// App privada: que ningún buscador la indexe.
export default function robots() {
  return { rules: { userAgent: "*", disallow: "/" } };
}
