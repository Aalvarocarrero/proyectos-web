import Link from "next/link";
import { redirect } from "next/navigation";
import { GoogleSignIn } from "@/components/google-signin";
import { getAuthConfig } from "@/lib/auth/config";
import { isTurnstileFailureReason } from "@/lib/auth/turnstile";
import { chatGPTSignInPath, isStandaloneAuth, safeRelativeReturnPath } from "@/lib/auth-paths";

export const dynamic = "force-dynamic";
export const metadata = { title: "Entrar con Google", robots: { index: false, follow: false } };

export default async function SignInPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const returnTo = safeRelativeReturnPath(typeof params.return_to === "string" ? params.return_to : "/");
  if (!isStandaloneAuth()) redirect(chatGPTSignInPath(returnTo));
  let siteKey = "";
  try { siteKey = (await getAuthConfig()).turnstileSiteKey; } catch { /* Fail closed without exposing server configuration. */ }
  const challengeReason = params.error === "challenge_rejected" && isTurnstileFailureReason(params.reason) ? params.reason : undefined;
  return <main className="mx-auto flex min-h-[70vh] max-w-lg items-center px-5 py-16">
    <section className="w-full space-y-6 rounded-3xl border border-black/10 bg-white p-6 shadow-sm sm:p-8">
      <div className="space-y-3"><p className="text-sm font-semibold uppercase tracking-widest text-[#625547]">Venezuela Agro</p><h1 className="text-3xl font-semibold text-[#211d1a]">Entra con tu cuenta de Google</h1><p className="text-sm leading-6 text-[#625547]">Necesitas conexión a internet para entrar. Tus registros locales se conservarán en este navegador.</p></div>
      {params.error && <p role="alert" className="text-sm text-red-800">No se pudo completar el inicio de sesión. Completa una nueva verificación y vuelve a intentarlo.{challengeReason && <> Código de verificación: {challengeReason}.</>}</p>}
      {siteKey ? <GoogleSignIn siteKey={siteKey} returnTo={returnTo} /> : <p role="alert" className="text-sm text-red-800">El acceso con Google no está disponible en este momento. Inténtalo más tarde.</p>}
      <Link href="/" className="inline-flex min-h-11 items-center text-sm underline">Volver al inicio</Link>
    </section>
  </main>;
}
