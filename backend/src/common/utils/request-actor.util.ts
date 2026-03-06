import { JwtService } from '@nestjs/jwt';

export type RequestActor = {
  actorEmployeeId?: string;
  actorRole?: string;
  actorType: 'Employee' | 'System';
};

export function extractActorFromRequest(req: any): RequestActor {
  const jwtService = new JwtService();
  const auth = req?.headers?.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';

  if (!token) {
    return { actorType: 'System' };
  }

  try {
    const payload: any = jwtService.verify(token, {
      secret: process.env.ACCESS_TOKEN_SECRET,
    });
    const actorEmployeeId = payload?.id;
    const roleRaw = Array.isArray(payload?.roles) ? payload.roles[0] : undefined;
    const actorRole =
      typeof roleRaw === 'string'
        ? roleRaw
        : roleRaw?.role?.name_role || roleRaw?.name_role || roleRaw?.name || undefined;

    if (!actorEmployeeId) {
      return { actorType: 'System' };
    }

    return {
      actorType: 'Employee',
      actorEmployeeId,
      actorRole,
    };
  } catch {
    return { actorType: 'System' };
  }
}
