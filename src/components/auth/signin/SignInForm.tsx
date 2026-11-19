'use client';

import React, { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import CustomInput from '@/components/custom/CustomInput';
import { Lock, Mail } from 'lucide-react';
import CustomButton from '@/components/custom/CustomButton';
import CustomOtpInput from '@/components/custom/CustomOTPInput';
import CustomErrorIndicator from '@/components/custom/CustomErrorIndicator';
import { useRouter } from 'next/navigation';
import useSendOtp from '@/hooks/auth/useSendOtp';
import { handleOtpError } from '@/utils/helpers/handleOtpError';
import { toast } from 'sonner';
import useSignin from '@/hooks/auth/useSignin';
import { handleSignupError } from '@/utils/helpers/handleSignupError';
import { handlePasswordError } from '@/utils/helpers/handlePasswordError';
import { saveCookies } from '@/app/actions/saveCookies';
import { UserAuthRole } from '@/types/UserAuthRole';
import { SigninResponse } from '@/types/auth/SigninResponse';
import { getSignInMethod, signinWithPassword } from '@/services/authService';

type Step = 'email' | 'otp' | 'password';

const errorToast = (title: string, description: string) =>
  toast.error(title, {
    description,
    position: 'bottom-right',
    className: '!bg-[#DF1C41] !text-white',
    descriptionClassName: '!text-white !text-xs',
  });

const SignInForm = () => {
  const { mutateAsync: mutateSendOtp, isPending: isSendOtpPending } =
    useSendOtp();

  const { mutateAsync: mutateSignup, isPending: isSignupPending } = useSignin();

  const [isPasswordPending, setIsPasswordPending] = useState(false);

  const router = useRouter();
  const [step, setStep] = useState<Step>('email');

  const validationSchema = Yup.object({
    email: Yup.string()
      .email('Adresse email invalide')
      .required("L'email est requis"),
    otp: Yup.string()
      .length(4, 'Le code OTP doit contenir 4 chiffres')
      .matches(/^\d+$/, 'Le code OTP ne doit contenir que des chiffres'),
    password: Yup.string(),
  });

  const sendCode = async (email: string) => {
    try {
      await mutateSendOtp(email);
      setStep('otp');
    } catch (error) {
      errorToast("Échec de l'envoi du code OTP", handleOtpError(error));
    }
  };

  const finishSignIn = async (response: SigninResponse) => {
    if (response.user.role === UserAuthRole.USER) {
      errorToast(
        'Échec de la connexion',
        "Vous n'avez pas les autorisations nécessaires pour accéder à cette application."
      );
      return;
    }

    await saveCookies(response.accessToken);

    toast.success('Connexion réussie', {
      description: 'Vous êtes maintenant connecté à votre compte.',
      position: 'bottom-right',
      className: '!bg-[#CBF5E5] !text-[#176448] !border !border-[#CBF5E5]',
      descriptionClassName: '!text-[#176448] !text-sm',
    });

    router.replace('/dashboard');
  };

  const formik = useFormik({
    initialValues: {
      email: '',
      otp: '',
      password: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      if (step === 'email') {
        // Un admin qui a posé un mot de passe le tape ; les autres reçoivent
        // un code comme avant.
        const method = await getSignInMethod(values.email);
        if (method === 'password') {
          setStep('password');
          return;
        }
        await sendCode(values.email);
        return;
      }

      if (step === 'password') {
        if (!values.password) return;
        setIsPasswordPending(true);
        try {
          const response = await signinWithPassword({
            email: values.email,
            password: values.password,
          });
          await finishSignIn(response);
        } catch (error) {
          errorToast('Échec de la connexion', handlePasswordError(error));
        } finally {
          setIsPasswordPending(false);
        }
        return;
      }

      try {
        const response = await mutateSignup({
          email: values.email,
          code: values.otp,
        });
        await finishSignIn(response);
      } catch (error) {
        errorToast('Échec de la connexion', handleSignupError(error));
      }
    },
  });

  const isPending = isSendOtpPending || isSignupPending || isPasswordPending;

  return (
    <form
      onSubmit={formik.handleSubmit}
      className="bg-white flex flex-col gap-6 w-full md:w-[27.5rem] rounded-3xl border border-[#E6E7E9] shadow-2xl shadow-[#585C5F1A] py-16 px-8"
    >
      <div className="flex flex-col gap-1 pb-8">
        <h2 className="text-center font-semibold text-2xl leading-6">
          Connectez-vous à votre compte
        </h2>
        <p className="text-center text-[#525866] leading-8">
          Saisissez vos coordonnées pour continuer
        </p>
      </div>

      <div className="flex flex-col gap-3 pb-8">
        {step === 'email' && (
          <div className="flex flex-col gap-1">
            <label htmlFor="email">Email</label>
            <CustomInput
              id="email"
              name="email"
              type="email"
              autoComplete="username"
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              leftIcon={<Mail className="text-[#868C98]" size={16} />}
              placeholder="admin@gmail.com"
            />
            {formik.touched.email && formik.errors.email && (
              <CustomErrorIndicator message={formik.errors.email} />
            )}
          </div>
        )}

        {step === 'password' && (
          <div className="flex flex-col gap-1">
            {/* Champ e-mail caché : permet au navigateur de proposer le bon mot de passe enregistré. */}
            <input
              type="email"
              name="username"
              autoComplete="username"
              value={formik.values.email}
              readOnly
              hidden
            />
            <label htmlFor="password">Mot de passe</label>
            <CustomInput
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              autoFocus
              value={formik.values.password}
              onChange={formik.handleChange}
              leftIcon={<Lock className="text-[#868C98]" size={16} />}
            />
            <button
              type="button"
              className="self-start text-xs text-[#525866] underline cursor-pointer pt-1"
              onClick={() => sendCode(formik.values.email)}
            >
              Recevoir plutôt un code par e-mail
            </button>
          </div>
        )}

        {step === 'otp' && (
          <div className="flex flex-col gap-1">
            <div className="flex justify-center">
              <CustomOtpInput
                value={formik.values.otp}
                onChange={(value: string) => formik.setFieldValue('otp', value)}
              />
            </div>
            {formik.touched.otp && formik.errors.otp && (
              <CustomErrorIndicator message={formik.errors.otp} />
            )}
          </div>
        )}
      </div>

      <CustomButton type="submit" disabled={isPending} isLoading={isPending}>
        {step === 'otp' ? 'Vérifier' : 'Se connecter'}
      </CustomButton>
    </form>
  );
};

export default SignInForm;
