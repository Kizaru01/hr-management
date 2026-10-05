import * as SecureStore from "expo-secure-store";

const key = "hrms.employee.access-token";
const options: SecureStore.SecureStoreOptions = {
  keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
};
// Serialize writes/deletes so sign-out cannot race a pending sign-in write.
let queue: Promise<unknown> = Promise.resolve();
function serialized<T>(operation: () => Promise<T>): Promise<T> {
  const next = queue.then(operation, operation);
  queue = next.catch(() => undefined);
  return next;
}
async function requireStorage() {
  if (!(await SecureStore.isAvailableAsync()))
    throw new Error(
      "Secure storage is unavailable. Use the Android or iOS app.",
    );
}
export const tokenStorage = {
  read: () =>
    serialized(async () => {
      await requireStorage();
      return SecureStore.getItemAsync(key, options);
    }),
  write: (token: string) =>
    serialized(async () => {
      await requireStorage();
      await SecureStore.setItemAsync(key, token, options);
    }),
  clear: () =>
    serialized(async () => {
      await requireStorage();
      await SecureStore.deleteItemAsync(key, options);
    }),
};
