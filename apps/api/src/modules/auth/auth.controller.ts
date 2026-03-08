import type { Request, Response } from "express";
import { loginSchema, refreshSchema, signupSchema } from "./auth.validation";
import * as authService from "./auth.service";
import { UserModel } from "../users/user.model";
import { env } from "../../config/env";

const isProduction = env.nodeEnv === "production";
const sameSite: "lax" | "none" = isProduction ? "none" : "lax";

const cookieOptions = {
  httpOnly: true,
  sameSite,
  secure: isProduction,
  path: "/",
};

const clearCookieOptions = {
  path: "/",
  sameSite: cookieOptions.sameSite,
  secure: cookieOptions.secure,
};

export async function signup(req: Request, res: Response) {
  const parsed = signupSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid signup payload", errors: parsed.error.flatten() });
  }

  try {
    const result = await authService.signup(parsed.data);
    res
      .cookie("accessToken", result.accessToken, cookieOptions)
      .cookie("refreshToken", result.refreshToken, cookieOptions)
      .status(201)
      .json(result);
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
}

export async function login(req: Request, res: Response) {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid login payload", errors: parsed.error.flatten() });
  }

  try {
    const result = await authService.login(parsed.data);
    res
      .cookie("accessToken", result.accessToken, cookieOptions)
      .cookie("refreshToken", result.refreshToken, cookieOptions)
      .status(200)
      .json(result);
  } catch (error) {
    res.status(401).json({ message: (error as Error).message });
  }
}

export async function refreshToken(req: Request, res: Response) {
  const parsed = refreshSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid refresh payload", errors: parsed.error.flatten() });
  }

  const tokenFromCookie = req.cookies?.refreshToken as string | undefined;
  const token = parsed.data.refreshToken ?? tokenFromCookie;
  if (!token) {
    return res.status(400).json({ message: "Refresh token missing" });
  }

  try {
    const tokens = await authService.refresh(token);
    return res
      .cookie("accessToken", tokens.accessToken, cookieOptions)
      .cookie("refreshToken", tokens.refreshToken, cookieOptions)
      .status(200)
      .json(tokens);
  } catch (error) {
    return res.status(401).json({ message: (error as Error).message });
  }
}

export async function me(req: Request, res: Response) {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const user = await UserModel.findById(req.user.id).select("_id name email role createdAt");
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  return res.status(200).json({
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    },
  });
}

export async function logout(req: Request, res: Response) {
  if (req.user) {
    await authService.logout(req.user.id);
  }

  return res
    .clearCookie("accessToken", clearCookieOptions)
    .clearCookie("refreshToken", clearCookieOptions)
    .status(200)
    .json({ message: "Logged out" });
}

export async function getAllUsers(req: Request, res: Response) {
  try {
    const users = await UserModel.find().select("_id name email role createdAt").sort({ createdAt: -1 });
    return res.status(200).json({ users });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch users" });
  }
}
