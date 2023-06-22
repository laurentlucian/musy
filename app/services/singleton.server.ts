export const singleton = <Value>(name: string, value: () => Value): Value => {
  const yolo = global as any;
  yolo.__singletons ??= {};
  yolo.__singletons[name] ??= value();
  return yolo.__singletons[name];
};
