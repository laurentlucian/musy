import { typedjson } from 'remix-typedjson';
import { prisma } from '~/services/db.server';

export const loader = async () => {
  const queueableUsers = await prisma.profile.findMany({
    where: {
      settings: {
        allowQueue: 'on',
      },
    },
  });
  return typedjson(queueableUsers);
};
