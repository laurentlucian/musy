import { prisma } from '../db.server';

export const upsertThemeField = async (
  field: string,
  data: FormDataEntryValue | null,
  userId: string,
  isToggle = false,
) => {
  if (!data) return;

  const value = isToggle ? data === 'true' : data;

  await prisma.theme.upsert({
    create: { [field]: value, userId },
    update: { [field]: value },
    where: { userId },
  });
};

export const upsertSettingsField = async (
  field: string,
  data: FormDataEntryValue | null,
  userId: string,
  isToggle = false,
) => {
  if (!data) return;

  const value = isToggle ? data === 'true' : data;

  await prisma.settings.upsert({
    create: { [field]: value, userId },
    update: { [field]: value },
    where: { userId },
  });
};

export const getTheme = async (id?: string) => {
  if (!id) return null;
  return await prisma.theme.findUnique({
    select: {
      backgroundDark: true,
      backgroundLight: true,
      bgGradientDark: true,
      bgGradientLight: true,
      gradient: true,
    },
    where: { userId: id },
  });
};
