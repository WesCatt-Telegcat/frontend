import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const desktopDir = path.resolve(__dirname, "..");
const frontendDir = path.resolve(desktopDir, "..");
const desktopPackagePath = path.join(desktopDir, "package.json");
const frontendPackagePath = path.join(frontendDir, "package.json");
const frontendPreferencesPath = path.join(
  frontendDir,
  "src",
  "lib",
  "app-preferences.ts"
);
const installerIncludePath = path.join(desktopDir, "build", "installer.nsh");

const localeInstallerMap = {
  de: { installerLanguage: "de_DE", lcid: 1031 },
  en: { installerLanguage: "en_US", lcid: 1033 },
  es: { installerLanguage: "es_ES", lcid: 3082 },
  fr: { installerLanguage: "fr_FR", lcid: 1036 },
  it: { installerLanguage: "it_IT", lcid: 1040 },
  ja: { installerLanguage: "ja_JP", lcid: 1041 },
  ko: { installerLanguage: "ko_KR", lcid: 1042 },
  nl: { installerLanguage: "nl_NL", lcid: 1043 },
  pl: { installerLanguage: "pl_PL", lcid: 1045 },
  pt: { installerLanguage: "pt_BR", lcid: 1046 },
  ru: { installerLanguage: "ru_RU", lcid: 1049 },
  zh: { installerLanguage: "zh_CN", lcid: 2052 },
} 

function normalizeVersion(version) {
  return String(version ?? "").trim().replace(/^v/i, "");
}

function normalizeLocaleKey(locale) {
  return String(locale ?? "").trim().replace(/_/g, "-").toLowerCase();
}

async function readJson(filePath) {
  return JSON.parse(await readFile(filePath, "utf8"));
}

function extractFrontendLocales(source) {
  const localeTypeMatch = source.match(/export type Locale\s*=\s*([^;]+);/);

  if (!localeTypeMatch) {
    throw new Error("Unable to resolve frontend locale definitions");
  }

  const locales = Array.from(localeTypeMatch[1].matchAll(/"([^"]+)"/g)).map(
    (match) => match[1]
  );

  if (locales.length === 0) {
    throw new Error("No frontend locales found");
  }

  return locales;
}

function resolveInstallerLocale(locale) {
  const normalizedLocale = normalizeLocaleKey(locale);
  const exactMatch = localeInstallerMap[normalizedLocale];

  if (exactMatch) {
    return {
      appLocale: locale,
      ...exactMatch,
    };
  }

  const baseLocale = normalizedLocale.split("-")[0];
  const baseMatch = localeInstallerMap[baseLocale];

  if (baseMatch) {
    return {
      appLocale: locale,
      ...baseMatch,
    };
  }

  throw new Error(
    `Missing NSIS installer language mapping for frontend locale "${locale}"`
  );
}

async function writeInstallerInclude(installerLocales) {
  await mkdir(path.dirname(installerIncludePath), { recursive: true });

  const defaultLocale =
    installerLocales.find((locale) => normalizeLocaleKey(locale.appLocale) === "en")
      ?.appLocale ?? installerLocales[0].appLocale;
  const lines = [
    "!macro customInstall",
    "  SetShellVarContext current",
    '  CreateDirectory "$APPDATA\\Telecat"',
    `  StrCpy $0 "${defaultLocale}"`,
    ...installerLocales.flatMap((locale) => [
      `  StrCmp $LANGUAGE ${locale.lcid} 0 +2`,
      `  StrCpy $0 "${locale.appLocale}"`,
    ]),
    '  FileOpen $1 "$APPDATA\\Telecat\\installer-locale.json" w',
    '  FileWrite $1 "$0"',
    "  FileClose $1",
    "!macroend",
    "",
  ];

  await writeFile(installerIncludePath, lines.join("\n"), "utf8");
}

const desktopPackage = await readJson(desktopPackagePath);
const frontendPackage = await readJson(frontendPackagePath);
const frontendPreferencesSource = await readFile(frontendPreferencesPath, "utf8");
const frontendLocales = extractFrontendLocales(frontendPreferencesSource);
const installerLocales = frontendLocales.map(resolveInstallerLocale);
const nextVersion = normalizeVersion(
  process.env.RELEASE_VERSION || frontendPackage.version || desktopPackage.version
);

if (!nextVersion) {
  throw new Error("Unable to resolve desktop package version");
}

desktopPackage.build ??= {};
desktopPackage.build.nsis ??= {};
desktopPackage.build.nsis.include = "build/installer.nsh";
desktopPackage.build.nsis.displayLanguageSelector = true;
desktopPackage.build.nsis.multiLanguageInstaller = true;
desktopPackage.build.nsis.installerLanguages = installerLocales.map(
  (locale) => locale.installerLanguage
);

if (desktopPackage.version !== nextVersion) {
  desktopPackage.version = nextVersion;
}

await writeFile(
  desktopPackagePath,
  `${JSON.stringify(desktopPackage, null, 2)}\n`,
  "utf8"
);
await writeInstallerInclude(installerLocales);

process.stdout.write(`desktop version -> ${nextVersion}\n`);
process.stdout.write(
  `desktop installer languages -> ${installerLocales
    .map((locale) => locale.installerLanguage)
    .join(", ")}\n`
);
