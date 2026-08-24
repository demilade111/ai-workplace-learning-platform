import type { User } from "../types/user.types.js";

export type UserResponseDto = {
  id: string;
  email: string;
  createdAt: Date;
};

export function toUserResponseDto(user: User): UserResponseDto {
  return {
    id: user.id,
    email: user.email,
    createdAt: user.createdAt,
  };
}
