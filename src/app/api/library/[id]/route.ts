import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

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

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PUT(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params;
    const body = await request.json();

    const description =
      typeof body.description === "string"
        ? body.description.trim()
        : "";

    if (!description) {
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

    const { error } = await supabase
      .from("chart_examples")
      .update({
        description,
      })
      .eq("id", id);

    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.json({
      success: true,
      description,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "ویرایش توضیحات ناموفق بود.",
      },
      {
        status: 500,
      }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params;

    const { data: item, error: findError } = await supabase
      .from("chart_examples")
      .select("image_path")
      .eq("id", id)
      .maybeSingle();

    if (findError) {
      throw new Error(findError.message);
    }

    if (!item) {
      return NextResponse.json(
        {
          success: false,
          message: "تصویر پیدا نشد.",
        },
        {
          status: 404,
        }
      );
    }

    const { error: storageError } = await supabase.storage
      .from("chart")
      .remove([item.image_path]);

    if (storageError) {
      throw new Error(storageError.message);
    }

    const { error: databaseError } = await supabase
      .from("chart_examples")
      .delete()
      .eq("id", id);

    if (databaseError) {
      throw new Error(databaseError.message);
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "حذف تصویر ناموفق بود.",
      },
      {
        status: 500,
      }
    );
  }
}
