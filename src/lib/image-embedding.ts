type TensorResult = {
  data: Float32Array | number[];
};

type Extractor = (
  input: unknown,
  options: {
    pooling: string;
    normalize: boolean;
  }
) => Promise<TensorResult>;

let extractorPromise: Promise<Extractor> | null = null;

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
        return;
      }

      reject(new Error("خواندن تصویر ناموفق بود."));
    };

    reader.onerror = () => {
      reject(new Error("خواندن تصویر ناموفق بود."));
    };

    reader.readAsDataURL(file);
  });
}

async function loadImage(file: File): Promise<HTMLImageElement> {
  const dataUrl = await fileToDataUrl(file);

  return new Promise((resolve, reject) => {
    const image = new Image();

    image.onload = () => {
      resolve(image);
    };

    image.onerror = () => {
      reject(
        new Error(
          "تصویر قابل پردازش نیست. یک تصویر JPG، PNG یا WEBP معتبر انتخاب کنید."
        )
      );
    };

    image.src = dataUrl;
  });
}

async function prepareChartCanvas(file: File): Promise<HTMLCanvasElement> {
  const image = await loadImage(file);

  const sourceX = Math.round(image.naturalWidth * 0.04);
  const sourceY = Math.round(image.naturalHeight * 0.1);
  const sourceWidth = Math.max(
    1,
    Math.round(image.naturalWidth * 0.84)
  );
  const sourceHeight = Math.max(
    1,
    Math.round(image.naturalHeight * 0.8)
  );

  const canvas = document.createElement("canvas");
  canvas.width = 896;
  canvas.height = 512;

  const context = canvas.getContext("2d", {
    willReadFrequently: true,
  });

  if (!context) {
    throw new Error("پردازش تصویر در این مرورگر امکان‌پذیر نیست.");
  }

  context.fillStyle = "#000000";
  context.fillRect(0, 0, canvas.width, canvas.height);

  context.drawImage(
    image,
    sourceX,
    sourceY,
    sourceWidth,
    sourceHeight,
    0,
    0,
    canvas.width,
    canvas.height
  );

  const imageData = context.getImageData(
    0,
    0,
    canvas.width,
    canvas.height
  );

  const pixels = imageData.data;

  for (let index = 0; index < pixels.length; index += 4) {
    const gray =
      pixels[index] * 0.299 +
      pixels[index + 1] * 0.587 +
      pixels[index + 2] * 0.114;

    const contrast = Math.max(
      0,
      Math.min(255, (gray - 128) * 1.35 + 128)
    );

    pixels[index] = contrast;
    pixels[index + 1] = contrast;
    pixels[index + 2] = contrast;
    pixels[index + 3] = 255;
  }

  context.putImageData(imageData, 0, 0);

  return canvas;
}

async function getExtractor(): Promise<Extractor> {
  if (!extractorPromise) {
    extractorPromise = import("@huggingface/transformers").then(
      async ({ pipeline }) => {
        const extractor = await pipeline(
          "image-feature-extraction",
          "Xenova/clip-vit-base-patch32"
        );

        return extractor as unknown as Extractor;
      }
    );
  }

  return extractorPromise;
}

export async function getImageDimensions(file: File) {
  const image = await loadImage(file);

  return {
    width: image.naturalWidth,
    height: image.naturalHeight,
  };
}

export async function createImageEmbedding(
  file: File
): Promise<number[]> {
  const canvas = await prepareChartCanvas(file);
  const { RawImage } = await import("@huggingface/transformers");
  const rawImage = RawImage.fromCanvas(canvas);
  const extractor = await getExtractor();

  const output = await extractor(rawImage, {
    pooling: "mean",
    normalize: true,
  });

  const embedding = Array.from(output.data);

  if (embedding.length !== 512) {
    throw new Error(
      `طول بردار تصویر معتبر نیست. مقدار دریافت‌شده: ${embedding.length}`
    );
  }

  return embedding;
}
