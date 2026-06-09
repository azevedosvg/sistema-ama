export type UserRole = "admin" | "voluntario";

// Usuário exposto para a interface (sem a senha)
export type AppUser = {
  email: string;
  role: UserRole;
  createdAt: string; // ISO
};

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: "Administrador",
  voluntario: "Voluntário",
};
