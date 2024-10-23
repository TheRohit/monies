import { auth } from "@clerk/nextjs/server";

export default async function HomeServer() {
  const userId = auth().userId;
  if (!userId) {
    return <div>Loading...</div>;
  }

  return <></>;
}
