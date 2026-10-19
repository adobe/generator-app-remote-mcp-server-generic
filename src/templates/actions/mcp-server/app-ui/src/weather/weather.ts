/**
 * Weather MCP App - renders the weather tool's result as a themed card whose
 * background, icon and ambient animation follow the reported condition
 * (sun / clouds / rain / snow).
 */
import {
  App,
  applyDocumentTheme,
  applyHostFonts,
  applyHostStyleVariables,
  type McpUiHostContext,
} from "@modelcontextprotocol/ext-apps";
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import "../global.css";
import "./weather.css";

const mainEl = document.getElementById("main") as HTMLElement;
const fxEl = document.getElementById("fx") as HTMLElement;
const cardEl = document.getElementById("card") as HTMLElement;
const errorMessage = document.getElementById("error-message") as HTMLParagraphElement;
const cityInput = document.getElementById("city-input") as HTMLInputElement;
const searchBtn = document.getElementById("search-btn") as HTMLButtonElement;

const cityNameEl = document.getElementById("city-name")!;
const countryNameEl = document.getElementById("country-name")!;
const temperatureEl = document.getElementById("temperature")!;
const conditionEl = document.getElementById("condition")!;
const updatedEl = document.getElementById("updated")!;
const detailHumidity = document.getElementById("detail-humidity")!;
const detailWind = document.getElementById("detail-wind")!;
const detailPressure = document.getElementById("detail-pressure")!;
const detailVisibility = document.getElementById("detail-visibility")!;
const detailUv = document.getElementById("detail-uv")!;

type WeatherCategory = "sunny" | "cloudy" | "rain" | "snow";

type WeatherStructured = {
  city: string;
  country: string;
  category: WeatherCategory;
  condition: string;
  temperature: number;
  humidity: number;
  windSpeed: number;
  pressure: number;
  visibility: number;
  uvIndex: number;
  lastUpdated: string;
};

function getStructured(result: CallToolResult): WeatherStructured | null {
  if (result.isError) return null;
  const raw = result.structuredContent as WeatherStructured | undefined;
  return raw ?? null;
}

function randomBetween(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

/** Rain/snow need particles generated per-render; sun/clouds are pure CSS. */
function renderParticles(category: WeatherCategory) {
  fxEl.innerHTML = "";
  if (category === "rain") {
    const count = 28;
    for (let i = 0; i < count; i++) {
      const drop = document.createElement("span");
      drop.className = "drop";
      drop.style.left = `${randomBetween(0, 100)}%`;
      drop.style.animationDuration = `${randomBetween(0.6, 1.3)}s`;
      drop.style.animationDelay = `-${randomBetween(0, 1.3)}s`;
      fxEl.appendChild(drop);
    }
  } else if (category === "snow") {
    const count = 22;
    for (let i = 0; i < count; i++) {
      const flake = document.createElement("span");
      flake.className = "flake";
      const size = randomBetween(3, 7);
      flake.style.left = `${randomBetween(0, 100)}%`;
      flake.style.width = `${size}px`;
      flake.style.height = `${size}px`;
      flake.style.opacity = `${randomBetween(0.5, 1)}`;
      flake.style.animationDuration = `${randomBetween(5, 11)}s`;
      flake.style.animationDelay = `-${randomBetween(0, 10)}s`;
      fxEl.appendChild(flake);
    }
  }
}

/**
 * Default/reset state - shown from first paint (see weather.html) and reapplied before any
 * re-fetch (see searchCity), so a request in flight always looks like "loading", never like
 * stale data or an unrelated empty message.
 */
function setLoadingState() {
  errorMessage.hidden = true;
  cardEl.hidden = false;
  cardEl.dataset.state = "loading";
  mainEl.dataset.category = "loading";
  fxEl.innerHTML = "";
}

function renderWeather(structured: WeatherStructured) {
  errorMessage.hidden = true;
  cardEl.hidden = false;

  mainEl.dataset.category = structured.category;
  renderParticles(structured.category);

  cityNameEl.textContent = structured.city;
  countryNameEl.textContent = structured.country;
  temperatureEl.textContent = `${Math.round(structured.temperature)}°C`;
  conditionEl.textContent = structured.condition;
  detailHumidity.textContent = `${structured.humidity}%`;
  detailWind.textContent = `${structured.windSpeed} km/h`;
  detailPressure.textContent = `${structured.pressure} hPa`;
  detailVisibility.textContent = `${structured.visibility} km`;
  detailUv.textContent = `${structured.uvIndex}`;
  updatedEl.textContent = `Updated ${new Date(structured.lastUpdated).toLocaleString()}`;

  // Reveal real values now that they're populated - flips the skeleton off in the same frame
  // the text changes, so the shimmer fades straight into the real content in place.
  cardEl.dataset.state = "ready";
}

function showError(message: string) {
  cardEl.hidden = true;
  fxEl.innerHTML = "";
  errorMessage.textContent = message;
  errorMessage.hidden = false;
}

function applyToolResult(result: CallToolResult) {
  if (result.isError) {
    const content = result.content ?? [];
    const textItem = content.find((c): c is { type: "text"; text: string } => c.type === "text");
    showError(textItem?.text ?? "An error occurred.");
    return;
  }
  const structured = getStructured(result);
  if (structured) {
    renderWeather(structured);
  }
}

function handleHostContextChanged(ctx: McpUiHostContext) {
  if (ctx.theme) applyDocumentTheme(ctx.theme);
  if (ctx.styles?.variables) applyHostStyleVariables(ctx.styles.variables);
  if (ctx.styles?.css?.fonts) applyHostFonts(ctx.styles.css.fonts);
  if (ctx.safeAreaInsets) {
    const { top, right, bottom, left } = ctx.safeAreaInsets;
    mainEl.style.padding = `${top + 20}px ${right + 20}px ${bottom + 20}px ${left + 20}px`;
  }
}

const app = new App({ name: "Weather App", version: "1.0.0" });

app.onteardown = async () => ({});
app.ontoolinput = () => setLoadingState();
app.ontoolresult = applyToolResult;
app.ontoolcancelled = () => {};
app.onerror = console.error;
app.onhostcontextchanged = handleHostContextChanged;

async function searchCity() {
  const city = cityInput.value.trim();
  if (!city) return;
  setLoadingState();
  try {
    const result = await app.callServerTool({
      name: "weather",
      arguments: { city },
    });
    applyToolResult(result);
  } catch (e) {
    showError(e instanceof Error ? e.message : "Weather request failed.");
  }
}

searchBtn.addEventListener("click", () => {
  void searchCity();
});

cityInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") searchBtn.click();
});

app.connect().then(() => {
  const ctx = app.getHostContext();
  if (ctx) handleHostContextChanged(ctx);
});
