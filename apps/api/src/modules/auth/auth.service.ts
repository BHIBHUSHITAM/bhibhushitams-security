import bcrypt from "bcryptjs";
import type { LoginInput, SignupInput } from "./auth.validation";
import { UserModel } from "../users/user.model";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../../utils/jwt";

export async function signup(data: SignupInput) {
  const existingUser = await UserModel.findOne({ email: data.email.toLowerCase() });
  if (existingUser) {
    throw new Error("Email already registered");
  }

  const passwordHash = await bcrypt.hash(data.password, 10);
  // Public signup can only create non-admin accounts.
  const role = data.role === "company" ? "company" : "student";

  const user = await UserModel.create({
    name: data.name,
    email: data.email.toLowerCase(),
    passwordHash,
    role,
  });

  const payload = {
    sub: user._id.toString(),
    role: user.role,
    email: user.email,
  };

  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);
  user.refreshToken = refreshToken;
  await user.save();

  return {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    accessToken,
    refreshToken,
  };
}

export async function login(data: LoginInput) {
  const user = await UserModel.findOne({ email: data.email.toLowerCase() });
  if (!user) {
    throw new Error("Invalid email or password");
  }

  const passwordMatches = await bcrypt.compare(data.password, user.passwordHash);
  if (!passwordMatches) {
    throw new Error("Invalid email or password");
  }

  const payload = {
    sub: user._id.toString(),
    role: user.role,
    email: user.email,
  };

  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);
  user.refreshToken = refreshToken;
  await user.save();

  return {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    accessToken,
    refreshToken,
  };
}

export async function refresh(refreshToken: string) {
  const payload = verifyRefreshToken(refreshToken);
  const user = await UserModel.findById(payload.sub);

  if (!user || user.refreshToken !== refreshToken) {
    throw new Error("Invalid refresh token");
  }

  const newPayload = {
    sub: user._id.toString(),
    role: user.role,
    email: user.email,
  };

  const accessToken = signAccessToken(newPayload);
  const newRefreshToken = signRefreshToken(newPayload);

  user.refreshToken = newRefreshToken;
  await user.save();

  return { accessToken, refreshToken: newRefreshToken };
}

export async function logout(userId: string) {
  await UserModel.findByIdAndUpdate(userId, { $unset: { refreshToken: 1 } });
}
