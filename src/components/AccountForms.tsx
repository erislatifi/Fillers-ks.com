"use client";

import { useActionState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/Button";
import { ArrowRightIcon, CheckCircleIcon } from "@/components/icons";
import {
  loginCustomer,
  registerCustomer,
  updateCustomerProfile,
  type AccountFormState,
} from "@/app/(frontend)/[locale]/account/actions";
import type { CustomerProfile } from "@/lib/customerSession";

function FormError({ state }: { state: AccountFormState }) {
  const t = useTranslations("account.errors");
  if (!state?.error) return null;
  return (
    <div className="sm:col-span-2 rounded-xl border border-red-200 bg-red-50 p-4 text-[13px] text-red-700">
      {t.has(state.error) ? t(state.error) : t("server-error")}
    </div>
  );
}

type FieldProps = {
  name: string;
  label: string;
  type?: string;
  required?: boolean;
  defaultValue?: string | null;
  autoComplete?: string;
  hint?: string;
  wide?: boolean;
  multiline?: boolean;
};

function Field({ name, label, type = "text", required, defaultValue, autoComplete, hint, wide, multiline }: FieldProps) {
  return (
    <div className={wide ? "sm:col-span-2" : undefined}>
      <label htmlFor={name} className="text-[13px] font-medium text-ink">
        {label}
      </label>
      {multiline ? (
        <textarea
          id={name}
          name={name}
          rows={3}
          required={required}
          defaultValue={defaultValue ?? ""}
          autoComplete={autoComplete}
          className="input mt-2 resize-none"
        />
      ) : (
        <input
          id={name}
          name={name}
          type={type}
          required={required}
          defaultValue={defaultValue ?? ""}
          autoComplete={autoComplete}
          className="input mt-2"
        />
      )}
      {hint && <p className="mt-1.5 text-[12px] text-ink-faint">{hint}</p>}
    </div>
  );
}

export function LoginForm() {
  const t = useTranslations("account");
  const locale = useLocale();
  const [state, action, pending] = useActionState(loginCustomer, null);

  return (
    <form action={action} className="grid gap-5">
      <input type="hidden" name="locale" value={locale} />
      <Field name="email" type="email" label={t("email")} required autoComplete="email" />
      <Field name="password" type="password" label={t("password")} required autoComplete="current-password" />
      <FormError state={state} />
      <div>
        <Button type="submit" size="lg" disabled={pending} className="w-full">
          {pending ? t("loggingIn") : t("login")}
          <ArrowRightIcon className="h-4 w-4" />
        </Button>
      </div>
      <p className="text-[13px] text-ink-soft">
        {t("noAccount")}{" "}
        <Link href="/account/register" className="font-medium text-accent-deep underline">
          {t("registerLink")}
        </Link>
      </p>
      <p className="text-[12px] text-ink-faint">{t("forgotPassword")}</p>
    </form>
  );
}

export function RegisterForm() {
  const t = useTranslations("account");
  const locale = useLocale();
  const [state, action, pending] = useActionState(registerCustomer, null);

  return (
    <form action={action} className="grid sm:grid-cols-2 gap-5">
      <input type="hidden" name="locale" value={locale} />
      <Field name="clinicName" label={t("clinicName")} required autoComplete="organization" wide />
      <Field name="fullName" label={t("fullName")} required autoComplete="name" />
      <Field name="phone" type="tel" label={t("phone")} required autoComplete="tel" />
      <Field name="email" type="email" label={t("email")} required autoComplete="email" />
      <Field name="city" label={t("city")} autoComplete="address-level2" />
      <Field name="address" label={t("address")} autoComplete="street-address" wide multiline />
      <Field name="licenseNumber" label={t("licenseNumber")} wide />
      <Field
        name="password"
        type="password"
        label={t("password")}
        required
        autoComplete="new-password"
        hint={t("passwordHint")}
      />
      <Field name="passwordConfirm" type="password" label={t("passwordConfirm")} required autoComplete="new-password" />
      <FormError state={state} />
      <p className="sm:col-span-2 text-[12.5px] text-ink-faint">{t("professionalNotice")}</p>
      <div className="sm:col-span-2">
        <Button type="submit" size="lg" disabled={pending}>
          {pending ? t("registering") : t("register")}
          <ArrowRightIcon className="h-4 w-4" />
        </Button>
      </div>
      <p className="sm:col-span-2 text-[13px] text-ink-soft">
        {t("haveAccount")}{" "}
        <Link href="/account" className="font-medium text-accent-deep underline">
          {t("loginLink")}
        </Link>
      </p>
    </form>
  );
}

export function ProfileForm({ customer }: { customer: CustomerProfile }) {
  const t = useTranslations("account");
  const [state, action, pending] = useActionState(updateCustomerProfile, null);

  return (
    <form action={action} className="grid sm:grid-cols-2 gap-5">
      <Field name="clinicName" label={t("clinicName")} required defaultValue={customer.clinicName} wide />
      <Field name="fullName" label={t("fullName")} required defaultValue={customer.fullName} />
      <Field name="phone" type="tel" label={t("phone")} required defaultValue={customer.phone} />
      <Field name="city" label={t("city")} defaultValue={customer.city} />
      <Field name="licenseNumber" label={t("licenseNumber")} defaultValue={customer.licenseNumber} />
      <Field name="address" label={t("address")} defaultValue={customer.address} wide multiline />

      <div className="sm:col-span-2 mt-2 pt-5 border-t border-line-soft">
        <p className="text-[14px] font-medium text-ink">{t("passwordTitle")}</p>
        <p className="mt-1 text-[12px] text-ink-faint">{t("passwordOptional")}</p>
      </div>
      <Field name="currentPassword" type="password" label={t("currentPassword")} autoComplete="current-password" />
      <Field
        name="newPassword"
        type="password"
        label={t("newPassword")}
        autoComplete="new-password"
        hint={t("passwordHint")}
      />

      <FormError state={state} />
      <div className="sm:col-span-2 flex items-center gap-4">
        <Button type="submit" disabled={pending}>
          {pending ? t("saving") : t("save")}
        </Button>
        {state?.saved && !pending && (
          <span className="inline-flex items-center gap-1.5 text-[13px] text-accent-deep">
            <CheckCircleIcon className="h-4 w-4" />
            {t("saved")}
          </span>
        )}
      </div>
    </form>
  );
}
