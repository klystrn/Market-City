import { readdir, mkdir, copyFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";
const root = process.cwd();
const source = path.join(root, "music");
const output = path.join(root, "public", "music");
const extensions = new Set([".mp3", ".m4a", ".ogg", ".wav", ".aac"]);
async function files(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true }).catch(() => []);
  const nested = await Promise.all(
    entries
      .filter((e) => !e.isSymbolicLink())
      .map(async (e) =>
        e.isDirectory()
          ? files(path.join(dir, e.name))
          : extensions.has(path.extname(e.name).toLowerCase())
            ? [path.join(dir, e.name)]
            : [],
      ),
  );
  return nested.flat().sort();
}
async function main() {
  const folders = (
    await readdir(source, { withFileTypes: true }).catch(() => [])
  )
    .filter((e) => e.isDirectory() && !e.isSymbolicLink())
    .map((e) => e.name);
  const names = Array.from(
    new Set(["jazz", "lofi", "classical", "technopop", ...folders]),
  ).sort();
  const stations = await Promise.all(
    names.map(async (id) => {
      const tracks = await files(path.join(source, id));
      return {
        id,
        name:
          (
            {
              jazz: "MC Jazz",
              lofi: "MC Lofi",
              classical: "MC Classical",
              technopop: "MC Technopop",
            } as Record<string, string>
          )[id] ?? `MC ${id}`,
        tracks: await Promise.all(
          tracks.map(async (file) => {
            const relative = path.relative(source, file),
              destination = path.join(output, relative);
            await mkdir(path.dirname(destination), { recursive: true });
            const original = await stat(file),
              copied = await stat(destination).catch(() => null);
            if (
              !copied ||
              copied.size !== original.size ||
              copied.mtimeMs < original.mtimeMs
            )
              await copyFile(file, destination);
            return {
              title: path
                .basename(file, path.extname(file))
                .replace(/-\d+$/, "")
                .replaceAll("-", " "),
              url:
                "/music/" +
                relative.split(path.sep).map(encodeURIComponent).join("/"),
            };
          }),
        ),
      };
    }),
  );
  await mkdir(path.join(root, "src", "data"), { recursive: true });
  await writeFile(
    path.join(root, "src", "data", "music-library.json"),
    JSON.stringify(stations, null, 2) + "\n",
  );
  console.log(
    `Music library: ${stations.map((s) => `${s.id}: ${s.tracks.length}`).join(", ")}`,
  );
}
void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
