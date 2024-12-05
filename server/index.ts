import compression from "compression";
import express from "express";
import morgan from "morgan";
import { development } from "./development.ts";
import { production } from "./production.ts";

export type Express = ReturnType<typeof express>;

const DEVELOPMENT = process.env.NODE_ENV === "development";
const PORT = Number.parseInt(process.env.PORT || "3000");

const app = express();

app.use(compression());
app.disable("x-powered-by");

if (DEVELOPMENT) {
  await development(app);
} else {
  await production(app);
}

app.use(morgan("tiny"));

const hostname = DEVELOPMENT ? "localhost" : "0.0.0.0";
app.listen(PORT, hostname, () => {
  console.log(
    "\x1b[32m%s\x1b[0m",
    `server running @ http://${hostname}:${PORT}`,
  );
});
