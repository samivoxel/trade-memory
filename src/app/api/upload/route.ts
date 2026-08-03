import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

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

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("image");
    const description = formData.get("description");

    if (!(file instanceof File) || typeof description !== "string") {
      return NextResponse.json(
        {
          success: false,
          message: "تصویر و توضیحات را کامل وارد کنید.",
        },
        {
          status: 400,
        }
      );
    }

    if (!description.trim()) {
      return NextResponse.json(
        {
          success: false,
          message: "توضیحات را وارد کنید.",
        },
        {
          status: 400,
        }
      );
    }

    const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const fileName = `${crypto.randomUUID()}.${extension}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    const { error: uploadError } = await supabase.storage
      .from("chart")
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      return NextResponse.json(
        {
          success: false,
          message: uploadError.message,
        },
        {
          status: 500,
        }
      );
    }

    const { error: databaseError } = await supabase
      .from("chart_examples")
      .insert({
        image_path: fileName,
        description: description.trim(),
      });

    if (databaseError) {
      await supabase.storage.from("chart").remove([fileName]);

      return NextResponse.json(
        {
          success: false,
          message: databaseError.message,
        },
        {
          status: 500,
        }
      );
    }

    return NextResponse.json({
      success: true,
      message: "تصویر و توضیحات با موفقیت ذخیره شدند.",
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: "خطایی هنگام ذخیره‌سازی رخ داد.",
      },
      {
        status: 500,
      }
    );
  }
}
