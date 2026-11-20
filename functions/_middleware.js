export function onRequest({ request, next }) {
  const target = new URL(request.url);
  if (!["caliyang.dpdns.org", "www.caliyang.dpdns.org"].includes(target.hostname)) {
    return next();
  }

  target.protocol = "https:";
  target.host = "caliyang.cn";
  return Response.redirect(target.href, 301);
}
