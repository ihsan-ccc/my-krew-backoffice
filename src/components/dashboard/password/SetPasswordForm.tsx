'use client';

import React, { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'sonner';
import { Lock } from 'lucide-react';
import CustomInput from '@/components/custom/CustomInput';
import CustomButton from '@/components/custom/CustomButton';
import CustomErrorIndicator from '@/components/custom/CustomErrorIndicator';
import useGetMe from '@/hooks/auth/useGetMe';
import { setPassword } from '@/services/authService';

const SetPasswordForm = () => {
  const { data: me } = useGetMe();
  const [isPending, setIsPending] = useState(false);

  const formik = useFormik({
    initialValues: { password: '', confirmation: '' },
    validationSchema: Yup.object({
      password: Yup.string()
        .min(12, 'Au moins 12 caractères')
        .required('Le mot de passe est requis'),
      confirmation: Yup.string()
        .oneOf([Yup.ref('password')], 'Les deux saisies sont différentes')
        .required('Confirmez le mot de passe'),
    }),
    onSubmit: async (values, { resetForm }) => {
      setIsPending(true);
      try {
        await setPassword(values.password);
        resetForm();
        toast.success('Mot de passe enregistré', {
          description: 'À la prochaine connexion, plus besoin de code.',
          position: 'bottom-right',
          className: '!bg-[#CBF5E5] !text-[#176448] !border !border-[#CBF5E5]',
          descriptionClassName: '!text-[#176448] !text-sm',
        });
      } catch {
        toast.error("Le mot de passe n'a pas été enregistré", {
          description: 'Réessayez dans un instant.',
          position: 'bottom-right',
          className: '!bg-[#DF1C41] !text-white',
          descriptionClassName: '!text-white !text-xs',
        });
      } finally {
        setIsPending(false);
      }
    },
  });

  return (
    <form
      onSubmit={formik.handleSubmit}
      className="flex flex-col gap-4 w-full max-w-[27.5rem]"
    >
      {/* Permet au navigateur d'enregistrer le mot de passe avec la bonne adresse. */}
      <input
        type="email"
        name="username"
        autoComplete="username"
        value={me?.email ?? ''}
        readOnly
        hidden
      />
      <div className="flex flex-col gap-1">
        <label htmlFor="password" className="text-sm">
          Nouveau mot de passe
        </label>
        <CustomInput
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          autoFocus
          value={formik.values.password}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          leftIcon={<Lock className="text-[#868C98]" size={16} />}
        />
        {formik.submitCount > 0 && formik.errors.password && (
          <CustomErrorIndicator message={formik.errors.password} />
        )}
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="confirmation" className="text-sm">
          Encore une fois
        </label>
        <CustomInput
          id="confirmation"
          name="confirmation"
          type="password"
          autoComplete="new-password"
          value={formik.values.confirmation}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          leftIcon={<Lock className="text-[#868C98]" size={16} />}
        />
        {formik.submitCount > 0 && formik.errors.confirmation && (
          <CustomErrorIndicator message={formik.errors.confirmation} />
        )}
      </div>
      <CustomButton
        type="submit"
        className="self-start"
        disabled={isPending}
        isLoading={isPending}
      >
        Enregistrer
      </CustomButton>
    </form>
  );
};

export default SetPasswordForm;
