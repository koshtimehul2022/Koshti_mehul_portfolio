import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import fs from "fs";
import { createRequire } from "module";
import { pathToFileURL } from "url";
import { componentTagger } from "lovable-tagger";

const envPath = path.resolve(process.cwd(), ".env");
if (fs.existsSync(envPath)) {
  const envRaw = fs.readFileSync(envPath, "utf8");
  envRaw.split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || trimmed.startsWith("export ")) return;
    const equalsIndex = trimmed.indexOf("=");
    if (equalsIndex === -1) return;
    const key = trimmed.slice(0, equalsIndex).trim();
    let value = trimmed.slice(equalsIndex + 1).trim();
    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.slice(1, -1);
    }
    if (process.env[key] === undefined) {
      process.env[key] = value;
    }
  });
}

const requireFn = createRequire(import.meta.url);

const netlifyFunctionsDevPlugin = () => ({
  name: "vite-plugin-netlify-functions-dev",
  configureServer(server) {
    server.middlewares.use(async (req, res, next) => {
      if (!req.url || !req.url.startsWith("/.netlify/functions/")) {
        return next();
      }

      const functionName = req.url.replace(/^\/\.netlify\/functions\//, "").split(/[?#]/)[0];
      const jsFile = path.resolve(__dirname, "netlify/functions", `${functionName}.js`);
      const cjsFile = path.resolve(__dirname, "netlify/functions", `${functionName}.cjs`);
      const functionFile = fs.existsSync(cjsFile)
        ? cjsFile
        : fs.existsSync(jsFile)
          ? jsFile
          : null;

      if (!functionFile) {
        return next();
      }

      try {
        let rawBody = "";
        await new Promise<void>((resolve, reject) => {
          req.on("data", (chunk) => {
            rawBody += chunk;
          });
          req.on("end", resolve);
          req.on("error", reject);
        });

        const event = {
          httpMethod: req.method,
          path: req.url,
          headers: req.headers,
          body: rawBody || null,
          rawBody,
          queryStringParameters: null,
        };

        let imported;
        if (functionFile.endsWith('.cjs')) {
          imported = requireFn(functionFile);
        } else {
          try {
            imported = await import(`${pathToFileURL(functionFile).href}?t=${Date.now()}`);
          } catch (importError) {
            imported = requireFn(functionFile);
          }
        }

        const handler = imported.handler || imported.default?.handler || imported.default;

        if (typeof handler !== "function") {
          return next();
        }

        const result = await handler(event);
        res.statusCode = result?.statusCode || 200;

        const headers = result?.headers || { "Content-Type": "application/json" };
        Object.entries(headers).forEach(([key, value]) => {
          if (typeof value === "string") {
            res.setHeader(key, value);
          }
        });

        res.end(result?.body || "");
      } catch (error) {
        res.statusCode = 500;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify({
          success: false,
          message: "Local function execution failed.",
          error: error instanceof Error ? error.message : String(error),
        }));
      }
    });
  },
});

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8081,
    headers: {
      "Cache-Control": "no-store",
    },
  },
  plugins: [react(), mode === "development" && componentTagger(), mode === "development" && netlifyFunctionsDevPlugin()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
