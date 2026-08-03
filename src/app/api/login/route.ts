import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const password =
      typeof body.password === "string" ? body.password : "";

    if (!process.env.APP_PASSWORD) {
      return NextResponse.json(
        {
          success: false,
          message: "رمز ورود روی سرور تنظیم نشده است.",
        },
        {
          status: 500,
        }
      );
    }

    if (password !== process.env.APP_PASSWORD) {
      return NextResponse.json(
        {
          success: false,
          message: "رمز عبور اشتباه است.",
        },
        {
          status: 401,
        }
      );
    }

    if (!process.env.AUTH_SESSION_TOKEN) {
      return NextResponse.json(
        {
          success: false,
          message: "نشست ورود روی سرور تنظیم نشده است.",
        },
        {
          status: 500,
        }
      );
    }

    const response = NextResponse.json({
      success: true,
    });

    response.cookies.set(
      "trade_memory_session",
      process.env.AUTH_SESSION_TOKEN,
      {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 30,
        path: "/",
      }
    );

    return response;
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: "درخواست ورود نامعتبر است.",
      },
      {
        status: 400,
      }
    );
  }
}
