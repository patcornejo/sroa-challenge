import { Role } from "../models/role";

// UtilHelper
export const isNullOrUndefined = (value: any) => {
  if (typeof value === 'undefined') {
    return true;
  }
  if (value === null) {
    return true;
  }
  return false;
};

export const safelyParseJSON = (json: string) => {
  // This function cannot be optimized, it's best to
  // keep it small!
  let parsed: any;
  try {
    parsed = JSON.parse(json);
  } catch (e) {
    // Oh well, but whatever...
    parsed = undefined;
  }
  return parsed; // Could be undefined!
};

export const stringToRole = (roleName: string) => {
  const roleMap: Record<string, Role> = {
    Admin: Role.Admin,
    Sales: Role.Sales,
    "Technical Support": Role.Support,
    Support: Role.Support,
    Owner: Role.Owner,
    Guest: Role.Guest,
  };

  if (!(roleName in roleMap)) {
    throw new Error(`Role string "${roleName}" no reconocido`);
  }

  return roleMap[roleName];
}

