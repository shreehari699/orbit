import type { ImageProvider, ImageGenerationResult } from "../types";
import { ImageProviderNotConfiguredError } from "../types";

export class NullImageProvider implements ImageProvider {
  readonly id = "none";
  readonly configured = false;

  async generate(): Promise<ImageGenerationResult> {
    throw new ImageProviderNotConfiguredError(this.id);
  }
}
