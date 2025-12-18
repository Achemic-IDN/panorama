res.cookies.set(
  "auth",
  JSON.stringify({ role: "admin" }),
  {
    httpOnly: true,
    path: "/",
  }
);
