import { createServer } from "node:http";
import { randomBytes, timingSafeEqual } from "node:crypto";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import process from "node:process";
import { Buffer } from "node:buffer";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
try { process.loadEnvFile(path.join(root, ".env")); } catch (error) { if (error.code !== "ENOENT") throw error; }
const dataDir = path.join(root, "server", "data");
const ordersFile = path.join(dataDir, "orders.json");
const port = Number(process.env.PORT || 4174);
const users = [
  { username: "manager", password: process.env.POS_MANAGER_PASSWORD, role: "Manager", name: "Restaurant Manager" },
  { username: "waiter", password: process.env.POS_WAITER_PASSWORD, role: "Waiter", name: "Main Waiter" },
  { username: "receptionist", password: process.env.POS_RECEPTIONIST_PASSWORD, role: "Receptionist", name: "Reception Desk" },
  { username: "cook", password: process.env.POS_COOK_PASSWORD, role: "Cook", name: "Kitchen Chef" },
].filter((user) => user.password);
const sessions = new Map();
const mimeTypes = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8", ".svg": "image/svg+xml", ".png": "image/png", ".ico": "image/x-icon", ".woff2": "font/woff2" };

await mkdir(dataDir, { recursive: true });
try { await readFile(ordersFile); } catch { await writeFile(ordersFile, "[]\n"); }

async function readOrders() {
  return JSON.parse(await readFile(ordersFile, "utf8"));
}

let writeQueue = Promise.resolve();
function mutateOrders(mutator) {
  let result;
  writeQueue = writeQueue.catch(() => {}).then(async () => {
    const orders = await readOrders();
    result = await mutator(orders);
    const tempFile = `${ordersFile}.${process.pid}.tmp`;
    await writeFile(tempFile, `${JSON.stringify(orders, null, 2)}\n`);
    await rename(tempFile, ordersFile);
  });
  return writeQueue.then(() => result);
}

