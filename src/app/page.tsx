import { auth } from "@clerk/nextjs/server";

export default async function HomeServer() {
  const userId = (await auth()).userId;
  if (!userId) {
    return <div>Loading...</div>;
  }

  return <></>;
}
