import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { saveBlogImage } from "@/server/files-handler";

const pngHeader = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const jpegBytes = Buffer.from([0xff, 0xd8, 0xff, 0xd9]);
const maxBlogImageBytes = 2 * 1024 * 1024;

describe("blog image upload validation", () => {
  let previousCwd: string;
  let tempDir: string;

  beforeEach(async () => {
    previousCwd = process.cwd();
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "esword-upload-test-"));
    await fs.mkdir(path.join(tempDir, "public"));
    process.chdir(tempDir);
  });

  afterEach(async () => {
    process.chdir(previousCwd);
    await fs.rm(tempDir, { recursive: true, force: true });
  });

  it("rejects remote image URLs to prevent SSRF", async () => {
    await expect(saveBlogImage("http://169.254.169.254/latest/meta-data")).resolves.toBeNull();
  });

  it("rejects non-image data URLs", async () => {
    const payload = Buffer.from("<script>alert(1)</script>").toString("base64");

    await expect(saveBlogImage(`data:text/html;base64,${payload}`)).resolves.toBeNull();
  });

  it("rejects images with mismatched magic bytes", async () => {
    const payload = Buffer.from("not a png").toString("base64");

    await expect(saveBlogImage(`data:image/png;base64,${payload}`)).resolves.toBeNull();
  });

  it("rejects oversized data URL uploads", async () => {
    const payload = Buffer.concat([pngHeader, Buffer.alloc(maxBlogImageBytes)]).toString("base64");

    await expect(saveBlogImage(`data:image/png;base64,${payload}`)).resolves.toBeNull();
  });

  it("stores a valid small JPEG data URL in public blog storage", async () => {
    const payload = jpegBytes.toString("base64");

    const savedPath = await saveBlogImage(`data:image/jpeg;base64,${payload}`);

    expect(savedPath).toMatch(/^\/blogs-images\/\d{4}\/\d{1,2}\/.+\.jpg$/);
    await expect(fs.stat(path.join(tempDir, "public", savedPath!))).resolves.toBeTruthy();
  });
});
