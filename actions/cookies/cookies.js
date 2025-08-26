"use server";

import { cookies } from "next/headers";


export async function getAuthCookies() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken");
  const refreshToken = cookieStore.get("refreshToken");
 
  if (!accessToken || !refreshToken) {
   return {
    accessToken: null,
    refreshToken: null,
    success: false,
   }
  }
  return {
    accessToken: accessToken.value,
    refreshToken: refreshToken.value,
    success: true,
  };
}

export async function setAuthCookies(accessToken, refreshToken) {
  const cookieStore = await cookies();
  try {
    cookieStore.set("accessToken", accessToken, { httpOnly: true });
    cookieStore.set("refreshToken", refreshToken, { httpOnly: true });
  } catch (error) {
    return { error: "Something went wrong,try again.", success: false };
  }
  return { message: "Cookie set successful", success: true };
}


export async function deleteAllCookies() {
  console.log("called for deleteAllCookies in cookies.js");
  const cookieStore = await cookies();
  try {
    cookieStore.set("accessToken", "", { maxAge: 0 });
    cookieStore.set("refreshToken", "", { maxAge: 0 });
  } catch (error) {
    return { error: "Something went wrong, try again.", success: false };
  }
  return { message: "Cookies deleted successfully", success: true };
}