function sendJson(response, status, data, headers = {}) {
  response.writeHead(status, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store", ...headers });
  response.end(JSON.stringify(data));
}

async function readBody(request) {
  let raw = "";
  for await (const chunk of request) {
    raw += chunk;
    if (raw.length > 1_000_000) throw Object.assign(new Error("Request body is too large"), { status: 413 });
  }
  try { return JSON.parse(raw || "{}"); } catch { throw Object.assign(new Error("Invalid JSON"), { status: 400 }); }
}

function getSession(request) {
  const token = request.headers.cookie?.split(";").map((part) => part.trim()).find((part) => part.startsWith("jaffaz_session="))?.slice("jaffaz_session=".length);
  return token ? sessions.get(token) : null;
}

function sameSecret(candidate, expected) {
  const left = Buffer.from(String(candidate ?? ""));
  const right = Buffer.from(expected);
  return left.length === right.length && timingSafeEqual(left, right);
}

function requireRole(session, roles) {
  if (!session) throw Object.assign(new Error("Sign in to continue"), { status: 401 });
  if (roles && !roles.includes(session.role)) throw Object.assign(new Error("Your role cannot perform this action"), { status: 403 });
}

async function handleApi(request, response, url) {
  if (request.method === "GET" && url.pathname === "/api/health") return sendJson(response, 200, { ok: true });

  if (request.method === "POST" && url.pathname === "/api/login") {
    const body = await readBody(request);
    const found = users.find((entry) => entry.username === body.username && sameSecret(body.password, entry.password));
    if (!found) return sendJson(response, 401, { error: "Incorrect username or password." });
    const token = randomBytes(32).toString("hex");
    const user = { username: found.username, role: found.role, name: found.name };
    sessions.set(token, user);
    return sendJson(response, 200, { user }, { "Set-Cookie": `jaffaz_session=${token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=43200` });
  }

  if (request.method === "POST" && url.pathname === "/api/logout") {
    const token = request.headers.cookie?.split(";").map((part) => part.trim()).find((part) => part.startsWith("jaffaz_session="))?.slice("jaffaz_session=".length);
    if (token) sessions.delete(token);
    return sendJson(response, 200, { ok: true }, { "Set-Cookie": "jaffaz_session=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0" });
  }

  if (request.method === "GET" && url.pathname === "/api/session") {
    const user = getSession(request);
    if (!user) return sendJson(response, 401, { error: "Sign in required" });
    return sendJson(response, 200, { user });
  }

  const session = getSession(request);
  requireRole(session, null);

  if (request.method === "GET" && url.pathname === "/api/orders") return sendJson(response, 200, await readOrders());

  if (request.method === "POST" && url.pathname === "/api/orders") {
    requireRole(session, ["Manager"]);
    const order = await readBody(request);
    if (!Array.isArray(order.items) || order.items.length === 0 || order.items.length > 100) return sendJson(response, 400, { error: "Add at least one menu item." });
    for (const item of order.items) {
      if (typeof item.name !== "string" || !item.name.trim() || !Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 100 || !Number.isFinite(item.price) || item.price < 0) return sendJson(response, 400, { error: "Order contains an invalid menu item." });
    }
    const subtotal = order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const tax = Math.round(subtotal * 0.05);
    if (order.subtotal !== subtotal || order.tax !== tax || order.total !== subtotal + tax) return sendJson(response, 400, { error: "Order totals did not match the selected items." });
    const created = {
      id: 0,
      table: String(order.table || "Takeaway").slice(0, 80),
      items: order.items,
      subtotal, tax, total: subtotal + tax,
      status: order.requiresWaiter === true ? "WAITING_FOR_WAITER" : "WAITING_FOR_RECEPTIONIST",
      createdBy: session.username,
      waiter: null,
      paymentMethod: null,
      createdAt: new Date().toISOString(),
    };
    const savedOrder = await mutateOrders((orders) => {
      created.id = orders.reduce((maximum, entry) => Math.max(maximum, Number(entry.id) || 0), 0) + 1;
      orders.push(created);
      return created;
    });
    return sendJson(response, 201, savedOrder);
  }

  const orderMatch = url.pathname.match(/^\/api\/orders\/(\d+)$/);
  if (request.method === "PATCH" && orderMatch) {
    const orderId = Number(orderMatch[1]);
    const changes = await readBody(request);
    const keys = Object.keys(changes);
    if (keys.length < 1 || keys.length > 2 || keys.some((key) => !["status", "paymentMethod"].includes(key))) return sendJson(response, 400, { error: "Only order status and payment method can be updated." });
    const order = await mutateOrders((orders) => {
      const found = orders.find((entry) => entry.id === orderId);
      if (!found) throw Object.assign(new Error("Order not found."), { status: 404 });
      if (changes.paymentMethod !== undefined) {
        const payStates = ["WAITING_FOR_RECEPTIONIST", "PAID_WAITING_FOR_COOK", "PREPARING", "READY", "COMPLETED"];
        if (session.role !== "Receptionist" || !["Cash", "Card", "Mobile Wallet"].includes(changes.paymentMethod) || found.paymentMethod || !payStates.includes(found.status)) {
          throw Object.assign(new Error("This order cannot be paid in its current state."), { status: 403 });
        }
        if (changes.status !== undefined && changes.status !== "PAID_WAITING_FOR_COOK" && changes.status !== found.status) {
          throw Object.assign(new Error("Payment cannot change the kitchen status."), { status: 400 });
        }
        if (found.status === "WAITING_FOR_RECEPTIONIST") found.status = "PAID_WAITING_FOR_COOK";
        found.paymentMethod = changes.paymentMethod;
        return found;
      }
      if (changes.status === undefined) throw Object.assign(new Error("An order status is required."), { status: 400 });
      const target = changes.status;
      const allowed = {
        Waiter: { WAITING_FOR_WAITER: "WAITING_FOR_RECEPTIONIST" },
        Cook: { WAITING_FOR_RECEPTIONIST: "PREPARING", PAID_WAITING_FOR_COOK: "PREPARING", PREPARING: "READY", READY: "COMPLETED" },
      };
      if (session.role === "Manager" && target === "CANCELLED" && !["COMPLETED", "CANCELLED"].includes(found.status)) {
        found.status = target;
      } else if (allowed[session.role]?.[found.status] === target) {
        found.status = target;
        if (session.role === "Waiter") found.waiter = session.name;
      } else {
        throw Object.assign(new Error("That order transition is not allowed for your role."), { status: 403 });
      }
      return found;
    });
    return sendJson(response, 200, order);
  }

  return sendJson(response, 404, { error: "API route not found." });
}

const server = createServer(async (request, response) => {
  const url = new URL(request.url || "/", `http://${request.headers.host || "localhost"}`);
  try {
    if (url.pathname.startsWith("/api/")) return await handleApi(request, response, url);
    const dist = path.join(root, "dist");
    let filePath = path.resolve(dist, `.${decodeURIComponent(url.pathname)}`);
    if (!filePath.startsWith(`${dist}${path.sep}`)) filePath = path.join(dist, "index.html");
    try {
      const content = await readFile(filePath);
      response.writeHead(200, { "Content-Type": mimeTypes[path.extname(filePath)] || "application/octet-stream" });
      return response.end(content);
    } catch {
      const content = await readFile(path.join(dist, "index.html"));
      response.writeHead(200, { "Content-Type": mimeTypes[".html"] });
      return response.end(content);
    }
  } catch (error) {
    if (!response.headersSent) sendJson(response, error.status || 500, { error: error.status ? error.message : "Internal server error" });
    else response.destroy();
    if (!error.status) console.error(error);
  }
});

server.listen(port, "127.0.0.1", () => console.log(`Jaffa'z POS API listening on http://127.0.0.1:${port}`));
