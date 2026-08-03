import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import sharp from "sharp";

export const runtime = "nodejs";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

type ChartRow = {
  id: string;
  image_path: string;
  description: string;
  created_at: string;
  embedding: number[] | null;
};

function cosineSimilarity(first: number[], second: number[]) {
  if (first.length !== second.length) {
    return -1;
  }

  let dotProduct = 0;
  let firstMagnitude = 0;
  let secondMagnitude = 0;

  for (let index = 0; index < first.length; index += 1) {
    dotProduct += first[index] * second[index];
    firstMagnitude += first[index] * first[index];
    secondMagnitude += second[index] * second[index];
  }

  const denominator =
    Math.sqrt(firstMagnitude) * Math.sqrt(secondMagnitude);

  if (!denominator) {
    return -1;
  }

  return dotProduct / denominator;
}

async function createChartFingerprint(buffer: Buffer) {
  const metadata = await sharp(buffer).metadata();

  if (!metadata.width || !metadata.height) {
    throw new Error("ابعاد تصویر قابل شناسایی نیست.");
  }

  const left = Math.round(metadata.width * 0.04);
  const top = Math.round(metadata.height * 0.1);
  const width = Math.max(1, Math.round(metadata.width * 0.82));
  const height = Math.max(1, Math.round(metadata.height * 0.8));

  const safeWidth = Math.min(width, metadata.width - left);
  const safeHeight = Math.min(height, metadata.height - top);

  const { data } = await sharp(buffer)
    .extract({
      left,
      top,
      width: safeWidth,
      height: safeHeight,
    })
    .grayscale()
    .normalize()
    .resize(32, 16, {
      fit: "fill",
    })
    .raw()
    .toBuffer({
      resolveWithObject: true,
    });

  const values = Array.from(data, (value) => value / 255);

  const average =
    values.reduce((sum, value) => sum + value, 0) /
    values.length;

  const variance =
    values.reduce(
      (sum, value) => sum + (value - average) ** 2,
      0
    ) / values.length;

  const standardDeviation = Math.sqrt(variance) || 1;

  return values.map(
    (value) => (value - average) / standardDeviation
  );
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("image");

    if (!(file instanceof File)) {
      return NextResponse.json(
        {
          success: false,
          message: "تصویر را انتخاب کنید.",
        },
        {
          status: 400,
        }
      );
    }

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        {
          success: false,
          message: "فقط تصاویر JPG، PNG و WEBP مجاز هستند.",
        },
        {
          status: 400,
        }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const queryEmbedding = await createChartFingerprint(buffer);

    const { data, error } = await supabase
      .from("chart_examples")
      .select(
        "id, image_path, description, created_at, embedding"
      )
      .not("embedding", "is", null);

    if (error) {
      throw new Error(error.message);
    }

    const rows = (data ?? []) as ChartRow[];

    const rankedRows = rows
      .filter(
        (item) =>
          Array.isArray(item.embedding) &&
          item.embedding.length === queryEmbedding.length
      )
      .map((item) => ({
        ...item,
        similarity: cosineSimilarity(
          queryEmbedding,
          item.embedding as number[]
        ),
      }))
      .sort((first, second) => second.similarity - first.similarity)
      .filter(item => item.similarity >= 0.55)
      .slice(0, 5);

    const results = await Promise.all(
      rankedRows.map(async (item) => {
        const { data: signedUrlData } = await supabase.storage
          .from("chart")
          .createSignedUrl(item.image_path, 3600);

        return {
          id: item.id,
          description: item.description,
          created_at: item.created_at,
          similarity: Math.max(
            0,
            Math.min(100, item.similarity * 100)
          ),
          image_url: signedUrlData?.signedUrl ?? null,
        };
      })
    );

    return NextResponse.json({
      success: true,
      results,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "جستجوی تصاویر ناموفق بود.",
      },
      {
        status: 500,
      }
    );
  }
}
